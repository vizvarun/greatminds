import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import { submitLeaveRequest } from "@/services/attendanceApi";
import CustomAlert from "@/components/ui/CustomAlert";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ApplyLeaveScreen() {
  const { childId, sectionId } = useLocalSearchParams<{
    childId: string;
    sectionId: string;
  }>();
  const { userProfile } = useAuth();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [leaveReason, setLeaveReason] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const inputAccessoryViewID = "leaveReasonInput";

  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  // Get today's date in YYYY-MM-DD format for min date
  const todayString = new Date().toISOString().split("T")[0];

  // Function to scroll to the input with appropriate offset
  const scrollToInput = useCallback(() => {
    // Improved offset calculation based on screen height
    const screenHeight = Dimensions.get("window").height;
    const keyboardOffset = screenHeight * 0.35; // More dynamic offset based on screen size

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
      // Additional scroll to ensure the input is visible above the keyboard
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: keyboardOffset,
          animated: true,
        });
      }, 100);
    }, 150);
  }, []);

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Give the keyboard time to fully appear before scrolling
        if (inputRef.current?.isFocused()) {
          scrollToInput();
        }
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [scrollToInput]);

  // Add a fix for Android keyboard accessory positioning
  useEffect(() => {
    if (Platform.OS === "android") {
      // On Android, we need to ensure the keyboard accessory is visible
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        (event) => {
          setKeyboardVisible(true);
          // Calculate keyboard height for better positioning
          const keyboardHeight = event.endCoordinates.height;

          // Store the keyboard height if needed for positioning
          if (scrollViewRef.current) {
            // Wait for layout to settle, then scroll
            setTimeout(() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 100);
          }
        }
      );

      return () => {
        keyboardDidShowListener.remove();
      };
    }
  }, []);

  const statusColors = {
    present: "#4CAF50", // Green
    absent: "#F44336", // Red
    late: "#FF9800", // Orange
    leave: "#9C27B0", // Purple
    holiday: "#2196F3", // Blue
  };

  const getMarkedDates = useCallback(() => {
    const markedDates: any = {};

    // Mark selected dates for leave application
    selectedDates.forEach((date) => {
      markedDates[date] = {
        selected: true,
        selectedColor: "rgba(156, 39, 176, 0.3)",
      };
    });

    return markedDates;
  }, [selectedDates]);

  const onDayPress = (day: DateData) => {
    // Additional validation to prevent selecting past dates
    const selectedDate = new Date(day.dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time part for accurate date comparison

    if (selectedDate < today) {
      return; // Ignore selection of past dates
    }

    if (selectedDates.includes(day.dateString)) {
      setSelectedDates(selectedDates.filter((date) => date !== day.dateString));
    } else {
      setSelectedDates([...selectedDates, day.dateString]);
    }
  };

  const handleApplyLeave = () => {
    if (selectedDates.length > 0) {
      // Show confirmation modal instead of navigating immediately
      setShowConfirmationModal(true);
    }
  };

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

  const confirmAndSubmitLeave = async () => {
    try {
      setIsSubmitting(true);

      // Get necessary IDs
      const userId = userProfile?.user?.id;

      if (!userId || !childId || !sectionId) {
        throw new Error("Missing required information");
      }

      // Submit the leave request
      await submitLeaveRequest(
        childId,
        sectionId,
        selectedDates,
        leaveReason, // This can now be empty
        userId
      );

      // Close modal and navigate back
      setShowConfirmationModal(false);

      // Navigate back showing success through URL params
      router.back();

      // Set params for the parent screen to show success message
      router.setParams({
        leaveApplied: "true",
        selectedDates: selectedDates.join(","),
      });
    } catch (error) {
      console.error("Failed to submit leave request:", error);
      setShowConfirmationModal(false);
      showAlert(
        "Error",
        "Failed to submit leave request. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Apply for Leave</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined} // Changed to undefined for Android
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // No offset needed for Android
        contentContainerStyle={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.scrollContentContainer} // Added style
        >
          <Text style={styles.inputLabel}>Select Dates:</Text>
          <Text style={styles.dateSelectionHelp}>
            (Select dates on the calendar below)
          </Text>

          <Calendar
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            minDate={todayString} // Set minimum date to today
            theme={{
              selectedDayBackgroundColor: primary,
              todayTextColor: primary,
              // Visually indicate past dates are disabled
              textDisabledColor: "#d9e1e8",
            }}
          />

          <Text style={styles.selectedDatesText}>
            Selected: {selectedDates.length} day(s)
          </Text>

          <Text style={styles.inputLabel}>Reason for Leave:</Text>
          <TextInput
            ref={inputRef}
            style={styles.reasonInput}
            value={leaveReason}
            onChangeText={setLeaveReason}
            placeholder="Enter reason for leave"
            placeholderTextColor="#999"
            multiline
            onFocus={scrollToInput} // Direct call to scrollToInput
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.applyButton,
                selectedDates.length === 0 && styles.disabledButton,
              ]}
              onPress={handleApplyLeave}
              disabled={selectedDates.length === 0}
            >
              <Text style={styles.applyButtonText}>Submit Application</Text>
            </TouchableOpacity>
          </View>

          {/* Increased bottom padding to ensure enough space below input */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Add keyboard accessory view for iOS */}
        {Platform.OS === "ios" && (
          <InputAccessoryView nativeID={inputAccessoryViewID}>
            <View style={styles.keyboardAccessory}>
              <TouchableOpacity
                style={styles.keyboardDoneButton}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </InputAccessoryView>
        )}

        {/* Android keyboard accessory with improved positioning and styling */}
        {Platform.OS === "android" && keyboardVisible && (
          <View style={styles.androidKeyboardAccessoryWrapper}>
            <View style={styles.androidKeyboardAccessory}>
              <TouchableOpacity
                style={styles.keyboardDoneButton}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Confirmation Modal */}
        <Modal
          visible={showConfirmationModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowConfirmationModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {/* Improved header design */}
              <View style={styles.modalHeaderContainer}>
                <MaterialCommunityIcons
                  name="calendar-check"
                  size={24}
                  color={primary}
                />
                <Text style={styles.modalTitle}>Confirm Leave Application</Text>
              </View>

              <View style={styles.modalDivider} />

              <Text style={styles.modalText}>
                You are requesting leave for {selectedDates.length} day(s):
              </Text>

              {/* Scrollable date container for many dates */}
              <ScrollView
                style={[
                  styles.dateScrollView,
                  selectedDates.length > 6 && styles.dateScrollViewTall,
                ]}
                contentContainerStyle={styles.calendarContainer}
                showsVerticalScrollIndicator={selectedDates.length > 6}
              >
                {selectedDates.sort().map((date) => {
                  const dateObj = new Date(date);
                  const day = dateObj.getDate();
                  const month = dateObj.toLocaleString("default", {
                    month: "short",
                  });
                  const weekday = dateObj.toLocaleString("default", {
                    weekday: "short",
                  });

                  return (
                    <View key={date} style={styles.dateCard}>
                      {/* Make remove button more prominent */}
                      <TouchableOpacity
                        style={styles.removeDateButton}
                        onPress={() => {
                          setSelectedDates(
                            selectedDates.filter((d) => d !== date)
                          );
                          // If removing the last date, close the modal
                          if (selectedDates.length === 1) {
                            setShowConfirmationModal(false);
                          }
                        }}
                      >
                        <MaterialCommunityIcons
                          name="close-circle"
                          size={18}
                          color="white"
                        />
                      </TouchableOpacity>
                      <View style={styles.dateHeader}>
                        <Text style={styles.dateMonth}>{month}</Text>
                      </View>
                      <View style={styles.dateBody}>
                        <Text style={styles.dateNumber}>{day}</Text>
                        <Text style={styles.dateWeekday}>{weekday}</Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              {leaveReason.trim() !== "" && (
                <>
                  <Text style={styles.modalText}>Reason:</Text>
                  <Text style={styles.modalReason}>{leaveReason}</Text>
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowConfirmationModal(false)}
                  disabled={isSubmitting}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalConfirmButton,
                    isSubmitting && styles.disabledButton,
                  ]}
                  onPress={confirmAndSubmitLeave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.modalConfirmButtonText}>Confirm</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>

      {/* Alert component */}
      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={hideAlert}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginLeft: 4,
  },
  rightPlaceholder: {
    width: 24, // To balance the header
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Increased padding at bottom
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginTop: 10,
    marginBottom: 8,
  },
  dateSelectionHelp: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 8,
  },
  selectedDatesText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
    marginTop: 10,
    marginBottom: 10,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
    fontFamily: Typography.fontFamily.primary,
    marginBottom: 20,
    backgroundColor: "#fff",
    color: "#333",
    fontSize: 16, // Increased font size for better visibility
  },
  buttonContainer: {
    marginVertical: 20,
  },
  applyButton: {
    backgroundColor: primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  applyButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 16,
  },
  keyboardAccessory: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  androidKeyboardAccessoryWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999, // Ensure it's above everything else
    elevation: 10, // Android elevation for shadow and stacking
  },
  androidKeyboardAccessory: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 12, // Increased padding
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#ccc", // Darker border for better visibility
    flexDirection: "row",
    justifyContent: "flex-end",
    shadowColor: "#000", // Add shadow for better visibility
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4, // Android shadow
  },
  keyboardDoneButton: {
    paddingVertical: 8, // Increased touch target size
    paddingHorizontal: 16, // Wider button
    backgroundColor: "#fff", // Add background for better visibility
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  doneButtonText: {
    color: primary,
    fontFamily: Typography.fontWeight.semiBold.primary, // Made font weight bolder
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  modalDivider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginLeft: 8,
    textAlign: "center",
  },
  modalText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#444",
    marginBottom: 8,
  },
  modalDates: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
    marginBottom: 16,
  },
  modalReason: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 20,
    fontStyle: "italic",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
    flex: 1,
    alignItems: "center",
  },
  modalCancelButtonText: {
    color: "#666",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  modalConfirmButton: {
    backgroundColor: primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flex: 1,
    alignItems: "center",
  },
  modalConfirmButtonText: {
    color: "white",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
  },
  calendarContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 16,
  },
  dateScrollView: {
    maxHeight: 200,
  },
  dateScrollViewTall: {
    maxHeight: 300,
  },
  dateCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    margin: 8,
    width: 60,
    alignItems: "center",
    paddingBottom: 8,
    position: "relative",
  },
  removeDateButton: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: primary,
    borderRadius: 12,
    width: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  dateHeader: {
    backgroundColor: primary,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    width: "100%",
    alignItems: "center",
    paddingVertical: 4,
  },
  dateMonth: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  dateBody: {
    alignItems: "center",
    marginTop: 4,
  },
  dateNumber: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: primary,
  },
  dateWeekday: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
});
