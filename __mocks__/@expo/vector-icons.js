// Mock @expo/vector-icons to avoid loading .ttf fonts in tests
const React = require("react");
const { Text } = require("react-native");

module.exports = new Proxy(
    {},
    {
        get: (target, name) => {
            // Any icon imported (e.g., Feather, MaterialIcons) returns a dummy component
            return (props) => <Text>{`[Icon: ${name}]`}</Text>;
        },
    }
);
