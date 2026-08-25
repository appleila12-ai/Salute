// Immagine monocolore (duotone blu): foto desaturata lato CDN (+sat=-100)
// con velo blu del brand sopra. Angoli arrotondati.

import { Image, StyleSheet, View, ViewStyle } from "react-native";

import { colors } from "@/src/theme";

interface Props {
  uri: string;
  height: number;
  radius?: number;
  style?: ViewStyle;
}

export function MonoImage({ uri, height, radius = 16, style }: Props) {
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
      <Image
        source={{ uri }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={[StyleSheet.absoluteFill, styles.tint]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tint: {
    backgroundColor: "rgba(42,117,211,0.28)",
  },
});
