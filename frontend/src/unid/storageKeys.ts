// src/unid/storageKeys.ts
export const getUID = () => localStorage.getItem("id") || null;

// ต่อ key ด้วย userId ถ้ามี (ถ้ายังไม่ล็อกอิน = คืน base เดิม)
export const k = (base: string) => {
  const uid = getUID();
  return uid ? `${base}:${uid}` : base;
};

export const KEYS = {
  NOTI: "patient_notifications",
  NOTICE_FLAG: "has_new_notice",
  CAL: "calendar_events",
  CHECK_DAY: "daily-checklist-v2",
  CHECK_BYDATE: "daily-checklist-bydate-v2",
};
