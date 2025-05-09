import CustomAlert from "@/components/ui/CustomAlert";
import CustomDropdown from "@/components/ui/CustomDropdown";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { useAuth } from "@/context/AuthContext";
import {
  createDiaryEntry,
  updateDiaryEntry,
  fetchDiaryEntryById,
} from "@/services/diaryApi";
import { fetchSubjects, Subject } from "@/services/subjectApi";
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
  Switch,
  ActivityIndicator,
} from "react-native";

export default function AddDiaryEntryScreen() {
  const params = useLocalSearchParams();
  const { branchId, gradeId, sectionId, date, edit, entryId } = params;
  const isEditMode = edit === "true";
  const { userProfile } = useAuth();

  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "homework", // homework, classwork, preparation, research, other
    effectiveDate: date ? new Date(date as string) : new Date(),
    dueDate: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 1 week later
    subject: "",
    isUrgent: false, // New field for urgent toggle
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempEffectiveDate, setTempEffectiveDate] = useState<Date | null>(null);
  const [tempDueDate, setTempDueDate] = useState<Date | null>(null);

  const [isFetchingEntry, setIsFetchingEntry] = useState(false);
  const [fetchEntryError, setFetchEntryError] = useState<string | null>(null);

  // Fetch subjects from API when component mounts
  useEffect(() => {
    const getSubjects = async () => {
      if (!userProfile || !branchId) return;

      try {
        setIsLoadingSubjects(true);
        setSubjectError(null);

        // Get user ID from profile
        const userId = userProfile.user?.id.toString() || "";

        // Fetch subjects from API
        const subjectsData = await fetchSubjects(branchId as string, userId);

        console.log("Subjects data received:", subjectsData);

        // Transform to format expected by CustomDropdown
        // Handle both array format and object format responses
        const formattedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map((subject) => ({
              id: subject.id.toString(), // Ensure ID is a string
              label: subject.name || subject.subject_name || "Unknown Subject",
            }))
          : Object.entries(subjectsData).map(
              ([key, subject]: [string, any]) => ({
                id: (subject.id || key).toString(),
                label:
                  subject.name || subject.subject_name || "Unknown Subject",
              })
            );

        console.log("Formatted subjects:", formattedSubjects);

        if (formattedSubjects.length > 0) {
          setSubjects(formattedSubjects);

          // Only set default subject if not already set
          if (!formData.subject) {
            setFormData((prev) => ({
              ...prev,
              subject: formattedSubjects[0].id,
            }));
          }
        } else {
          console.warn("No subjects found in the response");
          setSubjectError("No subjects available for this class");
        }
      } catch (error) {
        console.error("Failed to fetch subjects:", error);
        setSubjectError("Failed to load subjects. Please try again.");
      } finally {
        setIsLoadingSubjects(false);
      }
    };

    getSubjects();
  }, [userProfile, branchId]);

  const retryFetchSubjects = async () => {
    if (!userProfile || !branchId) return;

    try {
      setIsLoadingSubjects(true);
      setSubjectError(null);

      const userId = userProfile.user?.id.toString() || "";
      const subjectsData = await fetchSubjects(branchId as string, userId);

      console.log("Retry - Subjects data received:", subjectsData);

      // Transform to format expected by CustomDropdown with more robust handling
      const formattedSubjects = Array.isArray(subjectsData)
        ? subjectsData.map((subject) => ({
            id: subject.id.toString(),
            label: subject.name || subject.subject_name || "Unknown Subject",
          }))
        : Object.entries(subjectsData).map(([key, subject]: [string, any]) => ({
            id: (subject.id || key).toString(),
            label: subject.name || subject.subject_name || "Unknown Subject",
          }));

      console.log("Retry - Formatted subjects:", formattedSubjects);

      if (formattedSubjects.length > 0) {
        setSubjects(formattedSubjects);

        // Only set default subject if not already set
        if (!formData.subject) {
          setFormData((prev) => ({
            ...prev,
            subject: formattedSubjects[0].id,
          }));
        }
      } else {
        setSubjectError("No subjects available for this class");
      }
    } catch (error) {
      console.error("Retry failed to fetch subjects:", error);
      setSubjectError("Failed to load subjects. Please try again.");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

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
    {
      id: "other",
      name: "Other",
      icon: "dots-horizontal-circle",
      color: "#607D8B",
    },
  ];

  // Format entry types for dropdown
  const entryTypeOptions = entryTypes.map((type) => ({
    id: type.id,
    label: type.name,
  }));

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
      fetchEntryData(entryId as string);
    }
  }, [isEditMode, entryId]);

  const fetchEntryData = async (id: string) => {
    setIsFetchingEntry(true);
    setFetchEntryError(null);

    try {
      const entryData = await fetchDiaryEntryById(id);

      if (entryData) {
        // Map API response to form data
        const entryType = mapNoteTypeToFormType(entryData.notetype);

        // Parse dates from API (format could be YYYY-MM-DD or ISO string)
        const effectiveDate = entryData.effectivedate
          ? new Date(entryData.effectivedate)
          : new Date();
        const dueDate = entryData.duedate
          ? new Date(entryData.duedate)
          : new Date(new Date().setDate(new Date().getDate() + 7));

        // Find matching subject ID from our subjects list
        let subjectId = "";
        if (subjects.length > 0 && entryData.subject) {
          const matchingSubject = subjects.find(
            (s) => s.label.toLowerCase() === entryData.subject.toLowerCase()
          );
          if (matchingSubject) {
            subjectId = matchingSubject.id;
          }
        }

        setFormData({
          title: entryData.notetype || "",
          description: entryData.description || "",
          type: entryType,
          subject: subjectId,
          effectiveDate: effectiveDate,
          dueDate: dueDate,
          isUrgent: entryData.isUrgent || false,
        });
      }
    } catch (error) {
      console.error("Error fetching diary entry:", error);
      setFetchEntryError("Failed to load diary entry. Please try again.");
      showAlert("Error", "Failed to load diary entry", "error");
    } finally {
      setIsFetchingEntry(false);
    }
  };

  // Map API note type to our form type
  const mapNoteTypeToFormType = (noteType: string): string => {
    const normalizedType = noteType?.toLowerCase() || "";

    if (
      normalizedType.includes("home") ||
      normalizedType.includes("homework")
    ) {
      return "homework";
    } else if (
      normalizedType.includes("class") ||
      normalizedType.includes("classwork")
    ) {
      return "classwork";
    } else if (
      normalizedType.includes("prep") ||
      normalizedType.includes("preparation")
    ) {
      return "preparation";
    } else if (normalizedType.includes("research")) {
      return "research";
    } else if (normalizedType.includes("test")) {
      return "test";
    } else {
      return "other";
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.title || !formData.description) {
      showAlert("Error", "Please fill all required fields", "error");
      return;
    }

    // Validate subject selection
    if (!formData.subject && subjects.length > 0) {
      showAlert("Error", "Please select a subject", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format dates for API (YYYY-MM-DD format)
      const formatDateForApi = (date: Date): string => {
        return date.toISOString().split("T")[0];
      };

      // Prepare data for API
      const apiData = {
        sectionid: Number(sectionId),
        noteType:
          formData.type === "other"
            ? formData.title
            : getNoteTypeFromType(formData.type),
        effectiveDate: formatDateForApi(formData.effectiveDate),
        dueDate: ["homework", "research", "preparation"].includes(formData.type)
          ? formatDateForApi(formData.dueDate)
          : formatDateForApi(formData.effectiveDate),
        subject: getSubjectLabelFromId(formData.subject),
        description: formData.description,
        isUrgent: formData.isUrgent,
      };

      // Call the appropriate API based on mode
      if (isEditMode && entryId) {
        await updateDiaryEntry(entryId as string, apiData);
        showAlert("Success", "Diary entry updated successfully", "success");
      } else {
        await createDiaryEntry(apiData);
        showAlert("Success", "Diary entry added successfully", "success");
      }

      // Navigate back after successful submission
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Error saving diary entry:", error);
      showAlert(
        "Error",
        "Failed to save diary entry. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getNoteTypeFromType = (type: string): string => {
    switch (type) {
      case "homework":
        return "Homework";
      case "classwork":
        return "Classwork";
      case "preparation":
        return "Preparation";
      case "research":
        return "Research";
      case "test":
        return "Test";
      case "reminder":
        return "Reminder";
      default:
        return "Note";
    }
  };

  const getTypeColor = (typeId: string) => {
    return entryTypes.find((type) => type.id === typeId)?.color || primary;
  };

  const getSubjectLabelFromId = (subjectId: string): string => {
    const subject = subjects.find((subject) => subject.id === subjectId);
    return subject ? subject.label : "Other";
  };

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const inputAccessoryViewID = "diaryFormInput";

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
            {isEditMode ? "Update Diary Entry" : "Add Diary Entry"}
          </Text>
        </View>
      </View>
      <ScrollView style={styles.formContainer}>
        {isFetchingEntry ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={primary} />
            <Text style={styles.loadingText}>Loading diary entry...</Text>
          </View>
        ) : fetchEntryError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{fetchEntryError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchEntryData(entryId as string)}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <CustomDropdown
              options={entryTypeOptions}
              selectedValue={formData.type}
              onValueChange={(value) => handleTypeSelect(value)}
              placeholder="Select entry type"
              label="Entry Type"
            />

            {formData.type === "other" ? (
              <>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) =>
                      setFormData({ ...formData, title: text })
                    }
                    placeholder="e.g. Special Announcement"
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
                    placeholder="e.g. Important information about upcoming events"
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
                  <Text style={styles.label}>Date *</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={handleEffectiveDatePress}
                  >
                    <Text style={styles.dateText}>
                      {formatDate(formData.effectiveDate)}
                    </Text>
                    <MaterialCommunityIcons
                      name="calendar"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {isLoadingSubjects ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={primary} />
                    <Text style={styles.loadingText}>Loading subjects...</Text>
                  </View>
                ) : subjectError ? (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{subjectError}</Text>
                    <TouchableOpacity
                      style={styles.retryButton}
                      onPress={retryFetchSubjects}
                    >
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : subjects.length === 0 ? (
                  <View style={styles.formGroup}>
                    <Text style={styles.warningText}>
                      No subjects available. Default subject will be used.
                    </Text>
                  </View>
                ) : (
                  <CustomDropdown
                    options={subjects}
                    selectedValue={formData.subject}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subject: value })
                    }
                    placeholder="Select a subject"
                    label="Subject"
                  />
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Title *</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.title}
                    onChangeText={(text) =>
                      setFormData({ ...formData, title: text })
                    }
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
                    <MaterialCommunityIcons
                      name="calendar"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {["homework", "research", "preparation"].includes(
                  formData.type
                ) && (
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Due Date *</Text>
                    <TouchableOpacity
                      style={styles.datePickerButton}
                      onPress={handleDueDatePress}
                    >
                      <Text style={styles.dateText}>
                        {formatDate(formData.dueDate)}
                      </Text>
                      <MaterialCommunityIcons
                        name="calendar"
                        size={22}
                        color="#666"
                      />
                    </TouchableOpacity>
                  </View>
                )}
              </>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Urgent Information</Text>
              <View style={styles.toggleWrapper}>
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleLabel}>
                    Mark as urgent information
                  </Text>
                  <Switch
                    trackColor={{ false: "#dddddd", true: primary }}
                    thumbColor={formData.isUrgent ? "#ffffff" : "#f4f3f4"}
                    ios_backgroundColor="#dddddd"
                    onValueChange={(value) =>
                      setFormData({ ...formData, isUrgent: value })
                    }
                    value={formData.isUrgent}
                  />
                </View>
                {formData.isUrgent && (
                  <Text style={styles.urgentHint}>
                    This will be highlighted as important information
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: getTypeColor(formData.type) },
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isEditMode ? "Update Entry" : "Add Entry"}
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

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

      {Platform.OS === "ios" && (
        <KeyboardDismissBar nativeID={inputAccessoryViewID} />
      )}

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
    paddingTop: 14,
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
  toggleWrapper: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 12,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleLabel: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  urgentHint: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#F44336",
    marginTop: 8,
    fontStyle: "italic",
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    marginBottom: 16,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#F44336",
    textAlign: "center",
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 16,
  },
  warningText: {
    color: "#FF9800",
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    marginBottom: 16,
  },
});
