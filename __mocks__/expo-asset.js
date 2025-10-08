export const Asset = {
    fromModule: jest.fn(() => ({
        downloadAsync: jest.fn(),
        localUri: 'mock-uri',
    })),
};
export default { Asset };
