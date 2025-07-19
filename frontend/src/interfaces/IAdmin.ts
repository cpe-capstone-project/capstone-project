export interface AdminInterface {
  ID?: number;
  FirstName: string;
  LastName: string;
  Email: string;
  PasswordHash?: string;
  RoleID?: number;
}
