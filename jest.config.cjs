module.exports = {
    preset: "react-native",
    setupFilesAfterEnv: [
        "@testing-library/jest-native/extend-expect",
        "<rootDir>/jest.setup.js"
    ],
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",
    },
    transformIgnorePatterns: [
        "node_modules/(?!(jest-)?react-native" +
        "|@react-native" +
        "|@expo" +
        "|expo(nent)?" +
        "|expo-modules-core" +
        "|expo-router" +
        "|expo-asset" +
        "|@expo/vector-icons" +
        "|@react-navigation" +
        "|react-native-svg" +
        ")",
    ],
    moduleNameMapper: {
        "^expo-modules-core$": "<rootDir>/__mocks__/expo-modules-core.js",
        "^expo-constants$": "<rootDir>/__mocks__/expo-constants.js",
        "^expo-font$": "<rootDir>/__mocks__/expo-font.js",
        "^expo-asset$": "<rootDir>/__mocks__/expo-asset.js",
        "^expo-router$": "<rootDir>/__mocks__/expo-router.js",
        "^expo$": "<rootDir>/__mocks__/expo.js",
        "^@expo/vector-icons$": "<rootDir>/__mocks__/@expo/vector-icons.js",
        "^react-native-safe-area-context$": "<rootDir>/__mocks__/react-native-safe-area-context.js",
        "^@react-native-async-storage/async-storage$": "<rootDir>/__mocks__/@react-native-async-storage/async-storage.js",
        "^@/firebase/firebaseConfig$": "<rootDir>/__mocks__/firebase/firebaseConfig.js",
        "^firebase/firebaseConfig$": "<rootDir>/__mocks__/firebase/firebaseConfig.js",
        "^\\.{0,2}/?\\.\\./?\\.\\./?firebase\\/firebaseConfig$": "<rootDir>/__mocks__/firebase/firebaseConfig.js",
        '^react-native-paper(/.*)?$': '<rootDir>/__mocks__/react-native-paper.js'
    },

    testPathIgnorePatterns: ["/node_modules/", "/android/", "/ios/"],
    testEnvironment: "jsdom",
    verbose: true,
};
