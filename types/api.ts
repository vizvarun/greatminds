export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNo: string;
}

export interface Section {
  sectionId: number;
  sectionName: string;
}

export interface ClassSection {
  sections: Section[];
}

export interface Class {
  empId: number;
  className: string;
}

export interface ClassWithSections {
  0: Class;
  1: ClassSection;
}

export interface SchoolDetails {
  schoolId: number;
  schoolName: string;
  schoolAddress: string;
  city: string;
  state: string;
  pincode: string;
}

export interface SchoolWithClasses {
  0: SchoolDetails;
  1: {
    classes_list: ClassWithSections[];
  };
}

export interface UserProfileResponse {
  user: User;
  student_ids: number[];
  school_ids: SchoolWithClasses[];
}

export interface StudentDetails {
  enrollmentno: string;
  firstname: string;
  middlename: string | null;
  lastname: string;
  dob: string;
}

export interface ParentDetails {
  firstname: string;
  middlename: string | null;
  lastname: string;
  email: string;
  mobileno: string;
  parenttype: "father" | "mother" | "guardian";
}

export interface SectionDetails {
  schoolname: string;
  schooladdress: string;
  schoolcity: string;
  schoolstate: string;
  schoolid: number;
  classname: string;
  classid: number;
  section: string;
  sectionid: number;
  id: number;
  studentid: number;
  createdat: string;
  updatedat: string | null;
  deletedat: string | null;
  isactive: boolean;
  createdby: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  logo: string;
}

export interface StudentProfileResponse {
  student: StudentDetails;
  parents: ParentDetails[];
  section_details: SectionDetails[];
}

export interface StudentProfile extends StudentProfileResponse {
  id: number; // Adding this to track which student ID this profile belongs to
}
