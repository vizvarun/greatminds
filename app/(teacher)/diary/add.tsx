import CustomAlert from "@/components/ui/CustomAlert";
import CustomDropdown from "@/components/ui/CustomDropdown";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";

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

export default function AddDiaryEntryScreen() {
  const params = useLocalSearchParams();
  const { branchId, gradeId, sectionId, date, edit, entryId } = params;
  const isEditMode = edit === "true";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "homework", // homework, classwork, preparation, research
    effectiveDate: date ? new Date(date as string) : new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 1 week later
    subject: "math",
  });

  const [tempEffectiveDate, setTempEffectiveDate] = useState<Date | null>(null);
  const [tempDueDate, setTempDueDate] = useState<Date | null>(null);

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

  // Date pickers state
  const [showEffectiveDatePicker, setShowEffectiveDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Alert state
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
  });

  // Entry types with colors
  const entryTypes = [
    {
      id: "homework",
      name: "Homework",
      icon: "book-open-variant",
      color: "#4CAF50",
    },
    {
      id: "classwork",
      name: "Classwork",
      icon: "pencil-outline",
      color: "#2196F3",
    },
    {
      id: "preparation",
      name: "Preparation",
      icon: "clipboard-outline",
      color: "#F44336",
    },
    { id: "research", name: "Research", icon: "magnify", color: "#3F51B5" },
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

  const formatDate = (date: Date) => {
    // Format date as "Wed, May 28" with comma between day and date
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const handleEffectiveDatePress = () => {
    setShowDueDatePicker(false);
    setTempEffectiveDate(formData.effectiveDate);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: formData.effectiveDate,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            const newEffectiveDate = selectedDate;

            let newDueDate = formData.dueDate;
            if (newEffectiveDate > formData.dueDate) {
              newDueDate = new Date(newEffectiveDate);
              newDueDate.setDate(newEffectiveDate.getDate() + 7);
            }

            setFormData({
              ...formData,
              effectiveDate: newEffectiveDate,
              dueDate: newDueDate,
            });
          }
        },
        positiveButtonLabel: "Confirm",
        negativeButtonLabel: "Cancel",
      });
    } else {
      setShowEffectiveDatePicker(true);
    }
  };

  const handleDueDatePress = () => {
    setShowEffectiveDatePicker(false);
    setTempDueDate(formData.dueDate);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: formData.dueDate,
        mode: "date",
        minimumDate: formData.effectiveDate,
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            const validDueDate =
              selectedDate < formData.effectiveDate
                ? new Date(formData.effectiveDate.getTime())
                : selectedDate;

            setFormData({ ...formData, dueDate: validDueDate });
          }
        },
        positiveButtonLabel: "Confirm",
        negativeButtonLabel: "Cancel",
        accentColor: primary,
      });
    } else {
      setShowDueDatePicker(true);
    }
  };

  const handleEffectiveDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.effectiveDate;

    if (Platform.OS === "android") {
      // This function will not be used for Android anymore
      // It's handled directly in the DateTimePickerAndroid.open call
    } else {
      setTempEffectiveDate(currentDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.dueDate;

    if (Platform.OS === "android") {
      // This function will not be used for Android anymore
      // It's handled directly in the DateTimePickerAndroid.open call
    } else {
      setTempDueDate(currentDate);
    }
  };

  const confirmEffectiveDate = () => {
    if (tempEffectiveDate) {
      const newEffectiveDate = tempEffectiveDate;

      let newDueDate = formData.dueDate;
      if (newEffectiveDate > formData.dueDate) {
        newDueDate = new Date(newEffectiveDate);
        newDueDate.setDate(newEffectiveDate.getDate() + 7);
      }

      setFormData({
        ...formData,
        effectiveDate: newEffectiveDate,
        dueDate: newDueDate,
      });
    }
    setShowEffectiveDatePicker(false);
  };

  const confirmDueDate = () => {
    if (tempDueDate) {
      setFormData({ ...formData, dueDate: tempDueDate });
    }
    setShowDueDatePicker(false);
  };

  const handleTypeSelect = (type: string) => {
    setFormData({ ...formData, type });
  };

  // Fetch entry data when in edit mode
  useEffect(() => {
    if (isEditMode && entryId) {
      // In a real app, you would fetch the entry from an API
      // For demo purposes, we'll simulate fetching entry data
      fetchEntryData(entryId as string);
    }
  }, [isEditMode, entryId]);

  const fetchEntryData = (id: string) => {
    // This is a mock implementation - in a real app, you would fetch from an API
    // Mock data based on the entry ID
    let mockEntry;

    // Simulate different types of entries based on the entryId
    // In a real app, you would fetch the actual entry from your database
    switch (id) {
      case "1":
        mockEntry = {
          id: id,
          title: "Math Quiz Preparation",
          description: "Complete practice problems 1-20 from Chapter 5",
          type: "homework",
          subject: "math",
          effectiveDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        };
        break;
      case "2":
        mockEntry = {
          id: id,
          title: "Group Discussion",
          description: "In-class discussion on renewable energy sources",
          type: "classwork",
          subject: "science",
          effectiveDate: new Date(),
          dueDate: null, // classwork doesn't necessarily have a due date
        };
        break;
      case "3":
        mockEntry = {
          id: id,
          title: "Research Project",
          description:
            "Research on historical figures for upcoming presentation",
          type: "research",
          subject: "social",
          effectiveDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
        };
        break;
      case "4":
        mockEntry = {
          id: id,
          title: "Exam Preparation",
          description: "Review previous chapters for mid-term exam",
          type: "preparation",
          subject: "english",
          effectiveDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        };
        break;
      default:
        mockEntry = {
          id: id,
          title: "Assignment",
          description: "General description for any entry type",
          type: "homework",
          subject: "math",
          effectiveDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 3)),
        };
    }

    // Prefill the form with the fetched data
    setFormData({
      title: mockEntry.title,
      description: mockEntry.description,
      type: mockEntry.type,
      subject: mockEntry.subject,
      effectiveDate: mockEntry.effectiveDate,
      dueDate:
        mockEntry.dueDate ||
        new Date(new Date().setDate(new Date().getDate() + 7)),
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title || !formData.description) {
      showAlert("Error", "Please fill all required fields", "error");
      return;
    }

    // In a real app, you would save the diary entry here
    if (isEditMode) {
      showAlert("Success", "Diary entry updated successfully", "success");
    } else {
      showAlert("Success", "Diary entry added successfully", "success");
    }

    // Reset form or navigate back after successful submission
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  // Function to get the current color of the selected entry type
  const getTypeColor = (typeId: string) => {
    return entryTypes.find((type) => type.id === typeId)?.color || primary;
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputAccessoryViewID = "diaryFormInput";

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
          <Text style={styles.label}>Entry Type *</Text>
          <View style={styles.typeButtonsContainer}>
            {entryTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  formData.type === type.id && {
                    ...styles.selectedTypeButton,
                    backgroundColor: type.color,
                  },
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={22}
                  color={formData.type === type.id ? "#fff" : "#666"}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type.id && styles.selectedTypeButtonText,
                  ]}
                >
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="e.g. Complete Math Exercises"
            placeholderTextColor="#999"
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="e.g. Complete exercises 1-10 on page 25"
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            inputAccessoryViewID={
              Platform.OS === "ios" ? inputAccessoryViewID : undefined
            }
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Effective Date *</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={handleEffectiveDatePress}
          >
            <Text style={styles.dateText}>
              {formatDate(formData.effectiveDate)}
            </Text>
            <MaterialCommunityIcons name="calendar" size={22} color="#666" />
          </TouchableOpacity>
        </View>

        {["homework", "research", "preparation"].includes(formData.type) && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Due Date *</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={handleDueDatePress}
            >
              <Text style={styles.dateText}>
                {formatDate(formData.dueDate)}
              </Text>
              <MaterialCommunityIcons name="calendar" size={22} color="#666" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: getTypeColor(formData.type) },
          ]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isEditMode ? "Update Entry" : "Add Entry"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Effective Date Picker - iOS modal only, Android uses imperative API */}
      {showEffectiveDatePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          visible={showEffectiveDatePicker}
          animationType="fade"
          onRequestClose={() => setShowEffectiveDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Effective Date</Text>
              <DateTimePicker
                value={tempEffectiveDate || formData.effectiveDate}
                mode="date"
                display="spinner"
                onChange={handleEffectiveDateChange}
                style={styles.dateTimePicker}
                textColor="#000000"
                themeVariant="light"
                accentColor={primary}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowEffectiveDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmEffectiveDate}
                >
                  <Text style={styles.confirmButtonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Due Date Picker - iOS modal only, Android uses imperative API */}
      {showDueDatePicker && Platform.OS === "ios" && (
        <Modal
          transparent={true}
          visible={showDueDatePicker}
          animationType="fade"
          onRequestClose={() => setShowDueDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Due Date</Text>
              <DateTimePicker
                value={tempDueDate || formData.dueDate}
                mode="date"
                display="spinner"
                onChange={handleDueDateChange}
                style={styles.dateTimePicker}
                textColor="#000000"
                themeVariant="light"
                accentColor={primary}
                minimumDate={formData.effectiveDate}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowDueDatePicker(false)}
                >
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.confirmButton]}
                  onPress={confirmDueDate}
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  datePickerButton: {
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
  dateText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  typeButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f1f1",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    width: "48%",
  },
  selectedTypeButton: {
    backgroundColor: primary, // This will be overridden by the specific color
  },
  typeButtonText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginLeft: 8,
  },
  selectedTypeButtonText: {
    color: "#fff",
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
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    minWidth: 100,
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
