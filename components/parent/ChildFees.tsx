import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { router } from "expo-router";

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
  transactions?: Transaction[];
};

type Transaction = {
  id: string;
  date: string;
  amount: number;
  mode: "online" | "cash" | "cheque";
  reference: string;
  status: "success" | "pending" | "failed";
};

export default function ChildFees({ childId, showAlert }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<
    Transaction[]
  >([]);

  const childInfo = {
    name: "Alex Johnson",
    class: "Grade 5",
    batch: "2023-2024",
    enrollmentNumber: "EN2023051",
  };

  const feeTerms: FeeTerm[] = [
    {
      id: "term1",
      name: "Term 1 Fees",
      dueDate: "July 15, 2023",
      totalAmount: 25000,
      paidAmount: 25000,
      status: "paid",
      transactions: [
        {
          id: "tr1001",
          date: "July 10, 2023",
          amount: 15000,
          mode: "online",
          reference: "HDFC23071085462",
          status: "success",
        },
        {
          id: "tr1002",
          date: "July 14, 2023",
          amount: 10000,
          mode: "cheque",
          reference: "CHQ-675432",
          status: "success",
        },
      ],
    },
    {
      id: "term2",
      name: "Term 2 Fees",
      dueDate: "October 15, 2023",
      totalAmount: 25000,
      paidAmount: 25000,
      status: "paid",
      transactions: [
        {
          id: "tr2001",
          date: "October 5, 2023",
          amount: 25000,
          mode: "online",
          reference: "SBI23100575319",
          status: "success",
        },
      ],
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
    showAlert("Payment Gateway", "Redirecting to payment gateway...", "info");
  };

  const handleViewTransactions = (termId: string) => {
    const term = feeTerms.find((t) => t.id === termId);
    if (term && term.transactions && term.transactions.length > 0) {
      setSelectedTransactions(term.transactions);
      setModalVisible(true);
    } else {
      showAlert("No Transactions", "No transaction details available", "info");
    }
  };

  const getStatusColor = (status: FeeStatus) => {
    switch (status) {
      case "paid":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "overdue":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "failed":
        return "#F44336";
      default:
        return "#666";
    }
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case "online":
        return "bank-transfer";
      case "cash":
        return "cash";
      case "cheque":
        return "file-document-outline";
      default:
        return "help-circle-outline";
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>School Fees</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
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
                    { backgroundColor: getStatusColor(term.status) + "15" },
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

              <View style={styles.feeActions}>
                {term.status !== "paid" && (
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => handlePayFees(term.id)}
                  >
                    <Text style={styles.payButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                )}

                {term.status === "paid" &&
                  term.transactions &&
                  term.transactions.length > 0 && (
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewTransactions(term.id)}
                    >
                      <MaterialCommunityIcons
                        name="eye-outline"
                        size={16}
                        color={primary}
                      />
                      <Text style={styles.viewButtonText}>
                        View Transactions
                      </Text>
                    </TouchableOpacity>
                  )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Transaction Details</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.transactionList}>
              {selectedTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionIconContainer}>
                    <MaterialCommunityIcons
                      name={getPaymentModeIcon(transaction.mode)}
                      size={24}
                      color={primary}
                    />
                  </View>

                  <View style={styles.transactionDetails}>
                    <View style={styles.transactionHeader}>
                      <Text style={styles.transactionAmount}>
                        {formatCurrency(transaction.amount)}
                      </Text>
                      <View
                        style={[
                          styles.transactionStatusBadge,
                          {
                            backgroundColor:
                              getTransactionStatusColor(transaction.status) +
                              "15",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.transactionStatusText,
                            {
                              color: getTransactionStatusColor(
                                transaction.status
                              ),
                            },
                          ]}
                        >
                          {transaction.status.charAt(0).toUpperCase() +
                            transaction.status.slice(1)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.transactionDate}>
                      Date: {transaction.date}
                    </Text>
                    <Text style={styles.transactionReference}>
                      <Text style={styles.referenceLabel}>Mode: </Text>
                      {transaction.mode.charAt(0).toUpperCase() +
                        transaction.mode.slice(1)}
                    </Text>
                    <Text style={styles.transactionReference}>
                      <Text style={styles.referenceLabel}>Reference: </Text>
                      {transaction.reference}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    width: "100%",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    fontWeight: "600",
  },
  feeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 6,
    borderRadius: 4,
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "#fff",
    borderRadius: 12,
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
  },
  closeButton: {
    padding: 4,
  },
  transactionList: {
    padding: 16,
    maxHeight: 400,
  },
  transactionItem: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 16,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: `${primary}15`,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  transactionDate: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#555",
    marginBottom: 2,
  },
  transactionReference: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#555",
  },
  referenceLabel: {
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#777",
  },
  transactionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  transactionStatusText: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  modalFooter: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    padding: 12,
    alignItems: "center",
  },
  modalCloseButton: {
    backgroundColor: primary,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 6,
  },
  modalCloseButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
});
