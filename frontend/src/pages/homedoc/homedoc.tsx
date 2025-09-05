import React, { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { k, KEYS } from "../../unid/storageKeys";
import PatientOverviewChart from "../../components/PatientOverviewChart/PatientOverviewChart";
// เพิ่มต่อจาก import อื่น ๆ ด้านบน
import {
  BookOpen,
  GraduationCap,
  FlaskConical,
  FileText,
  ExternalLink,
  Link as LinkIcon,
  Search,
} from "lucide-react";

/* ======================== Helpers (Scoped Keys / Storage) ======================== */
const getScopedKey = (base: string) => {
  const role = localStorage.getItem("role") || "-";
  const pid = localStorage.getItem("psych_id") || "";
  const uid = pid || localStorage.getItem("id") || "";
  return `${base}:${role}:${uid}`;
};

const DOC_REJECT_INBOX_KEY = getScopedKey("DOC_REJECT_INBOX"); // สำหรับ migration เดิม
const DOC_REQUESTS_KEY = getScopedKey("DOC_REQUESTS");         // กล่อง “คำร้องทั้งหมด”
const CAL_KEY = getScopedKey("CAL");
const safeGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const safeSet = (key: string, val: string) => {
  try {
    localStorage.setItem(key, val);
  } catch {}
};

/* ===== Types ===== */
type RequestType = "ขอคำปรึกษา" | "ขอนัดพบ" | "อื่นๆ";
type RequestItem = {
  id: number;
  type: RequestType;
  detail: string;
  other?: string;
  createdAt: string;      // ISO
  meetingStart?: string;  // ISO
  meetingEnd?: string;    // ISO
  patient_name?: string;
};


const loadDocRequests = (): RequestItem[] => {
  try {
    return JSON.parse(localStorage.getItem(DOC_REQUESTS_KEY) || "[]");
  } catch {
    return [];
  }
};
const saveDocRequests = (list: RequestItem[]) =>
  localStorage.setItem(DOC_REQUESTS_KEY, JSON.stringify(list || []));

interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  age: number | string;
  gender: string;
  birthday: string;
}
// วางไว้เหนือ fetchAll หรือส่วนบนๆ ของไฟล์ Homedoc.tsx
const toISO = (v: any): string | undefined => {
  if (!v) return undefined;
  const d = new Date(v);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};
// --- helpers ---
const firstNonEmpty = (...vals: any[]) =>
  vals.find((v) => typeof v === "string" && v.trim().length > 0);

const fullNameFromObj = (o?: any): string | undefined => {
  if (!o) return undefined;
  const first =
    o.first_name ?? o.FirstName ?? o.firstname ?? o.given_name ?? o.GivenName ?? o.firstName;
  const last =
    o.last_name ?? o.LastName ?? o.lastname ?? o.family_name ?? o.FamilyName ?? o.lastName;
  const name = [first, last].filter(Boolean).join(" ").trim();
  return name || undefined;
};

// --- แทนที่ normalizeRequests เดิมด้วยอันนี้ ---
function normalizeRequests(arr: any[]): RequestItem[] {
  return (arr || []).map((r) => {
    const patientName =
      firstNonEmpty(
        r.patient_name,
        r.patientName,
        r.PatientName,
        r.name,
      ) ||
      fullNameFromObj(r.Patient) ||
      fullNameFromObj(r.patient);

    return {
      id: Number(r.id) || 0,
      type: r.type,
      detail: r.detail,
      other: r.other ?? undefined,
      createdAt: toISO(r.createdAt ?? r.CreatedAt ?? r.created_at) || "",
      meetingStart: toISO(r.meetingStart ?? r.MeetingStart ?? r.meeting_start),
      meetingEnd: toISO(r.meetingEnd ?? r.MeetingEnd ?? r.meeting_end),
      patient_name: patientName,
    };
  });
}


/* ======================== Component ======================== */
const Homedoc: React.FC = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const isLogin = localStorage.getItem("isLogin");
  const psychId = localStorage.getItem("psych_id") || localStorage.getItem("id");

  const [, setLoading] = useState(true);

  const [patients, setPatients] = useState<Patient[]>([]);
  const patientsRef = useRef<Patient[]>([]);
  useEffect(() => {
    patientsRef.current = patients;
  }, [patients]);

  // one-time migration (คีย์รวม -> คีย์ต่อผู้ใช้)
  useEffect(() => {
    const migFlag = `__migrated__:${DOC_REJECT_INBOX_KEY}::${CAL_KEY}`;
    if (safeGet(migFlag) === "1") return;

    // inbox: doc_reject_inbox -> scoped
    const oldInboxKey = "doc_reject_inbox";
    const oldInboxVal = safeGet(oldInboxKey);
    const newInboxVal = safeGet(DOC_REJECT_INBOX_KEY);
    if (oldInboxVal && !newInboxVal) safeSet(DOC_REJECT_INBOX_KEY, oldInboxVal);

    // calendar: k(KEYS.CAL) -> scoped
    const oldCalKey = k(KEYS.CAL);
    const oldCalVal = safeGet(oldCalKey);
    const newCalVal = safeGet(CAL_KEY);
    if (oldCalVal && !newCalVal) safeSet(CAL_KEY, oldCalVal);

    safeSet(migFlag, "1");
  }, [DOC_REJECT_INBOX_KEY, CAL_KEY]); // ✅ แก้ dependency ถูกต้อง

  /* ===== Stats ===== */
  const [inTreatmentIds, setInTreatmentIds] = useState<number[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [stats, setStats] = useState([
    {
      title: "Total Patients",
      value: "0",
      subtitle: "—",
      icon: "https://cdn-icons-png.flaticon.com/128/747/747376.png",
    },
    {
      title: "บทความวิจัย",
    value: "5",
    subtitle: "CBT/Depression references",
    icon: "https://cdn-icons-png.flaticon.com/128/5403/5403820.png",
    },
    // ⬇️ ใช้ All Requests แทน Recent Activities
    {
      title: "All Requests",
      value: String(loadDocRequests().length),
      subtitle: "View inbox requests",
      icon: "https://cdn-icons-png.flaticon.com/128/1828/1828859.png",
    },
  ]);
function getAuthHeaders(): HeadersInit {
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  const token = localStorage.getItem("token") || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `${tokenType} ${token}`; // เช่น "Bearer xxxxxx"
  }
  return headers;
}

// ===== refs เป็นแหล่งจริงฝั่ง UI =====
const inSetRef = useRef<Set<number>>(new Set());
const doneSetRef = useRef<Set<number>>(new Set());

// sync ref -> state
const flushSetsToState = () => {
  setInTreatmentIds(Array.from(inSetRef.current));
  setCompletedIds(Array.from(doneSetRef.current));
};

// ย้ายทีละคน (mutual exclusive)
const moveOne = (pid: number, state: "in_treatment" | "completed" | "unknown") => {
  if (!Number.isFinite(pid) || pid <= 0) return;
  if (state === "in_treatment") {
    doneSetRef.current.delete(pid);
    inSetRef.current.add(pid);
  } else if (state === "completed") {
    inSetRef.current.delete(pid);
    doneSetRef.current.add(pid);
  }
};

// ย้ายหลายคน
const moveMany = (
  items: Array<{ patient_id: number; state: "in_treatment" | "completed" | "unknown" }>
) => {
  for (const it of items || []) {
    const pid = Number(it.patient_id);
    if (!Number.isFinite(pid) || pid <= 0) continue;
    moveOne(pid, it.state);
  }
};

useEffect(() => {
  const pid = localStorage.getItem("psych_id") || localStorage.getItem("id");
  if (!pid) return;

  const tokenType = localStorage.getItem("token_type") || "Bearer";
  const token = localStorage.getItem("token") || "";

  const fetchAll = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/requests/by-psychologist?psychologist_id=${pid}`,
      { headers: { Authorization: `${tokenType} ${token}` } }
    );
    if (!res.ok) throw new Error("bad res");
    const raw = await res.json();
    const arr = normalizeRequests(Array.isArray(raw) ? raw : []);
    saveDocRequests(arr);
    window.dispatchEvent(new Event("docRequestsUpdated"));
  } catch {}
};


  // ดึงครั้งแรก
  fetchAll();

  // ตั้ง interval
  const t = setInterval(fetchAll, 20000); // 20s
  return () => clearInterval(t);
}, []);
  const refreshAllRequestsCount = () => {
    const count = loadDocRequests().length;
    setStats((prev) =>
      prev.map((s) =>
        s.title === "All Requests"
          ? { ...s, value: String(count), subtitle: "View inbox requests" }
          : s
      )
    );
  };

  useEffect(() => {
    // โหลดครั้งแรก + ฟังอีเวนต์สำหรับ All Requests
    refreshAllRequestsCount();
    const onRequests = () => refreshAllRequestsCount();
    window.addEventListener("docRequestsUpdated", onRequests);
    return () => window.removeEventListener("docRequestsUpdated", onRequests);
  }, []);

  /* ===== โหลดผู้ป่วย ===== */
  useEffect(() => {
    const updateTotal = (arr: Patient[]) => {
      const total = arr.filter((p) => p.id && p.id !== 0).length;
      setStats((prev) =>
        prev.map((s) =>
          s.title === "Total Patients"
            ? { ...s, value: total.toLocaleString("en-US"), subtitle: "updated just now" }
            : s
        )
      );
    };

    if (!psychId) return;
    fetch(`http://localhost:8000/patients-by-psych?psychologist_id=${psychId}`, {
  headers: getAuthHeaders(),
})
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("ข้อมูลผิดรูปแบบ");
        const normalized = data.map((p: any) => ({ ...p, id: Number(p.id) || 0 }));
        setPatients(normalized);
        setLoading(false);
        updateTotal(normalized);
      })
      .catch((err) => {
        console.error("โหลดผู้ป่วยล้มเหลว", err);
        setPatients([
          { first_name: "-", last_name: "-", age: "-", gender: "-", birthday: "-", id: 0 },
        ]);
        setLoading(false);
        updateTotal([]);
      });
  }, [psychId]);

  // รีเฟรชเมื่อมีผู้ป่วยใหม่ (BroadcastChannel)
  useEffect(() => {
    if (!psychId) return;
    let isUnmounted = false;

    const refetchPatients = async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/patients-by-psych?psychologist_id=${psychId}`,
           { headers: getAuthHeaders() }
        );
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        const data = await res.json();
        if (!Array.isArray(data) || isUnmounted) return;
        const normalized = data.map((p: any) => ({ ...p, id: Number(p.id) || 0 }));
        setPatients(normalized);

        const total = normalized.filter((p: Patient) => p.id && p.id !== 0).length;
        setStats((prev) =>
          prev.map((s) =>
            s.title === "Total Patients"
              ? { ...s, value: total.toLocaleString("en-US"), subtitle: "updated just now" }
              : s
          )
        );
      } catch (e) {
        console.error("refetch patients failed", e);
      }
    };

    try {
      const bc = new BroadcastChannel("patient_updates");
      bc.onmessage = (ev) => {
        const msg = ev.data;
        if (msg?.type === "patient_registered" && String(msg.psychologist_id) === String(psychId)) {
          refetchPatients();
        }
      };
      return () => {
        bc.close();
        isUnmounted = true;
      };
    } catch {
      // ไม่รองรับ BroadcastChannel ก็ข้าม
    }
  }, [psychId]);

/* ===== Auth guard ===== */
useEffect(() => {
  if (!psychId || !isLogin || role !== "Psychologist") {
    navigate("/");
  }
}, [psychId, isLogin, role, navigate]);
// ✅ รีเซ็ตสถานะทั้งหมดเมื่อเปลี่ยน psychId
useEffect(() => {
  setInTreatmentIds([]);
  setCompletedIds([]);
  inSetRef.current = new Set();
  doneSetRef.current = new Set();
}, [psychId]);

useEffect(() => {
  if (!psychId) return;

  const applyMsg = (raw: any) => {
  const msg = raw || {};

  // ถ้ามี psychologist_id ในข้อความและไม่ตรงกับเรา ให้ข้าม
  if (msg?.psychologist_id && String(msg.psychologist_id) !== String(psychId)) return;

  let changed = false;

  if (msg?.type === "therapy_status_change") {
    const pidNum = Number(msg.patient_id);
    if (!Number.isFinite(pidNum) || pidNum <= 0) return;
    moveOne(pidNum, msg.state);
    changed = true;
  } else if (msg?.type === "therapy_status_batch" && Array.isArray(msg.items)) {
    moveMany(msg.items);
    changed = true;
  } else if (Array.isArray(msg)) {
    // ✅ รับเฉพาะรายการที่ระบุ psychologist_id ตรงกับเรา
    const items = (msg as any[]).filter(
      (it) => it?.psychologist_id && String(it.psychologist_id) === String(psychId)
    );
    if (items.length) {
      moveMany(items);
      changed = true;
    }
  }

  if (changed) flushSetsToState();
};


  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel("patient_activity");
    bc.onmessage = (ev) => applyMsg(ev.data);
  } catch {}

  const onStorage = (e: StorageEvent) => {
    if (e.key !== "patient_activity_ping" || !e.newValue) return;
    try { applyMsg(JSON.parse(e.newValue)); } catch {}
  };
  window.addEventListener("storage", onStorage);

  try {
    const last = localStorage.getItem("patient_activity_ping");
    if (last) applyMsg(JSON.parse(last));
  } catch {}

  return () => {
    try { bc?.close(); } catch {}
    window.removeEventListener("storage", onStorage);
  };
}, [psychId]);

useEffect(() => {
  if (!psychId) return;

 const fetchCases = async () => {
  try {
    const res = await fetch(
      `http://localhost:8000/therapy-case/psyco/${psychId}`,
     { headers: getAuthHeaders() }
    );
    if (res.status === 204) return;        // ไม่มีอะไรใหม่ ก็ไม่ต้องเปลี่ยน
    if (!res.ok) throw new Error("bad res");

    const cases = await res.json();
    const { inIds, doneIds } = deriveIdsFromCases(cases || []);

    // ทับสถานะตรง ๆ จากฐานข้อมูล (สแนปช็อต)
    setInTreatmentIds(inIds);
    setCompletedIds(doneIds);

    // อัปเดต refs ให้ตรงกับ state ล่าสุด (ถ้ายังใช้ refs ที่อื่น)
    inSetRef.current = new Set(inIds);
    doneSetRef.current = new Set(doneIds);
  } catch (err) {
    console.warn("poll therapy cases failed:", err);
    // อย่าล้าง state ตอน error
  }
};

  fetchCases();
  const t = setInterval(fetchCases, 20000);
  return () => clearInterval(t);
}, [psychId]);


// ให้ refs เท่ากับค่า state เมื่อ state เปลี่ยนครั้งแรก ๆ
useEffect(() => {
  // ทำแบบอ่อน ๆ: อัปเดตทุกครั้งให้ refs ตรงกับ state ล่าสุด
  inSetRef.current = new Set(inTreatmentIds);
  doneSetRef.current = new Set(completedIds);
}, [inTreatmentIds, completedIds]);


function deriveIdsFromCases(cases: Array<any>) {
  const inSet = new Set<number>();
  const doneSet = new Set<number>();

  for (const c of cases || []) {
    const pid = Number(c.patient_id ?? c.PatientID ?? c.patientId) || 0;
    if (!pid) continue;

    // ดึงเลขสถานะจากฟิลด์ที่ backend อาจคืนมาได้หลายแบบ
    const sid =
      Number(
        c.case_status_id ??
        c.CaseStatusID ??
        c.caseStatusId ??
        c.case_status?.id ??
        c.CaseStatus?.ID
      ) || 0;

    if (sid === 2) doneSet.add(pid);
    else if (sid === 1) inSet.add(pid);
  }

  return { inIds: Array.from(inSet), doneIds: Array.from(doneSet) };
}




// แทน validPatients เดิม ด้วยเวอร์ชัน dedupe
const validPatients = useMemo(() => {
  const arr = patients.filter((p) => Number.isFinite(p?.id) && p.id !== 0);
  const map = new Map<number, Patient>();
  for (const p of arr) if (!map.has(p.id)) map.set(p.id, p);
  return Array.from(map.values());
}, [patients]);


// ผู้ป่วยที่มีอยู่จริง (dedupe แล้วอยู่แล้วใน validPatients)
const validIdSet = useMemo(
  () => new Set(validPatients.map((p) => p.id)),
  [validPatients]
);
// แทนที่ของเดิมตรง ResearchLink / researchLinks
type ResearchLink = {
  title: string;
  href: string;
  source?: string;
  Icon?: React.ElementType; // <- เพิ่ม
};

const researchLinks: ResearchLink[] = [
  {
    title: "Cognitive Therapy of Depression (บทความรีวิว)",
    href: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3584580/",
    source: "NCBI / PMC",
    Icon: BookOpen,
  },
  {
    title: "แนวทางและข้อเท็จจริงเรื่องโรคซึมเศร้า",
    href: "https://www.who.int/news-room/fact-sheets/detail/depression",
    source: "WHO",
    Icon: FileText,
  },
  {
    title: "CBT สำหรับโรคซึมเศร้า: หลักฐานเชิงประจักษ์",
    href: "https://pubmed.ncbi.nlm.nih.gov/28368347/",
    source: "PubMed",
    Icon: GraduationCap,
  },
  {
    title: "การใช้ Thought Record ในการบำบัด CBT",
    href: "https://pubmed.ncbi.nlm.nih.gov/25705912/",
    source: "PubMed",
    Icon: FlaskConical,
  },
  {
    title: "แนวทางออกแบบงานวิจัยคลินิกด้านภาวะซึมเศร้า",
    href: "https://www.nimh.nih.gov/health/topics/depression",
    source: "NIMH",
    Icon: LinkIcon,
  },
];

// เอาเฉพาะ id ที่มีอยู่จริง
const doneIdsShown = useMemo(
  () => completedIds.filter((id) => validIdSet.has(id)),
  [completedIds, validIdSet]
);

const inIdsShown = useMemo(
  () =>
    inTreatmentIds.filter(
      (id) => validIdSet.has(id) && !doneIdsShown.includes(id) // mutual exclusive
    ),
  [inTreatmentIds, doneIdsShown, validIdSet]
);

// นับ
const doneCount = doneIdsShown.length;
const inCount   = inIdsShown.length;
const newCount  = Math.max(
  0,
  validPatients.length - doneCount - inCount
);
  /* ===== UI: View All Requests ===== */
  const handleViewMore = (stat: { title: string }) => {
    if (stat.title !== "All Requests") return;

    const requests = loadDocRequests().sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    const MAX_PREVIEW = 5;

    const pad2 = (n: number) => String(n).padStart(2, "0");
    const fmtTH = (d: Date) => {
      const buddhistYear = d.getFullYear() + 543;
      const yy = pad2(buddhistYear % 100);
      return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${yy} ${pad2(d.getHours())}:${pad2(
        d.getMinutes()
      )}`;
    };

    const itemHTML = (r: RequestItem) => {
      const created = fmtTH(new Date(r.createdAt));
      const isMeet = r.type === "ขอนัดพบ" && r.meetingStart;
      const meetText = isMeet
        ? `${fmtTH(new Date(r.meetingStart!))}${
            r.meetingEnd ? ` – ${fmtTH(new Date(r.meetingEnd))}` : ""
          }`
        : "";

      return `
        <div class="rq-item">
          <div class="rq-line">
            <div class="rq-label">ผู้ป่วย:</div>
            <div class="rq-value">${r.patient_name || "-"}</div>
          </div>
          <div class="rq-line">
            <div class="rq-label">ประเภทคำร้อง:</div>
            <div class="rq-value">${r.type}${r.other ? ` • ${r.other}` : ""}</div>
          </div>
          <div class="rq-line">
            <div class="rq-label">รายละเอียด:</div>
            <div class="rq-value">${r.detail || "-"}</div>
          </div>
          <div class="rq-line">
            <div class="rq-label">ส่งเมื่อ:</div>
            <div class="rq-value">${created}</div>
          </div>
          ${isMeet ? `<div class="rq-meet"><b>เวลาที่ต้องการ:</b> ${meetText}</div>` : ``}
        </div>
      `;
    };

    const renderList = (list: RequestItem[], limit?: number) => {
      const data = typeof limit === "number" ? list.slice(0, limit) : list;
      if (!data.length) return `<div class="rq-empty">— ยังไม่มีคำร้อง —</div>`;
      return data.map(itemHTML).join("");
    };

    const html = `
      <style>
        .rq-wrap{ text-align:left }
        .rq-head{ display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:6px }
        .rq-title{ margin:0; font-weight:800; font-size:18px }
        .rq-count{ font-size:12px; color:#6b7280 }
        .rq-item{ background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px 16px; margin-bottom:10px; text-align:left }
        .rq-line{ display:flex; align-items:flex-start; gap:10px; margin:6px 0 }
        .rq-label{ min-width:130px; color:#6b7280 }
        .rq-value{ color:#111827; font-weight:600; word-break:break-word }
        .rq-meet{ margin-top:8px; padding:8px 10px; border:1px dashed #d1d5db; border-radius:10px; background:#f9fafb }
        .rq-empty{ color:#777; text-align:center; padding:12px }
        .rq-footer{ display:flex; justify-content:center; margin-top:4px }
        .rq-toggle-btn{
          padding: 8px 12px;
          border: 2px solid #007bff;
          background: #fff;
          color: #007bff;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: -15px;
        }
      </style>

      <div class="rq-wrap">
        <div class="rq-head">
          <h3 class="rq-title">คำร้องทั้งหมด</h3>
          <span class="rq-count">${Math.min(requests.length, MAX_PREVIEW)} / ${requests.length}</span>
        </div>

        <div id="rq-list">
          ${renderList(requests, MAX_PREVIEW)}
        </div>

        ${requests.length > MAX_PREVIEW ? `
        <div class="rq-footer">
          <button id="rq-toggle" class="rq-toggle-btn" data-expanded="false">
            More (${Math.max(0, requests.length - MAX_PREVIEW)})
          </button>
        </div>` : ``}
      </div>
    `;

    Swal.fire({
      html,
      width: 700,
      showCloseButton: true,
      showConfirmButton: false,
      didOpen: () => {
        const toggleBtn = document.getElementById("rq-toggle");
        const listEl = document.getElementById("rq-list");
        const countEl = document.querySelector(".rq-count");

        if (!toggleBtn || !listEl || !countEl) return;

        toggleBtn.addEventListener("click", () => {
          const expanded = toggleBtn.getAttribute("data-expanded") === "true";

          if (expanded) {
            listEl.innerHTML = renderList(requests, MAX_PREVIEW);
            countEl.textContent = `${Math.min(requests.length, MAX_PREVIEW)} / ${requests.length}`;
            toggleBtn.textContent = `More (${Math.max(0, requests.length - MAX_PREVIEW)})`;
            toggleBtn.setAttribute("data-expanded", "false");
          } else {
            listEl.innerHTML = renderList(requests);
            countEl.textContent = `${requests.length} / ${requests.length}`;
            toggleBtn.textContent = "Less";
            toggleBtn.setAttribute("data-expanded", "true");
          }
        });
      },
    });
  };


  /* ======================== Render ======================== */
  return (
    <div className="qewty-stats-container">
      {stats.map((stat, index) => (
        <div key={index} className="qewty-stat-card">
          <div className="qewty-stat-header">
            <h4>{stat.title}</h4>
            <img src={stat.icon} alt="icon" className="qewty-stat-icon" />
          </div>

          <div className="qewty-stat-main">
            <span className="qewty-stat-value">{stat.value}</span>

            {stat.title !== "All Requests" && (
              <p className="qewty-stat-sub">{stat.subtitle}</p>
            )}

            {stat.title === "All Requests" && (
              <div className="qewty-stat-row">
                <span className="qewty-stat-sub qewty-stat-sub--tight">
                  {stat.subtitle}
                </span>
                <button className="qewty-view-btn" onClick={() => handleViewMore(stat)}>
                  View Details →
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Left Chart Section */}
      <div className="qewty-chart-section">
        <h3 className="qewty-chart-title">Patient Overview</h3>
        <p className="qewty-chart-subtitle">Quick insights into your patient base.</p>

        <div className="qewty-barchart-holder">
          <PatientOverviewChart
            patients={patients}
            inTreatmentIds={inTreatmentIds}
            completedIds={completedIds}
          />

          <div className="qewty-status-overlay">
            <h4 className="qewty-status-title">
              Patient Status <span className="qewty-status-right">จำนวน</span>
            </h4>
            <ul className="qewty-status-list">
              <li>
                <span className="qewty-status-left">ผู้ป่วยบำบัดเรียบร้อยแล้ว :</span>
                <span className="qewty-status-right">
                 {doneCount.toLocaleString()} คน
                </span>
              </li>
              <li>
                <span className="qewty-status-left">ผู้ป่วยที่รักษาอยู่ :</span>
                <span className="qewty-status-right">
                  {inCount.toLocaleString()} คน
                </span>
              </li>
              <li>
                <span className="qewty-status-left">ผู้ป่วยใหม่ :</span>
                <span className="qewty-status-right">
                  {newCount.toLocaleString()} คน
                </span>
              </li>
            </ul>

            <button
  className="qewty-overlay-btn"
  onClick={() => navigate("/psychologist/therapy")}
>
  View More Information
</button>
          </div>
        </div>
      </div>
<div className="qewty-feedback-section">
  <div className="qewty-feedback-card">
    <h4 className="qewty-research-title">
      <BookOpen className="qewty-research-title-icon" aria-hidden />
      บทความวิจัย: การทำวิจัยผู้ป่วยโรคซึมเศร้า
    </h4>

    <p className="qewty-subtext">
      รวมแหล่งอ้างอิงด้านการวิจัยโรคซึมเศร้าและการประเมินผลการรักษา
     สำหรับใช้ออกแบบวิธีวิจัยและทบทวนวรรณกรรม
    </p>

    <ul className="qewty-research-list">
      {researchLinks.map(({ title, href, source, Icon }, idx) => (
        <li key={idx} className="qewty-research-item">
          <div className="qewty-research-row">
            {Icon ? <Icon className="qewty-link-icon" aria-hidden /> : <LinkIcon className="qewty-link-icon" aria-hidden />}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="qewty-link"
              title={title}
            >
              {title}
            </a>
            <ExternalLink className="qewty-ext-icon" aria-label="เปิดลิงก์ภายนอก" />
          </div>
          {source && <span className="qewty-source">— {source}</span>}
        </li>
      ))}
    </ul>

    <a
      className="qewty-feedback-btn"
      href="https://scholar.google.com/scholar?q=depression+CBT+%22thought+record%22+study"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Search className="qewty-btn-icon" aria-hidden />
      ค้นหาเพิ่มเติม
    </a>
  </div>
</div>
     </div>
  );
};

export default Homedoc;


