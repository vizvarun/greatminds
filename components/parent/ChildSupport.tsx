import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Platform,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
  SafeAreaView,
  InputAccessoryView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import KeyboardDismissBar from "@/components/ui/KeyboardDismissBar";
import { router } from "expo-router";

type Props = {
  childId: string;
  showAlert: (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
};

type SupportCategory = "teacher" | "academic" | "fees" | "technical" | "other";

type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

type SupportTicket = {
  id: string;
  category: SupportCategory;
  subject: string;
  message: string;
  date: string;
  status: "open" | "in-progress" | "resolved" | "closed";
};

export default function ChildSupport({ childId, showAlert }: Props) {
  const [activeTab, setActiveTab] = useState<"new" | "faq" | "history">("new");
  const [selectedCategory, setSelectedCategory] =
    useState<SupportCategory>("academic");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [activeInput, setActiveInput] = useState<
    "none" | "subject" | "message"
  >("none");
  const [showKeyboardBar, setShowKeyboardBar] = useState(false); // Direct control for keyboard bar
  const scrollViewRef = useRef<ScrollView>(null);
  const subjectInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);
  const inputAccessoryViewID = "supportFormInput";
  const historyListRef = useRef<FlatList>(null);
  const windowHeight = Dimensions.get("window").height;

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
        setActiveInput("none");
      }
    );

    const handleInputBlur = () => {
      // Delay hiding the bar to ensure it doesn't hide too quickly
      setTimeout(() => {
        if (
          !subjectInputRef.current?.isFocused() &&
          !messageInputRef.current?.isFocused()
        ) {
          setShowKeyboardBar(false);
        }
      }, 100);
    };

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const faqs: FAQItem[] = [
    {
      id: "1",
      question: "How can I check my child's homework?",
      answer:
        "You can check your child's homework in the Diary section. Navigate to the specific date to see all assigned homework and tasks for that day.",
    },
    {
      id: "2",
      question: "What should I do if my child will be absent?",
      answer:
        "Please apply for leave in advance through the Attendance tab. Select the dates and provide a reason for the absence. For emergencies, you can call the school office directly.",
    },
    {
      id: "3",
      question: "How do I pay school fees online?",
      answer:
        "You can pay fees online through the Fees section. Select the term for which you want to pay, click on 'Pay Now', and you'll be redirected to our secure payment gateway.",
    },
    {
      id: "4",
      question: "How can I update my contact information?",
      answer:
        "To update your contact information, please go to the Profile section from the main dashboard. Click on 'Edit Profile' to update your phone number, email, or address.",
    },
    {
      id: "5",
      question: "How do I contact my child's teacher?",
      answer:
        "Please submit an inquiry through the Support section using the 'Teacher' category. The school will coordinate with the appropriate teacher who will get back to you.",
    },
  ];

  const pastTickets: SupportTicket[] = [
    {
      id: "1",
      category: "academic",
      subject: "Extra study material request",
      message:
        "I would like to request additional study materials for the upcoming science test.",
      date: "2023-05-15",
      status: "resolved",
    },
    {
      id: "2",
      category: "fees",
      subject: "Fee receipt issue",
      message:
        "I haven't received the receipt for the last fee payment made on April 10th.",
      date: "2023-04-12",
      status: "closed",
    },
    {
      id: "3",
      category: "technical",
      subject: "Unable to view attendance",
      message:
        "I'm facing issues viewing my child's attendance for March. The page shows an error.",
      date: "2023-03-25",
      status: "in-progress",
    },
    {
      id: "4",
      category: "teacher",
      subject: "Parent-teacher meeting schedule",
      message:
        "I would like to schedule a meeting with my child's math teacher to discuss recent progress.",
      date: "2023-06-05",
      status: "open",
    },
    {
      id: "5",
      category: "academic",
      subject: "Homework clarification",
      message:
        "My child is having difficulty understanding yesterday's homework assignment. Could you provide additional guidance?",
      date: "2023-06-10",
      status: "in-progress",
    },
    {
      id: "6",
      category: "other",
      subject: "School event participation",
      message:
        "My child would like to participate in the upcoming science fair. What are the requirements and deadlines?",
      date: "2023-05-28",
      status: "resolved",
    },
    {
      id: "7",
      category: "fees",
      subject: "Payment plan inquiry",
      message:
        "I'm interested in setting up a monthly payment plan for next term's fees. Could you provide details on available options?",
      date: "2023-06-15",
      status: "open",
    },
  ];

  const getCategoryIcon = (category: SupportCategory) => {
    switch (category) {
      case "teacher":
        return "account-tie";
      case "academic":
        return "book-open-variant";
      case "fees":
        return "cash";
      case "technical":
        return "laptop";
      case "other":
        return "help-circle";
      default:
        return "message-question";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "#FF9800"; // Orange
      case "in-progress":
        return "#2196F3"; // Blue
      case "resolved":
        return "#4CAF50"; // Green
      case "closed":
        return "#9E9E9E"; // Gray
      default:
        return "#666";
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const showKeyboardDismissAndScroll = (
    inputType: "subject" | "message",
    y: number
  ) => {
    setKeyboardVisible(true);
    setActiveInput(inputType);

    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: y,
        animated: true,
      });
    }, 100);
  };

  const showKeyboardDismissBar = () => {
    setShowKeyboardBar(true);
  };

  const handleSubmitTicket = () => {
    if (!ticketSubject.trim()) {
      showAlert("Error", "Please enter a subject for your inquiry", "error");
      return;
    }

    if (!ticketMessage.trim()) {
      showAlert("Error", "Please enter a message for your inquiry", "error");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showAlert(
        "Success",
        "Your support inquiry has been submitted successfully. A support representative will get back to you soon.",
        "success"
      );
      setTicketSubject("");
      setTicketMessage("");
      setActiveTab("history");
    }, 1500);
  };

  const renderTicketItem = ({ item }: { item: SupportTicket }) => (
    <View key={item.id} style={styles.ticketCard}>
      <View style={styles.ticketHeader}>
        <View style={styles.ticketInfo}>
          <Text style={styles.ticketSubject}>{item.subject}</Text>
          <Text style={styles.ticketDate}>{formatDate(item.date)}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.status) }]}
          >
            {item.status.replace("-", " ").toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.ticketCategory}>
        <MaterialCommunityIcons
          name={getCategoryIcon(item.category)}
          size={16}
          color="#666"
        />
        <Text style={styles.categoryLabel}>
          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
        </Text>
      </View>

      <Text style={styles.ticketMessage}>{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Support & Help</Text>
        </View>
      </View>

      <View style={styles.tabButtons}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "new" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("new")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "new" && styles.activeTabButtonText,
            ]}
          >
            New Inquiry
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "faq" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("faq")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "faq" && styles.activeTabButtonText,
            ]}
          >
            FAQs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "history" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "history" && styles.activeTabButtonText,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "history" ? (
        <View style={styles.historyContentContainer}>
          <Text style={styles.sectionTitle}>Previous Inquiries</Text>
          {pastTickets.length > 0 ? (
            <FlatList
              ref={historyListRef}
              data={pastTickets}
              renderItem={renderTicketItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.ticketList}
              showsVerticalScrollIndicator={true}
              scrollEnabled={true}
              style={styles.flatListContainer}
              initialNumToRender={5}
              windowSize={5}
              removeClippedSubviews={true}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="ticket-outline"
                size={48}
                color="#ddd"
              />
              <Text style={styles.emptyStateText}>
                No previous inquiries found
              </Text>
              <TouchableOpacity
                style={styles.createNewButton}
                onPress={() => setActiveTab("new")}
              >
                <Text style={styles.createNewButtonText}>
                  Create New Inquiry
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <KeyboardAvoidingView
          style={styles.keyboardAvoidContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
        >
          <View style={styles.keyboardAvoidInner}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <ScrollView
                ref={scrollViewRef}
                style={styles.content}
                keyboardShouldPersistTaps="handled"
              >
                {activeTab === "new" && (
                  <View style={styles.inquirySection}>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Support Inquiry</Text>

                      <View style={styles.categoryRow}>
                        {(
                          [
                            "teacher",
                            "academic",
                            "fees",
                            "technical",
                            "other",
                          ] as SupportCategory[]
                        ).map((category) => (
                          <TouchableOpacity
                            key={category}
                            style={[
                              styles.categoryButton,
                              selectedCategory === category &&
                                styles.selectedCategory,
                            ]}
                            onPress={() => setSelectedCategory(category)}
                          >
                            <MaterialCommunityIcons
                              name={getCategoryIcon(category)}
                              size={16}
                              color={
                                selectedCategory === category ? primary : "#777"
                              }
                            />
                            <Text
                              style={[
                                styles.categoryText,
                                selectedCategory === category &&
                                  styles.selectedCategoryText,
                              ]}
                            >
                              {category.charAt(0).toUpperCase() +
                                category.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>Subject</Text>
                        <TextInput
                          ref={subjectInputRef}
                          style={styles.inputField}
                          value={ticketSubject}
                          onChangeText={setTicketSubject}
                          placeholder="Brief description of your inquiry"
                          placeholderTextColor="#999"
                          inputAccessoryViewID={
                            Platform.OS === "ios"
                              ? inputAccessoryViewID
                              : undefined
                          }
                          onFocus={() => {
                            showKeyboardDismissBar(); // Always show the bar on focus
                            subjectInputRef.current?.measureLayout(
                              scrollViewRef.current,
                              (x, y) => {
                                showKeyboardDismissAndScroll(
                                  "subject",
                                  y - 100
                                );
                              },
                              () => {}
                            );
                          }}
                        />
                      </View>

                      <View style={styles.formField}>
                        <Text style={styles.inputLabel}>Message</Text>
                        <TextInput
                          ref={messageInputRef}
                          style={styles.messageField}
                          value={ticketMessage}
                          onChangeText={setTicketMessage}
                          placeholder="Provide details of your inquiry..."
                          placeholderTextColor="#999"
                          multiline
                          textAlignVertical="top"
                          inputAccessoryViewID={
                            Platform.OS === "ios"
                              ? inputAccessoryViewID
                              : undefined
                          }
                          onFocus={() => {
                            showKeyboardDismissBar(); // Always show the bar on focus
                            messageInputRef.current?.measureLayout(
                              scrollViewRef.current,
                              (x, y) => {
                                showKeyboardDismissAndScroll("message", y - 80);
                              },
                              () => {}
                            );
                          }}
                        />
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          (!ticketSubject.trim() ||
                            !ticketMessage.trim() ||
                            isLoading) &&
                            styles.disabledButton,
                        ]}
                        onPress={handleSubmitTicket}
                        disabled={
                          !ticketSubject.trim() ||
                          !ticketMessage.trim() ||
                          isLoading
                        }
                      >
                        {isLoading ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.submitButtonText}>Submit</Text>
                        )}
                      </TouchableOpacity>
                    </View>

                    <View style={styles.contactInfo}>
                      <Text style={styles.contactInfoLabel}>
                        Need immediate assistance?
                      </Text>
                      <Text style={styles.contactInfoText}>
                        Call:{" "}
                        <Text style={styles.contactHighlight}>
                          +91 44 2345 6789
                        </Text>{" "}
                        or Email:{" "}
                        <Text style={styles.contactHighlight}>
                          support@greatminds.edu
                        </Text>
                      </Text>
                    </View>
                  </View>
                )}

                {activeTab === "faq" && (
                  <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>
                      Frequently Asked Questions
                    </Text>
                    {faqs.map((faq) => (
                      <TouchableOpacity
                        key={faq.id}
                        style={styles.faqCard}
                        onPress={() => toggleFAQ(faq.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.faqHeader}>
                          <Text style={styles.faqQuestion}>{faq.question}</Text>
                          <MaterialCommunityIcons
                            name={
                              expandedFAQ === faq.id
                                ? "chevron-up"
                                : "chevron-down"
                            }
                            size={24}
                            color="#666"
                          />
                        </View>
                        {expandedFAQ === faq.id && (
                          <Text style={styles.faqAnswer}>{faq.answer}</Text>
                        )}
                      </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                      style={styles.moreHelpButton}
                      onPress={() => setActiveTab("new")}
                    >
                      <Text style={styles.moreHelpText}>
                        Can't find what you're looking for?
                      </Text>
                      <Text style={styles.submitNewInquiry}>
                        Submit a new inquiry
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            </TouchableWithoutFeedback>

            {/* Always show keyboard bar when needed, regardless of keyboard visibility */}
            {Platform.OS === "android" && showKeyboardBar && (
              <View style={styles.fixedKeyboardDismissBar}>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => {
                    Keyboard.dismiss();
                    setShowKeyboardBar(false);
                  }}
                >
                  <Text style={styles.dismissButtonText}>Done</Text>
                  <MaterialCommunityIcons
                    name="chevron-down"
                    size={16}
                    color="#555"
                  />
                </TouchableOpacity>
              </View>
            )}

            {Platform.OS === "ios" && (
              <KeyboardDismissBar nativeID={inputAccessoryViewID} />
            )}
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Add the iOS InputAccessoryView */}
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

      {/* Replace the existing Android keyboard bar with the style from leave application */}
      {Platform.OS === "android" && keyboardVisible && showKeyboardBar && (
        <View style={styles.androidKeyboardAccessory}>
          <TouchableOpacity
            style={styles.keyboardDoneButton}
            onPress={() => {
              Keyboard.dismiss();
              setShowKeyboardBar(false);
            }}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  tabButtons: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: primary,
  },
  tabButtonText: {
    fontFamily: Typography.fontWeight.medium.primary,
    fontSize: 14,
    color: "#666",
  },
  activeTabButtonText: {
    color: primary,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginTop: 16,
    marginBottom: 12,
    marginLeft: 16,
  },

  inquirySection: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 16,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
    backgroundColor: "#f5f5f5",
  },
  selectedCategory: {
    backgroundColor: "rgba(11, 181, 191, 0.1)",
  },
  categoryText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginLeft: 4,
  },
  selectedCategoryText: {
    color: primary,
  },
  formField: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#444",
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    backgroundColor: "#fff",
  },
  messageField: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    padding: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    backgroundColor: "#fff",
    height: 120,
  },
  submitButton: {
    backgroundColor: primary,
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  contactInfo: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 4,
    borderLeftWidth: 2,
    borderLeftColor: primary,
  },
  contactInfoLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#444",
    marginBottom: 4,
  },
  contactInfoText: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#555",
    lineHeight: 18,
  },
  contactHighlight: {
    color: primary,
    fontFamily: Typography.fontWeight.medium.primary,
  },

  faqSection: {
    paddingBottom: 20,
  },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginTop: 10,
    lineHeight: 20,
  },
  moreHelpButton: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 20,
  },
  moreHelpText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
  },
  submitNewInquiry: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: primary,
    marginTop: 6,
  },

  ticketList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  historyContentContainer: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: "#f5f7fa",
  },
  flatListContainer: {
    flex: 1,
    flexGrow: 1,
  },

  ticketCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 12,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  ticketDate: {
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
    fontSize: 10,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  ticketCategory: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    marginLeft: 6,
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  ticketMessage: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#555",
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyStateText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
    marginBottom: 16,
  },
  createNewButton: {
    backgroundColor: primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  createNewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.bold.primary,
  },

  keyboardAvoidContainer: {
    flex: 1,
  },
  keyboardAvoidInner: {
    flex: 1,
    position: "relative",
  },
  keyboardDismissBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    zIndex: 1000,
    elevation: 10,
  },
  fixedKeyboardDismissBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
    zIndex: 9999,
    elevation: 99, // Much higher elevation to ensure visibility
  },
  dismissButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 12,
    paddingHorizontal: 16,
  },
  dismissButtonText: {
    color: "#555",
    fontSize: 16,
    fontFamily: Typography.fontWeight.medium.primary,
    marginRight: 4,
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
