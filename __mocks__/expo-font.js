module.exports = {
    loadAsync: jest.fn().mockResolvedValue(true),
    isLoaded: jest.fn().mockReturnValue(true),
    useFonts: jest.fn(() => [true, null]),
};
