import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, router } from "expo-router";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import CustomAlert from "@/components/ui/CustomAlert";

// Student type
type Student = {
  id: string;
  name: string;
  rollNumber: string;
  status: "present" | "absent" | "leave" | "untracked";
};

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
  const [students, setStudents] = useState<Student[]>([]);
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

  // Initialize with dummy data
  useEffect(() => {
    const dummyStudents: Student[] = Array.from({ length: 30 }, (_, i) => ({
      id: `s${i + 1}`,
      name: `Student ${i + 1}`,
      rollNumber: `${i + 1}`.padStart(2, "0"),
      status:
        i < 22 ? "present" : i < 25 ? "absent" : i < 27 ? "leave" : "untracked",
    }));
    setStudents(dummyStudents);
  }, []);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setSearchQuery("");
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

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

  // Mark all untracked students as present
  const handleMarkAllPresent = () => {
    // Only show the modal if there are untracked students
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
      () => {
        const updatedStudents = students.map((student) => ({
          ...student,
          status: student.status === "untracked" ? "present" : student.status,
        }));
        setStudents(updatedStudents);
        showAlert(
          "Success",
          "All untracked students have been marked as present.",
          "success"
        );
      },
      true, // Show cancel button
      () => {} // On cancel function (empty since we just close the modal)
    );
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

  // Apply bulk action to selected students
  const applyBulkAction = (
    newStatus: "present" | "absent" | "leave" | "untracked"
  ) => {
    if (selectedStudents.size === 0) {
      showAlert("No Selection", "Please select students first", "info");
      return;
    }

    const updatedStudents = students.map((student) =>
      selectedStudents.has(student.id)
        ? { ...student, status: newStatus }
        : student
    );

    setStudents(updatedStudents);
    showAlert(
      "Status Updated",
      `${selectedStudents.size} student(s) marked as ${newStatus}`,
      "success"
    );

    setIsBulkMode(false);
  };

  // Change individual student status
  const changeStudentStatus = (
    studentId: string,
    newStatus: "present" | "absent" | "leave" | "untracked"
  ) => {
    if (isBulkMode) {
      toggleStudentSelection(studentId);
      return;
    }

    const updatedStudents = students.map((student) =>
      student.id === studentId ? { ...student, status: newStatus } : student
    );
    setStudents(updatedStudents);
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
          s.name.toLowerCase().includes(query) || s.rollNumber.includes(query)
      );
    }

    return filteredList;
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
  const renderStudentItem = ({ item }: { item: Student }) => {
    const isSelected = selectedStudents.has(item.id);
    const statusConfig = STATUS_CONFIG[item.status];

    return (
      <TouchableOpacity
        style={[styles.studentCard, isSelected && styles.selectedStudentCard]}
        onPress={() => toggleStudentSelection(item.id)}
        activeOpacity={isBulkMode ? 0.7 : 1}
      >
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentRoll}>Roll No: {item.rollNumber}</Text>

          {!isBulkMode && (
            <View style={styles.statusIndicator}>
              <MaterialCommunityIcons
                name={statusConfig.icon}
                size={14}
                color={statusConfig.color}
              />
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
          )}
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
                onPress={() => changeStudentStatus(item.id, "present")}
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
                onPress={() => changeStudentStatus(item.id, "absent")}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={18}
                  color="#F44336"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // List header component with filters
  const ListHeaderComponent = () => (
    <View style={styles.listHeader}>
      <View style={styles.filterChips}>
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
          ? `No ${statusFilter} students found`
          : "No students available"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header with search and mode toggle */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search students..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Footer with quick actions */}
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
      </View>

      <CustomAlert
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={() => hideAlert(true)}
        onCancel={() => hideAlert(false)}
        showCancelButton={alert.showCancelButton}
        cancelable={false} // Prevent closing when clicking outside
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
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
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
    paddingBottom: 70, // Space for footer
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
  activeFilterText: {
    fontSize: 13,
    color: "#333",
    fontFamily: Typography.fontWeight.medium.primary,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedStudentCard: {
    backgroundColor: "rgba(11, 181, 191, 0.05)",
    borderWidth: 1,
    borderColor: primary,
  },
  studentInfo: {
    flex: 1,
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
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
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
    paddingHorizontal: 20,
    position: "relative",
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
});
