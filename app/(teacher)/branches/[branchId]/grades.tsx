import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";

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

  // Dummy data for grades and sections
  const grades = [
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {grades.map((grade) => (
          <View key={grade.id} style={styles.gradeContainer}>
            <Text style={styles.gradeTitle}>{grade.name}</Text>
            {grade.sections.map((section) => (
              <TouchableOpacity
                key={section.id}
                style={styles.sectionCard}
                onPress={() =>
                  router.push(
                    `/(teacher)/branches/${branchId}/grades/${grade.id}/sections/${section.id}`
                  )
                }
              >
                <View style={styles.sectionIconContainer}>
                  <MaterialCommunityIcons
                    name="google-classroom"
                    size={24}
                    color={primary}
                  />
                </View>
                <View style={styles.sectionDetails}>
                  <Text style={styles.sectionName}>{section.name}</Text>
                  <Text style={styles.sectionStudents}>
                    <MaterialCommunityIcons
                      name="account-group-outline"
                      size={14}
                      color="#666"
                    />{" "}
                    {section.students} Students
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={primary}
                />
              </TouchableOpacity>
            ))}
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
    backgroundColor: "#f5f7fa",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  gradeContainer: {
    marginBottom: 24,
  },
  gradeTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 12,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  sectionDetails: {
    flex: 1,
  },
  sectionName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  sectionStudents: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});
