// __mocks__/expo-modules-core.js
export const EventEmitter = jest.fn().mockImplementation(() => ({
    addListener: jest.fn(),
    removeListeners: jest.fn(),
}));
export const requireNativeModule = jest.fn();
export const requireOptionalNativeModule = jest.fn(() => ({})); // ✅ return empty object
export const NativeModulesProxy = {};
