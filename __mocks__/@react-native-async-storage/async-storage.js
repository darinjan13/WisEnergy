// Mock AsyncStorage for Jest
export default {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiSet: jest.fn(),
    multiGet: jest.fn(),
    multiRemove: jest.fn(),
};
