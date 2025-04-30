import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function GradesScreen() {
  const { branchId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
    });
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  // Predefined colors in blue-green spectrum (vibrant versions without transparency)
  const gradeColors = [
    "#1A7B8C", // Teal
    "#2E86AB", // Ocean Blue
    "#0F7173", // Deep Teal
    "#118AB2", // Bright Blue
    "#2A9D8F", // Seafoam
    "#287271", // Forest Green
    "#3E92CC", // Sky Blue
    "#1D7874", // Emerald
  ];

  // Lighter shade variants (vibrant)
  const sectionColorSets = {
    "#1A7B8C": ["#2B97AB", "#3CAEBC"],
    "#2E86AB": ["#40A6CB", "#58BCDF"],
    "#0F7173": ["#209294", "#30B2B4"],
    "#118AB2": ["#25A8D1", "#3DBCE5"],
    "#2A9D8F": ["#3BBDAD", "#4DD8C8"],
    "#287271": ["#389190", "#49B0AF"],
    "#3E92CC": ["#5AABE0", "#76C1F0"],
    "#1D7874": ["#2D9591", "#3DB3AF"],
  };

  // Generate grades with fixed colors
  const generateGradesWithColors = () => {
    // Example grade data structure
    const gradeData = [
      {
        id: "1",
        name: "Grade 5",
        sections: [
          { id: "5a", name: "Section A", students: 28 },
          { id: "5b", name: "Section B", students: 30 },
        ],
      },
      {
        id: "2",
        name: "Grade 6",
        sections: [
          { id: "6a", name: "Section A", students: 32 },
          { id: "6b", name: "Section B", students: 31 },
        ],
      },
      {
        id: "3",
        name: "Grade 7",
        sections: [
          { id: "7a", name: "Section A", students: 29 },
          { id: "7b", name: "Section B", students: 30 },
        ],
      },
    ];

    // Add colors from hardcoded palette
    return gradeData.map((grade, index) => {
      // Cycle through colors if we have more grades than colors
      const colorIndex = index % gradeColors.length;
      const baseColor = gradeColors[colorIndex];

      return {
        ...grade,
        color: baseColor,
        sections: grade.sections.map((section, sectionIndex) => ({
          ...section,
          // Use predefined section colors
          color:
            sectionColorSets[baseColor][
              sectionIndex % sectionColorSets[baseColor].length
            ],
        })),
      };
    });
  };

  // Generate grades with colors
  const grades = generateGradesWithColors();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {grades.map((grade) => (
          <View key={grade.id} style={styles.gradeContainer}>
            <View style={styles.gradeTitleContainer}>
              <View
                style={[
                  styles.gradeTitleBackground,
                  { backgroundColor: grade.color },
                ]}
              >
                <Text style={styles.gradeTitle}>{grade.name}</Text>
                <View style={styles.gradeIconContainer}>
                  <MaterialCommunityIcons
                    name="school"
                    size={18} // Smaller icon
                    color="#FFF"
                  />
                </View>
              </View>
            </View>

            <View style={styles.sectionsContainer}>
              {grade.sections.map((section, index) => (
                <TouchableOpacity
                  key={section.id}
                  style={[
                    styles.sectionCard,
                    { borderLeftColor: section.color, borderLeftWidth: 2 }, // Thinner border
                  ]}
                  onPress={() =>
                    router.push(
                      `/(teacher)/branches/${branchId}/grades/${grade.id}/sections/${section.id}`
                    )
                  }
                >
                  <View
                    style={[
                      styles.sectionIconContainer,
                      { backgroundColor: `${section.color}30` }, // More visible background but still subtle
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="google-classroom"
                      size={20} // Smaller icon
                      color={section.color}
                    />
                  </View>
                  <View style={styles.sectionDetails}>
                    <Text style={styles.sectionName}>{section.name}</Text>
                    <View style={styles.studentInfoContainer}>
                      <MaterialCommunityIcons
                        name="account-group-outline"
                        size={12} // Smaller icon
                        color="#77777F"
                      />
                      <Text style={styles.sectionStudents}>
                        {section.students} Students
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.sectionAction,
                      { backgroundColor: `${section.color}15` }, // Slightly more visible
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={18} // Smaller icon
                      color={section.color}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb", // Lighter, more neutral background
  },
  contentContainer: {
    flex: 1,
    padding: 10, // Reduced padding
  },
  scrollContentContainer: {
    paddingBottom: 12, // Reduced padding
  },
  gradeContainer: {
    marginBottom: 12, // Reduced margin
  },
  gradeTitleContainer: {
    marginBottom: 6, // Reduced margin
    borderRadius: 6, // Smaller radius
    overflow: "hidden",
    elevation: 0.5, // Minimal elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, // Very subtle shadow
    shadowRadius: 1,
  },
  gradeTitleBackground: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10, // Reduced padding
    paddingVertical: 8, // Reduced padding
  },
  gradeTitle: {
    fontSize: 15, // Smaller font
    fontFamily: Typography.fontWeight.medium.primary, // Less bold for subtlety
    color: "#FFF",
  },
  gradeIconContainer: {
    width: 26, // Smaller container
    height: 26, // Smaller container
    borderRadius: 13, // Corresponding radius
    backgroundColor: "rgba(255, 255, 255, 0.2)", // More visible background
    justifyContent: "center",
    alignItems: "center",
  },
  sectionsContainer: {
    flexDirection: "column",
    width: "100%",
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 6, // Smaller radius
    padding: 10, // Reduced padding
    marginBottom: 6, // Reduced margin
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Slightly increased shadow
    elevation: 0.5, // Minimal elevation
    borderLeftWidth: 2, // Thinner border
  },
  sectionIconContainer: {
    width: 34, // Smaller container
    height: 34, // Smaller container
    borderRadius: 17, // Corresponding radius
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8, // Reduced margin
  },
  sectionDetails: {
    flex: 1,
  },
  sectionName: {
    fontSize: 13, // Smaller font
    fontFamily: Typography.fontWeight.medium.primary, // Less bold
    color: "#444", // Lighter text
    marginBottom: 1, // Minimal margin
  },
  studentInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionStudents: {
    fontSize: 11, // Smaller font
    fontFamily: Typography.fontFamily.primary,
    color: "#77777F", // Lighter, more subtle color
    marginLeft: 2, // Reduced margin
  },
  sectionAction: {
    width: 24, // Smaller container
    height: 24, // Smaller container
    borderRadius: 12, // Corresponding radius
    justifyContent: "center",
    alignItems: "center",
  },
});
