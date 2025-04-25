import { Text, type TextProps, StyleSheet } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  fontFamily?: "primary" | "secondary";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  fontFamily = "primary",
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        {
          fontFamily:
            type === "default"
              ? Typography.fontFamily[fontFamily]
              : type === "defaultSemiBold"
              ? Typography.fontWeight.semiBold[fontFamily]
              : type === "subtitle"
              ? Typography.fontWeight.medium[fontFamily]
              : type === "title" || type === "link"
              ? Typography.fontWeight.bold[fontFamily]
              : Typography.fontFamily[fontFamily],
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: primary,
  },
});
