module.exports = {
    preset: 'react-native',
    setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
    transform: { '^.+\\.[tj]sx?$': 'babel-jest' },
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?react-native'
        + '|@react-native'
        + '|@expo'
        + '|expo(nent)?'
        + '|expo-modules-core'
        + '|expo-router'
        + '|expo-asset'
        + '|@expo/vector-icons'
        + '|@react-navigation'
        + '|react-native-svg'
        + ')',
    ],
    moduleNameMapper: {
        '^expo-modules-core$': '<rootDir>/__mocks__/expo-modules-core.js',
        '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
        '^expo-font$': '<rootDir>/__mocks__/expo-font.js',
        '^expo-asset$': '<rootDir>/__mocks__/expo-asset.js',
        '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
        '^expo$': '<rootDir>/__mocks__/expo.js',
        '^@react-native-async-storage/async-storage$':
            '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js',
        '^firebase/auth$': '<rootDir>/__mocks__/firebase/auth.js',
        '\\.(ttf|otf|png|jpg|jpeg|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    testEnvironment: 'node',
};
