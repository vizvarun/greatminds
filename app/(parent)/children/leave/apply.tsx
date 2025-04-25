import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  InputAccessoryView,
} from "react-native";
import { Calendar, DateData } from "react-native-calendars";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";

export default function ApplyLeaveScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [leaveReason, setLeaveReason] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const inputRef = useRef<TextInput>(null);
  const inputAccessoryViewID = "leaveReasonInput";

  // Listen for keyboard events
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        // Give the keyboard time to fully appear before scrolling
        setTimeout(() => {
          if (inputRef.current?.isFocused()) {
            scrollToInput();
          }
        }, 100);
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

  // Function to scroll to the input with appropriate offset
  const scrollToInput = () => {
    // Adjust the gap by slightly increasing the multiplier from 0.15 to 0.18
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: Dimensions.get("window").height * 0.18,
        animated: true,
      });
    }, 50);
  };

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
    if (selectedDates.includes(day.dateString)) {
      setSelectedDates(selectedDates.filter((date) => date !== day.dateString));
    } else {
      setSelectedDates([...selectedDates, day.dateString]);
    }
  };

  const handleApplyLeave = () => {
    if (selectedDates.length > 0) {
      // Navigate back to the previous screen
      router.back();

      // Show success alert (this needs to be handled by the parent component)
      // We'll pass the success message as a parameter
      router.setParams({
        leaveApplied: "true",
        selectedDates: selectedDates.join(","),
      });
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
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          keyboardShouldPersistTaps="handled"
          contentInsetAdjustmentBehavior="automatic"
        >
          <Text style={styles.inputLabel}>Select Dates:</Text>
          <Text style={styles.dateSelectionHelp}>
            (Select dates on the calendar below)
          </Text>

          <Calendar
            onDayPress={onDayPress}
            markedDates={getMarkedDates()}
            theme={{
              selectedDayBackgroundColor: primary,
              todayTextColor: primary,
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
            onFocus={() => {
              // Directly scroll to the end when focused
              scrollToInput();
            }}
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

          {/* Reduced padding - just enough for button visibility */}
          <View style={{ height: 40 }} />
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

        {/* Add a custom keyboard accessory for Android that appears when keyboard is visible */}
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
      </KeyboardAvoidingView>
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
    justifyContent: "space-between",
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
  },
  rightPlaceholder: {
    width: 24, // To balance the header
  },
  content: {
    flex: 1,
    padding: 16,
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
    color: "#333", // Ensure text is visible
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
    backgroundColor: "#ccc",
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
  androidKeyboardAccessory: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    flexDirection: "row",
    justifyContent: "flex-end",
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
