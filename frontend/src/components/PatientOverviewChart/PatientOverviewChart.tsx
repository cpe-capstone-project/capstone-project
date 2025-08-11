// src/components/patient-overview/PatientOverviewChart.tsx
import React, { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Modal } from "antd";

export type PatientLite = {
  id: number;
  first_name: string;
  last_name: string;
};

type Props = {
  patients: PatientLite[];      // ผู้ป่วยทั้งหมดของนักจิต
  inTreatmentIds: number[];     // ผู้ป่วยที่เริ่มมีการทำ Diary/Thought Record
  completedIds: number[];       // ผู้ป่วยที่นักจิตอนุมัติเคส (เสร็จสิ้น)
};

const PatientOverviewChart: React.FC<Props> = ({
  patients,
  inTreatmentIds,
  completedIds,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<number | "ALL">(
    "ALL"
  );
  const [modalOpen, setModalOpen] = useState<null | "new" | "in" | "done">(null);

  // สร้าง Set เพื่อเช็ค membership เร็ว ๆ
  const inSet = useMemo(() => new Set(inTreatmentIds), [inTreatmentIds]);
  const doneSet = useMemo(() => new Set(completedIds), [completedIds]);

  // แยกกลุ่มรายชื่อ
  const lists = useMemo(() => {
    const done = patients.filter((p) => doneSet.has(p.id));
    const inTx = patients.filter((p) => inSet.has(p.id) && !doneSet.has(p.id)); // ถ้าเสร็จแล้ว ไม่นับใน in-treatment
    const newOnes = patients.filter(
      (p) => !inSet.has(p.id) && !doneSet.has(p.id)
    ); // สมัครแล้วแต่ยังไม่เริ่มกิจกรรม
    return { newOnes, inTx, done };
  }, [patients, inSet, doneSet]);

  const selectedPatient = useMemo(
    () =>
      selectedPatientId === "ALL"
        ? null
        : patients.find((p) => p.id === selectedPatientId) || null,
    [selectedPatientId, patients]
  );

  // ค่าที่จะโชว์บนกราฟ (ให้ชื่อแกน X สั้น ๆ อังกฤษแบบเดียวกับอีกตัว)
  const chartData = useMemo(() => {
    if (!selectedPatient) {
      return [
        { label: "New", value: lists.newOnes.length },
        { label: "In Treatment", value: lists.inTx.length },
        { label: "Completed", value: lists.done.length },
      ];
    }
    const pid = selectedPatient.id;
    return [
      { label: "New", value: !inSet.has(pid) && !doneSet.has(pid) ? 1 : 0 },
      {
        label: "In Treatment",
        value: inSet.has(pid) && !doneSet.has(pid) ? 1 : 0,
      },
      { label: "Completed", value: doneSet.has(pid) ? 1 : 0 },
    ];
  }, [selectedPatient, lists, inSet, doneSet]);

  return (
    <div className="qewty-barchart-wrapper">
      {/* Controls */}
      <div className="qewty-chart-controls">
        <label className="qewty-control-label">Patient:</label>
        <select
          className="qewty-select"
          value={selectedPatientId === "ALL" ? "ALL" : String(selectedPatientId)}
          onChange={(e) => {
            const v = e.target.value;
            setSelectedPatientId(v === "ALL" ? "ALL" : Number(v));
          }}
        >
          <option value="ALL">All Patients</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.first_name} {p.last_name}
            </option>
          ))}
        </select>

     <div className="qewty-chart-actions">
  <button
    className={`qewty-chip qewty-chip--new ${lists.newOnes.length === 0 ? "is-empty" : ""}`}
    onClick={() => setModalOpen("new")}
    aria-label={`รายชื่อผู้ป่วยใหม่ ${lists.newOnes.length} คน`}
  >
    <img
      className="qewty-chip__iconimg"
      src="https://cdn-icons-png.flaticon.com/128/17968/17968093.png"
      alt="ผู้ป่วยใหม่"
      loading="lazy"
      decoding="async"
    />
    <span className="qewty-chip__label">ผู้ป่วยใหม่</span>
  </button>

  <button
    className={`qewty-chip qewty-chip--in ${lists.inTx.length === 0 ? "is-empty" : ""}`}
    onClick={() => setModalOpen("in")}
    aria-label={`รายชื่อผู้ป่วยที่รักษาอยู่ ${lists.inTx.length} คน`}
  >
    <span className="qewty-chip__icon" aria-hidden>🩺</span>
    <span className="qewty-chip__label">รักษาอยู่</span>
  </button>

  <button
    className={`qewty-chip qewty-chip--done ${lists.done.length === 0 ? "is-empty" : ""}`}
    onClick={() => setModalOpen("done")}
    aria-label={`รายชื่อผู้ป่วยเสร็จสิ้น ${lists.done.length} คน`}
  >
    <img
      className="qewty-chip__iconimg"
      src="https://cdn-icons-png.flaticon.com/128/2382/2382461.png"
      alt="เสร็จสิ้น"
      loading="lazy"
      decoding="async"
    />
    <span className="qewty-chip__label">เสร็จสิ้น</span>
  </button>
</div>


      </div>

      {/* Chart (โทนสี/สไตล์เหมือน DiaryStatsChart) */}
      <div className="qewty-barchart">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#bfdbfe" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} height={36} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value: any) => [`${value} รายการ`, "จำนวนผู้ป่วย"]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              labelStyle={{ fontWeight: 600 }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Modal รายชื่อ */}
      <Modal
        title={
          modalOpen === "new"
            ? "รายชื่อผู้ป่วยใหม่"
            : modalOpen === "in"
            ? "รายชื่อผู้ป่วยที่รักษาอยู่"
            : modalOpen === "done"
            ? "รายชื่อผู้ป่วยบำบัดเรียบร้อยแล้ว"
            : ""
        }
        open={modalOpen !== null}
        onCancel={() => setModalOpen(null)}
        footer={null}
        centered
      >
        <ul className="qewty-patient-list">
          {(modalOpen === "new"
            ? lists.newOnes
            : modalOpen === "in"
            ? lists.inTx
            : modalOpen === "done"
            ? lists.done
            : []
          ).map((p) => (
            <li key={p.id}>
              {p.first_name} {p.last_name}
            </li>
          ))}
          {((modalOpen === "new" && lists.newOnes.length === 0) ||
            (modalOpen === "in" && lists.inTx.length === 0) ||
            (modalOpen === "done" && lists.done.length === 0)) && (
            <li>— ไม่มีข้อมูล —</li>
          )}
        </ul>
      </Modal>
    </div>
  );
};

export default PatientOverviewChart;
