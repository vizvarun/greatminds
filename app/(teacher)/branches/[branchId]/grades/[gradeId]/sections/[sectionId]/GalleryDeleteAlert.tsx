import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";

type Props = {
  visible: boolean;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const GalleryDeleteAlert = ({
  visible,
  loading,
  onConfirm,
  onCancel,
}: Props) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onCancel}
  >
    <View style={styles.overlay}>
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="alert"
          size={40}
          color="#FF9800"
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.title}>Delete Gallery Group</Text>
        <Text style={styles.message}>
          Are you sure you want to delete this group and all its images?
        </Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          {loading ? (
            <View
              style={[
                styles.button,
                styles.confirmButton,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.confirmButton]}
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  confirmButton: {
    backgroundColor: "#FF9800",
    marginLeft: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});

export default GalleryDeleteAlert;
