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
  Linking,
} from "react-native";

export default function AddDiaryEntryScreen() {
  const params = useLocalSearchParams();
  const { branchId, gradeId, sectionId, date, edit, entryId } = params;
  const isEditMode = edit === "true";
  const { userProfile } = useAuth();

  const getInitialEffectiveDate = () => {
    if (!date) return new Date();

    try {
      const parsedDate = new Date(date as string);

      if (isNaN(parsedDate.getTime())) {
        console.log("Invalid date from params:", date);
        return new Date();
      }
      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", error);
      return new Date();
    }
  };

  const [subjects, setSubjects] = useState<{ id: string; label: string }[]>([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
  const [subjectError, setSubjectError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "homework",
    effectiveDate: getInitialEffectiveDate(),
    dueDate: new Date(
      new Date().setDate(getInitialEffectiveDate().getDate() + 1)
    ),
    subject: "",
    isUrgent: false,
    link: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tempEffectiveDate, setTempEffectiveDate] = useState<Date | null>(null);
  const [tempDueDate, setTempDueDate] = useState<Date | null>(null);

  const [isFetchingEntry, setIsFetchingEntry] = useState(false);
  const [fetchEntryError, setFetchEntryError] = useState<string | null>(null);

  const [originalEntryData, setOriginalEntryData] = useState<any>(null);

  useEffect(() => {
    const getSubjects = async () => {
      if (!userProfile || !branchId) return;

      try {
        setIsLoadingSubjects(true);
        setSubjectError(null);

        const userId = userProfile.user?.id.toString() || "";

        const subjectsData = await fetchSubjects(branchId as string, userId);

        console.log("Subjects data received:", subjectsData);

        const formattedSubjects = Array.isArray(subjectsData)
          ? subjectsData.map((subject) => ({
              id: subject.id.toString(),
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
      color: "#00BCD4",
    },
    {
      id: "preparation",
      name: "Preparation",
      icon: "clipboard-outline",
      color: "#F44336",
    },
    {
      id: "research",
      name: "Research",
      icon: "magnify",
      color: "#673AB7",
    },
    {
      id: "other",
      name: "Other",
      icon: "dots-horizontal-circle",
      color: "#607D8B",
    },
  ];

  const entryTypeOptions = entryTypes.map((type) => ({
    id: type.id,
    label: type.name,
  }));

  const [showEffectiveDatePicker, setShowEffectiveDatePicker] = useState(false);
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

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
    try {
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date provided to formatDate:", date);
        return formatDate(new Date());
      }

      const options: Intl.DateTimeFormatOptions = {
        weekday: "short",
        month: "long",
        day: "numeric",
      };
      return date.toLocaleDateString("en-US", options);
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  const handleEffectiveDatePress = () => {
    setShowDueDatePicker(false);
    const safeEffectiveDate = isNaN(formData.effectiveDate.getTime())
      ? new Date()
      : formData.effectiveDate;

    setTempEffectiveDate(safeEffectiveDate);

    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: safeEffectiveDate,
        mode: "date",
        onChange: (event, selectedDate) => {
          if (event.type === "set" && selectedDate) {
            const newEffectiveDate = selectedDate;

            let newDueDate = formData.dueDate;
            if (newEffectiveDate > formData.dueDate) {
              newDueDate = new Date(newEffectiveDate);
              newDueDate.setDate(newEffectiveDate.getDate() + 1);
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
    } else {
      setTempEffectiveDate(currentDate);
    }
  };

  const handleDueDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formData.dueDate;

    if (Platform.OS === "android") {
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
        newDueDate.setDate(newEffectiveDate.getDate() + 1);
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

  useEffect(() => {
    if (isEditMode && entryId) {
      fetchEntryData(entryId as string);
    }
  }, [isEditMode, entryId]);

  useEffect(() => {
    if (originalEntryData && subjects.length > 0) {
      console.log("Trying to match subject:", originalEntryData.subject);
      console.log(
        "Available subjects:",
        subjects.map((s) => `${s.id}: ${s.label}`).join(", ")
      );

      let subjectId = "";
      if (originalEntryData.subject) {
        let matchingSubject = subjects.find(
          (s) =>
            s.label.toLowerCase() === originalEntryData.subject.toLowerCase()
        );

        if (!matchingSubject) {
          matchingSubject = subjects.find(
            (s) =>
              s.label
                .toLowerCase()
                .includes(originalEntryData.subject.toLowerCase()) ||
              originalEntryData.subject
                .toLowerCase()
                .includes(s.label.toLowerCase())
          );
        }

        if (matchingSubject) {
          console.log("Found matching subject:", matchingSubject.label);
          subjectId = matchingSubject.id;
        } else {
          console.log(
            "No matching subject found. Using first available subject."
          );
          if (subjects.length > 0) {
            subjectId = subjects[0].id;
          }
        }
      }

      setFormData((prevData) => ({
        ...prevData,
        subject: subjectId,
        link: originalEntryData.link || "",
      }));
    }
  }, [subjects, originalEntryData]);

  const fetchEntryData = async (id: string) => {
    setIsFetchingEntry(true);
    setFetchEntryError(null);

    try {
      const response = await fetchDiaryEntryById(id);

      const entryData = response.diary_id ? response.diary_id : response;

      if (entryData) {
        console.log("Received entry data:", entryData);
        setOriginalEntryData(entryData);

        const entryType = mapNoteTypeToFormType(entryData.notetype);

        const effectiveDate = entryData.effectivedate
          ? new Date(entryData.effectivedate)
          : new Date();
        const dueDate = entryData.duedate
          ? new Date(entryData.duedate)
          : new Date(new Date().setDate(new Date().getDate() + 7));

        let subjectId = "";
        if (subjects.length > 0 && entryData.subject) {
          const matchingSubject = subjects.find(
            (s) => s.label.toLowerCase() === entryData.subject.toLowerCase()
          );
          if (matchingSubject) {
            subjectId = matchingSubject.id;
          }
        }

        const title =
          entryType === "other" ? entryData.subject : entryData.notetype || "";

        setFormData({
          title: title,
          description: entryData.description || "",
          type: entryType,
          subject: subjectId,
          effectiveDate: effectiveDate,
          dueDate: dueDate,
          isUrgent: entryData.isurgent || false,
          link: entryData.link || "",
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
    } else if (normalizedType === "other" || noteType === "Other") {
      return "other";
    } else {
      return "other";
    }
  };

  const handleSubmit = async () => {
    if (!formData.description) {
      showAlert("Error", "Please enter a description", "error");
      return;
    }

    if (formData.type === "other") {
      if (!formData.title) {
        showAlert("Error", "Please enter a title", "error");
        return;
      }
    } else {
      if (!formData.subject && subjects.length > 0) {
        showAlert("Error", "Please select a subject", "error");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formatDateForApi = (date: Date): string => {
        return date.toISOString().split("T")[0];
      };

      let apiData;

      if (formData.type === "other") {
        apiData = {
          sectionid: Number(sectionId),
          noteType: "Other",
          effectiveDate: formatDateForApi(formData.effectiveDate),
          dueDate: formatDateForApi(formData.effectiveDate),
          subject: formData.title,
          description: formData.description,
          isUrgent: formData.isUrgent,
          link: formData.link || "",
        };
      } else {
        apiData = {
          sectionid: Number(sectionId),
          noteType: getNoteTypeFromType(formData.type),
          effectiveDate: formatDateForApi(formData.effectiveDate),
          dueDate: ["homework", "research", "preparation"].includes(
            formData.type
          )
            ? formatDateForApi(formData.dueDate)
            : formatDateForApi(formData.effectiveDate),
          subject: getSubjectLabelFromId(formData.subject),
          description: formData.description,
          isUrgent: formData.isUrgent,
          link: formData.link || "",
        };
      }

      console.log("Form data at submission:", {
        type: formData.type,
        title: formData.title,
        subject: formData.subject,
      });
      console.log("Final API payload:", apiData);

      if (isEditMode && entryId) {
        await updateDiaryEntry(entryId as string, apiData);
        showAlert("Success", "Diary entry updated successfully", "success");
      } else {
        await createDiaryEntry(apiData);
        showAlert("Success", "Diary entry added successfully", "success");
      }

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

  // Debugging helper
  console.log("Link value:", formData.link);

  // Always show the icon as long as there's any text (even a single character)
  const isValidUrl = (url: string) => {
    const result = url && url.trim().length > 0;
    console.log("URL validation result:", result, "for URL:", url);
    return result;
  };

  // Simplified open link function - just try to open whatever was entered
  const openLink = async (url: string) => {
    try {
      // Add https:// prefix if no protocol is specified
      let urlToOpen = url.trim();
      if (
        !urlToOpen.startsWith("http://") &&
        !urlToOpen.startsWith("https://")
      ) {
        urlToOpen = "https://" + urlToOpen;
      }

      console.log("Opening URL:", urlToOpen);
      await Linking.openURL(urlToOpen);
    } catch (error) {
      console.error("Error opening URL:", error);
      showAlert("Error", "Failed to open the URL", "error");
    }
  };

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
                  <Text style={styles.label}>Resource Link (Optional)</Text>
                  <View style={styles.linkInputContainer}>
                    <TextInput
                      style={styles.linkInput}
                      value={formData.link}
                      onChangeText={(text) => {
                        console.log("Link input changed:", text);
                        setFormData({ ...formData, link: text });
                      }}
                      placeholder="e.g. example.com/resource"
                      placeholderTextColor="#999"
                      keyboardType="url"
                      autoCapitalize="none"
                      inputAccessoryViewID={
                        Platform.OS === "ios" ? inputAccessoryViewID : undefined
                      }
                    />
                    <View style={styles.linkPreviewButtonContainer}>
                      {formData.link.trim().length > 0 ? (
                        <TouchableOpacity
                          style={styles.linkPreviewButton}
                          onPress={() => openLink(formData.link)}
                          accessibilityLabel="Open link in browser"
                        >
                          <MaterialCommunityIcons
                            name="open-in-new"
                            size={24}
                            color={primary}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
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
    marginTop: 4,
    opacity: 0.8,
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
  linkInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    height: 46,
  },
  linkInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    height: 44,
  },
  linkPreviewButtonContainer: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  linkPreviewButton: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
