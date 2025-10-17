import { Dimensions, PixelRatio } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Base width you designed on (e.g., iPhone 12 = 375)
const BASE_WIDTH = 375;

export function RFValueWidth(fontSize, baseWidth = BASE_WIDTH) {
  const scale = SCREEN_WIDTH / baseWidth;
  return Math.round(PixelRatio.roundToNearestPixel(fontSize * scale));
}
