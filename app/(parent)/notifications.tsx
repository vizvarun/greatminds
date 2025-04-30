import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

export default function ParentNotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "School Closure Notice",
      message: "School will be closed this Friday for staff development",
      time: "2 hours ago",
      read: false,
      details:
        "Due to scheduled staff development activities, the school will remain closed on Friday. Regular classes will resume on Monday. Please ensure your child completes any pending assignments during this extended weekend.",
    },
    {
      id: "2",
      title: "Parent-Teacher Meeting",
      message:
        "Schedule for next week's parent-teacher conferences is now available",
      time: "Yesterday",
      read: true,
      details:
        "The parent-teacher meeting schedule has been finalized. You can book your preferred time slot through the parent portal. Meetings will be held from Monday to Wednesday next week, between 3 PM and 7 PM.",
    },
    {
      id: "3",
      title: "Fee Payment Reminder",
      message: "Quarterly fees due by the end of this month",
      time: "3 days ago",
      read: true,
      details:
        "This is a reminder that the quarterly fees for the current term are due by the 30th of this month. Please ensure timely payment to avoid late fees. You can pay through the online portal or at the school accounts office.",
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
    setAlert({
      visible: true,
      title: "Mark All as Read",
      message: "Are you sure you want to mark all notifications as read?",
      type: "info",
    });
  };

  const confirmMarkAllAsRead = () => {
    const updatedNotifications = notifications.map((item) => ({
      ...item,
      read: true,
    }));
    setNotifications(updatedNotifications);
    setAlert((prev) => ({ ...prev, visible: false }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
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
            <Text style={styles.title}>Notifications</Text>
            {notifications.length > 0 && (
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={markAllAsRead}
                >
                  <MaterialCommunityIcons
                    name="eye-check-outline"
                    size={22}
                    color={primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={clearAllNotifications}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={22}
                    color={primary}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

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
                  <Text style={styles.notificationTime}>
                    {notification.time}
                  </Text>
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
                  {selectedNotification?.details ||
                    selectedNotification?.message}
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
          onConfirm={
            alert.title === "Clear Notifications"
              ? confirmClearNotifications
              : confirmMarkAllAsRead
          }
          onCancel={hideAlert}
          showCancelButton={true}
        />
      </View>
    </SafeAreaView>
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
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginLeft: "auto",
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: "rgba(11, 181, 191, 0.1)",
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
