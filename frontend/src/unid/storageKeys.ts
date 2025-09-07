// ✅ เพิ่ม role
export const getRole = () => (localStorage.getItem("role") || "").toLowerCase() || null;
export const getUID  = () => localStorage.getItem("id") || null;

// ✅ ทำ namespace เป็น base:role:id เพื่อลดชนกันข้ามบทบาท/ผู้ใช้
export const k = (base: string) => {
  const role = getRole();
  const uid  = getUID();
  if (role && uid) return `${base}:${role}:${uid}`;
  if (uid)         return `${base}:${uid}`;
  return base;
};

export const KEYS = {
  NOTI: "patient_notifications",
  NOTICE_FLAG: "has_new_notice",
  CAL: "calendar_events",
  CHECK_DAY: "daily-checklist-v2",
  CHECK_BYDATE: "daily-checklist-bydate-v2",

  // ✅ แยก cache โปรไฟล์คนละบทบาท
  PROFILE_PATIENT: "patient_profile",
  PROFILE_PSYCH:   "psych_profile",
};
