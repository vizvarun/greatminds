import ChildTimetable from "@/components/parent/ChildTimetable";
import CustomAlert from "@/components/ui/CustomAlert";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChildTimetableScreen() {
  const { id } = useLocalSearchParams();
  const { studentProfiles } = useAuth();
  const [sectionId, setSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (studentProfiles && studentProfiles.length > 0) {
      const foundStudent = studentProfiles.find((s) => s.id.toString() === id);

      if (
        foundStudent?.section_details &&
        foundStudent.section_details.length > 0
      ) {
        setSectionId(foundStudent.section_details[0].sectionid.toString());
      }
    }
  }, [id, studentProfiles]);

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const hideAlert = (confirmed: boolean = false) => {
    setAlert((prev) => {
      if (confirmed) {
        prev.onConfirm();
      } else {
        prev.onCancel();
      }
      return { ...prev, visible: false };
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        <ChildTimetable sectionId={sectionId as string} />
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => hideAlert(true)}
        onCancel={() => hideAlert(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  content: {
    flex: 1,
  },
});
