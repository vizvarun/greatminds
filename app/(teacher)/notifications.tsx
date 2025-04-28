import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New School Policy",
      message: "Please review the updated school policy for the new term",
      time: "2 hours ago",
      read: false,
      details:
        "The school board has approved updated policies regarding attendance, mobile phone usage, and uniform requirements. These changes will be effective from the next term. Please ensure you go through all the details in the policy document shared on the school portal.",
    },
    {
      id: "2",
      title: "Staff Meeting",
      message: "Staff meeting scheduled for tomorrow at 9:00 AM",
      time: "Yesterday",
      read: true,
      details:
        "The monthly staff meeting will be held in the conference room. Agenda includes discussion on upcoming examinations, review of the previous month's academic performance, and planning for the annual day celebrations.",
    },
    {
      id: "3",
      title: "Grade Submission",
      message: "Reminder to submit final grades by end of week",
      time: "2 days ago",
      read: true,
      details:
        "All teachers are requested to complete their grade submissions for the quarterly assessments by Friday. The academic council will review the results next week before they are released to parents.",
    },
  ]);
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

  const handleNotificationPress = (notification) => {
    // Mark notification as read
    const updatedNotifications = notifications.map((item) =>
      item.id === notification.id ? { ...item, read: true } : item
    );
    setNotifications(updatedNotifications);

    // Set selected notification and show modal
    setSelectedNotification(notification);
    setDetailsModalVisible(true);
  };

  const clearAllNotifications = () => {
    setAlert({
      visible: true,
      title: "Clear Notifications",
      message: "Are you sure you want to clear all notifications?",
      type: "warning",
    });
  };

  const confirmClearNotifications = () => {
    setNotifications([]);
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const hideAlert = () => {
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map((item) => ({
      ...item,
      read: true,
    }));
    setNotifications(updatedNotifications);
  };

  return (
    <View style={styles.container}>
      {notifications.length > 0 && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={markAllAsRead}>
            <Text style={styles.actionButtonText}>Mark all as read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={clearAllNotifications}
          >
            <Text style={styles.actionButtonText}>Clear all</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.notificationList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={styles.notificationItem}
              onPress={() => handleNotificationPress(notification)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.notificationIcon,
                  {
                    backgroundColor: notification.read
                      ? "#f1f1f1"
                      : "rgba(11, 181, 191, 0.1)",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={24}
                  color={notification.read ? "#999" : primary}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {notification.title}
                </Text>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {!notification.read && <View style={styles.unreadIndicator} />}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="bell-off-outline"
              size={60}
              color="#ccc"
            />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        )}
      </ScrollView>

      {/* Notification Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedNotification?.title}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.notificationTime}>
                {selectedNotification?.time}
              </Text>
              <Text style={styles.modalMessage}>
                {selectedNotification?.details || selectedNotification?.message}
              </Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => setDetailsModalVisible(false)}
              >
                <Text style={styles.dismissButtonText}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={confirmClearNotifications}
        onCancel={hideAlert}
        showCancelButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  notificationList: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  notificationIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: primary,
    position: "absolute",
    top: 16,
    right: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginTop: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 20,
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    lineHeight: 24,
    marginTop: 12,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 16,
    alignItems: "center",
  },
  dismissButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: primary,
    borderRadius: 8,
  },
  dismissButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#fff",
  },
});
