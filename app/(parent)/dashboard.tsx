import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function ParentDashboard() {
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

  return (
    <View style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Your Children</Text>
        <Text style={styles.subtitle}>
          View and manage your children's profiles
        </Text>
      </View>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.childrenSection}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.childrenList}
          >
            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/1")}
            >
              <Image
                source={require("@/assets/images/onboarding.png")}
                style={styles.childAvatar}
              />
              <View style={styles.childInfo}>
                <Text style={styles.childName}>Sarah Johnson</Text>
                <Text style={styles.childGrade}>Grade 5-A</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: "75%" }]} />
                </View>
                <Text style={styles.progressText}>Academic Progress: 75%</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.childCard}
              onPress={() => router.push("/(parent)/children/details/2")}
            >
              <Image
                source={require("@/assets/images/onboarding.png")}
                style={styles.childAvatar}
              />
              <View style={styles.childInfo}>
                <Text style={styles.childName}>Michael Johnson</Text>
                <Text style={styles.childGrade}>Grade 3-B</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progress, { width: "60%" }]} />
                </View>
                <Text style={styles.progressText}>Academic Progress: 60%</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.addChildCard}
              onPress={() =>
                showAlert(
                  "Add Child",
                  "Feature coming soon. You'll be able to add your child once their school provides the access code.",
                  "info"
                )
              }
            >
              <View style={styles.addChildIcon}>
                <MaterialCommunityIcons name="plus" size={30} color={primary} />
              </View>
              <Text style={styles.addChildText}>Add Child</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={hideAlert}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  welcomeText: {
    fontSize: 22,
    fontFamily: Typography.fontWeight.bold.primary,
    color: "#333",
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 4,
  },
  childrenSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  childrenList: {
    flex: 1,
  },
  childCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  childAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  childInfo: {
    flex: 1,
    paddingHorizontal: 15,
  },
  childName: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  childGrade: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    width: "100%",
    marginBottom: 5,
  },
  progress: {
    height: "100%",
    backgroundColor: primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  addChildCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#ccc",
    height: 120,
  },
  addChildIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addChildText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
});
