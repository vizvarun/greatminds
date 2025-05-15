import CustomAlert from "@/components/ui/CustomAlert";
import InitialsAvatar from "@/components/ui/InitialsAvatar";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  fetchSectionAttendanceDetails,
  updateSectionAttendance,
  StudentAttendanceDetail,
  getStatusCode,
} from "@/services/attendanceApi";

// Status colors and icons for consistency
const STATUS_CONFIG = {
  all: { color: primary, icon: "account-group" },
  present: { color: "#4CAF50", icon: "check-circle" },
  absent: { color: "#F44336", icon: "close-circle" },
  leave: { color: "#9C27B0", icon: "calendar-clock" },
  untracked: { color: "#9E9E9E", icon: "help-circle" },
};

export default function AttendanceTrackerScreen() {
  const { branchId, gradeId, sectionId, filter } = useLocalSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentAttendanceDetail[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    filter as string | undefined
  );
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(
    new Set()
  );
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
    showCancelButton: false,
  });
  const [selectedStudent, setSelectedStudent] =
    useState<StudentAttendanceDetail | null>(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);

  // Fetch student data from API instead of using dummy data
  useEffect(() => {
    fetchStudents();
  }, [sectionId]);

  // Function to fetch students from API
  const fetchStudents = async () => {
    if (!sectionId) return;

    try {
      setRefreshing(true);
      const studentsData = await fetchSectionAttendanceDetails(
        sectionId as string
      );
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      showAlert(
        "Error",
        "Failed to load student attendance data. Please try again.",
        "error"
      );
    } finally {
      setRefreshing(false);
    }
  };

  // Reset selections on mode change
  useEffect(() => {
    if (!isBulkMode) setSelectedStudents(new Set());
  }, [isBulkMode]);

  // Update URL when status filter changes
  useEffect(() => {
    if (statusFilter && statusFilter !== "all") {
      router.setParams({ filter: statusFilter });
    } else {
      router.setParams({ filter: undefined });
    }
  }, [statusFilter]);

  // Set status filter from URL param
  useEffect(() => {
    setStatusFilter(
      filter && filter !== "undefined" ? (filter as string) : "all"
    );
  }, [filter]);

  // Replace the existing onRefresh function
  const onRefresh = useCallback(() => {
    fetchStudents();
    setSearchQuery("");
  }, [sectionId]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    onConfirm = () => {},
    showCancelButton = false,
    onCancel = () => {}
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      onCancel,
      showCancelButton,
    });
  };

  const hideAlert = (confirmed = false) => {
    setAlert((prev) => ({ ...prev, visible: false }));
    if (confirmed && alert.onConfirm) {
      alert.onConfirm();
    } else if (!confirmed && alert.onCancel) {
      alert.onCancel();
    }
  };

  // Update the changeStudentStatus function to use the API
  const changeStudentStatus = async (
    studentId: number,
    newStatus: "present" | "absent" | "leave" | "untracked"
  ) => {
    if (isBulkMode) {
      toggleStudentSelection(studentId.toString());
      return;
    }

    try {
      // Find the student to get their data
      const student = students.find((s) => s.studentId === studentId);
      if (!student) return;

      // Prepare update payload
      const statusCode = getStatusCode(newStatus);
      const updates = [
        {
          student_id: studentId,
          status: statusCode,
          date: student.date,
          remarks: student.remarks || "",
        },
      ];

      // Optimistically update UI
      const updatedStudents = students.map((student) =>
        student.studentId === studentId
          ? { ...student, status: newStatus, statusCode }
          : student
      );
      setStudents(updatedStudents);

      // Make API call to update attendance
      await updateSectionAttendance(sectionId as string, updates);
    } catch (error) {
      console.error("Error updating attendance status:", error);
      showAlert(
        "Error",
        "Failed to update attendance. Please try again.",
        "error"
      );
      // Revert back to original data if there's an error
      fetchStudents();
    }
  };

  // Update the applyBulkAction function to use the API
  const applyBulkAction = async (
    newStatus: "present" | "absent" | "leave" | "untracked"
  ) => {
    if (selectedStudents.size === 0) {
      showAlert("No Selection", "Please select students first", "info");
      return;
    }

    try {
      // Prepare updates for selected students
      const statusCode = getStatusCode(newStatus);
      const updates = Array.from(selectedStudents)
        .map((id) => {
          const student = students.find((s) => s.id.toString() === id);
          if (!student) return null;

          return {
            student_id: student.studentId,
            status: statusCode,
            date: student.date,
            remarks: student.remarks || "",
          };
        })
        .filter(Boolean);

      // Optimistically update UI
      const updatedStudents = students.map((student) =>
        selectedStudents.has(student.id.toString())
          ? { ...student, status: newStatus, statusCode }
          : student
      );
      setStudents(updatedStudents);

      // Make API call
      await updateSectionAttendance(sectionId as string, updates);

      showAlert(
        "Status Updated",
        `${selectedStudents.size} student(s) marked as ${newStatus}`,
        "success"
      );

      setIsBulkMode(false);
      setSelectedStudents(new Set());
    } catch (error) {
      console.error("Error updating bulk attendance:", error);
      showAlert(
        "Error",
        "Failed to update attendance. Please try again.",
        "error"
      );
      // Revert back to original data if there's an error
      fetchStudents();
    }
  };

  // Update handleMarkAllPresent function to use API
  const handleMarkAllPresent = async () => {
    if (statusCounts.untracked === 0) {
      showAlert(
        "No Action Needed",
        "All students are already tracked. No changes needed.",
        "info"
      );
      return;
    }

    showAlert(
      "Mark All Present",
      `Do you want to mark all ${statusCounts.untracked} untracked students as present?`,
      "info",
      async () => {
        try {
          // Get all untracked students
          const untrackedStudents = students.filter(
            (student) => student.status === "untracked"
          );

          // Prepare updates
          const updates = untrackedStudents.map((student) => ({
            student_id: student.studentId,
            status: "PR" as "PR" | "AB" | "LE" | "UT",
            date: student.date,
            remarks: student.remarks || "",
          }));

          // Optimistically update UI
          const updatedStudents = students.map((student) =>
            student.status === "untracked"
              ? { ...student, status: "present", statusCode: "PR" }
              : student
          );
          setStudents(updatedStudents);

          // Make API call
          await updateSectionAttendance(sectionId as string, updates);

          showAlert(
            "Success",
            "All untracked students have been marked as present.",
            "success"
          );
        } catch (error) {
          console.error("Error marking all present:", error);
          showAlert(
            "Error",
            "Failed to update attendance. Please try again.",
            "error"
          );
          // Revert back to original data
          fetchStudents();
        }
      },
      true,
      () => {}
    );
  };

  // Add this new function for submitting attendance
  const handleSubmitAttendance = () => {
    // Check if there are any untracked students
    if (statusCounts.untracked > 0) {
      showAlert(
        "Untracked Students",
        `There are ${statusCounts.untracked} untracked students. Do you want to continue with submission?`,
        "warning",
        async () => {
          await submitAttendance();
        },
        true,
        () => {}
      );
    } else {
      submitAttendance();
    }
  };

  // Function to handle the actual submission
  const submitAttendance = async () => {
    try {
      // Get all students data
      const updates = students.map((student) => ({
        student_id: student.studentId,
        status: getStatusCode(student.status),
        date: student.date,
        remarks: student.remarks || "",
      }));

      // Make API call to update attendance
      await updateSectionAttendance(sectionId as string, updates);

      showAlert("Success", "Attendance submitted successfully.", "success");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      showAlert(
        "Error",
        "Failed to submit attendance. Please try again.",
        "error"
      );
    }
  };

  // Toggle student selection in bulk mode
  const toggleStudentSelection = (studentId: string) => {
    if (!isBulkMode) return;

    const newSelection = new Set(selectedStudents);
    if (newSelection.has(studentId)) {
      newSelection.delete(studentId);
    } else {
      newSelection.add(studentId);
    }
    setSelectedStudents(newSelection);
  };

  // Get filtered students based on search and status filter
  const getFilteredStudents = () => {
    let filteredList = students;

    if (statusFilter && statusFilter !== "all") {
      filteredList = filteredList.filter((s) => s.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredList = filteredList.filter(
        (s) =>
          s.name.toLowerCase().includes(query) || s.enrollmentNo.includes(query)
      );
    }

    // Sort students first by status priority, then alphabetically by name within each status
    filteredList = [...filteredList].sort((a, b) => {
      const statusPriority = {
        absent: 1,
        leave: 2,
        untracked: 3,
        present: 4,
      };

      const statusDiff =
        (statusPriority[a.status] || 10) - (statusPriority[b.status] || 10);

      // If status is the same, sort alphabetically by name
      if (statusDiff === 0) {
        return a.name.localeCompare(b.name);
      }

      // Otherwise, sort by status priority
      return statusDiff;
    });

    return filteredList;
  };

  // Handle showing student details
  const handleShowStudentDetails = (student: StudentAttendanceDetail) => {
    setSelectedStudent(student);
    setShowStudentDetails(true);
  };

  // Status counts for the badge numbers
  const statusCounts = {
    all: students.length,
    present: students.filter((s) => s.status === "present").length,
    absent: students.filter((s) => s.status === "absent").length,
    leave: students.filter((s) => s.status === "leave").length,
    untracked: students.filter((s) => s.status === "untracked").length,
  };

  // Filtered students based on current filters
  const filteredStudents = getFilteredStudents();

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
  };

  // Render a single student item
  const renderStudentItem = ({ item }: { item: StudentAttendanceDetail }) => {
    const isSelected = selectedStudents.has(item.id.toString());
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity
        style={[
          styles.studentCard,
          { backgroundColor: `${statusConfig.color}08` },
          isSelected && styles.selectedStudentCard,
        ]}
        onPress={() => toggleStudentSelection(item.id.toString())}
        activeOpacity={isBulkMode ? 0.7 : 1}
      >
        <View style={styles.studentWithAvatar}>
          <InitialsAvatar
            name={item.name}
            size={40}
            imageUri={item.profilePic}
            style={styles.studentAvatar}
          />

          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{item.name}</Text>
            <Text style={styles.studentRoll}>
              Enrollment No: {item.enrollmentNo}
            </Text>

            {!isBulkMode && (
              <View style={styles.statusIndicator}>
                <MaterialCommunityIcons
                  name={statusConfig.icon}
                  size={14}
                  color={statusConfig.color}
                />
                <Text
                  style={[styles.statusText, { color: statusConfig.color }]}
                >
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          {isBulkMode ? (
            <MaterialCommunityIcons
              name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
              size={24}
              color={isSelected ? primary : "#999"}
            />
          ) : (
            <>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "rgba(76, 175, 80, 0.1)" },
                ]}
                onPress={() => changeStudentStatus(item.studentId, "present")}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={18}
                  color="#4CAF50"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "rgba(244, 67, 54, 0.1)" },
                ]}
                onPress={() => changeStudentStatus(item.studentId, "absent")}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color="#F44336"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "rgba(11, 181, 191, 0.1)" },
                ]}
                onPress={() => handleShowStudentDetails(item)}
              >
                <MaterialCommunityIcons
                  name="eye-outline"
                  size={18}
                  color={primary}
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // List header component with filters - in order: All, Absent, Leave, Untracked, Present
  const ListHeaderComponent = () => (
    <View style={styles.listHeader}>
      <View style={styles.filterChips}>
        {/* 1. All filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            (!statusFilter || statusFilter === "all") &&
              styles.activeFilterChip,
          ]}
          onPress={() => setStatusFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              (!statusFilter || statusFilter === "all") &&
                styles.activeFilterText,
            ]}
          >
            All ({statusCounts.all})
          </Text>
        </TouchableOpacity>

        {/* 2. Absent filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "absent" && styles.activeFilterChip,
            statusFilter === "absent" && {
              borderColor: STATUS_CONFIG.absent.color,
            },
          ]}
          onPress={() => setStatusFilter("absent")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "absent" && {
                color: STATUS_CONFIG.absent.color,
              },
            ]}
          >
            Absent ({statusCounts.absent})
          </Text>
        </TouchableOpacity>

        {/* 3. Leave filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "leave" && styles.activeFilterChip,
            statusFilter === "leave" && {
              borderColor: STATUS_CONFIG.leave.color,
            },
          ]}
          onPress={() => setStatusFilter("leave")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "leave" && { color: STATUS_CONFIG.leave.color },
            ]}
          >
            Leave ({statusCounts.leave})
          </Text>
        </TouchableOpacity>

        {/* 4. Untracked filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "untracked" && styles.activeFilterChip,
            statusFilter === "untracked" && {
              borderColor: STATUS_CONFIG.untracked.color,
            },
          ]}
          onPress={() => setStatusFilter("untracked")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "untracked" && {
                color: STATUS_CONFIG.untracked.color,
              },
            ]}
          >
            Untracked ({statusCounts.untracked})
          </Text>
        </TouchableOpacity>

        {/* 5. Present filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            statusFilter === "present" && styles.activeFilterChip,
            statusFilter === "present" && {
              borderColor: STATUS_CONFIG.present.color,
            },
          ]}
          onPress={() => setStatusFilter("present")}
        >
          <Text
            style={[
              styles.filterChipText,
              statusFilter === "present" && {
                color: STATUS_CONFIG.present.color,
              },
            ]}
          >
            Present ({statusCounts.present})
          </Text>
        </TouchableOpacity>
      </View>

      {searchQuery.length > 0 && (
        <View style={styles.activeFilterBanner}>
          <Text style={styles.activeFilterText}>
            {`Search: "${searchQuery}"`}
            {statusFilter && statusFilter !== "all"
              ? ` in ${statusFilter} students`
              : ""}
          </Text>
          <TouchableOpacity onPress={clearFilters}>
            <MaterialCommunityIcons name="close" size={18} color={primary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Empty state when no students match filters
  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="account-search" size={50} color="#ddd" />
      <Text style={styles.emptyText}>
        {searchQuery
          ? "No students match your search"
          : statusFilter && statusFilter !== "all"
          ? `No students found`
          : "No students available"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Attendance Tracker</Text>
        </View>
        <TouchableOpacity
          style={[styles.modeButton, isBulkMode && styles.activeModeButton]}
          onPress={() => setIsBulkMode(!isBulkMode)}
        >
          <MaterialCommunityIcons
            name={isBulkMode ? "close-circle" : "account-multiple-check"}
            size={24}
            color={isBulkMode ? "#fff" : primary}
          />
        </TouchableOpacity>
      </View>

      {/* Header with search and mode toggle */}
      <View style={styles.searchHeader}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Bulk action panel */}
      {isBulkMode && (
        <View style={styles.bulkActionBar}>
          <Text style={styles.bulkActionTitle}>
            {selectedStudents.size} selected
          </Text>

          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={[
                styles.bulkAction,
                { backgroundColor: "rgba(76, 175, 80, 0.8)" },
              ]}
              onPress={() => applyBulkAction("present")}
            >
              <Text style={styles.bulkActionText}>Mark Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.bulkAction,
                { backgroundColor: "rgba(244, 67, 54, 0.8)" },
              ]}
              onPress={() => applyBulkAction("absent")}
            >
              <Text style={styles.bulkActionText}>Mark Absent</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main student list */}
      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Footer with quick actions - Modified to include two buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.markAllButton}
          onPress={handleMarkAllPresent}
        >
          <View style={styles.markAllContent}>
            <MaterialCommunityIcons name="check-all" size={22} color="#fff" />
            <Text style={styles.markAllText}>Mark Untracked as Present</Text>
          </View>
          <View style={styles.untrackedBadge}>
            <Text style={styles.untrackedBadgeText}>
              {statusCounts.untracked}
            </Text>
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitAttendance}
        >
          <View style={styles.submitButtonContent}>
            <MaterialCommunityIcons
              name="cloud-upload"
              size={22}
              color="#fff"
            />
            <Text style={styles.submitButtonText}>Submit Attendance</Text>
          </View>
        </TouchableOpacity> */}
      </View>
      <Modal
        visible={showStudentDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStudentDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Student Details</Text>
              <TouchableOpacity
                onPress={() => setShowStudentDetails(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView
                style={styles.detailsContainer}
                contentContainerStyle={styles.detailsContentContainer}
              >
                <View style={styles.studentDetailHeader}>
                  <InitialsAvatar
                    name={selectedStudent.name}
                    size={70}
                    imageUri={selectedStudent.profilePic}
                  />
                  <View style={styles.studentDetailHeaderInfo}>
                    <Text style={styles.studentDetailName}>
                      {selectedStudent.name}
                    </Text>
                    <View style={styles.studentDetailBadgeRow}>
                      <View style={styles.studentDetailBadge}>
                        <Text style={styles.studentDetailBadgeText}>
                          Enrollment No: {selectedStudent.enrollmentNo}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.studentDetailBadge,
                          {
                            backgroundColor:
                              STATUS_CONFIG[selectedStudent.status].color +
                              "20",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.studentDetailBadgeText,
                            {
                              color:
                                STATUS_CONFIG[selectedStudent.status].color,
                            },
                          ]}
                        >
                          {selectedStudent.status.charAt(0).toUpperCase() +
                            selectedStudent.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.detailItemsContainer}>
                  {selectedStudent.gender && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Gender</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.gender}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.dob && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Date of Birth</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.dob}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.parentName && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Parent/Guardian</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.parentName}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.contactNumber && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Contact Number</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.contactNumber}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.address && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Address</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.address.fullAddress ||
                          [
                            selectedStudent.address.addressLine1,
                            selectedStudent.address.addressLine2,
                            `${selectedStudent.address.city}, ${selectedStudent.address.state}`,
                            selectedStudent.address.zipcode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.bloodGroup && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Blood Group</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.bloodGroup}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.allergies && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Allergies</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.allergies}
                      </Text>
                    </View>
                  )}

                  {selectedStudent.medicalNotes && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Medical Notes</Text>
                      <Text style={styles.detailValue}>
                        {selectedStudent.medicalNotes}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowStudentDetails(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => hideAlert(true)}
        onCancel={() => hideAlert(false)}
        showCancelButton={alert.showCancelButton}
        cancelable={false}
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
    paddingTop: 4,
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
  searchHeader: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
  },
  modeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginLeft: 10,
  },
  activeModeButton: {
    backgroundColor: primary,
  },
  listContent: {
    paddingBottom: 70,
  },
  listHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
    justifyContent: "flex-start",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  activeFilterChip: {
    borderColor: primary,
    backgroundColor: "rgba(11, 181, 191, 0.05)",
  },
  filterChipText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  activeFilterText: {
    color: primary,
  },
  activeFilterBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(11, 181, 191, 0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  studentCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    borderWidth: Platform.OS === "android" ? 1 : 0,
    borderColor: "#eee",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 0, // Remove elevation entirely
      },
    }),
  },
  selectedStudentCard: {
    backgroundColor: "rgba(11, 181, 191, 0.05)",
    borderWidth: 1,
    borderColor: primary,
  },
  studentWithAvatar: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  studentAvatar: {
    marginRight: 12,
  },
  studentInfo: {
    flex: 1,
  },
  nameWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  studentName: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  studentRoll: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    borderWidth: Platform.OS === "android" ? 0 : 0,
    ...Platform.select({
      android: {
        elevation: 0,
      },
    }),
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    margin: 12,
    padding: 24,
    borderRadius: 10,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  bulkActionBar: {
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bulkActionTitle: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginBottom: 8,
  },
  bulkActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bulkAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: Platform.OS === "android" ? 0 : 0,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  bulkActionText: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#fff",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  markAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    position: "relative",
    flex: 1,
    marginRight: 8,
  },
  markAllContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  markAllText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  untrackedBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: "#FF9800",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  untrackedBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: Typography.fontWeight.bold.primary,
    paddingHorizontal: 4,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
  },
  submitButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "65%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: Platform.OS === "android" ? 1 : 0,
    borderColor: "#eee",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 0,
      },
    }),
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
  },
  detailsContainer: {
    padding: 16,
  },
  detailsContentContainer: {
    paddingBottom: 16,
  },
  studentDetailHeader: {
    flexDirection: "row",
    marginBottom: 20,
  },
  studentDetailHeaderInfo: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  studentDetailName: {
    fontSize: 20,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 8,
  },
  studentDetailBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  studentDetailBadge: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  studentDetailBadgeText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  detailItemsContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  detailItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  closeButton: {
    backgroundColor: primary,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 16,
  },
});
