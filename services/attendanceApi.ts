import api from "./api";

// Define the actual API response structure
interface AttendanceAPIResponse {
  summary: {
    total_students: number;
    present_count: number;
    absent_count: number;
    leave_count: number;
    untracked_count: number;
    present_percentage: number;
    absent_percentage: number;
    leave_percentage: number;
    untracked_percentage: number;
  };
  details: Array<{
    firstname: string;
    lastname: string;
    profilepic: string | null;
    id: number;
    sectionid: number | null;
    studentid: number;
    attendance: string; // "PR", "AB", "LE", "UT"
    remarks: string | null;
    date: string;
    createdat: string | null;
    updatedat: string | null;
    deletedat: string | null;
    schoolid: number;
    enrollmentno: string;
    dob: string;
    addressline1: string;
    addressline2: string;
    state: string;
    city: string;
    zipcode: string;
    classid: number | null;
    phoneno: string;
    isactive: boolean;
    createdby: number;
    middlename: string | null;
  }>;
}

// Define the shape of the attendance data
export type AttendanceSummary = AttendanceAPIResponse & {
  section_id: string;
  date: string;
};

// Student attendance detail type
export type StudentAttendanceDetail = {
  id: number;
  studentId: number;
  name: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  profilePic: string | null;
  enrollmentNo: string;
  status: "present" | "absent" | "leave" | "untracked";
  statusCode: "PR" | "AB" | "LE" | "UT";
  remarks: string | null;
  date: string;
  contactNumber: string;
  dob: string;
  // Add address fields
  address: {
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    zipcode: string;
    fullAddress?: string; // Convenience field for displaying full address
  };
};

// Attendance update payload type
export type AttendanceUpdatePayload = {
  student_id: number;
  status: "PR" | "AB" | "LE" | "UT";
  date: string;
  remarks?: string;
};

// Get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // YYYY-MM-DD format
};

/**
 * Fetch section attendance summary
 * @param section_id - The ID of the section to fetch attendance for
 * @returns The attendance summary data
 */
export const fetchSectionAttendanceSummary = async (
  section_id: string
): Promise<AttendanceSummary> => {
  try {
    const response = await api.get<AttendanceAPIResponse>(
      "/section/attendance/summary",
      {
        params: {
          section_id,
          date: getTodayDate(),
        },
      }
    );

    // Return the complete API response along with the section_id and date
    return {
      ...response.data,
      section_id: section_id,
      date: getTodayDate(),
    };
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    throw error;
  }
};

/**
 * Convert API status code to readable status
 * @param statusCode - API status code (PR, AB, LE, UT)
 * @returns Readable status
 */
export const getReadableStatus = (
  statusCode: string
): "present" | "absent" | "leave" | "untracked" => {
  const statusMap: {
    [key: string]: "present" | "absent" | "leave" | "untracked";
  } = {
    PR: "present",
    AB: "absent",
    LE: "leave",
    UT: "untracked",
  };
  return statusMap[statusCode] || "untracked";
};

/**
 * Convert readable status to API status code
 * @param status - Readable status (present, absent, leave, untracked)
 * @returns Status code used by the API
 */
export const getStatusCode = (
  status: "present" | "absent" | "leave" | "untracked"
): "PR" | "AB" | "LE" | "UT" => {
  const statusMap: { [key: string]: "PR" | "AB" | "LE" | "UT" } = {
    present: "PR",
    absent: "AB",
    leave: "LE",
    untracked: "UT",
  };
  return statusMap[status];
};

/**
 * Fetch detailed student attendance for a section
 * @param section_id - The ID of the section
 * @param date - Optional date parameter, defaults to today
 * @returns Array of student attendance details
 */
export const fetchSectionAttendanceDetails = async (
  section_id: string,
  date?: string
): Promise<StudentAttendanceDetail[]> => {
  try {
    const targetDate = date || getTodayDate();
    const response = await api.get<AttendanceAPIResponse>(
      "/section/attendance/summary",
      {
        params: {
          section_id,
          date: targetDate,
        },
      }
    );

    // Transform API response to more usable format
    return response.data.details.map((student) => {
      // Get full name
      const fullName = [student.firstname, student.middlename, student.lastname]
        .filter(Boolean)
        .join(" ");

      return {
        id: student.id,
        studentId: student.studentid,
        name: fullName,
        firstName: student.firstname,
        middleName: student.middlename,
        lastName: student.lastname,
        profilePic: student.profilepic,
        enrollmentNo: student.enrollmentno,
        status: getReadableStatus(student.attendance),
        statusCode: student.attendance as "PR" | "AB" | "LE" | "UT",
        remarks: student.remarks,
        date: student.date,
        contactNumber: student.phoneno,
        dob: student.dob,
        address: {
          addressLine1: student.addressline1,
          addressLine2: student.addressline2,
          city: student.city,
          state: student.state,
          zipcode: student.zipcode,
          fullAddress: `${student.addressline1}, ${
            student.addressline2 || ""
          }, ${student.city}, ${student.state}, ${student.zipcode}`.replace(
            /,\s,/g,
            ","
          ),
        },
      };
    });
  } catch (error) {
    console.error("Error fetching attendance details:", error);
    throw error;
  }
};

/**
 * Update attendance status for multiple students
 * @param section_id - The ID of the section
 * @param updates - Array of attendance updates
 * @returns The API response data
 */
export const updateSectionAttendance = async (
  section_id: string,
  updates: AttendanceUpdatePayload[]
): Promise<any> => {
  try {
    const response = await api.put(
      `/section/attendance/update?section_id=${section_id}`,
      updates
    );
    return response.data;
  } catch (error) {
    console.error("Error updating attendance:", error);
    throw error;
  }
};
