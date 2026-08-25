// Illustrazione brand con velo blu leggerissimo per uniformare le tonalità.
// Angoli arrotondati.

import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

import { colors } from "@/src/theme";

interface Props {
  source: ImageSourcePropType;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export function MonoImage({ source, height, radius = 16, style }: Props) {
  return (
    <View
      style={[
        {
          height,
          borderRadius: radius,
          overflow: "hidden",
          backgroundColor: colors.surfaceSecondary,
        },
        style,
      ]}
    >
      <Image source={source} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: "rgba(42,117,211,0.06)",
  },
});
