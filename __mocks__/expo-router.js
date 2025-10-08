export const useRouter = () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
});
export const Stack = ({ children }) => children;
export default { useRouter, Stack };
