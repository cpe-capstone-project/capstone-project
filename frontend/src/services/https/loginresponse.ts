export interface LoginResponse {
  status: boolean;
  message: string;
  userType?: string | null;
  profileName?: string;
  imagePath?: string;
  token?: string;  // เพิ่ม token ไว้ตรงนี้
}