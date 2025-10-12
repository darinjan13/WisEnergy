console.log('Loading react-native-paper mock');
const Card = ({ children, ...props }) => (
    <div {...props}>{children}</div>
);

Card.Title = ({ title, subtitle, right, titleStyle, subtitleStyle, ...props }) => (
    <div {...props}>
        <span style={titleStyle}>{title}</span>
        {subtitle && <span style={subtitleStyle}>{subtitle}</span>}
        {right && right()}
    </div>
);

Card.Content = ({ children, ...props }) => <div {...props}>{children}</div>;

const Text = ({ children, ...props }) => <span {...props}>{children}</span>;

const IconButton = ({ onPress, icon, iconColor, ...props }) => (
    <button onClick={onPress} {...props}>{icon}</button>
);

module.exports = {
    Card,
    Text,
    IconButton
};