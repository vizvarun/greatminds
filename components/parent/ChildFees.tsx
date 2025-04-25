import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";

type Props = {
  childId: string;
  showAlert: (title: string, message: string, type: string) => void;
};

type FeeStatus = "paid" | "pending" | "overdue";

type FeeTerm = {
  id: string;
  name: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  status: FeeStatus;
};

export default function ChildFees({ childId, showAlert }: Props) {
  // Child information
  const childInfo = {
    name: "Alex Johnson",
    class: "Grade 5",
    batch: "2023-2024",
    enrollmentNumber: "EN2023051",
  };

  // Sample fee data
  const feeTerms: FeeTerm[] = [
    {
      id: "term1",
      name: "Term 1 Fees",
      dueDate: "July 15, 2023",
      totalAmount: 25000,
      paidAmount: 25000,
      status: "paid",
    },
    {
      id: "term2",
      name: "Term 2 Fees",
      dueDate: "October 15, 2023",
      totalAmount: 25000,
      paidAmount: 25000,
      status: "paid",
    },
    {
      id: "term3",
      name: "Term 3 Fees",
      dueDate: "January 15, 2024",
      totalAmount: 25000,
      paidAmount: 15000,
      status: "pending",
    },
    {
      id: "term4",
      name: "Term 4 Fees",
      dueDate: "April 15, 2024",
      totalAmount: 25000,
      paidAmount: 0,
      status: "pending",
    },
  ];

  const handlePayFees = (termId: string) => {
    // In a real app, this would navigate to a payment gateway
    showAlert("Payment Gateway", "Redirecting to payment gateway...", "info");
  };

  const getStatusColor = (status: FeeStatus) => {
    switch (status) {
      case "paid":
        return "#4CAF50"; // Green
      case "pending":
        return "#FF9800"; // Orange
      case "overdue":
        return "#F44336"; // Red
      default:
        return "#666";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>School Fees</Text>
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Child Info Section */}
        <View style={styles.childInfoCard}>
          <View style={styles.childInfoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Class</Text>
              <Text style={styles.infoValue}>{childInfo.class}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Batch</Text>
              <Text style={styles.infoValue}>{childInfo.batch}</Text>
            </View>
          </View>
          <View style={styles.childInfoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Enrollment Number</Text>
              <Text style={styles.infoValue}>{childInfo.enrollmentNumber}</Text>
            </View>
          </View>
        </View>

        {/* Summary Section - Simplified */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                feeTerms.reduce((total, term) => total + term.totalAmount, 0)
              )}
            </Text>
            <Text style={styles.summaryLabel}>Total Fees</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                feeTerms.reduce((total, term) => total + term.paidAmount, 0)
              )}
            </Text>
            <Text style={styles.summaryLabel}>Paid</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {formatCurrency(
                feeTerms.reduce(
                  (total, term) => total + (term.totalAmount - term.paidAmount),
                  0
                )
              )}
            </Text>
            <Text style={styles.summaryLabel}>Due</Text>
          </View>
        </View>

        {/* Fee Structure */}
        <Text style={styles.sectionTitle}>Fee Structure</Text>

        <View style={styles.feeListContainer}>
          {feeTerms.map((term) => (
            <View key={term.id} style={styles.feeCard}>
              <View style={styles.feeHeader}>
                <View>
                  <Text style={styles.feeName}>{term.name}</Text>
                  <Text style={styles.feeDueDate}>Due: {term.dueDate}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(term.status) + "15" }, // More transparent
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(term.status) },
                    ]}
                  >
                    {term.status.charAt(0).toUpperCase() + term.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.feeDetails}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Total</Text>
                  <Text style={styles.feeAmount}>
                    {formatCurrency(term.totalAmount)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Paid</Text>
                  <Text style={styles.feeAmount}>
                    {formatCurrency(term.paidAmount)}
                  </Text>
                </View>
                <View style={styles.feeRow}>
                  <Text style={styles.feeLabel}>Remaining</Text>
                  <Text
                    style={[
                      styles.feeAmount,
                      {
                        color:
                          term.totalAmount - term.paidAmount > 0
                            ? "#FF9800"
                            : "#4CAF50",
                      },
                    ]}
                  >
                    {formatCurrency(term.totalAmount - term.paidAmount)}
                  </Text>
                </View>
              </View>

              {term.status !== "paid" && (
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => handlePayFees(term.id)}
                >
                  <Text style={styles.payButtonText}>Pay Now</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  scrollContainer: {
    flex: 1,
  },
  childInfoCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 12,
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  childInfoRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#777",
  },
  infoValue: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    width: "31%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.regular.primary,
    color: "#777",
    marginTop: 2,
  },
  summaryValue: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginHorizontal: 16,
    marginBottom: 8,
  },
  feeListContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  feeCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 1,
    elevation: 1,
  },
  feeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  feeName: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  feeDueDate: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#777",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  feeDetails: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  feeLabel: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#777",
  },
  feeAmount: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  payButton: {
    backgroundColor: "rgba(11, 181, 191, 0.75)",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});
