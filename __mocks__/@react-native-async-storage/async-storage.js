const store = {};
module.exports = {
  __esModule: true,
  default: {
    getItem: async (k) => (k in store ? store[k] : null),
    setItem: async (k, v) => {
      store[k] = v;
    },
    removeItem: async (k) => {
      delete store[k];
    },
    __reset: () => {
      Object.keys(store).forEach((k) => delete store[k]);
    },
  },
};
