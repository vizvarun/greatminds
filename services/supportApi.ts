import api from "./api";

export type SupportTicketStatus = "New" | "Replied" | "Closed";

export type SupportTicketCategory =
  | "Teacher"
  | "Academic"
  | "Fees"
  | "Technical"
  | "Other";

export type SupportTicketReply = {
  id: string;
  message: string;
  date: string;
  isParent: boolean;
};

export type SupportTicket = {
  id: number;
  message: string;
  sentby: number;
  assigned_to: number;
  subject: string;
  studentid: number;
  sectionid: number;
  createdat: string;
  updatedat: string | null;
  status: SupportTicketStatus;
  category: SupportTicketCategory;
  firstname: string;
  lastname: string;
  mobileno: string;
  messages: SupportTicketReply[];
};

export type SupportTicketsResponse = {
  total: number;
  page: number;
  page_size: number;
  tickets: SupportTicket[];
};

/**
 * Fetch support tickets created by a parent
 * @param sectionId Section ID
 * @param userId User ID of the parent
 * @param page Page number (optional)
 * @param pageSize Number of items per page (optional)
 */
export const fetchParentSupportTickets = async (
  sectionId: string,
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SupportTicketsResponse> => {
  try {
    const response = await api.get<SupportTicketsResponse>(
      `/support/created/list?section_id=${sectionId}&user_id=${userId}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching parent support tickets:", error);
    throw error;
  }
};

/**
 * Fetch support tickets assigned to a teacher
 * @param sectionId Section ID
 * @param userId User ID of the teacher
 * @param page Page number (optional)
 * @param pageSize Number of items per page (optional)
 */
export const fetchTeacherSupportTickets = async (
  sectionId: string,
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<SupportTicketsResponse> => {
  try {
    const response = await api.get<SupportTicketsResponse>(
      `/support/assigned/list?section_id=${sectionId}&user_id=${userId}&page=${page}&page_size=${pageSize}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching teacher support tickets:", error);
    throw error;
  }
};

/**
 * Create a new support ticket
 */
export const createSupportTicket = async (
  sectionId: string,
  userId: string,
  studentId: string,
  subject: string,
  message: string,
  category: SupportTicketCategory
) => {
  try {
    const response = await api.post("/support/create", {
      category,
      subject,
      message,
      sentby: Number(userId),
      studentid: Number(studentId),
      sectionid: Number(sectionId),
      status: "new",
    });
    return response.data;
  } catch (error) {
    console.error("Error creating support ticket:", error);
    throw error;
  }
};

/**
 * Reply to a support ticket
 */
export const replySupportTicket = async (
  ticketId: number,
  userId: string,
  message: string
) => {
  try {
    const response = await api.put("/support/update", {
      support_ticket_id: ticketId,
      message,
      sentby: Number(userId),
      action: "reply",
    });
    return response.data;
  } catch (error) {
    console.error("Error replying to support ticket:", error);
    throw error;
  }
};

/**
 * Update a support ticket status (close ticket)
 */
export const updateTicketStatus = async (
  ticketId: number,
  userId: string,
  message: string = ""
) => {
  try {
    const response = await api.put("/support/update", {
      support_ticket_id: ticketId,
      message,
      sentby: Number(userId),
      action: "close",
    });
    return response.data;
  } catch (error) {
    console.error("Error updating ticket status:", error);
    throw error;
  }
};
