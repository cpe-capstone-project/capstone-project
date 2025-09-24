import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./tailwind.css";
//import DiarySummary from "../diary_summary/DiarySummary";
//import { GetDiaryCountThisMonth, GetHomeDiaries } from "../../services/https/Diary";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import type { DiaryInterface } from "../../interfaces/IDiary";
//import { GetLatestDiaries } from "../../services/https/Diary";
//import type { DiaryInterface } from "../../interfaces/IDiary";
//import pamemo1 from "../assets/pamemo1.png"; // ปรับ path ให้ถูกต้องตามโปรเจกต์คุณ
import { k, KEYS } from "../../unid/storageKeys";
import DiaryStatsChart from "../../components/DiaryStatsChart/DiaryStatsChart";
import ThoughtRecordStatsChart from "../../components/thought-record-summary/ThoughtRecordStatsChart";
import { useDiary } from "../../contexts/DiaryContext";
import { useDiarySummary, TAGS } from "../../hooks/useDiarySummary";
import { useMemo } from "react";
import { GetDiarySummaryById } from "../../services/https/Diary"; // ⬅️ เพิ
import { GetPatientById } from "../../services/https/Patient";
import type { PatientInterface } from "../../interfaces/IPatient";
import {
  GetDiaryCountForPatient,
  GetHomeDiariesForPatient,
} from "../../services/https/Diary";
import {
  GetThoughtRecordsByPatientId,
  GetThoughtRecordCountByPatientId,
} from "../../services/https/ThoughtRecord";
import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord";
import type { FeedBackInterface } from "../../interfaces/IFeedback";
//import { GetFeedbacksByPatient } from "../../services/https/Feedback";
import { GetFeedbacksByDiary } from "../../services/https/Feedback";
import DiarySummary from "../diary_summary/DiarySummary";
function HomePage() {
  // ใส่ไว้ในฟังก์ชัน HomePage() ด้านบน ๆ ใกล้ ๆ state อื่น ๆ
  const { diaries } = useDiary();
  const [summaryKeywords, setSummaryKeywords] = useState<string[]>([]); // ⬅️ เพิ่ม
  const [today, setToday] = useState<DiaryInterface | null>(null);
  const [week, setWeek] = useState<DiaryInterface | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setMe] = useState<PatientInterface | null>(null);
  // ใกล้ ๆ state อื่น ๆ
  const [trRecent, setTrRecent] = useState<ThoughtRecordInterface[]>([]);
  const [trCount, setTrCount] = useState<number>(0);
  const [trLoading, setTrLoading] = useState<boolean>(true);

  // ===== แทนที่/เพิ่ม state ใกล้ ๆ fb state =====
  const [feedbackDiaryId, setFeedbackDiaryId] = useState<number | null>(null);
  const [latestDiaryFeedbacks, setLatestDiaryFeedbacks] = useState<
    FeedBackInterface[]
  >([]);
  const [fbLoading, setFbLoading] = useState<boolean>(true);
  const [monthCount, setMonthCount] = useState(0);
  const getFeedbackId = (fb: any) =>
    fb?.ID ?? fb?.Id ?? fb?.id ?? fb?.FeedbackID ?? fb?.feedback_id ?? null;

  const safeText = (v: any) => (typeof v === "string" ? v : (v ?? "") + "");
  const stripHtml = (s?: string | null) =>
    s ? s.toString().replace(/<[^>]*>?/gm, "") : "";

  // ===== โหลดตาม diaryId เป้าหมาย (เรียกตอน mount และเมื่อ today เปลี่ยน) =====
  useEffect(() => {
    let alive = true;

    async function loadForDiary(diaryId: number) {
      try {
        setFbLoading(true);
        // ถ้ามี endpoint ให้ใช้แบบนี้:
        const res = await GetFeedbacksByDiary(diaryId, 2, true);
        const items =
          res?.data?.items ?? // {items: [...]}
          res?.data?.data ?? // {data: [...]}
          res?.data ?? // [...]
          [];
        if (alive) setLatestDiaryFeedbacks(Array.isArray(items) ? items : []);
      } catch {
        if (alive) setLatestDiaryFeedbacks([]);
      } finally {
        if (alive) setFbLoading(false);
      }
    }

    // เลือก diary เป้าหมาย: last_feedback_diary_id > today.ID > null
    const last =
      Number(localStorage.getItem("last_feedback_diary_id") || 0) || null;
    const todayId = (today as any)?.ID ?? (today as any)?.id ?? null;
    const preferred = last || todayId || null;

    setFeedbackDiaryId(preferred);

    if (preferred) {
      loadForDiary(preferred);
    } else {
      setLatestDiaryFeedbacks([]);
      setFbLoading(false);
    }

    return () => {
      alive = false;
    };
  }, [today?.ID]); // เมื่อไดอารี่วันนี้เปลี่ยน ลองรีโหลด

  // ===== ฟัง event: feedback:created → ตั้ง diaryId และรีโหลด =====
  useEffect(() => {
    let alive = true;

    const onCreated = async (e: any) => {
      try {
        if (!alive) return;
        const detail = e?.detail || {};
        const target = Number(detail?.diaryIds?.[0] || 0) || feedbackDiaryId;

        if (target) {
          // เก็บเป็นค่า default ต่อไป
          localStorage.setItem("last_feedback_diary_id", String(target));
          setFeedbackDiaryId(target);
        }

        // 1) ถ้ามี items กลับมาจากหน้า Create → ใช้เลย (ไม่ต้องยิง API)
        const items = Array.isArray(detail?.items) ? detail.items : [];
        if (items.length) {
          setLatestDiaryFeedbacks(items.slice(0, 3));
          setFbLoading(false);
          return;
        }

        // 2) ถ้าไม่มี items → ยิงโหลดจากฐาน (ตาม diaryId)
        if (target) {
          setFbLoading(true);
          const res = await GetFeedbacksByDiary(target, 3, true);
          const fetched =
            res?.data?.items ?? res?.data?.data ?? res?.data ?? [];
          setLatestDiaryFeedbacks(Array.isArray(fetched) ? fetched : []);
        }
      } catch {
        setLatestDiaryFeedbacks([]);
      } finally {
        setFbLoading(false);
      }
    };

    window.addEventListener("feedback:created", onCreated as any);
    return () => {
      alive = false;
      window.removeEventListener("feedback:created", onCreated as any);
    };
  }, [feedbackDiaryId]);
  // สำหรับเลื่อนรายการ TR
  const [trIndex, setTrIndex] = useState(0);
  const openTR = (tr: any) => {
    const id = tr?.id ?? tr?.ID;
    if (!id) return;
    navigate(`/patient/thought_records/${id}`);
  };

  // รีเซ็ต/จัดระเบียบ index เมื่อโหลดรายการเสร็จหรือจำนวนเปลี่ยน
  useEffect(() => {
    if (trIndex >= trRecent.length) setTrIndex(0);
  }, [trRecent.length]);

  // ---- Requests (one-way) ----
  type RequestType = "ขอคำปรึกษา" | "ขอนัดพบ" | "อื่นๆ";
  type RequestItem = {
    id: string;
    type: RequestType;
    detail: string;
    other?: string;
    createdAt: string; // ISO
    meetingStart?: string; // ISO (เฉพาะ "ขอนัดพบ")
    meetingEnd?: string; // ISO (เฉพาะ "ขอนัดพบ")
  };
  const getScopedKey = (base: string) => {
    const role = localStorage.getItem("role") || "-";
    // ใช้ไอดีของบทบาทนั้นๆ เป็นหลัก
    const uid =
      (role === "Psychologist"
        ? localStorage.getItem("psych_id")
        : localStorage.getItem("patient_id")) ||
      localStorage.getItem("id") ||
      ""; // fallback
    return `${base}:${role}:${uid}`;
  };
  const newDayState = (): ChecklistState => {
    const tasks = tasksForToday();
    return {
      date: todayKey(),
      tasks,
      done: emptyDoneMap(tasks),
    };
  };
  const pid = Number(localStorage.getItem("patient_id") || 0);

  const myDiaries = useMemo(() => {
    const list = Array.isArray(diaries) ? diaries : [];
    return list.filter((d: any) => {
      const owner =
        d.PatientID ??
        d.patient_id ??
        d.PatientId ??
        d?.TherapyCase?.PatientID ?? // ✅ อ่านจาก TherapyCase (camel)
        d?.therapy_case?.patient_id ?? // ✅ อ่านจาก TherapyCase (snake)
        d.patient?.ID ??
        d.patient?.id;

      return Number(owner) === pid;
    });
  }, [diaries, pid]);
  console.log("🐞 myDiaries in HomePage:", myDiaries);

  console.log("🐞 pid:", pid);
  console.log("🐞 diaries from context:", diaries);
  console.log("🐞 myDiaries after filter:", myDiaries);
  async function postRequestToServer(newItem: RequestItem) {
    try {
      const tokenType = localStorage.getItem("token_type") || "Bearer";
      const token = localStorage.getItem("token") || "";
      const patientId = Number(localStorage.getItem("patient_id") || 0);
      // เลือกนักจิตปลายทาง: ถ้าแอปมีคู่จับอยู่แล้ว ก็อ่านจาก localStorage หรือตัวแปรที่คุณเก็บ
      const psychId = Number(
        localStorage.getItem("assigned_psych_id") ||
          localStorage.getItem("psych_id") ||
          0
      );

      if (!patientId || !psychId) return; // กันพลาด

      const body = {
        type: newItem.type,
        detail: newItem.detail,
        other: newItem.other ?? null,
        meeting_start: newItem.meetingStart ?? null,
        meeting_end: newItem.meetingEnd ?? null,
        patient_id: patientId,
        psychologist_id: psychId,
      };

      await fetch("http://localhost:8000/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${tokenType} ${token}`,
        },
        body: JSON.stringify(body),
      });
    } catch (e) {
      // เงียบไว้ก่อนก็ได้ หรือจะแจ้งเตือนว่า "บันทึกขึ้นเซิร์ฟเวอร์ไม่สำเร็จ" ก็ได้
      console.error("postRequestToServer failed", e);
    }
  }

  const REQUESTS_KEY = getScopedKey("REQUESTS:v2"); // เปลี่ยนเวอร์ชันเพื่อแยกจากของเก่า
  const loadRequests = (): RequestItem[] => {
    try {
      const raw = localStorage.getItem(REQUESTS_KEY) || "[]";
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };
  const saveRequests = (list: RequestItem[]) => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(list));
  };
  // === Requests state ===
  const [recentRequests, setRecentRequests] = useState<RequestItem[]>([]);
  const [requestCount, setRequestCount] = useState<number>(0); // ⬅️ เพิ่ม
  // วางไว้ใน useEffect โซน data fetching อื่น ๆ
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        setTrLoading(true);
        const pid = Number(localStorage.getItem("patient_id") || 0);
        if (!pid) {
          setTrRecent([]);
          setTrCount(0);
          setTrLoading(false);
          return;
        }

        const [listRes, countRes] = await Promise.all([
          GetThoughtRecordsByPatientId(pid, 1, true), // ⬅️ กัน cache
          GetThoughtRecordCountByPatientId(pid, true), // ⬅️ กัน cache
        ]);

        const items =
          listRes?.data?.items ?? listRes?.data?.data ?? listRes?.data ?? [];

        setTrRecent(Array.isArray(items) ? items : []);
        setTrCount(Number(countRes?.data?.count ?? 0));
      } catch {
        setTrRecent([]);
        setTrCount(0);
      } finally {
        setTrLoading(false);
      }
    })();
  }, [location.key]); // ⬅️ เหลืออันเดียวพอ
  useEffect(() => {
    (async () => {
      try {
        setTrLoading(true);
        const pid = Number(localStorage.getItem("patient_id") || 0);
        if (!pid) {
          setTrRecent([]);
          setTrCount(0);
          setTrLoading(false);
          return;
        }

        const [listRes, countRes] = await Promise.all([
          GetThoughtRecordsByPatientId(pid, 1),
          GetThoughtRecordCountByPatientId(pid),
        ]);

        // รองรับได้ทั้งกรณี backend ส่ง {items: []} หรือส่ง [] ตรง ๆ
        const items =
          listRes?.data?.items ?? listRes?.data?.data ?? listRes?.data ?? [];

        setTrRecent(Array.isArray(items) ? items : []);
        setTrCount(Number(countRes?.data?.count ?? 0));
      } catch {
        setTrRecent([]);
        setTrCount(0);
      } finally {
        setTrLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    return scheduleMidnightReset(async () => {
      try {
        await fetchChecklistTodayFromServer();
      } catch {
        setChecklist(newDayState()); // เผื่อออฟไลน์
      }
    });
  }, []);

  useEffect(() => {
    const all = loadRequests().sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    setRecentRequests(all.slice(0, 2));
    setRequestCount(all.length); // ⬅️ เพิ่ม
  }, []);

  // ✅ Drop-in replacement
  async function openRequestForm() {
    const html = `
  <style>
    .rq-row{ margin:10px 0; text-align:left }
    .rq-label{ font-weight:500; margin-bottom:6px; display:block }
    .rq-input, .rq-select, .rq-textarea{
      width:100%; padding:10px 12px; border:1px solid #e5e7eb;
      border-radius:10px; background:#fff; box-sizing:border-box;
    }
    .rq-textarea{ min-height:100px; resize:vertical }
    .rq-note{ display:none }
  </style>

  <div class="rq-row">
    <label class="rq-label">ประเภทคำร้อง</label>
    <select id="rqType" class="rq-select">
      <option value="ขอคำปรึกษา">ขอคำปรึกษา</option>
      <option value="ขอนัดพบ">ขอนัดพบ</option>
      <option value="อื่นๆ">อื่นๆ</option>
    </select>
  </div>

  <!-- ระบุเพิ่มเติม (เฉพาะ "อื่นๆ") -->
  <div class="rq-row">
    <label class="rq-label" id="rqOtherLabel" style="display:none">ระบุเพิ่มเติม</label>
    <input id="rqOther" class="rq-input rq-note" placeholder="โปรดระบุ"/>
    <div id="rqOtherHelp" style="display:none; color:#ef4444; font-size:12px; margin-top:4px">กรุณาระบุข้อมูลเพิ่มเติม</div>
  </div>

  <!-- วัน-เวลา (เฉพาะ "ขอนัดพบ") -->
  <div class="rq-row" id="rqMeetWrap" style="display:none">
    <label class="rq-label">เลือกวัน/เวลาที่ต้องการ</label>
    <div>
      <input id="rqMeetStart" type="datetime-local" class="rq-input" />
    </div>
    <div id="rqMeetHelp" style="display:none; color:#ef4444; font-size:12px; margin-top:6px">
      กรุณาระบุวัน–เวลาเริ่มต้น
    </div>
  </div>

  <div class="rq-row">
    <label class="rq-label">รายละเอียด</label>
    <textarea id="rqDetail" class="rq-textarea" placeholder=""></textarea>
  </div>
`;

    const { value: form } = await Swal.fire({
      title: "ทำแบบคำร้อง",
      html,
      width: 640,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "ส่งคำร้อง",
       showClass: { popup: "" }, // ปิด animation ตอนเปิด
  hideClass: { popup: "" }, // ปิด animation ตอนปิด
      didOpen: () => {
        const typeEl = document.getElementById("rqType") as HTMLSelectElement;
        const otherEl = document.getElementById("rqOther") as HTMLInputElement;
        const otherLbl = document.getElementById(
          "rqOtherLabel"
        ) as HTMLLabelElement;
        const meetWrap = document.getElementById(
          "rqMeetWrap"
        ) as HTMLDivElement;

        const toggleFields = () => {
          const isOther = typeEl.value === "อื่นๆ";
          const isMeet = typeEl.value === "ขอนัดพบ";
          otherEl.style.display = isOther ? "block" : "none";
          otherLbl.style.display = isOther ? "block" : "none";
          if (!isOther)
            (
              document.getElementById("rqOtherHelp") as HTMLDivElement
            ).style.display = "none";
          meetWrap.style.display = isMeet ? "block" : "none";
          if (!isMeet)
            (
              document.getElementById("rqMeetHelp") as HTMLDivElement
            ).style.display = "none";
        };

        toggleFields();
        typeEl.addEventListener("change", toggleFields);
      },

      preConfirm: () => {
        const typeEl = document.getElementById("rqType") as HTMLSelectElement;
        const detailEl = document.getElementById(
          "rqDetail"
        ) as HTMLTextAreaElement;
        const otherEl = document.getElementById("rqOther") as HTMLInputElement;

        const helpOther = document.getElementById(
          "rqOtherHelp"
        ) as HTMLDivElement;
        const helpMeet = document.getElementById(
          "rqMeetHelp"
        ) as HTMLDivElement;

        const meetStartEl = document.getElementById(
          "rqMeetStart"
        ) as HTMLInputElement;
        const type = (typeEl?.value || "ขอคำปรึกษา") as RequestType;
        const detail = (detailEl?.value || "").trim();
        const other = (otherEl?.value || "").trim();

        if (!detail) {
          Swal.showValidationMessage("กรุณากรอกรายละเอียด");
          return;
        }
        if (type === "อื่นๆ" && !other) {
          helpOther.style.display = "block";
          Swal.showValidationMessage("กรุณาระบุเพิ่มเติมสำหรับ ‘อื่นๆ’");
          return;
        }

        let meetingStart: string | undefined;
        if (type === "ขอนัดพบ") {
          const s = meetStartEl?.value;
          if (!s) {
            helpMeet.style.display = "block";
            Swal.showValidationMessage("กรุณาระบุวัน–เวลาเริ่มต้น");
            return;
          }
          const ds = new Date(s);
          meetingStart = ds.toISOString();
        }

        return { type, detail, other, meetingStart };
      },
    });

    if (!form) return;

    const newItem: RequestItem = {
      id: Math.random().toString(36).slice(2),
      type: form.type,
      detail: form.detail,
      other: form.other || undefined,
      createdAt: new Date().toISOString(),
      meetingStart: form.meetingStart || undefined,
      meetingEnd: form.meetingEnd || undefined,
    };

    const all = loadRequests();
    const next = [newItem, ...all].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    saveRequests(next);
    setRecentRequests(next.slice(0, 2));
    setRequestCount(next.length);
    postRequestToServer(newItem);

    if (newItem.type === "ขอคำปรึกษา") {
      await Swal.fire({
        title: "เหตุฉุกเฉินด้านสุขภาพจิต",
        html: `
      <div style="text-align:left;line-height:1.6">
        <p style="display:flex;align-items:center;gap:8px;">
          <img src="https://cdn-icons-png.flaticon.com/128/455/455604.png"
               alt="phone" width="20" height="20"
               style="display:inline-block" />
          <b>โทร : 1323</b> <span>(ตลอด 24 ชั่วโมง)</span>
        </p>
      </div>
    `,
        confirmButtonText: "รับทราบ",
      });
    }

    const saved = next.find((x) => x.id === newItem.id)!;

    const timeBlock = saved.meetingStart
      ? `
      <div style="margin-top:6px;padding:8px 10px;border:1px dashed #d1d5db;border-radius:10px;background:#f9fafb">
        <b>เวลาที่ต้องการ:</b><br/>
        ${
          saved.meetingEnd
            ? `${new Date(saved.meetingStart).toLocaleString(
                "th-TH"
              )} – ${new Date(saved.meetingEnd).toLocaleString("th-TH")}`
            : `${new Date(saved.meetingStart).toLocaleString("th-TH")}`
        }
      </div>`
      : "";

    await Swal.fire({
      icon: "success",
      title: "ส่งคำร้องแล้ว",
      html: `
    <div style="text-align:left">
      <p style="margin:6px 0"><b>ประเภท:</b> ${saved.type}${
        saved.other ? ` (${saved.other})` : ""
      }</p>
      ${timeBlock}
      <p style="margin:6px 0"><b>รายละเอียด:</b> ${saved.detail}</p>
    </div>
  `,
      confirmButtonText: "รับทราบ",
    });
  }
  function handleViewAllRequests() {
    const all = loadRequests().sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );

    const fmtDate = (iso: string) =>
      new Date(iso).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    const fmtTime = (iso: string) =>
      new Date(iso).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

    const LABEL_MORE = "ดูเพิ่ม";
    const LABEL_LESS = "ย่อ";

    const html = `
    <style>
      .rq-card{background:#fff;padding:12px 14px;border-radius:12px;margin-bottom:10px;border:1px solid #eee}
      .rq-head{display:flex;justify-content:space-between;gap:10px;align-items:center}
      .rq-type{font-weight:500}
      .rq-time{color:#6b7280;font-size:12px}
      .rq-detail{color:#374151;margin-top:6px}
      .rq-meet{margin-top:6px;padding:8px 10px;border:1px dashed #d1d5db;border-radius:10px;background:#f9fafb}
      .rq-divider{height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:8px 0 4px}
      .rq-toggle-wrap{display:flex;justify-content:center;margin-top:8px}
      .rq-toggle-btn{
        appearance:none;border:1px solid #e5e7eb;background:linear-gradient(180deg,#ffffff,#f8fafc);
        border-radius:9999px;padding:8px 14px;font-weight:600;font-size:12.5px;cursor:pointer;
        display:inline-flex;align-items:center;gap:8px;
        box-shadow:0 1px 2px rgba(15,23,42,.06), inset 0 0 0 1px #fff;
        transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
      }
      .rq-toggle-btn:hover{transform:translateY(-1px);border-color:#d1d5db;box-shadow:0 6px 12px rgba(15,23,42,.08)}
      .rq-toggle-btn:active{transform:translateY(0)}
      .rq-toggle-chip{background:#111827;color:#fff;border-radius:9999px;font-weight:700;font-size:11px;padding:2px 8px;line-height:1}
      .rq-toggle-icn{font-size:12px;opacity:.8}
      .rq-empty{color:#777}
    </style>

    <div style="text-align:left">
      <h3 style="margin:0 0 8px">คำร้องทั้งหมด</h3>
      <div id="reqList"></div>

      ${
        all.length > 5
          ? `
        <div class="rq-divider"></div>
        <div class="rq-toggle-wrap">
          <button id="toggleReqBtn" class="rq-toggle-btn" type="button" aria-expanded="false">
            <span class="rq-toggle-text">${LABEL_MORE}</span>
            <span class="rq-toggle-chip">+${all.length - 5}</span>
            <span class="rq-toggle-icn">▾</span>
          </button>
        </div>`
          : ``
      }
    </div>
  `;

    Swal.fire({
      html,
      width: 640,
      showCloseButton: true,
      showConfirmButton: false,
       showClass: { popup: "" }, // ปิด animation ตอนเปิด
        hideClass: { popup: "" }, // ปิด animation ตอนปิด
      didOpen: () => {
        const listEl = document.getElementById("reqList");
        const toggleBtn = document.getElementById(
          "toggleReqBtn"
        ) as HTMLButtonElement | null;

        let showAll = false;

        const updateToggleBtn = (expanded: boolean) => {
          if (!toggleBtn) return;
          const txt = toggleBtn.querySelector(
            ".rq-toggle-text"
          ) as HTMLElement | null;
          const chip = toggleBtn.querySelector(
            ".rq-toggle-chip"
          ) as HTMLElement | null;
          const icn = toggleBtn.querySelector(
            ".rq-toggle-icn"
          ) as HTMLElement | null;

          const remain = Math.max(0, all.length - 5);
          if (txt) txt.textContent = expanded ? LABEL_LESS : LABEL_MORE;
          if (icn) icn.textContent = expanded ? "▴" : "▾";
          if (chip) {
            chip.textContent = `+${remain}`;
            chip.style.display =
              expanded || remain <= 0 ? "none" : "inline-block";
          }
          toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
        };

        const renderList = () => {
          if (!listEl) return;

          const items = showAll ? all : all.slice(0, 5);
          if (!items.length) {
            listEl.innerHTML = `<div class="rq-empty">— ยังไม่มีคำร้อง —</div>`;
            return;
          }

          listEl.innerHTML = items
            .map((it) => {
              const created = `${fmtDate(it.createdAt)} ${fmtTime(
                it.createdAt
              )} น.`;
              const extra =
                it.type === "ขอนัดพบ" && it.meetingStart
                  ? `
              <div class="rq-meet">
                <b>เวลาที่ต้องการ:</b><br/>
                ${fmtDate(it.meetingStart)} ${fmtTime(it.meetingStart)} น.
              </div>`
                  : "";

              return `
              <div class="rq-card">
                <div class="rq-head">
                  <div class="rq-type">${it.type}${
                it.other ? ` • ${it.other}` : ""
              }</div>
                  <div class="rq-time">${created}</div>
                </div>
                <div class="rq-detail"><b>รายละเอียด:</b> ${
                  it.detail || "—"
                }</div>
                ${extra}
              </div>
            `;
            })
            .join("");
        };

        renderList();
        updateToggleBtn(showAll);

        toggleBtn?.addEventListener("click", () => {
          showAll = !showAll;
          renderList();
          updateToggleBtn(showAll);
        });
      },
    });
  }
  async function openAllDiaryFeedbacks() {
    try {
  if (!feedbackDiaryId) {
    await Swal.fire({
      title: "ยังไม่มีไดอารี่เป้าหมาย",
      text: "ไม่มีข้อมูลไดอารี่สำหรับดึง Feedback",
      icon: "info",
      showClass: { popup: "" }, // ปิด animation ตอนเปิด
      hideClass: { popup: "" }, // ปิด animation ตอนปิด
    });
    return;
  }


      // ดึง “ทั้งหมด” ของไดอารี่เป้าหมาย
      // ถ้า backend รองรับ limit=null/undefined ให้ส่งแบบนี้เพื่อเอามาทั้งหมด
      const res = await GetFeedbacksByDiary(
        feedbackDiaryId as number,
        undefined as any,
        true
      );

      const list: any[] =
        res?.data?.items ?? res?.data?.data ?? res?.data ?? [];

      // fallback ถ้าไม่มีอะไรเลย
      const items = Array.isArray(list) ? list : [];

      const getId = (fb: any) =>
        fb?.ID ?? fb?.Id ?? fb?.id ?? fb?.FeedbackID ?? fb?.feedback_id ?? null;

      const getTitle = (fb: any) =>
        typeof fb?.FeedbackTitle === "string"
          ? fb.FeedbackTitle
          : typeof fb?.title === "string"
          ? fb.title
          : "Feedback";

      const getBody = (fb: any) => {
        const raw =
          typeof fb?.FeedbackContent === "string"
            ? fb.FeedbackContent
            : typeof fb?.content === "string"
            ? fb.content
            : "";
        return (raw || "").toString().replace(/<[^>]*>?/gm, ""); // stripHtml เบา ๆ
      };

      const getWhen = (fb: any) =>
        fb?.CreatedAt ??
        fb?.created_at ??
        fb?.UpdatedAt ??
        fb?.updated_at ??
        null;

      const fmtTH = (iso?: string | null) =>
        iso ? new Date(iso).toLocaleString("th-TH", { hour12: false }) : "";

      const html = `
      <style>
        .fb-list{max-height:60vh;overflow:auto}
        .fb-card{background:#fff;border:1px solid #eee;border-radius:12px;padding:12px 14px;margin:10px 0}
        .fb-head{display:flex;justify-content:space-between;gap:10px;align-items:center}
        .fb-title{font-weight:600}
        .fb-when{color:#6b7280;font-size:12px;white-space:nowrap}
        .fb-body{color:#374151;margin-top:6px;line-height:1.55}
        .fb-empty{color:#777;text-align:center;padding:16px 0}
      </style>
      <div class="fb-list">
        ${
          items.length === 0
            ? `<div class="fb-empty">— ยังไม่มี Feedback —</div>`
            : items
                .map((fb, i) => {
                  const title = getTitle(fb);
                  const body = getBody(fb);
                  const when = fmtTH(getWhen(fb));
                  return `
                    <div class="fb-card" data-key="${getId(fb) ?? i}">
                      <div class="fb-head">
                        <div class="fb-title">${title}</div>
                        <div class="fb-when">${when}</div>
                      </div>
                      <div class="fb-body">${(body || "—").replace(
                        /</g,
                        "&lt;"
                      )}</div>
                    </div>
                  `;
                })
                .join("")
        }
      </div>
    `;

      await Swal.fire({
        title: "Feedback ทั้งหมดของไดอารี่นี้",
        html,
        width: 720,
        confirmButtonText: "ปิด",
        showCloseButton: true,
        showClass: { popup: "" }, // ปิด animation ตอนเปิด
        hideClass: { popup: "" }, // ปิด animation ตอนปิด
});

    } catch (e) {
      console.error(e);
      await Swal.fire("ดึงข้อมูลไม่สำเร็จ", "โปรดลองใหม่อีกครั้ง", "error");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const idRaw = localStorage.getItem("diary_summary_id");
        const id = idRaw ? parseInt(idRaw) : 0;
        if (!id) return;

        const res = await GetDiarySummaryById(id);
        if (res?.status === 200 && res.data) {
          // สมมติ backend ส่ง field "Keyword" เป็นสตริง เช่น "stress, anxious, sleep"
          const raw = String(res.data.Keyword ?? "");
          const tokens = raw
            .split(/[,\n]/) // คั่นด้วย , หรือขึ้นบรรทัด
            .map((s) => s.trim())
            .filter(Boolean);
          setSummaryKeywords(tokens);
        }
      } catch {
        setSummaryKeywords([]);
      }
    })();
  }, []);
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Patient") {
      navigate("/");
      return;
    }

    const id = localStorage.getItem("patient_id");
    if (!id) {
      Swal.fire("ไม่พบผู้ใช้", "กรุณาเข้าสู่ระบบใหม่อีกครั้ง", "warning");
      navigate("/");
      return;
    }

    (async () => {
      const res = await GetPatientById(Number(id));
      if (res?.status === 200) {
        setMe(res.data); // หรือ res.data.data ตาม API
      }
    })();
  }, []);

 const { detectedEmotions, currentEmotion } = useDiarySummary();
  // ✅ รวมคีย์เวิร์ดที่จะไฮไลต์ (อาจเพิ่มคำอื่น ๆ ได้เอง)
  const HIGHLIGHT_WORDS = useMemo(() => {
    const arr = [
      ...TAGS,
      ...(detectedEmotions || []),
      ...(currentEmotion ? [currentEmotion] : []),
      ...summaryKeywords,
    ];
    return Array.from(new Set(arr.map((t) => t.trim()).filter(Boolean)));
  }, [detectedEmotions, currentEmotion, summaryKeywords]);

  const escapeReg = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const highlightText = (text?: string | null) => {
    if (!text || !HIGHLIGHT_WORDS.length) return text || "— ยังไม่มีสรุป —";
    const pattern = new RegExp(
      `(${HIGHLIGHT_WORDS.map(escapeReg).join("|")})`,
      "gi"
    );
    const parts = text.split(pattern);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="aertr-highlight">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };
  // จำนวนไดอารี่เดือนนี้ (ผู้ป่วยคนปัจจุบัน)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const pid = Number(localStorage.getItem("patient_id") || 0);
        if (!pid) {
          if (isMounted) setMonthCount(0);
          return;
        }
        const res = await GetDiaryCountForPatient({
          patientId: pid,
          scope: "month",
          tz: "Asia/Bangkok",
        });

        if (!isMounted) return;
        if (res?.status === 200) {
          setMonthCount(Number(res.data?.count ?? 0));
        } else {
          setMonthCount(0);
        }
      } catch {
        if (isMounted) setMonthCount(0);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);
  // today/week ของผู้ป่วยคนนั้น
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const pid = Number(localStorage.getItem("patient_id") || 0);
        if (!pid) {
          if (isMounted) {
            setToday(null);
            setWeek(null);
          }
          return;
        }
        const res = await GetHomeDiariesForPatient(pid, "Asia/Bangkok");
        if (!isMounted) return;
        if (res?.status === 200) {
          const data = res.data;
          setToday(data?.today ?? null);
          setWeek(data?.week ?? null);
        } else {
          setToday(null);
          setWeek(null);
        }
      } catch {
        if (isMounted) {
          setToday(null);
          setWeek(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const relTime = (iso?: string) =>
    iso
      ? formatDistanceToNow(new Date(iso), { addSuffix: true, locale: th })
      : "";
  // ---- Task types ----
  type TaskId =
    | "write_diary"
    | "thought_record"
    | "analyze_diary_daily"
    | "analyze_tr_daily"
    | "exercise"
    | "review_prev_day"
    | "gratitude"
    | "goal_review"
    | "mood_trend_check"
    | "analyze_diary_monthly"
    | "analyze_tr_monthly";

  type Task = { id: TaskId; label: string };

  type ChecklistState = {
    date: string; // YYYY-MM-DD
    tasks: Task[]; // รายการงานของวันนั้น
    done: Record<TaskId, boolean>; // สถานะของแต่ละงาน
  };

  // ---- 7 วัน: เซ็ตงานไม่ซ้ำกัน ----
  const TASK_SETS: Task[][] = [
    // Day 1
    [
      { id: "write_diary", label: "เขียนไดอารี่(Diary)" },
      { id: "thought_record", label: "ทำ Though Record" },
      { id: "analyze_diary_daily", label: "วิเคราะห์ผล Diary(รายวัน)" },
      {
        id: "analyze_tr_daily",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)",
      },
    ],
    // Day 2
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำบันทึกความคิด" },
      { id: "exercise", label: "ทำ Though Record" },
      {
        id: "analyze_tr_daily",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)",
      },
    ],
    // Day 3
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำ Though Record" },
      { id: "review_prev_day", label: "ทบทวนอารมณ์เมื่อวาน" },
      { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
    ],
    // Day 4
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำ Though Record" },
      { id: "gratitude", label: "ดู Feedback" },
      {
        id: "analyze_tr_daily",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)",
      },
    ],
    // Day 5
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำบันทึกความคิด" },
      { id: "goal_review", label: "ทบทวนเป้าหมายประจำสัปดาห์" },
      { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
    ],
    // Day 6
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำบันทึกความคิด" },
      { id: "mood_trend_check", label: "ตรวจสอบแนวโน้มอารมณ์" },
      {
        id: "analyze_tr_daily",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)",
      },
    ],
    // Day 7 (เพิ่มสรุปรายเดือน)
    [
      { id: "write_diary", label: "เขียนไดอารี่" },
      { id: "thought_record", label: "ทำบันทึกความคิด" },
      { id: "analyze_diary_daily", label: "วิเคราะห์ไดอารี่ (รายวัน)" },
      {
        id: "analyze_tr_daily",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายวัน)",
      },
      { id: "analyze_diary_monthly", label: "วิเคราะห์ไดอารี่ (รายเดือน)" },
      {
        id: "analyze_tr_monthly",
        label: "วิเคราะห์อารมณ์จาก Though Record (รายเดือน)",
      },
    ],
  ];

  const STORAGE_KEY = k(KEYS.CHECK_DAY);
  const STORAGE_KEY_BYDATE = k(KEYS.CHECK_BYDATE);
  //const STORAGE_KEY = "daily-checklist-v2"; // เปลี่ยน key กันชนกับของเก่า
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const dayIndex = (d = new Date()) => d.getDay(); // 0=Sun ... 6=Sat
  const FORCE_DAY_INDEX: number | null = null; // 0=Day1, 1=Day2,...; ใส่ null ถ้าอยาก auto ตามวันอาทิตย์ถึงเสาร์
  const tasksForToday = () => TASK_SETS[FORCE_DAY_INDEX ?? dayIndex()];
  const ICON_UNCHECKED =
    "https://cdn-icons-png.flaticon.com/128/2217/2217292.png";
  const ICON_CHECKED =
    "https://cdn-icons-png.flaticon.com/128/2951/2951459.png";

  const emptyDoneMap = (tasks: Task[]): Record<TaskId, boolean> =>
    tasks.reduce(
      (acc, t) => ((acc[t.id] = false), acc),
      {} as Record<TaskId, boolean>
    );

  const dateKey = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
  const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

  // เอาเซ็ตงานของ "วันที่นั้น" (อิง day-of-week จริง ไม่ใช่ FORCE_DAY_INDEX)
  function getTasksForDate(d: Date): Task[] {
    return TASK_SETS[d.getDay()];
  }

  type ChecklistStateByDate = {
    date: string; // YYYY-MM-DD
    tasks: Task[];
    done: Record<TaskId, boolean>;
  };

  function loadStore(): Record<string, ChecklistStateByDate> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_BYDATE) || "{}");
    } catch {
      return {};
    }
  }
  function saveStore(store: Record<string, ChecklistStateByDate>) {
    localStorage.setItem(STORAGE_KEY_BYDATE, JSON.stringify(store));
  }

  function loadDay(d: Date): ChecklistStateByDate {
    const key = dateKey(d);
    const store = loadStore();
    const existed = store[key];
    const todayTasks = getTasksForDate(d);

    if (!existed) {
      const fresh: ChecklistStateByDate = {
        date: key,
        tasks: todayTasks,
        done: emptyDoneMap(todayTasks),
      };
      store[key] = fresh;
      saveStore(store);
      return fresh;
    }

    // ถ้าเซ็ตงานเปลี่ยน (เช่นต่างวัน/ต่างดัชนี) → rebuild แต่พยายามคงสถานะ id เดิม
    const same =
      existed.tasks.length === todayTasks.length &&
      existed.tasks.every((t, i) => t.id === todayTasks[i].id);

    if (!same) {
      const rebuilt: ChecklistStateByDate = {
        date: key,
        tasks: todayTasks,
        done: (() => {
          const next = emptyDoneMap(todayTasks);
          Object.keys(next).forEach((id) => {
            if (existed.done[id as TaskId] !== undefined) {
              next[id as TaskId] = existed.done[id as TaskId];
            }
          });
          return next;
        })(),
      };
      store[key] = rebuilt;
      saveStore(store);
      return rebuilt;
    }

    return existed;
  }

  function saveDay(state: ChecklistStateByDate) {
    const store = loadStore();
    store[state.date] = state;
    saveStore(store);
  }

  function loadChecklist(): ChecklistState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return newDayState();
      const parsed: ChecklistState = JSON.parse(raw);

      // ถ้าวันเปลี่ยน หรือเซ็ตงานของวันนี้ต่างจากที่เก็บไว้ → รีบิวด์ใหม่
      const today = todayKey();
      const todayTasks = tasksForToday();
      const sameDate = parsed.date === today;
      const sameTaskSet =
        parsed.tasks.length === todayTasks.length &&
        parsed.tasks.every((t, i) => t.id === todayTasks[i].id);

      if (!sameDate || !sameTaskSet) return newDayState();
      return parsed;
    } catch {
      return newDayState();
    }
  }
  // ✅ GET วันนี้
  async function fetchChecklistTodayFromServer() {
    const tokenType = localStorage.getItem("token_type") || "Bearer";
    const token = localStorage.getItem("token") || "";
    const patientId = Number(localStorage.getItem("patient_id") || 0);
    const tz = "Asia/Bangkok";
    if (!patientId) return;

    const today = new Date().toISOString().slice(0, 10);
    // ⬇️ ใส่ /api
    const url = `http://localhost:8000/api/patients/${patientId}/checklists?date=${today}&tz=${encodeURIComponent(
      tz
    )}`;

    const res = await fetch(url, {
      headers: { Authorization: `${tokenType} ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      const s: ChecklistState = {
        date: data.date,
        tasks: (data.tasks || []).map((t: any) => ({
          id: t.id,
          label: t.label,
        })),
        done: data.done || {},
      };
      setChecklist(s);
      saveChecklist(s);
    }
  }

  // ✅ PATCH toggle
  async function toggleTaskOnServer(
    dateYYYYMMDD: string,
    taskId: TaskId,
    done: boolean,
    version?: number
  ) {
    const tokenType = localStorage.getItem("token_type") || "Bearer";
    const token = localStorage.getItem("token") || "";
    const patientId = Number(localStorage.getItem("patient_id") || 0);
    const tz = "Asia/Bangkok";
    if (!patientId) return;

    // ⬇️ ใส่ /api
    const url = `http://localhost:8000/api/patients/${patientId}/checklists/${dateYYYYMMDD}/toggle?tz=${encodeURIComponent(
      tz
    )}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `${tokenType} ${token}`,
      },
      body: JSON.stringify({ taskId, done, version: version || 0 }),
    });

    if (res.status === 409) {
      await fetchChecklistTodayFromServer();
      return;
    }
    if (res.ok) {
      const data = await res.json();
      const s: ChecklistState = {
        date: data.date,
        tasks: (data.tasks || []).map((t: any) => ({
          id: t.id,
          label: t.label,
        })),
        done: data.done || {},
      };
      setChecklist(s);
      saveChecklist(s);
    }
  }

  function saveChecklist(s: ChecklistState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }

  // ตั้ง reset ที่เที่ยงคืน (เวลาท้องถิ่น)
  function scheduleMidnightReset(cb: () => void) {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1,
      0,
      0,
      0,
      0
    );
    const ms = midnight.getTime() - now.getTime();
    const t = setTimeout(() => {
      cb();
      scheduleMidnightReset(cb);
    }, ms);
    return () => clearTimeout(t);
  }

  // ---- state & effects ----
  const [checklist, setChecklist] = useState<ChecklistState>(() =>
    loadChecklist()
  );

  useEffect(() => {
    saveChecklist(checklist);
  }, [checklist]);

  //useEffect(() => scheduleMidnightReset(() => setChecklist(newDayState())), []);

  const toggleTask = (id: TaskId) => {
    setChecklist((s) => {
      const next = { ...s, done: { ...s.done, [id]: !s.done[id] } };
      saveChecklist(next);
      // fire & forget ซิงก์ (ถ้าอยากกัน spam ให้ debounce/throttle 200–400ms)
      toggleTaskOnServer(next.date, id, next.done[id]).catch(console.error);
      return next;
    });
  };

  // ---- progress ----
  const total = checklist.tasks.length;
  const completed = Object.values(checklist.done).filter(Boolean).length;
  const progressPct = total ? (completed / total) * 100 : 0;

  const navigate = useNavigate();
  // const [latestDiaries, setLatestDiaries] = useState<DiaryInterface[]>([]);
  useEffect(() => {
    //showSuccessLog(); // <--- เพิ่มเพื่อทดสอบ
  }, []);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const isLogin = localStorage.getItem("isLogin");

    if (isLogin !== "true" || role !== "Patient") {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบก่อนใช้งาน",
      }).then(() => {
        navigate("/");
      });
    }
  }, [navigate]);
function openChecklistModal(startDate?: Date) {
  let current = startDate ? new Date(startDate) : new Date();


  const html = `
    <div style="text-align:left">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:12px">
        <button id="prevDay" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer">◀ Yesterday</button>
        <div id="currentDate" style="font-weight:500">${current.toLocaleDateString()}</div>
        <button id="nextDay" style="padding:6px 10px;border:1px solid #ddd;border-radius:8px;background:#fff;cursor:pointer">Tomorrow ▶</button>
      </div>

      <div style="margin:8px 0 14px;font-size:0.95rem;color:#555">
        Progress: <b id="progressPercent">0%</b>
        <div style="height:8px;background:#eee;border-radius:9999px;margin-top:6px;overflow:hidden">
          <div id="progressBar" style="height:100%;width:0%;background:#3b82f6"></div>
        </div>
      </div>

      <ul id="checklistUl" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px"></ul>
    </div>
  `;

  Swal.fire({
    title: "Checklist วันนี้",
    html,
    width: 620,
    showConfirmButton: false,
    showCloseButton: true,
    showClass: { popup: "" },
    hideClass: { popup: "" },
    didOpen: () => {
      const prev = document.getElementById("prevDay")!;
      const next = document.getElementById("nextDay")!;
      const dateEl = document.getElementById("currentDate")!;
      const progressPercent = document.getElementById("progressPercent")!;
      const progressBar = document.getElementById("progressBar")!;
      const checklistUl = document.getElementById("checklistUl")!;

      const renderDay = () => {
        const state = loadDay(current);
        const total = state.tasks.length;
        const done = Object.values(state.done).filter(Boolean).length;
        const progress = total ? Math.round((done / total) * 100) : 0;

        dateEl.innerText = current.toLocaleDateString();
        progressPercent.innerText = `${progress}%`;
        progressBar.style.width = `${progress}%`;

        // render checklist
        checklistUl.innerHTML = state.tasks
          .map((t) => {
            const checked = state.done[t.id] ? "checked" : "";
            return `
              <li style="display:flex;justify-content:space-between;align-items:center;gap:12px;padding:10px 12px;border:1px solid #eee;border-radius:10px;background:#f9fafb">
                <label style="display:flex;align-items:center;gap:10px;cursor:pointer;flex:1">
                  <input type="checkbox" data-task="${t.id}" ${checked} />
                  <span>${t.label}</span>
                </label>
                <span style="min-width:100px;text-align:right;color:${
                  state.done[t.id] ? "#059669" : "#b40909ff"
                };font-weight:600">
                  ${state.done[t.id] ? "Completed" : "Incomplete"}
                </span>
              </li>
            `;
          })
          .join("");

        // add checkbox listener
        checklistUl.querySelectorAll<HTMLInputElement>("input[type=checkbox]").forEach((cb) => {
          cb.addEventListener("change", () => {
            const id = cb.getAttribute("data-task") as TaskId;
            const st = loadDay(current);
            st.done[id] = cb.checked;
            saveDay(st);
            renderDay(); // update progress & status
          });
        });
      };

      prev.addEventListener("click", () => {
        current = addDays(current, -1);
        renderDay();
      });
      next.addEventListener("click", () => {
        current = addDays(current, 1);
        renderDay();
      });

      renderDay(); // render วันแรก
    },
  });
}

  return (
    <div className="dash-frame">
      <div className="dash-content">
        <div className="deer-dashboard-container">
          <div className="diorr-card1">
            <div className="diorr-card-header">
              <div className="diorr-card-title">
                <h3>Daily Progress</h3>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5948/5948941.png"
                  alt="Daily Progress Icon"
                  className="diorr-icon"
                />
              </div>
              <span className="diorr-stat-text">
                {completed}/{total}
              </span>
              <div className="diorr-progress-bar">
                <div
                  className="diorr-progress"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>

          <div className="diorr-card2">
            <div className="diorr-card-header">
              <div className="diorr-card-title">
                <h3>Diary Entries</h3>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/8275/8275593.png"
                  alt="Diary Entries Icon"
                  className="diorr-icon"
                />
              </div>
              <span className="diorr-stat-text">{monthCount}</span>
              <span className="diorr-stat-subtext">This month</span>
            </div>
          </div>

          {/* เดิม diorr-card3: แก้ส่วนตัวเลข/ข้อความ */}
          <div className="diorr-card3">
            <div className="diorr-card-header">
              <div className="diorr-card-title">
                <h3>Thought Records</h3>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/109/109827.png"
                  alt="Thought Records Icon"
                  className="diorr-icon"
                />
              </div>
              <span className="diorr-stat-text">{trCount}</span>
              <span className="diorr-stat-subtext">Total</span>
            </div>
          </div>
          <div className="diorr-card4">
            <div className="diorr-card-header">
              <div className="diorr-card-title">
                <h3>Recent Requests</h3>
                <img
                  src="https://cdn-icons-png.flaticon.com/128/2991/2991113.png"
                  alt="Request Form Icon"
                  className="diorr-icon"
                />
              </div>
              <span className="diorr-stat-text">{requestCount}</span>{" "}
              {/* ⬅️ รวมทั้งหมด */}
              <span className="diorr-stat-subtext">Total submitted</span>
            </div>
          </div>

          {/* Lower Section */}
          <div className="deer-tiger-dashboard-container">
            {/* Daily Checklist */}
            <div className="deer-tiger-card">
              <div className="hior-title">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/5948/5948941.png"
                  alt="Checklist Icon"
                  className="frio-icon"
                />
                <h3>Daily Checklist</h3>
              </div>
              <p className="deer-tiger-subtext">
                Track your daily wellness activities
              </p>

              <ul className="deer-tiger-checklist">
                {checklist.tasks.map(({ id, label }) => {
                  const done = checklist.done[id];
                  const iconSrc = done ? ICON_CHECKED : ICON_UNCHECKED;

                  return (
                    <li
                      key={id}
                      onClick={() => toggleTask(id)}
                      className="deer-tiger-item"
                    >
                      <div className="deer-item-left">
                        <img
                          src={iconSrc}
                          alt={done ? "Done" : "Todo"}
                          className="deer-check-icon"
                        />
                        <span className="deer-item-label">{label}</span>
                      </div>
                      <span
                        className={`deer-tiger-status ${
                          done ? "completed" : "pending"
                        }`}
                      >
                        {done ? "Completed" : "Incomplete"}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <button
                className="deer-tiger-btn"
                onClick={() => openChecklistModal()}
              >
                View More
              </button>
            </div>

            {/* Diary */}
            <div className="deer-tiger-card">
              <div className="hior-title">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/8275/8275593.png"
                  alt="Diary Icon"
                  className="frio-icon"
                />
                <h3>Diary</h3>
              </div>

              <p className="deer-tiger-subtext">
                Your personal thoughts and reflections
              </p>

              {loading ? (
                // --- แสดงโหลดเฉพาะส่วนนี้ (ไม่บล็อกทั้งหน้า) ---
                <>
                  <p className="deer-tiger-diary-entry">
                    <span className="diary-entry-header">
                      Today’s Entry
                      <span className="diary-entry-time">กำลังโหลด…</span>
                    </span>
                    <span className="diary-entry-content"> </span>
                  </p>
                  <p className="deer-tiger-diary-entry">
                    <span className="diary-entry-header">
                      Yesterday
                      <span className="diary-entry-time">กำลังโหลด…</span>
                    </span>
                    <span className="diary-entry-content"> </span>
                  </p>
                </>
              ) : (
                <>
                  <p className="deer-tiger-diary-entry">
                    <span className="diary-entry-header">
                      Today’s Entry
                      <span className="diary-entry-time">
                        {today?.UpdatedAt ? relTime(today.UpdatedAt) : "—"}
                      </span>
                    </span>
                    <span className="diary-entry-content">
                      {today
                        ? highlightText(
                            stripHtml(today.Content).slice(0, 120) ||
                              today.Title ||
                              "ยังไม่มีบันทึกวันนี้"
                          )
                        : "ยังไม่มีบันทึกวันนี้"}
                    </span>
                  </p>

                  <p className="deer-tiger-diary-entry">
                    <span className="diary-entry-header">
                      Last Week
                      <span className="diary-entry-time">
                        {week?.UpdatedAt ? relTime(week.UpdatedAt) : "—"}
                      </span>
                    </span>
                    <span className="diary-entry-content">
                      {week
                        ? highlightText(
                            stripHtml(week.Content).slice(0, 120) ||
                              week.Title ||
                              "ยังไม่มีบันทึกสัปดาห์ที่ผ่านมา"
                          )
                        : "ยังไม่มีบันทึกสัปดาห์ที่ผ่านมา"}
                    </span>
                  </p>
                </>
              )}

              <button
                className="deer-tiger-btn"
                onClick={() => navigate("/patient/diary")}
                disabled={loading}
              >
                View More
              </button>
            </div>
            
            {/* ===== Thought Record card (single) ===== */}
            <div className="deer-tiger-card">
              <div className="hior-title">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/109/109827.png"
                  alt="Thought Record Icon"
                  className="frio-icon"
                />
                <h3>Thought Record</h3>
              </div>
              <p className="deer-tiger-subtext">
                Cognitive behavioral therapy tracking
              </p>

              {trLoading ? (
                // skeleton: โชว์แค่ 1 อัน
                <div
                  className="deer-tiger-thought-entry"
                  style={{
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 10,
                    background: "#fff",
                    display: "grid",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        height: 12,
                        width: "45%",
                        background: "#f1f5f9",
                        borderRadius: 6,
                      }}
                    />
                    <span
                      style={{
                        height: 20,
                        width: 64,
                        background: "#e5e7eb",
                        borderRadius: 999,
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gap: 6 }}>
                    <div
                      style={{
                        height: 10,
                        background: "#f1f5f9",
                        borderRadius: 6,
                      }}
                    />
                    <div
                      style={{
                        height: 10,
                        background: "#f1f5f9",
                        borderRadius: 6,
                        width: "70%",
                      }}
                    />
                  </div>
                </div>
              ) : trCount === 0 ? (
                // empty
                <div
                  className="deer-tiger-thought-entry"
                  style={{
                    padding: 10,
                    border: "1px dashed #e5e7eb",
                    borderRadius: 10,
                    background: "#fcfcfd",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <strong>—</strong>
                    <span
                      style={{
                        background: "#e5e7eb",
                        color: "#111",
                        borderColor: "#e5e7eb",
                        border: "1px solid",
                        borderRadius: 999,
                        padding: "2px 8px",
                        fontSize: 11,
                      }}
                    >
                      —
                    </span>
                  </div>
                  <p style={{ marginTop: 6, color: "#64748b", fontSize: 13 }}>
                    ยังไม่มี Thought Record
                  </p>
                </div>
              ) : (
                (() => {
                  const tr: any = trRecent[0]; // ✅ โชว์รายการแรกอันเดียว

                  const firstNonEmpty = (...vals: any[]) =>
                    vals.find(
                      (v) => typeof v === "string" && v.trim().length > 0
                    ) || undefined;

                  const getEmotionName = (row: any) =>
                    firstNonEmpty(
                      row?.emotion?.Name,
                      row?.Emotion?.Name,
                      row?.emotion_name,
                      row?.EmotionName,
                      row?.emotion,
                      row?.Emotion
                    );

                  const getTagColor = (row: any) =>
                    firstNonEmpty(
                      row?.tag_colors,
                      row?.TagColors,
                      row?.tagColor,
                      row?.TagColor
                    );

                  const idealTextColor = (bg?: string) => {
                    if (!bg) return "#fff";
                    let hex = bg.trim();
                    if (hex.startsWith("var(")) return "#fff";
                    if (hex.startsWith("#")) hex = hex.slice(1);
                    if (hex.length === 3)
                      hex = hex
                        .split("")
                        .map((c) => c + c)
                        .join("");
                    const r = parseInt(hex.slice(0, 2) || "0", 16);
                    const g = parseInt(hex.slice(2, 4) || "0", 16);
                    const b = parseInt(hex.slice(4, 6) || "0", 16);
                    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
                    return yiq >= 128 ? "#111" : "#fff";
                  };

                  const situation =
                    tr?.Situation ??
                    tr?.situation ??
                    tr?.event ??
                    tr?.Event ??
                    tr?.Topic ??
                    tr?.title ??
                    "—";
                  const thoughts =
                    tr?.Thoughts ??
                    tr?.thoughts ??
                    tr?.AlternateThought ??
                    tr?.alternate_thought ??
                    "—";
                  const altThought =
                    tr?.AlternateThought ?? tr?.alternate_thought ?? "—";
                  const behaviors = tr?.Behaviors ?? tr?.behaviors ?? "—";
                  const emotionName = getEmotionName(tr) ?? "Emotion";
                  const tagColor = getTagColor(tr) ?? "#6B7280";

                  return (
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => openTR(tr)}
                      onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && openTR(tr)
                      }
                      className="deer-tiger-thought-entry"
                      style={{
                        padding: 10,
                        border: "1px solid #eee",
                        borderRadius: 12,
                        background: "#fff",
                        display: "grid",
                        gap: 6,
                        cursor: "pointer",
                        boxShadow: "0 1px 2px rgba(16,24,40,.04)", // คงเงาอ่อนๆ ถ้าต้องการ
                        borderColor: "#eee",
                      }}
                    >
                      {/* header */}
                      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <div
    title={situation}
    style={{
      display: "-webkit-box",
      WebkitLineClamp: 1,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
      textOverflow: "ellipsis",
      fontSize: 14,
      lineHeight: 1.3,
      flex: 1,
    }}
  >
    {situation}
  </div>

                        <span
                          style={{
                            backgroundColor: tagColor,
                            color: idealTextColor(tagColor),
                            borderColor: tagColor,
                            borderWidth: 1,
                            borderStyle: "solid",
                            padding: "2px 8px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 500,
                            whiteSpace: "nowrap",
                          }}
                          title={emotionName}
                        >
                          {emotionName}
                        </span>
                      </div>

                      {/* rows */}
                      <p style={{ margin: 0, color: "#334155", fontSize: 13 }}>
                        <span style={{ fontWeight: 500, color: "#0f172a" }}>
                          🧠 Thoughts:
                        </span>{" "}
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={typeof thoughts === "string" ? thoughts : ""}
                        >
                          {thoughts}
                        </span>
                      </p>

                      <p style={{ margin: 0, color: "#334155", fontSize: 13 }}>
                        <span style={{ fontWeight: 500, color: "#0f172a" }}>
                          💡 Alternate:
                        </span>{" "}
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={
                            typeof altThought === "string" ? altThought : ""
                          }
                        >
                          {altThought}
                        </span>
                      </p>

                      <p style={{ margin: 0, color: "#334155", fontSize: 13 }}>
                        <span style={{ fontWeight: 500, color: "#0f172a" }}>
                          🧭 Behaviors:
                        </span>{" "}
                        <span
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={typeof behaviors === "string" ? behaviors : ""}
                        >
                          {behaviors}
                        </span>
                      </p>
                    </div>
                  );
                })()
              )}

              <button
                className="deer-tiger-btn"
                onClick={() => navigate("/patient/thought_records")}
              >
                View More
              </button>
            </div>

            <div className="deer-tiger-card">
              <div className="hior-title">
                <img
                  src="https://cdn-icons-png.flaticon.com/128/2991/2991113.png"
                  alt="Request Form Icon"
                  className="frio-icon"
                />
                <h3>Recent Requests</h3>
              </div>

              {recentRequests.length === 0 ? (
                <div className="appointment-entry">
                  <div className="appointment-header">
                    <strong>—</strong>
                    <span className="appointment-date">—</span>
                  </div>
                  <p className="appointment-detail">ยังไม่มีคำร้องล่าสุด</p>
                  <p className="appointment-time">—</p>
                </div>
              ) : (
                recentRequests.slice(0, 2).map((rq) => {
                  const created = new Date(rq.createdAt);
                  const dateText = created.toLocaleDateString("th-TH", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                  const timeText = created.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={rq.id}
                      className="appointment-entry"
                      style={{ marginTop: 8 }}
                    >
                      <div className="appointment-header">
                        
                          {rq.type}
                          {rq.other ? ` • ${rq.other}` : ""}
                      
                        <span className="appointment-date">{dateText}</span>
                      </div>
                      <p className="appointment-detail">{rq.detail || "—"}</p>
                      <p className="appointment-time">{timeText}</p>
                    </div>
                  );
                })
              )}

              {/* เปลี่ยนปุ่มเป็นส่งคำร้อง */}
              <button className="deer-tiger-btn" onClick={openRequestForm}>
                กรอกฟอร์มยื่นคำร้อง
              </button>

              {/* ถ้าอยากมีปุ่มดูทั้งหมดด้วย ให้คงไว้บรรทัดล่างนี้; ไม่ต้องมีก็ลบทิ้งได้ */}
              <button
                className="deer-tiger-btn"
                onClick={handleViewAllRequests}
              >
                ดูคำร้องทั้งหมด
              </button>
            </div>

            {/* ===== Summary Diary Text (aertr) ===== */}
            <div className="aertr-overall-container">
              <div className="aertr-summary-card">
                <div className="aertr-summary-left">
                  <div
                    style={{
                      marginTop: 12,
                      padding: "12px 14px",
                      border: "1px solid #eee",
                      borderRadius: 12,
                      background: "#fff",
                    }}
                  >
                    <DiaryStatsChart
                      diaries={myDiaries}
                      dateField="UpdatedAt"
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="aertr-summary-right">
                  <div className="aertr-feedback-card">
                    <h4 className="aertr-feedback-title">
                      <img
                        src="https://cdn-icons-png.flaticon.com/128/11213/11213138.png"
                        alt="Feedback Icon"
                        className="aertr-feedback-icon"
                      />
                      Diary Feedback{feedbackDiaryId ? ` ` : ""}
                    </h4>
                    {/* content */}
                    {fbLoading ? (
                      <div className="gmk space-y-6 mt-3">
                        {[...Array(2)].map((_, i) => (
                          <div
                            key={i}
                            className="animate-pulse rounded-xl border border-slate-400 bg-white p-4"
                          >
                            <div className="h-4 w-36 bg-slate-200 rounded"></div>
                            <div className="mt-3 h-3 w-5/6 bg-slate-200 rounded"></div>
                          </div>
                        ))}
                      </div>
                    ) : latestDiaryFeedbacks.length === 0 ? (
                      <p className="text-slate-400 text-sm mt-3">
                        ยังไม่มี Feedback
                      </p>
                    ) : (
                      <div className="gmk flex flex-col gap-y-6 mt-3">
                        {latestDiaryFeedbacks.slice(0, 2).map((fb, idx) => {
                          const id = getFeedbackId(fb);
                          const title = safeText(
                            (fb as any)?.FeedbackTitle ??
                              (fb as any)?.title ??
                              "Feedback"
                          );
                          const bodyPlain = stripHtml(
                            safeText(
                              (fb as any)?.FeedbackContent ??
                                (fb as any)?.content ??
                                ""
                            )
                          );
                          const when =
                            (fb as any)?.CreatedAt ??
                            (fb as any)?.created_at ??
                            (fb as any)?.UpdatedAt ??
                            (fb as any)?.updated_at ??
                            null;

                          const key =
                            id != null
                              ? String(id)
                              : `${title}-${when ?? ""}-${idx}`;

                          return (
                            <article
                              key={key}
                              className="rounded-xl border border-slate-400 bg-white p-4"
                            >
                              {/* header */}
                              <div className="flex items-center justify-between mb-3">
                                <h5 className="text-slate-900 font-semibold text-base">
                                  {title}
                                </h5>
                                {when ? (
                                  <time className="text-[12px] text-slate-500">
                                    {new Date(when).toLocaleString("th-TH")}
                                  </time>
                                ) : null}
                              </div>

                              {/* body */}
                              <p className="text-sm text-slate-700 leading-relaxed">
                                {bodyPlain}
                              </p>
                            </article>
                          );
                        })}
                      </div>
                    )}

                    <button
                      className="aertr-feedback-btn"
                      onClick={openAllDiaryFeedbacks}
                    >
                      View More
                    </button>
                  </div>
                </div>
              </div>
                  <DiarySummary /> 
            </div>
          </div>
          <ThoughtRecordStatsChart/>
        </div>
      </div>
    </div>
  );
}
export default HomePage;
