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
  FlatList,
  Dimensions,
  SafeAreaView,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  InputAccessoryView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Typography } from "@/constants/Typography";
import { primary } from "@/constants/Colors";
import { router } from "expo-router";
import { getSectionId } from "@/utils/sectionUtils";

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
  replies?: {
    id: string;
    message: string;
    date: string;
    isParent: boolean;
  }[];
};

export default function ChildSupport({ childId, showAlert }: Props) {
  const [activeTab, setActiveTab] = useState<"new" | "faq" | "history">("new");
  const [selectedCategory, setSelectedCategory] =
    useState<SupportCategory>("academic");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "open" | "in-progress" | "resolved" | "closed"
  >("all");

  const scrollViewRef = useRef<ScrollView>(null);
  const historyScrollViewRef = useRef<ScrollView>(null);
  const subjectInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);
  const replyInputRef = useRef<TextInput>(null);
  const historyListRef = useRef<FlatList>(null);
  const syncIconRotation = useRef(new Animated.Value(0)).current;

  const inputAccessoryViewID = "replyInputAccessoryView";
  const windowHeight = Dimensions.get("window").height;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

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
      replies: [
        {
          id: "r1",
          message:
            "Thank you for your request. I'll prepare some additional practice questions and explanations for the key topics that will be covered in the test.",
          date: "2023-05-15T16:30:00",
          isParent: false,
        },
        {
          id: "r2",
          message: "Thank you! When can I expect to receive these materials?",
          date: "2023-05-16T09:20:00",
          isParent: true,
        },
        {
          id: "r3",
          message:
            "I've shared them on the student portal. Your child can access them now. Let me know if you have any questions about the content.",
          date: "2023-05-16T14:15:00",
          isParent: false,
        },
        {
          id: "r4",
          message:
            "Got it. The materials are very helpful. Thank you for your prompt response.",
          date: "2023-05-16T18:40:00",
          isParent: true,
        },
      ],
    },
    {
      id: "2",
      category: "fees",
      subject: "Fee receipt issue",
      message:
        "I haven't received the receipt for the last fee payment made on April 10th.",
      date: "2023-04-12",
      status: "closed",
      replies: [
        {
          id: "r1",
          message:
            "I apologize for the inconvenience. Let me check this with our accounts department.",
          date: "2023-04-12T14:30:00",
          isParent: false,
        },
        {
          id: "r2",
          message:
            "We've located your payment record. The receipt will be emailed to you within the next hour.",
          date: "2023-04-12T16:45:00",
          isParent: false,
        },
        {
          id: "r3",
          message: "Thank you, I've received the receipt now.",
          date: "2023-04-13T09:10:00",
          isParent: true,
        },
      ],
    },
    {
      id: "3",
      category: "technical",
      subject: "Unable to view attendance",
      message:
        "I'm facing issues viewing my child's attendance for March. The page shows an error.",
      date: "2023-03-25",
      status: "in-progress",
      replies: [
        {
          id: "r1",
          message:
            "Thank you for reporting this issue. Our technical team is looking into it.",
          date: "2023-03-25T16:30:00",
          isParent: false,
        },
        {
          id: "r2",
          message:
            "Could you please provide more details about the error message you're seeing?",
          date: "2023-03-26T10:15:00",
          isParent: false,
        },
        {
          id: "r3",
          message:
            "It says 'Error loading data: Server timeout'. I've tried on both my phone and laptop.",
          date: "2023-03-26T14:20:00",
          isParent: true,
        },
      ],
    },
    {
      id: "4",
      category: "teacher",
      subject: "Parent-teacher meeting schedule",
      message:
        "I would like to schedule a meeting with my child's math teacher to discuss recent progress.",
      date: "2023-06-05",
      status: "open",
      replies: [],
    },
    {
      id: "5",
      category: "academic",
      subject: "Homework clarification",
      message:
        "My child is having difficulty understanding yesterday's homework assignment. Could you provide additional guidance?",
      date: "2023-06-10",
      status: "in-progress",
      replies: [
        {
          id: "r1",
          message:
            "I understand. I'll ask the subject teacher to provide additional instructions.",
          date: "2023-06-10T13:40:00",
          isParent: false,
        },
      ],
    },
    {
      id: "6",
      category: "other",
      subject: "School event participation",
      message:
        "My child would like to participate in the upcoming science fair. What are the requirements and deadlines?",
      date: "2023-05-28",
      status: "resolved",
      replies: [
        {
          id: "r1",
          message:
            "The science fair registration deadline is June 15th. Each participant needs to prepare a project on environmental sustainability.",
          date: "2023-05-28T16:30:00",
          isParent: false,
        },
        {
          id: "r2",
          message:
            "Thank you. Where can I find the detailed guidelines for the project?",
          date: "2023-05-29T09:20:00",
          isParent: true,
        },
        {
          id: "r3",
          message:
            "The guidelines have been posted on the school website under 'Events'. I'll also send a copy directly to your email.",
          date: "2023-05-29T14:15:00",
          isParent: false,
        },
      ],
    },
    {
      id: "7",
      category: "fees",
      subject: "Payment plan inquiry",
      message:
        "I'm interested in setting up a monthly payment plan for next term's fees. Could you provide details on available options?",
      date: "2023-06-15",
      status: "open",
      replies: [],
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
        return "#FF9800";
      case "in-progress":
        return "#2196F3";
      case "resolved":
        return "#4CAF50";
      case "closed":
        return "#9E9E9E";
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

  const formatDateTime = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: "2-digit",
      minute: "2-digit",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} min ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    } else {
      return formatDate(dateString).split(",")[0];
    }
  };

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const toggleTicketExpansion = (ticketId: string) => {
    if (expandedTicket && expandedTicket !== ticketId) {
      setExpandedTicket(null);
      setReplyText("");
      setTimeout(() => {
        setExpandedTicket(ticketId);
      }, 100);
    } else {
      setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
      if (expandedTicket === ticketId) {
        setReplyText("");
      }
    }
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

  const handleSubmitReply = (ticketId: string) => {
    if (!replyText.trim()) {
      showAlert("Error", "Please enter a reply message", "error");
      return;
    }

    setIsReplying(true);

    setTimeout(() => {
      const updatedTickets = [...pastTickets];
      const ticketIndex = updatedTickets.findIndex((t) => t.id === ticketId);

      if (ticketIndex !== -1) {
        const newReply = {
          id: `r${Date.now()}`,
          message: replyText,
          date: new Date().toISOString(),
          isParent: true,
        };

        if (!updatedTickets[ticketIndex].replies) {
          updatedTickets[ticketIndex].replies = [];
        }

        updatedTickets[ticketIndex].replies!.push(newReply);

        if (updatedTickets[ticketIndex].status === "open") {
          updatedTickets[ticketIndex].status = "in-progress";
        }

        setReplyText("");
        setIsReplying(false);
        showAlert("Success", "Your reply has been sent", "success");

        setTimeout(() => {
          historyScrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, 1000);
  };

  const adjustScrollForInput = (inputRef: React.RefObject<TextInput>) => {
    if (!inputRef.current) return;

    inputRef.current.measureInWindow((x, y, width, height) => {
      const inputBottomPosition = y + height;
      const keyboardTopPosition = windowHeight - keyboardHeight;

      if (inputBottomPosition > keyboardTopPosition - 20) {
        const scrollAmount = inputBottomPosition - (keyboardTopPosition - 20);

        if (historyScrollViewRef.current) {
          historyScrollViewRef.current.scrollTo({
            y: scrollAmount,
            animated: true,
          });
        }
      }
    });
  };

  const getFilteredTickets = () => {
    if (statusFilter === "all") {
      return pastTickets;
    }
    return pastTickets.filter((ticket) => ticket.status === statusFilter);
  };

  const fetchChildSectionData = async () => {
    try {
      const sectionId = getSectionId(childSectionDetail);
      // Use sectionId for API calls
    } catch (error) {
      console.error("Error fetching section data:", error);
    }
  };

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
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <View style={styles.historyContentContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Previous Inquiries</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.statusFilterContainer}
              >
                <TouchableOpacity
                  style={[
                    styles.statusFilterButton,
                    statusFilter === "all" && styles.activeStatusFilter,
                  ]}
                  onPress={() => setStatusFilter("all")}
                >
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === "all" && styles.activeStatusFilterText,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusFilterButton,
                    statusFilter === "open" && styles.activeStatusFilter,
                    { borderColor: getStatusColor("open") },
                  ]}
                  onPress={() => setStatusFilter("open")}
                >
                  <View
                    style={styles.statusFilterDot}
                    backgroundColor={getStatusColor("open")}
                  />
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === "open" && styles.activeStatusFilterText,
                    ]}
                  >
                    Open
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusFilterButton,
                    statusFilter === "in-progress" && styles.activeStatusFilter,
                    { borderColor: getStatusColor("in-progress") },
                  ]}
                  onPress={() => setStatusFilter("in-progress")}
                >
                  <View
                    style={styles.statusFilterDot}
                    backgroundColor={getStatusColor("in-progress")}
                  />
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === "in-progress" &&
                        styles.activeStatusFilterText,
                    ]}
                  >
                    In Progress
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusFilterButton,
                    statusFilter === "resolved" && styles.activeStatusFilter,
                    { borderColor: getStatusColor("resolved") },
                  ]}
                  onPress={() => setStatusFilter("resolved")}
                >
                  <View
                    style={styles.statusFilterDot}
                    backgroundColor={getStatusColor("resolved")}
                  />
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === "resolved" &&
                        styles.activeStatusFilterText,
                    ]}
                  >
                    Resolved
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusFilterButton,
                    statusFilter === "closed" && styles.activeStatusFilter,
                    { borderColor: getStatusColor("closed") },
                  ]}
                  onPress={() => setStatusFilter("closed")}
                >
                  <View
                    style={styles.statusFilterDot}
                    backgroundColor={getStatusColor("closed")}
                  />
                  <Text
                    style={[
                      styles.statusFilterText,
                      statusFilter === "closed" &&
                        styles.activeStatusFilterText,
                    ]}
                  >
                    Closed
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            {pastTickets.length > 0 ? (
              <ScrollView
                ref={historyScrollViewRef}
                contentContainerStyle={styles.ticketList}
                showsVerticalScrollIndicator={true}
                style={styles.historyScrollView}
                keyboardShouldPersistTaps="handled"
              >
                {getFilteredTickets().length > 0 ? (
                  getFilteredTickets().map((ticket) => (
                    <TouchableOpacity
                      key={ticket.id}
                      style={styles.ticketCard}
                      onPress={() => toggleTicketExpansion(ticket.id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.ticketHeader}>
                        <View style={styles.ticketInfo}>
                          <Text style={styles.ticketSubject}>
                            {ticket.subject}
                          </Text>
                          <Text style={styles.ticketDate}>
                            {getRelativeTime(ticket.date)}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusBadge,
                            {
                              backgroundColor:
                                getStatusColor(ticket.status) + "20",
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusText,
                              { color: getStatusColor(ticket.status) },
                            ]}
                          >
                            {ticket.status.replace("-", " ").toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.ticketCategory}>
                        <MaterialCommunityIcons
                          name={getCategoryIcon(ticket.category)}
                          size={16}
                          color="#666"
                        />
                        <Text style={styles.categoryLabel}>
                          {ticket.category.charAt(0).toUpperCase() +
                            ticket.category.slice(1)}
                        </Text>
                        <MaterialCommunityIcons
                          name={
                            expandedTicket === ticket.id
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={20}
                          color="#666"
                          style={{ marginLeft: "auto" }}
                        />
                      </View>

                      {!expandedTicket || expandedTicket !== ticket.id ? (
                        <Text
                          style={styles.ticketMessage}
                          numberOfLines={2}
                          ellipsizeMode="tail"
                        >
                          {ticket.message}
                        </Text>
                      ) : (
                        <View style={styles.expandedContent}>
                          <View style={styles.messageContainer}>
                            <Text style={styles.messageLabel}>
                              Original Message:
                            </Text>
                            <Text style={styles.ticketMessage}>
                              {ticket.message}
                            </Text>
                          </View>

                          {ticket.replies && ticket.replies.length > 0 && (
                            <View style={styles.repliesContainer}>
                              <Text style={styles.repliesLabel}>
                                Conversation:
                              </Text>
                              {ticket.replies.map((reply) => (
                                <View
                                  key={reply.id}
                                  style={[
                                    styles.replyItem,
                                    reply.isParent
                                      ? styles.parentReply
                                      : styles.teacherReply,
                                  ]}
                                >
                                  <Text style={styles.replyMessage}>
                                    {reply.message}
                                  </Text>
                                  <View style={styles.replyFooter}>
                                    <Text style={styles.replyFrom}>
                                      {reply.isParent ? "You" : "School"}
                                    </Text>
                                    <Text style={styles.replyDate}>
                                      {formatDateTime(reply.date)}
                                    </Text>
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}

                          {ticket.status !== "closed" &&
                            ticket.status !== "resolved" && (
                              <View style={styles.replyInputContainer}>
                                <TextInput
                                  ref={replyInputRef}
                                  style={styles.replyInput}
                                  placeholder="Type your reply here..."
                                  placeholderTextColor="#999"
                                  value={replyText}
                                  onChangeText={setReplyText}
                                  multiline
                                  textAlignVertical="top"
                                  inputAccessoryViewID={
                                    Platform.OS === "ios"
                                      ? inputAccessoryViewID
                                      : undefined
                                  }
                                  onFocus={() => {
                                    setTimeout(() => {
                                      adjustScrollForInput(replyInputRef);
                                    }, 100);
                                  }}
                                />
                                <View style={styles.replyActions}>
                                  <TouchableOpacity
                                    style={[
                                      styles.actionButton,
                                      styles.replyButton,
                                      (!replyText.trim() || isReplying) &&
                                        styles.disabledButton,
                                    ]}
                                    onPress={() => handleSubmitReply(ticket.id)}
                                    disabled={!replyText.trim() || isReplying}
                                  >
                                    {isReplying ? (
                                      <ActivityIndicator
                                        size="small"
                                        color="#fff"
                                      />
                                    ) : (
                                      <Text style={styles.actionButtonText}>
                                        Send Reply
                                      </Text>
                                    )}
                                  </TouchableOpacity>
                                </View>
                              </View>
                            )}
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.noFilteredResults}>
                    <MaterialCommunityIcons
                      name="filter-remove-outline"
                      size={40}
                      color="#ddd"
                    />
                    <Text style={styles.noFilteredResultsText}>
                      No {statusFilter.replace("-", " ")} tickets found
                    </Text>
                    <TouchableOpacity
                      style={styles.resetFilterButton}
                      onPress={() => setStatusFilter("all")}
                    >
                      <Text style={styles.resetFilterText}>
                        Show all tickets
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
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
        </KeyboardAvoidingView>
      ) : (
        <ScrollView ref={scrollViewRef} style={styles.content}>
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
                        color={selectedCategory === category ? primary : "#777"}
                      />
                      <Text
                        style={[
                          styles.categoryText,
                          selectedCategory === category &&
                            styles.selectedCategoryText,
                        ]}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
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
                    !ticketSubject.trim() || !ticketMessage.trim() || isLoading
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
                  <Text style={styles.contactHighlight}>+91 44 2345 6789</Text>{" "}
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
                        expandedFAQ === faq.id ? "chevron-up" : "chevron-down"
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
      )}

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
    marginTop: 12,
    marginBottom: 8,
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
    marginBottom: 8,
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

  expandedContent: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageLabel: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginBottom: 6,
  },
  repliesContainer: {
    marginBottom: 16,
  },
  repliesLabel: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginBottom: 8,
  },
  replyItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: "75%",
  },
  teacherReply: {
    backgroundColor: "rgba(11, 181, 191, 0.08)",
    alignSelf: "flex-start",
  },
  parentReply: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-end",
  },
  replyMessage: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    lineHeight: 20,
  },
  replyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  replyFrom: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    flex: 1,
  },
  replyDate: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.primary,
    color: "#888",
    textAlign: "right",
  },
  replyInputContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  replyInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    minHeight: 80,
    textAlignVertical: "top",
    color: "#333",
  },
  replyActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  replyButton: {
    backgroundColor: primary,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  historyScrollView: {
    flex: 1,
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
  statusFilterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: "row",
  },
  statusFilterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    height: 26,
  },
  activeStatusFilter: {
    backgroundColor: "rgba(11, 181, 191, 0.1)",
    borderColor: primary,
  },
  statusFilterText: {
    fontSize: 11,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
  },
  activeStatusFilterText: {
    color: primary,
  },
  statusFilterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  noFilteredResults: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  noFilteredResultsText: {
    marginTop: 10,
    fontSize: 15,
    fontFamily: Typography.fontFamily.primary,
    color: "#999",
    marginBottom: 16,
    textAlign: "center",
  },
  resetFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resetFilterText: {
    color: primary,
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  historyHeader: {
    paddingBottom: 4,
  },
});
