// __mocks__/@react-native-async-storage/async-storage.js
const mockAsyncStorage = (() => {
    let store = {};

    return {
        setItem: jest.fn((key, value) => {
            store[key] = value;
            return Promise.resolve();
        }),
        getItem: jest.fn((key) => Promise.resolve(store[key] || null)),
        removeItem: jest.fn((key) => {
            delete store[key];
            return Promise.resolve();
        }),
        clear: jest.fn(() => {
            store = {};
            return Promise.resolve();
        }),
        getAllKeys: jest.fn(() => Promise.resolve(Object.keys(store))),
    };
})();

export default mockAsyncStorage;
