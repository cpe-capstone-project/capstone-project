// src/unid/storageKeys.ts
export const getUID = () => localStorage.getItem("id") || null;

// ต่อ key ด้วย userId ถ้ามี (ถ้ายังไม่ล็อกอิน = คืน base เดิม)
export const k = (base: string) => {
  const uid = getUID();
  return uid ? `${base}:${uid}` : base;
};

export const KEYS = {
  NOTI: "patient_notifications",     // แจ้งเตือนนัดหมาย
  NOTICE_FLAG: "has_new_notice",     // flag ว่ามีแจ้งเตือนใหม่
  CAL: "calendar_events",            // ปฏิทิน
  CHECK_DAY: "daily-checklist-v2",   // checklist วันนี้
  CHECK_BYDATE: "daily-checklist-bydate-v2", // checklist ตามวัน
  PROFILE: "patient_profile",        // ✅ cache โปรไฟล์คนไข้
};
