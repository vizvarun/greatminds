import CustomAlert from "@/components/ui/CustomAlert";
import CustomDropdown from "@/components/ui/CustomDropdown";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerAndroid,
} from "@react-native-community/datetimepicker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Keyboard,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AddTimetableEntryScreen() {
  const params = useLocalSearchParams();
  const { branchId, gradeId, sectionId, edit, entryId } = params;
  const isEditMode = edit === "true";

  const [formData, setFormData] = useState({
    subject: "math",
    topic: "",
    day: "monday",
    startTime: new Date(new Date().setHours(9, 0, 0, 0)),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)),
    teacher: "", // Add teacher field to form data
  });

  const [tempStartTime, setTempStartTime] = useState<Date | null>(null);
  const [tempEndTime, setTempEndTime] = useState<Date | null>(null);

  // Time pickers state
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  // Subject options
  const subjects = [
    { id: "math", label: "Mathematics" },
    { id: "science", label: "Science" },
    { id: "english", label: "English" },
    { id: "social", label: "Social Studies" },
    { id: "language", label: "Second Language" },
    { id: "computer", label: "Computer Science" },
    { id: "pe", label: "Physical Education" },
    { id: "art", label: "Arts & Crafts" },
  ];

  // Teacher options
  const teachers = [
    { id: "smith", label: "Mrs. Smith" },
    { id: "johnson", label: "Mr. Johnson" },
    { id: "davis", label: "Mrs. Davis" },
    { id: "wilson", label: "Mr. Wilson" },
    { id: "martinez", label: "Mr. Martinez" },
    { id: "garcia", label: "Ms. Garcia" },
    { id: "rodriguez", label: "Ms. Rodriguez" },
    { id: "thompson", label: "Mr. Thompson" },
    { id: "taylor", label: "Ms. Taylor" },
    { id: "lee", label: "Mr. Lee" },
    { id: "white", label: "Mrs. White" },
    { id: "anderson", label: "Mrs. Anderson" },
    { id: "", label: "No Teacher (e.g., for breaks)" },
  ];

  // Day options
  const days = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
  ];

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleStartTimePress = () => {
    setShowEndTimePicker(false);
    setTempStartTime(formData.startTime);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: formData.startTime,
        mode: "time",
        display: "default", // Use default for material design clock
        is24Hour: false,
        onChange: (event, selectedTime) => {
          if (event.type === "set" && selectedTime) {
            const newStartTime = selectedTime;

            let newEndTime = formData.endTime;
            // If the new start time is after or equal to end time, adjust end time
            if (newStartTime >= formData.endTime) {
              newEndTime = new Date(newStartTime);
              newEndTime.setMinutes(newEndTime.getMinutes() + 45); // Default to 45 minutes period
            }

            setFormData({
              ...formData,
              startTime: newStartTime,
              endTime: newEndTime,
            });
          }
        },
        positiveButtonLabel: "Confirm",
        negativeButtonLabel: "Cancel",
        accentColor: primary,
      });
    } else {
      setShowStartTimePicker(true);
    }
  };

  const handleEndTimePress = () => {
    setShowStartTimePicker(false);
    setTempEndTime(formData.endTime);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: formData.endTime,
        mode: "time",
        display: "default", // Use default for material design clock
        is24Hour: false,
        onChange: (event, selectedTime) => {
          if (event.type === "set" && selectedTime) {
            // Ensure end time is after start time
            if (selectedTime <= formData.startTime) {
              const validEndTime = new Date(formData.startTime.getTime());
              validEndTime.setMinutes(validEndTime.getMinutes() + 45); // Add 45 minutes to start time
              setFormData({ ...formData, endTime: validEndTime });
              showAlert(
                "Invalid Time",
                "End time must be after start time",
                "error"
              );
            } else {
              setFormData({ ...formData, endTime: selectedTime });
            }
          }
        },
        positiveButtonLabel: "Confirm",
        negativeButtonLabel: "Cancel",
        accentColor: primary,
      });
    } else {
      setShowEndTimePicker(true);
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || formData.startTime;

    if (Platform.OS === "android") {
      // This function will not be used for Android anymore
      // It's handled directly in the DateTimePickerAndroid.open call
    } else {
      setTempStartTime(currentTime);
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || formData.endTime;

    if (Platform.OS === "android") {
      // This function will not be used for Android anymore
      // It's handled directly in the DateTimePickerAndroid.open call
    } else {
      setTempEndTime(currentTime);
    }
  };

  const confirmStartTime = () => {
    if (tempStartTime) {
      const newStartTime = tempStartTime;

      let newEndTime = formData.endTime;
      // If start time is after or equal to end time, adjust end time
      if (newStartTime >= formData.endTime) {
        newEndTime = new Date(newStartTime);
        newEndTime.setMinutes(newEndTime.getMinutes() + 45); // Default to 45 minutes period
      }

      setFormData({
        ...formData,
        startTime: newStartTime,
        endTime: newEndTime,
      });
    }
    setShowStartTimePicker(false);
  };

  const confirmEndTime = () => {
    if (tempEndTime) {
      // Ensure end time is after start time
      if (tempEndTime <= formData.startTime) {
        const validEndTime = new Date(formData.startTime.getTime());
        validEndTime.setMinutes(validEndTime.getMinutes() + 45); // Add 45 minutes to start time
        setFormData({ ...formData, endTime: validEndTime });
        showAlert("Invalid Time", "End time must be after start time", "error");
      } else {
        setFormData({ ...formData, endTime: tempEndTime });
      }
    }
    setShowEndTimePicker(false);
  };

  // Fetch entry data when in edit mode
  useEffect(() => {
    if (isEditMode && entryId) {
      // In a real app, you would fetch the entry from an API
      fetchEntryData(entryId as string);
    }
  }, [isEditMode, entryId]);

  const fetchEntryData = (id: string) => {
    // This is a mock implementation - in a real app, you would fetch from an API
    let mockEntry;

    // Simulate different types of entries based on the entryId
    switch (id) {
      case "1":
        mockEntry = {
          id: id,
          subject: "math",
          topic: "Algebra: Quadratic Equations",
          day: "monday",
          startTime: new Date(new Date().setHours(9, 0, 0, 0)),
          endTime: new Date(new Date().setHours(9, 45, 0, 0)),
          teacher: "smith", // Add teacher field
        };
        break;
      case "2":
        mockEntry = {
          id: id,
          subject: "science",
          topic: "Physics: Forces and Motion",
          day: "monday",
          startTime: new Date(new Date().setHours(10, 0, 0, 0)),
          endTime: new Date(new Date().setHours(10, 45, 0, 0)),
          teacher: "davis", // Add teacher field
        };
        break;
      default:
        mockEntry = {
          id: id,
          subject: "english",
          topic: "Poetry Analysis",
          day: "monday",
          startTime: new Date(new Date().setHours(11, 0, 0, 0)),
          endTime: new Date(new Date().setHours(11, 45, 0, 0)),
          teacher: "johnson", // Add teacher field
        };
    }

    // Prefill the form with the fetched data
    setFormData({
      subject: mockEntry.subject,
      topic: mockEntry.topic,
      day: mockEntry.day,
      startTime: mockEntry.startTime,
      endTime: mockEntry.endTime,
      teacher: mockEntry.teacher, // Add teacher field
    });
  };

  const handleSubmit = () => {
    // Validate required fields - topic is not mandatory
    if (!formData.startTime || !formData.endTime) {
      showAlert("Error", "Please fill all required fields", "error");
      return;
    }

    // Validate that end time is after start time
    if (formData.endTime <= formData.startTime) {
      showAlert("Error", "End time must be after start time", "error");
      return;
    }

    // In a real app, you would save the timetable entry here
    if (isEditMode) {
      showAlert("Success", "Timetable entry updated successfully", "success");
    } else {
      showAlert("Success", "Timetable entry added successfully", "success");
    }

    // Reset form or navigate back after successful submission
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputAccessoryViewID = "timetableFormInput";

  // Add keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
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
  }, []);

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
          <Text style={styles.title}>
            {isEditMode ? "Update Period Details" : "Add Period Details"}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.formContainer}>
        <CustomDropdown
          options={subjects}
          selectedValue={formData.subject}
          onValueChange={(value) =>
            setFormData({ ...formData, subject: value })
          }
          placeholder="Select a subject"
          label="Subject"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Topic</Text>
          <TextInput
            style={styles.input}
            value={formData.topic}
            onChangeText={(text) => setFormData({ ...formData, topic: text })}
            placeholder="e.g. Algebra: Linear Equations"
            placeholderTextColor="#999"
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
        </View>

        <CustomDropdown
          options={teachers}
          selectedValue={formData.teacher}
          onValueChange={(value) =>
            setFormData({ ...formData, teacher: value })
          }
          placeholder="Select a teacher"
          label="Teacher"
        />

        <CustomDropdown
          options={days}
          selectedValue={formData.day}
          onValueChange={(value) => setFormData({ ...formData, day: value })}
          placeholder="Select a day"
          label="Day"
        />

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Time *</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={handleStartTimePress}
          >
            <Text style={styles.timeText}>
              {formatTime(formData.startTime)}
            </Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Time *</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={handleEndTimePress}
          >
            <Text style={styles.timeText}>{formatTime(formData.endTime)}</Text>
            <MaterialCommunityIcons
              name="clock-outline"
              size={22}
              color="#666"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>
            {isEditMode ? "Update Period" : "Add Period"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Start Time Picker - iOS modal only, Android uses imperative API */}
      {showStartTimePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          visible={showStartTimePicker}
          animationType="fade"
          onRequestClose={() => setShowStartTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Start Time</Text>
              <DateTimePicker
                value={tempStartTime || formData.startTime}
                mode="time"
                display="spinner"
                onChange={handleStartTimeChange}
                style={styles.dateTimePicker}
                textColor="#000000"
                themeVariant="light"
                minuteInterval={5}
                accentColor={primary}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowStartTimePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmStartTime}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* End Time Picker - iOS modal only, Android uses imperative API */}
      {showEndTimePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          visible={showEndTimePicker}
          animationType="fade"
          onRequestClose={() => setShowEndTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select End Time</Text>
              <DateTimePicker
                value={tempEndTime || formData.endTime}
                mode="time"
                display="spinner"
                onChange={handleEndTimeChange}
                style={styles.dateTimePicker}
                textColor="#000000"
                themeVariant="light"
                minuteInterval={5}
                accentColor={primary}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEndTimePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmEndTime}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Add keyboard dismiss bar for iOS */}
      {Platform.OS === "ios" && (
        <KeyboardDismissBar nativeID={inputAccessoryViewID} />
      )}

      {/* Add keyboard dismiss bar for Android */}
      {Platform.OS === "android" && keyboardVisible && (
        <View style={styles.androidKeyboardAccessory}>
          <TouchableOpacity
            style={styles.keyboardDoneButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 11,
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
  formContainer: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  timePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  submitButton: {
    backgroundColor: primary,
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 24,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  dateTimePicker: {
    width: "100%",
    height: 200,
    marginVertical: 10,
    backgroundColor: Platform.OS === "android" ? "#fff" : undefined,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 120,
    alignItems: "center",
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  confirmButton: {
    backgroundColor: primary,
    borderColor: primary,
  },
  confirmButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  androidKeyboardAccessory: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-end",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  keyboardDoneButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  doneButtonText: {
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 16,
  },
});
