const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

module.exports = withNativeWind(() => {
    const config = getDefaultConfig(__dirname);
    const { transformer, resolver } = config;

    config.transformer = {
        ...transformer,
        babelTransformerPath: require.resolve("react-native-svg-transformer"),
    };

    config.resolver = {
        ...resolver,
        assetExts: resolver.assetExts.filter((ext) => ext !== "svg").concat("ttf"), // Ensure Skia fonts work
        sourceExts: [...resolver.sourceExts, "svg", "cjs"], // Ensure compatibility with Skia & Victory Native
    };

    return config;
}, { input: './global.css' });
