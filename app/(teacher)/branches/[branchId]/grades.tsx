import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/context/AuthContext";
import { primary } from "@/constants/Colors";

export default function GradesScreen() {
  const { branchId } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  const { userProfile, isLoading, refreshUserProfile } = useAuth();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshUserProfile().finally(() => {
      setRefreshing(false);
    });
  }, [refreshUserProfile]);

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

  // Simplified color palette - more subtle and professional
  const gradeColors = [
    "#4361EE", // Royal Blue
    "#3A0CA3", // Deep Purple
    "#7209B7", // Violet
    "#F72585", // Pink
    "#4CC9F0", // Cyan
    "#4895EF", // Sky Blue
    "#560BAD", // Purple
    "#B5179E", // Magenta
  ];

  // Extract grades and sections from the profile data for this branch
  const grades = useMemo(() => {
    if (!userProfile || !userProfile.school_ids || !branchId) {
      return [];
    }

    // Find the school that matches the branchId
    const schoolData = userProfile.school_ids.find(
      (school) => school[0].schoolId.toString() === branchId
    );

    if (!schoolData || !schoolData[1]?.classes_list) {
      return [];
    }

    // Transform the classes data into our grades format
    return schoolData[1].classes_list.map((classData, index) => {
      const classInfo = classData[0];
      const sections = classData[1]?.sections || [];

      // Calculate total students based on sections (estimated 25 per section)
      const totalStudents = sections.length * 25;

      // Use color from palette based on index
      const colorIndex = index % gradeColors.length;
      const gradeColor = gradeColors[colorIndex];

      return {
        id: classInfo.empId.toString(),
        name: classInfo.className,
        color: gradeColor,
        sections: sections.map((section) => ({
          id: section.sectionId.toString(),
          name: section.sectionName,
          students: 25, // Assuming average of 25 students per section
        })),
      };
    });
  }, [userProfile, branchId, gradeColors]);

  // Find the current school details
  const currentSchool = useMemo(() => {
    if (!userProfile || !userProfile.school_ids || !branchId) {
      return null;
    }

    const schoolData = userProfile.school_ids.find(
      (school) => school[0].schoolId.toString() === branchId
    );

    return schoolData ? schoolData[0] : null;
  }, [userProfile, branchId]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
            <Text style={styles.title}>Grades</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primary} />
          <Text style={styles.loadingText}>Loading grades...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Grades</Text>
        </View>
      </View>

      {/* {currentSchool && (
        <View style={styles.schoolInfoContainer}>
          <Text style={styles.schoolName}>{currentSchool.schoolName}</Text>
          <Text style={styles.schoolAddress}>
            {currentSchool.schoolAddress}, {currentSchool.city},{" "}
            {currentSchool.state}
          </Text>
        </View>
      )} */}

      {/* Added stats summary card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{grades.length}</Text>
          <Text style={styles.statLabel}>Grades</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {grades.reduce((sum, grade) => sum + grade.sections.length, 0)}
          </Text>
          <Text style={styles.statLabel}>Sections</Text>
        </View>
        <View style={styles.statDivider} />
        {/* <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {grades.reduce(
              (sum, grade) =>
                sum +
                grade.sections.reduce(
                  (secSum, section) => secSum + section.students,
                  0
                ),
              0
            )}
          </Text>
          <Text style={styles.statLabel}>Students</Text>
        </View> */}
      </View>

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {grades.length === 0 && !isLoading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="book-education-outline"
              size={48}
              color="#ccc"
            />
            <Text style={styles.emptyStateText}>No grades assigned yet</Text>
          </View>
        ) : (
          <View style={styles.gradesGrid}>
            {grades.map((grade) => (
              <View key={grade.id} style={styles.gradeCard}>
                <View
                  style={[
                    styles.gradeHeaderBanner,
                    { backgroundColor: `${grade.color}15` },
                  ]}
                >
                  <View style={styles.gradeHeaderContent}>
                    <View style={styles.gradeTitleSection}>
                      <View
                        style={[
                          styles.gradeIndicator,
                          { backgroundColor: grade.color },
                        ]}
                      />
                      <Text style={styles.gradeTitle}>{grade.name}</Text>
                    </View>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>
                        {grade.sections.length}{" "}
                        {grade.sections.length === 1 ? "Section" : "Sections"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.sectionsContainer}>
                  {grade.sections.map((section) => (
                    <TouchableOpacity
                      key={section.id}
                      style={styles.sectionItem}
                      onPress={() =>
                        router.push(
                          `/(teacher)/branches/${branchId}/grades/${grade.id}/sections/${section.id}`
                        )
                      }
                    >
                      <View style={styles.sectionContent}>
                        <View style={styles.sectionNameContainer}>
                          <MaterialCommunityIcons
                            name="google-classroom"
                            size={18}
                            color={grade.color}
                            style={styles.sectionIcon}
                          />
                          <Text style={styles.sectionName}>{section.name}</Text>
                        </View>
                        {/* <View style={styles.studentContainer}>
                          <MaterialCommunityIcons
                            name="account-group"
                            size={14}
                            color="#666"
                          />
                          <Text style={styles.studentCount}>
                            {section.students}
                          </Text>
                        </View> */}
                      </View>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
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
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  statLabel: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  scrollContentContainer: {
    paddingBottom: 80, // Extra padding for FAB
  },
  gradesGrid: {
    flexDirection: "column",
    width: "100%",
  },
  gradeCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradeHeaderBanner: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  gradeHeaderContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  gradeTitleSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  gradeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  gradeTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  gradeBadge: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  gradeBadgeText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  sectionsContainer: {
    paddingVertical: 8,
  },
  sectionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  sectionContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionName: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  studentContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  studentCount: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginLeft: 4,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#4361EE",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#4361EE",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  schoolInfoContainer: {
    backgroundColor: "white",
    padding: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  schoolName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  schoolAddress: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#999",
    fontFamily: Typography.fontWeight.medium.primary,
    textAlign: "center",
  },
});
