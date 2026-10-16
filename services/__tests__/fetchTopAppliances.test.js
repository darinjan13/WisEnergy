jest.mock("firebase/database", () => ({
  ref: jest.fn((db, path) => ({ __path: path })),
  query: jest.fn((r) => r),
  orderByKey: jest.fn(() => ({ __order: "key" })),
  limitToLast: jest.fn(() => ({ __limit: 30 })),
  get: jest.fn(),
}));

const { get } = require("firebase/database");
const { fetchTopAppliances } = require("../firebaseUsageService");

const dateNode = (total) => ({
  child: (k) => ({ val: () => (k === "total_kWh" ? total : null) }),
});
const snapOf = (dateTotals) => ({
  exists: () => true,
  val: () => ({}),
  forEach: (cb) => {
    Object.entries(dateTotals).forEach(([date, total]) =>
      cb({ key: date, ...dateNode(total) })
    );
  },
});

test("sums only the last 30 days per appliance, sorted desc, bounded reads", async () => {
  // NOTE: the mock returns every fixture node regardless of the query;
  // the 30-day bound itself is asserted via limitToLast(30) below
  // (RTDB enforces it server-side on real reads).
  const days = {};
  for (let i = 1; i <= 30; i++)
    days[`2026-01-${String(i).padStart(2, "0")}`] = 1;
  get.mockImplementation(async (r) => {
    if (r.__path === "appliances/u1")
      return { exists: () => true, val: () => ({ d1: { Fan: {}, Lamp: {} } }) };
    if (r.__path.includes("/Fan")) return snapOf(days);
    return snapOf({ "2026-01-40": 5 });
  });

  const { limitToLast, orderByKey } = require("firebase/database");

  const res = await fetchTopAppliances("u1", 5);

  const paths = get.mock.calls.map((c) => c[0].__path);
  expect(paths[0]).toBe("appliances/u1");
  expect(paths.slice(1).every((p) => p.startsWith("daily_summary/u1/"))).toBe(true);
  expect(paths.some((p) => p === "daily_summary/u1")).toBe(false);
  // bounded window enforced at the query level (RTDB applies it server-side)
  expect(orderByKey).toHaveBeenCalled();
  expect(limitToLast).toHaveBeenCalledWith(30);
  expect(res).toEqual([
    { name: "Fan", kwh: 30 },
    { name: "Lamp", kwh: 5 },
  ]);
});
