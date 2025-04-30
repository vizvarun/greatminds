import React from "react";
import { StyleSheet, Text, View, Image } from "react-native";

interface InitialsAvatarProps {
  name: string;
  size: number;
  fontSize?: number;
  style?: object;
  imageUri?: string; // Add optional imageUri prop
}

export default function InitialsAvatar({
  name,
  size,
  fontSize,
  style,
  imageUri,
}: InitialsAvatarProps) {
  // Generate initials from name (first letter of first name and last name)
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  // Generate a pastel color based on the name (for consistency)
  const getColorFromName = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Predefined set of pleasant pastel colors
    const pastelColors = [
      "#FFD6E0", // Light Pink
      "#C2F0D6", // Mint
      "#C2E5F0", // Light Blue
      "#E0C2F0", // Light Purple
      "#F0D6C2", // Light Orange
      "#FFEFC8", // Light Yellow
      "#D1F0C2", // Light Green
      "#E0C2F0", // Light Purple
      "#F0D6C2", // Light Orange
      "#C2F0D6", // Mint
      "#F0C2E5", // Rose
      "#C2CEF0", // Periwinkle
      "#E5F0C2", // Light Lime
    ];

    // Use the hash to select a color from our pastel palette
    const colorIndex = Math.abs(hash) % pastelColors.length;
    return pastelColors[colorIndex];
  };

  const initials = getInitials(name);
  const backgroundColor = getColorFromName(name);
  // Make font size slightly smaller relative to container
  const calculatedFontSize = fontSize || size * 0.35;

  // If we have an image URI, display the image instead of initials
  if (imageUri) {
    return (
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          style,
        ]}
      />
    );
  }

  // Otherwise, display the initials avatar
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { fontSize: calculatedFontSize }]}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#333",
    fontWeight: "bold",
  },
  image: {
    backgroundColor: "#eee", // Light background for images while loading
  },
});
