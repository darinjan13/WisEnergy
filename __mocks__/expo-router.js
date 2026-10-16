const React = require("react");
const noop = () => {};
module.exports = {
  Link: () => null,
  Slot: () => null,
  router: { push: noop, replace: noop, back: noop },
  useRouter: () => ({ push: noop, replace: noop, back: noop }),
  useLocalSearchParams: () => ({}),
  useGlobalSearchParams: () => ({}),
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
};
