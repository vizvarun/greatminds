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
