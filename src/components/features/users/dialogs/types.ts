
export type UserRole = "user" | "admin" | "super_admin";

export type UserFormValues = {
  firstName: string;
  lastName: string;
  avatarUrl: string;
  role: UserRole;
};
