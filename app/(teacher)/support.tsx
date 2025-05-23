import CustomAlert from "@/components/ui/CustomAlert";
import { primary } from "@/constants/Colors";
import { Typography } from "@/constants/Typography";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  InputAccessoryView,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  configureNotifications,
  requestNotificationPermissions,
  sendLocalNotification,
} from "@/utils/notifications";
import {
  fetchTeacherSupportTickets,
  replySupportTicket,
  updateTicketStatus,
  SupportTicket as ApiSupportTicket,
  SupportTicketStatus,
} from "@/services/supportApi";
import { useAuth } from "@/context/AuthContext";

type SupportTicket = {
  id: string;
  category: string;
  subject: string;
  message: string;
  date: string;
  gradeId?: string;
  gradeName?: string;
  sectionId?: string;
  sectionName?: string;
  studentId?: string;
  studentName?: string;
  status: "new" | "replied" | "closed";
  parentId?: string;
  parentName?: string;
  priority?: "low" | "medium" | "high";
  replies?: {
    id: string;
    message: string;
    date: string;
    isTeacher: boolean;
  }[];
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category?: string;
  gradeId?: string;
  isEditable?: boolean;
};

const searchPlaceholderText = "#777";
const inputPlaceholderText = "#777";
const inputTextColor = "#333";

export default function SupportScreen() {
  const params = useLocalSearchParams();
  const { from, branchId, gradeId, sectionId } = params;
  const [activeTab, setActiveTab] = useState<
    "new" | "replied" | "closed" | "faqs"
  >("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGradeFilter, setShowGradeFilter] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(
    (gradeId as string) || null
  );
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "general",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const { userProfile } = useAuth();
  const userId = userProfile?.user?.id;

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showKeyboardBar, setShowKeyboardBar] = useState(false);
  const [modalKeyboardVisible, setModalKeyboardVisible] = useState(false);
  const inputAccessoryViewID = "supportInputAccessoryView";
  const windowHeight = Dimensions.get("window").height;
  const [alert, setAlert] = useState({
    visible: false,
    title: "",
    message: "",
    type: "info" as "success" | "error" | "info" | "warning",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const scrollViewRef = useRef<ScrollView>(null);
  const replyInputRef = useRef<TextInput>(null);
  const [isInitialRender, setIsInitialRender] = useState(true);
  const lastTextChangeTime = useRef(0);

  const isFromInternal = from === "section" && gradeId;

  const grades = [
    { id: "all", name: "All Grades" },
    { id: "1", name: "Grade 1" },
    { id: "2", name: "Grade 2" },
    { id: "3", name: "Grade 3" },
    { id: "4", name: "Grade 4" },
    { id: "5", name: "Grade 5" },
  ];

  const currentGradeName = isFromInternal
    ? grades.find((g) => g.id === gradeId)?.name || `Grade ${gradeId}`
    : null;

  const currentSectionName = isFromInternal
    ? sectionId === "5a"
      ? "Section A"
      : sectionId === "5b"
      ? "Section B"
      : sectionId === "3a"
      ? "Section A"
      : sectionId === "4b"
      ? "Section B"
      : `Section ${sectionId}`
    : null;

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: "1",
      question: "How do I mark attendance?",
      answer:
        "Go to your class section, then tap 'Attendance Tracker'. You can mark students as present, absent, or on leave.",
      category: "attendance",
      isEditable: true,
    },
    {
      id: "2",
      question: "How can I add a diary entry?",
      answer:
        "From the dashboard, tap 'Quick Actions' and select 'Diary Entry', or navigate to your class section and select 'Class Diary'.",
      category: "diary",
      isEditable: true,
    },
    {
      id: "3",
      question: "How do I view my timetable?",
      answer:
        "Go to your class section and tap 'Timetable'. You'll see your schedule for the entire week.",
      category: "timetable",
      isEditable: true,
    },
    {
      id: "4",
      question: "How do I submit grades for my students?",
      answer:
        "Navigate to your class section, select 'Academics', then 'Grades'. You can enter grades for each assessment and submit them for review.",
      category: "academics",
      isEditable: true,
    },
  ]);

  useEffect(() => {
    if (from === "section" && gradeId) {
      setSelectedGrade(gradeId as string);
    }
  }, [from, gradeId]);

  useEffect(() => {
    configureNotifications();
    requestNotificationPermissions();
  }, []);

  const scrollToActiveInput = () => {
    if (isInitialRender || Date.now() - lastTextChangeTime.current < 300) {
      return;
    }

    if (expandedTicket && replyInputRef.current) {
      lastTextChangeTime.current = Date.now();
      setTimeout(() => {
        replyInputRef.current.measureInWindow((x, y, width, height) => {
          const inputBottom = y + height;
          const screenHeight = Dimensions.get("window").height;
          const keyboardHeight = keyboardVisible
            ? Platform.OS === "ios"
              ? 300
              : 300
            : 0;
          const availableHeight = screenHeight - keyboardHeight;

          if (inputBottom > availableHeight - 150) {
            const additionalScroll = inputBottom - (availableHeight - 200);
            scrollViewRef.current?.scrollTo({
              y: additionalScroll,
              animated: true,
            });
          }
        });
      }, 100);
    }
  };

  useEffect(() => {
    setIsInitialRender(false);

    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        setKeyboardVisible(true);
        setShowKeyboardBar(true);
        setTimeout(() => scrollToActiveInput(), 300);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setShowKeyboardBar(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [expandedTicket]);

  useEffect(() => {
    if (modalVisible) {
      const keyboardDidShowListener = Keyboard.addListener(
        "keyboardDidShow",
        () => {
          setModalKeyboardVisible(true);
        }
      );
      const keyboardDidHideListener = Keyboard.addListener(
        "keyboardDidHide",
        () => {
          setModalKeyboardVisible(false);
        }
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }
  }, [modalVisible]);

  const showAlert = (
    title: string,
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    onConfirm = () => {},
    onCancel = () => {}
  ) => {
    setAlert({
      visible: true,
      title,
      message,
      type,
      onConfirm,
      onCancel,
    });
  };

  const hideAlert = (confirmed: boolean = true) => {
    setAlert((prev) => {
      if (confirmed) {
        prev.onConfirm();
      } else {
        prev.onCancel();
      }
      return { ...prev, visible: false };
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-US", options);
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

  const toggleTicketExpansion = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
    setReplyText("");
  };

  useEffect(() => {
    const fetchTickets = async () => {
      if (!userId || !sectionId) return;

      setIsLoadingTickets(true);
      setTicketsError(null);

      try {
        const response = await fetchTeacherSupportTickets(
          sectionId as string,
          userId.toString()
        );

        const transformedTickets: SupportTicket[] = response.tickets.map(
          (ticket) => ({
            id: ticket.id.toString(),
            category: ticket.category.toLowerCase(),
            subject: ticket.subject,
            message: ticket.message,
            date: ticket.createdat, // Using lowercase API field
            gradeId: selectedGrade || "",
            gradeName: currentGradeName || "",
            sectionId: sectionId as string,
            sectionName: currentSectionName || "",
            studentId: ticket.studentid.toString(),
            studentName: "",
            status: ticket.status.toLowerCase() as "new" | "replied" | "closed",
            parentId: ticket.sentby.toString(),
            parentName: `${ticket.firstname} ${ticket.lastname}`,
            priority: "medium",
            replies:
              ticket.messages?.map((msg) => ({
                id: msg.id.toString(),
                message: msg.message,
                date: msg.createdat, // Using lowercase API field
                isTeacher: msg.sentby === userId, // Compare sentby with current userId
              })) || [],
          })
        );

        setSupportTickets(transformedTickets);
      } catch (error) {
        console.error("Failed to fetch support tickets:", error);
        setTicketsError("Failed to load support tickets. Please try again.");
        showAlert("Error", "Failed to load support tickets", "error");
      } finally {
        setIsLoadingTickets(false);
      }
    };

    if (sectionId && userId) {
      fetchTickets();
    }
  }, [userId, sectionId, selectedGrade, currentGradeName, currentSectionName]);

  const handleReplySubmit = async (ticketId: string) => {
    if (!replyText.trim() || !userId) {
      showAlert("Error", "Reply text cannot be empty", "error");
      return;
    }

    setIsReplying(true);

    try {
      await replySupportTicket(
        parseInt(ticketId),
        userId.toString(),
        replyText
      );

      const ticket = supportTickets.find((t) => t.id === ticketId);
      if (ticket && ticket.status === "new") {
        await updateTicketStatus(
          parseInt(ticketId),
          "Replied" as SupportTicketStatus
        );
      }

      const updatedTickets = supportTickets.map((ticket) => {
        if (ticket.id === ticketId) {
          const updatedReplies = [
            ...(ticket.replies || []),
            {
              id: `r${Date.now()}`,
              message: replyText,
              date: new Date().toISOString(),
              isTeacher: true,
            },
          ];

          return {
            ...ticket,
            status: "replied",
            replies: updatedReplies,
          };
        }
        return ticket;
      });

      setSupportTickets(updatedTickets);
      setReplyText("");
      setIsReplying(false);
      showAlert("Success", "Your reply has been sent", "success");
    } catch (error) {
      console.error("Failed to send reply:", error);
      showAlert(
        "Error",
        "Failed to send your reply. Please try again.",
        "error"
      );
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    showAlert(
      "Close Ticket",
      "Are you sure you want to close this ticket? This will mark the issue as resolved.",
      "warning",
      async () => {
        try {
          await updateTicketStatus(
            parseInt(ticketId),
            "Closed" as SupportTicketStatus
          );

          const updatedTickets = supportTickets.map((ticket) =>
            ticket.id === ticketId ? { ...ticket, status: "closed" } : ticket
          );

          setSupportTickets(updatedTickets);
          showAlert("Success", "The ticket has been closed", "success");
        } catch (error) {
          console.error("Failed to close ticket:", error);
          showAlert(
            "Error",
            "Failed to close the ticket. Please try again.",
            "error"
          );
        }
      }
    );
  };

  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ({ ...faq });
    setModalVisible(true);
  };

  const handleAddNewFAQ = () => {
    setEditingFAQ(null);
    setNewFAQ({
      question: "",
      answer: "",
      category: "general",
    });

    setTimeout(() => {
      setModalVisible(true);
    }, 50);
  };

  const handleSaveFAQ = () => {
    Keyboard.dismiss();
    setModalVisible(false);
  };

  const handleDeleteFAQ = (faqId: string) => {
    showAlert(
      "Delete FAQ",
      "Are you sure you want to delete this FAQ?",
      "warning",
      () => {
        setFaqs(faqs.filter((f) => f.id !== faqId));
        setModalVisible(false);
        setTimeout(() => {
          showAlert("Success", "FAQ deleted successfully", "success");
        }, 300);
      }
    );
  };

  const filteredTickets = supportTickets.filter((ticket) => {
    const matchesGrade =
      selectedGrade === "all" ||
      !selectedGrade ||
      ticket.gradeId === selectedGrade;
    const matchesStatus = ticket.status === activeTab;
    const matchesSearch =
      !searchQuery ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.parentName?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesGrade && matchesStatus && matchesSearch;
  });

  const renderTicketItem = (ticket: SupportTicket) => {
    const isExpanded = expandedTicket === ticket.id;
    const priorityColors = {
      low: "#4CAF50",
      medium: "#FF9800",
      high: "#F44336",
    };

    return (
      <View style={styles.ticketContainer} key={ticket.id}>
        <TouchableOpacity
          style={styles.ticketHeader}
          onPress={() => toggleTicketExpansion(ticket.id)}
          activeOpacity={0.7}
        >
          <View style={styles.ticketHeaderLeft}>
            <Text style={styles.ticketCategory}>
              {ticket.category.charAt(0).toUpperCase() +
                ticket.category.slice(1)}
            </Text>
            {ticket.priority && (
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: priorityColors[ticket.priority] },
                ]}
              >
                <Text style={styles.priorityText}>
                  {ticket.priority.charAt(0).toUpperCase() +
                    ticket.priority.slice(1)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.ticketHeaderRight}>
            <Text style={styles.ticketDate}>
              {getRelativeTime(ticket.date)}
            </Text>
            <MaterialCommunityIcons
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color="#666"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.ticketSubjectContainer}>
          <Text style={styles.ticketSubject}>{ticket.subject}</Text>
        </View>

        <View style={styles.ticketMetaContainer}>
          <Text style={styles.ticketMeta}>
            <Text style={styles.ticketMetaLabel}>From: </Text>
            {ticket.parentName}
          </Text>
          <Text style={styles.ticketMeta}>
            <Text style={styles.ticketMetaLabel}>Student: </Text>
            {ticket.studentName} ({ticket.gradeName} {ticket.sectionName})
          </Text>
        </View>

        {isExpanded && (
          <View style={styles.ticketExpandedContent}>
            <View style={styles.ticketMessageContainer}>
              <Text style={styles.ticketMessageLabel}>Original Message:</Text>
              <Text style={styles.ticketMessage}>{ticket.message}</Text>
            </View>

            {ticket.replies && ticket.replies.length > 0 && (
              <View style={styles.repliesContainer}>
                <Text style={styles.repliesLabel}>Conversation:</Text>
                {ticket.replies.map((reply) => (
                  <View
                    key={reply.id}
                    style={[
                      styles.replyItem,
                      reply.isTeacher
                        ? styles.teacherReply
                        : styles.parentReply,
                    ]}
                  >
                    <Text style={styles.replyMessage}>{reply.message}</Text>
                    <View style={styles.replyFooter}>
                      <Text style={styles.replyFrom}>
                        {reply.isTeacher ? "You" : ticket.parentName}
                      </Text>
                      <Text style={styles.replyDate}>
                        {formatDate(reply.date)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {ticket.status !== "closed" && (
              <View style={styles.replyInputContainer}>
                <TextInput
                  ref={replyInputRef}
                  style={[styles.replyInput, { color: inputTextColor }]}
                  placeholder="Type your reply here..."
                  placeholderTextColor={inputPlaceholderText}
                  value={replyText}
                  onChangeText={(text) => {
                    setReplyText(text);
                  }}
                  multiline
                  textAlignVertical="top"
                  inputAccessoryViewID={
                    Platform.OS === "ios" ? inputAccessoryViewID : undefined
                  }
                  onFocus={() => {
                    setShowKeyboardBar(true);
                    setTimeout(scrollToActiveInput, 300);
                  }}
                />
                <View style={styles.replyActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.closeButton]}
                    onPress={() => handleCloseTicket(ticket.id)}
                  >
                    <Text style={styles.actionButtonText}>Close Ticket</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      styles.replyButton,
                      (!replyText.trim() || isReplying) &&
                        styles.disabledButton,
                    ]}
                    onPress={() => handleReplySubmit(ticket.id)}
                    disabled={!replyText.trim() || isReplying}
                  >
                    {isReplying ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.actionButtonText}>Send Reply</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderFAQList = () => {
    return (
      <View style={styles.faqsContainer}>
        <View style={styles.faqHeader}>
          <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
          <TouchableOpacity
            style={styles.addFaqButton}
            onPress={handleAddNewFAQ}
          >
            <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            <Text style={styles.addFaqButtonText}>Add FAQ</Text>
          </TouchableOpacity>
        </View>

        {faqs.map((faq) => (
          <View key={faq.id} style={styles.faqItem}>
            <View style={styles.faqQuestionContainer}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              {faq.isEditable && (
                <TouchableOpacity
                  onPress={() => handleEditFAQ(faq)}
                  style={styles.editButton}
                >
                  <MaterialCommunityIcons
                    name="pencil"
                    size={18}
                    color={primary}
                  />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
            <View style={styles.faqFooter}>
              {faq.category && (
                <View style={styles.faqCategoryContainer}>
                  <Text style={styles.faqCategory}>{faq.category}</Text>
                </View>
              )}
              {faq.isEditable && (
                <TouchableOpacity
                  style={styles.faqDeleteButton}
                  onPress={() => handleDeleteFAQ(faq.id)}
                >
                  <MaterialCommunityIcons
                    name="delete-outline"
                    size={16}
                    color="#f44336"
                  />
                  <Text style={styles.faqDeleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const tabCounts = {
    new: supportTickets.filter(
      (t) =>
        t.status === "new" &&
        (selectedGrade === "all" ||
          !selectedGrade ||
          t.gradeId === selectedGrade)
    ).length,
    replied: supportTickets.filter(
      (t) =>
        t.status === "replied" &&
        (selectedGrade === "all" ||
          !selectedGrade ||
          t.gradeId === selectedGrade)
    ).length,
    closed: supportTickets.filter(
      (t) =>
        t.status === "closed" &&
        (selectedGrade === "all" ||
          !selectedGrade ||
          t.gradeId === selectedGrade)
    ).length,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
            <Text style={styles.title}>Support</Text>
          </View>
        </View>

        <View style={styles.header}>
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons name="magnify" size={20} color="#555" />
              <TextInput
                style={[styles.searchInput, { color: inputTextColor }]}
                placeholder="Search support tickets..."
                placeholderTextColor={searchPlaceholderText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialCommunityIcons name="close" size={20} color="#555" />
                </TouchableOpacity>
              )}
            </View>

            {!isFromInternal && (
              <TouchableOpacity
                style={styles.filterButton}
                onPress={() => setShowGradeFilter(!showGradeFilter)}
              >
                <MaterialCommunityIcons
                  name="filter-variant"
                  size={22}
                  color={primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {isFromInternal && (
            <View style={styles.currentClassBanner}>
              <MaterialCommunityIcons
                name="google-classroom"
                size={18}
                color={primary}
              />
              <Text style={styles.currentClassText}>
                {currentGradeName}{" "}
                {currentSectionName && `- ${currentSectionName}`}
              </Text>
            </View>
          )}

          {showGradeFilter && !isFromInternal && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.gradeFilterScroll}
              contentContainerStyle={styles.gradeFilterContainer}
            >
              {grades.map((grade) => (
                <TouchableOpacity
                  key={grade.id}
                  style={[
                    styles.gradeFilterChip,
                    selectedGrade === grade.id &&
                      styles.selectedGradeFilterChip,
                  ]}
                  onPress={() => setSelectedGrade(grade.id)}
                >
                  <Text
                    style={[
                      styles.gradeFilterText,
                      selectedGrade === grade.id &&
                        styles.selectedGradeFilterText,
                    ]}
                  >
                    {grade.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "new" && styles.activeTab]}
              onPress={() => setActiveTab("new")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "new" && styles.activeTabText,
                ]}
              >
                New ({tabCounts.new})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "replied" && styles.activeTab]}
              onPress={() => setActiveTab("replied")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "replied" && styles.activeTabText,
                ]}
              >
                Replied ({tabCounts.replied})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "closed" && styles.activeTab]}
              onPress={() => setActiveTab("closed")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "closed" && styles.activeTabText,
                ]}
              >
                Closed ({tabCounts.closed})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "faqs" && styles.activeTab]}
              onPress={() => setActiveTab("faqs")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "faqs" && styles.activeTabText,
                ]}
              >
                FAQs
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.contentContainer}
          contentContainerStyle={[
            styles.contentScrollContainer,
            keyboardVisible && {
              paddingBottom: Platform.OS === "ios" ? 180 : 220,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          scrollEventThrottle={16}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
            autoscrollToTopThreshold: 100,
          }}
        >
          {activeTab === "faqs" ? (
            renderFAQList()
          ) : (
            <>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((ticket) => renderTicketItem(ticket))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons
                    name="ticket-outline"
                    size={60}
                    color="#ddd"
                  />
                  <Text style={styles.emptyText}>
                    No {activeTab} support tickets found
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>

        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => {
            Keyboard.dismiss();
            setTimeout(() => setModalVisible(false), 100);
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => setModalVisible(false), 200);
                  }}
                  style={styles.modalCloseButton}
                >
                  <MaterialCommunityIcons name="close" size={22} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalFormContainer}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: modalKeyboardVisible ? 120 : 20,
                }}
              >
                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Question</Text>
                  <TextInput
                    style={[styles.formInput, { color: inputTextColor }]}
                    value={editingFAQ ? editingFAQ.question : newFAQ.question}
                    onChangeText={(text) =>
                      editingFAQ
                        ? setEditingFAQ({ ...editingFAQ, question: text })
                        : setNewFAQ((prev) => ({ ...prev, question: text }))
                    }
                    placeholder="Enter FAQ question"
                    placeholderTextColor={inputPlaceholderText}
                    multiline
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Answer</Text>
                  <TextInput
                    style={[
                      styles.formInput,
                      styles.formTextArea,
                      { color: inputTextColor },
                    ]}
                    value={editingFAQ ? editingFAQ.answer : newFAQ.answer}
                    onChangeText={(text) =>
                      editingFAQ
                        ? setEditingFAQ({ ...editingFAQ, answer: text })
                        : setNewFAQ((prev) => ({ ...prev, answer: text }))
                    }
                    placeholder="Enter FAQ answer"
                    placeholderTextColor={inputPlaceholderText}
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                <View style={styles.formField}>
                  <Text style={styles.formLabel}>Category</Text>
                  <View style={styles.categoryButtons}>
                    {[
                      "general",
                      "academic",
                      "attendance",
                      "diary",
                      "timetable",
                    ].map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          (editingFAQ?.category || newFAQ.category) ===
                            category && styles.selectedCategoryButton,
                        ]}
                        onPress={() =>
                          editingFAQ
                            ? setEditingFAQ({ ...editingFAQ, category })
                            : setNewFAQ({ ...newFAQ, category })
                        }
                      >
                        <Text
                          style={[
                            styles.categoryButtonText,
                            (editingFAQ?.category || newFAQ.category) ===
                              category && styles.selectedCategoryButtonText,
                          ]}
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View
                style={[
                  styles.modalActions,
                  modalKeyboardVisible &&
                    Platform.OS === "android" && { marginBottom: 48 },
                ]}
              >
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => setModalVisible(false), 150);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {editingFAQ && editingFAQ.id && (
                  <TouchableOpacity
                    style={[styles.modalButton, styles.deleteButton]}
                    onPress={() => {
                      if (editingFAQ.id) {
                        handleDeleteFAQ(editingFAQ.id);
                      }
                    }}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    styles.saveButton,
                    isLoading && styles.disabledButton,
                  ]}
                  onPress={() => {
                    Keyboard.dismiss();
                    setTimeout(() => handleSaveFAQ(), 50);
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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

        <CustomAlert
          visible={alert.visible}
          title={alert.title}
          message={alert.message}
          type={alert.type}
          onConfirm={() => hideAlert(true)}
          onCancel={() => hideAlert(false)}
          showCancelButton={alert.type === "warning"}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  header: {
    backgroundColor: "#fff",
    paddingTop: 12,
    paddingBottom: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  searchFilterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 12,
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
  filterButton: {
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  gradeFilterScroll: {
    maxHeight: 50,
  },
  gradeFilterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  gradeFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  selectedGradeFilterChip: {
    backgroundColor: primary,
  },
  gradeFilterText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  selectedGradeFilterText: {
    color: "#fff",
  },
  tabsContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  activeTabText: {
    color: primary,
    fontFamily: Typography.fontWeight.semiBold.primary,
  },
  contentContainer: {
    flex: 1,
  },
  contentScrollContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  ticketContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#eee",
  },
  ticketHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "#f9f9f9",
  },
  ticketHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketCategory: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#fff",
  },
  ticketHeaderRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  ticketDate: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginRight: 6,
  },
  ticketSubjectContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  ticketSubject: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    marginBottom: 4,
  },
  ticketMetaContainer: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  ticketMeta: {
    fontSize: 13,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    marginBottom: 2,
  },
  ticketMetaLabel: {
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
  },
  ticketExpandedContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  ticketMessageContainer: {
    marginBottom: 16,
  },
  ticketMessageLabel: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginBottom: 6,
  },
  ticketMessage: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
    lineHeight: 20,
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
    alignSelf: "flex-end",
  },
  parentReply: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-start",
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
  },
  replyInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    minHeight: 100,
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
  closeButton: {
    backgroundColor: "#f44336",
  },
  replyButton: {
    backgroundColor: primary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    textAlign: "center",
  },
  faqsContainer: {
    backgroundColor: "transparent",
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  faqSectionTitle: {
    fontSize: 18,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
  },
  addFaqButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addFaqButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    marginLeft: 4,
  },
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  faqQuestionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: Typography.fontWeight.semiBold.primary,
    color: "#333",
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#666",
    lineHeight: 20,
  },
  faqFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  faqCategoryContainer: {
    flex: 1,
  },
  faqCategory: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: primary,
    backgroundColor: "rgba(11, 181, 191, 0.08)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  faqDeleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  faqDeleteText: {
    fontSize: 12,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#f44336",
    marginLeft: 4,
  },
  currentClassBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(11, 181, 191, 0.08)",
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  currentClassText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    maxHeight: "85%",
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
  modalCloseButton: {
    padding: 4,
  },
  modalFormContainer: {
    padding: 16,
    maxHeight: Platform.OS === "ios" ? 420 : 380,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#555",
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee",
    padding: 10,
    fontSize: 14,
    fontFamily: Typography.fontFamily.primary,
    color: "#333",
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoryButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
    marginBottom: 8,
  },
  selectedCategoryButton: {
    backgroundColor: primary,
  },
  categoryButtonText: {
    fontSize: 13,
    fontFamily: Typography.fontWeight.medium.primary,
    color: "#666",
  },
  selectedCategoryButtonText: {
    color: "#fff",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelButtonText: {
    color: "#555",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  saveButton: {
    backgroundColor: primary,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Typography.fontWeight.medium.primary,
  },
  modalKeyboardAccessory: {
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
    elevation: 1000,
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
