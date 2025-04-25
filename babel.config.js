module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            [
                "module-resolver",
                {
                    alias: {
                        "@": ".",
                        "@components": "./components",
                        "@hooks": "./hooks",
                    }
                }
            ],
            'react-native-reanimated/plugin'],
    };
};