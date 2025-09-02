import React, { useEffect, useMemo, useState, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import "./Homedoc.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { k, KEYS } from "../../unid/storageKeys";
import PatientOverviewChart from "../../components/PatientOverviewChart/PatientOverviewChart";

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
      title: "Upcoming Sessions",
      value: "12",
      subtitle: "5 this week",
      icon: "https://cdn-icons-png.flaticon.com/128/747/747310.png",
    },
    // ⬇️ ใช้ All Requests แทน Recent Activities
    {
      title: "All Requests",
      value: String(loadDocRequests().length),
      subtitle: "View inbox requests",
      icon: "https://cdn-icons-png.flaticon.com/128/1828/1828859.png",
    },
  ]);


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

  /* ===== ดึงข้อมูลผู้ป่วยที่มี activity/ปิดเคส ===== */
  useEffect(() => {
    if (!psychId) return;

    // เริ่มทำกิจกรรม (Diary/TR)
    fetch(`http://localhost:8000/stats/patient-activity?psychologist_id=${psychId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("bad res")))
      .then((data: { diary_patient_ids?: number[]; tr_patient_ids?: number[] }) => {
        const diaryIds = new Set(data?.diary_patient_ids || []);
        const trIds = new Set(data?.tr_patient_ids || []);
        const union = new Set<number>([...diaryIds, ...trIds]);
        setInTreatmentIds(Array.from(union));
      })
      .catch(() => setInTreatmentIds([]));

    // อนุมัติ/ปิดเคส
    fetch(`http://localhost:8000/therapy-cases/by-psychologist?psychologist_id=${psychId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject("bad res")))
      .then((cases: Array<{ patient_id: number; status: string }>) => {
        const finished = (cases || []).filter(
          (c) => c.status?.toLowerCase() === "approved" || c.status?.toLowerCase() === "completed"
        );
        setCompletedIds(finished.map((c) => c.patient_id));
      })
      .catch(() => setCompletedIds([]));
  }, [psychId]);

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
    fetch(`http://localhost:8000/patients-by-psych?psychologist_id=${psychId}`)
      .then((res) => {
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("ข้อมูลผิดรูปแบบ");
        setPatients(data);
        setLoading(false);
        updateTotal(data);
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
          `http://localhost:8000/patients-by-psych?psychologist_id=${psychId}`
        );
        if (!res.ok) throw new Error("ไม่พบข้อมูล");
        const data = await res.json();
        if (!Array.isArray(data) || isUnmounted) return;
        setPatients(data);

        const total = data.filter((p: Patient) => p.id && p.id !== 0).length;
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


  /* ===== Derived counts ===== */
  const doneSet = useMemo(() => new Set(completedIds), [completedIds]);
  const inSet = useMemo(() => new Set(inTreatmentIds), [inTreatmentIds]);

  const doneCount = useMemo(
    () => patients.filter((p) => doneSet.has(p.id)).length,
    [patients, doneSet]
  );
  const inCount = useMemo(
    () => patients.filter((p) => inSet.has(p.id) && !doneSet.has(p.id)).length,
    [patients, inSet, doneSet]
  );
  const newCount = Math.max(0, patients.length - doneCount - inCount);

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
                  <strong>{doneCount.toLocaleString()} คน</strong>
                </span>
              </li>
              <li>
                <span className="qewty-status-left">ผู้ป่วยที่รักษาอยู่ :</span>
                <span className="qewty-status-right">
                  <strong>{inCount.toLocaleString()} คน</strong>
                </span>
              </li>
              <li>
                <span className="qewty-status-left">ผู้ป่วยใหม่ :</span>
                <span className="qewty-status-right">
                  <strong>{newCount.toLocaleString()} คน</strong>
                </span>
              </li>
            </ul>

            <button className="qewty-overlay-btn">View More Information</button>
          </div>
        </div>
      </div>

      {/* Right Feedback Section */}
      <div className="qewty-feedback-section">
        <div className="qewty-feedback-card">
          <h4>Feedback Thought Record</h4>
          <p className="qewty-subtext">Recent feedback on thought records.</p>
          <p>
            <strong>Patient I - Feedback (2025-08-02)</strong>
            <br />
            "Identifying automatic thoughts has been a game-changer for me."
          </p>
          <p>
            <strong>Patient J - Feedback (2025-08-01)</strong>
            <br />
            "The alternative thoughts section helps me reframe negative thinking."
          </p>
          <button className="qewty-feedback-btn">View More</button>
        </div>

        <div className="qewty-feedback-card">
          <h4>Feedback Diary</h4>
          <p className="qewty-subtext">Recent feedback from patient diary entries.</p>
          <p>
            <strong>Patient G - Feedback (2025-08-04)</strong>
            <br />
            "The journaling prompts were very helpful in processing my emotions."
          </p>
          <p>
            <strong>Patient H - Feedback (2025-08-03)</strong>
            <br />
            "I appreciate the space to reflect on my day without judgment."
          </p>
          <button className="qewty-feedback-btn">View More</button>
        </div>
      </div>

      {/* Emotion Distribution Section */}
      <div className="qewty-emotion-distribution">
        <div className="qewty-emotion-header">
          <h4>🕒 Emotion Distribution from Thought Records</h4>
          <div className="qewty-emotion-filters">
            <select>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <select>
              <option>All Patients</option>
              <option>Patient A</option>
              <option>Patient B</option>
            </select>
          </div>
        </div>

        <p className="qewty-emotion-subtext">
          Breakdown of emotions identified in patient thought record entries, filtered by
          time and patient.
        </p>

        <div className="qewty-piechart-holder">[Pie Chart Placeholder]</div>

        <div className="qewty-emotion-legend">
          <span className="legend-item anxiety">🔴 Anxiety</span>
          <span className="legend-item sadness">🌸 Sadness</span>
          <span className="legend-item anger">🟧 Anger</span>
          <span className="legend-item joy">🟩 Joy</span>
          <span className="legend-item neutral">🟨 Neutral</span>
        </div>
      </div>

      <div className="qewty-appointment-resources"></div>
    </div>
  );
};

export default Homedoc;
