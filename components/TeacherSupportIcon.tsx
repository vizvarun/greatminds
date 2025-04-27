import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";

type TeacherSupportIconProps = {
  gradeId?: string;
  sectionId?: string;
  branchId?: string;
  showBadge?: boolean;
  badgeCount?: number;
  size?: number;
  color?: string;
  style?: object;
};

export default function TeacherSupportIcon({
  gradeId,
  sectionId,
  branchId,
  showBadge = false,
  badgeCount = 0,
  size = 24,
  color = primary,
  style = {},
}: TeacherSupportIconProps) {
  const handlePress = () => {
    let routePath = "/(teacher)/support";

    // Add query parameters if provided
    if (gradeId || sectionId || branchId) {
      routePath += "?from=section";
      if (branchId) routePath += `&branchId=${branchId}`;
      if (gradeId) routePath += `&gradeId=${gradeId}`;
      if (sectionId) routePath += `&sectionId=${sectionId}`;
    }

    router.push(routePath);
  };

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={handlePress}>
      <MaterialCommunityIcons name="lifebuoy" size={size} color={color} />

      {showBadge && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 99 ? "99+" : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#F44336",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontFamily: Typography.fontWeight.bold.primary,
  },
});
