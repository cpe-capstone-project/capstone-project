import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetPatientsDashboardByPsychologistId, GetAllEmotions } from "../../../services/https/EmotionAnalysis";
import "./EmotionDashBoard.css";

interface PatientBasicInfo {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  gender_id: number;
}

interface PrimaryEmotionStats {
  positive_emotions: number;
  negative_emotions: number;
  total_records: number;
}

interface PatientWithEmotionStats {
  patient_info: PatientBasicInfo;
  primary_emotion_stats: PrimaryEmotionStats;
  latest_primary_emotion: string;
}

interface PatientsListDashboardResponse {
  patients: PatientWithEmotionStats[];
  total: number;
}

interface ApiResponse {
  message: string;
  data: PatientsListDashboardResponse;
  psychologist_id: number;
}

interface EmotionDefinition {
  emotions_name: string;
  category: string;
  thai_emotions_name: string;
  emotion_color: string;
}

const getGenderText = (genderId: number) => {
  switch (genderId) {
    case 1:
      return "ชาย";
    case 2:
      return "หญิง";
    case 3:
      return "อื่นๆ";
    default:
      return "ไม่ระบุ";
  }
};

const PatientsDashboard: React.FC = () => {
  const [patients, setPatients] = useState<PatientWithEmotionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [psychologistId, setPsychologistId] = useState<number | null>(null);
  const [emotionDefinitions, setEmotionDefinitions] = useState<EmotionDefinition[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const handleViewDetails = (patientId: number) => {
    navigate(`/psychologist/EmotionAnalyzeDashboardDetail/${patientId}`);
  };

  const getEmotionStyle = (emotion: string) => {
    if (!emotion || emotion.trim() === "" || emotion === "null") {
      return {
        color: "ยังไม่ได้วิเคราะห์อารมณ์",
        bgColor: "#000000",
        borderColor: "#000000",
        isAnalyzed: false,
      };
    }

    const found = emotionDefinitions.find(
      (e) => e.emotions_name.toLowerCase() === emotion.toLowerCase()
    );

    if (!found) {
      return {
        color: "ไม่ทราบอารมณ์",
        bgColor: "#f8f9fa",
        borderColor: "#6c757d",
        isAnalyzed: true,
      };
    }

    return {
      color: found.thai_emotions_name || found.emotions_name,
      bgColor: found.emotion_color, 
      borderColor: found.emotion_color,
      isAnalyzed: true,
    };
  };

  const getEmotionDescription = (stats: PrimaryEmotionStats) => {
    const { positive_emotions, negative_emotions, total_records } = stats;

    if (total_records === 0) {
      return "ผู้ป่วยยังไม่ได้รับการวิเคราะห์อารมณ์";
    }

    return `วิเคราะห์ ${total_records} ครั้งล่าสุด: บวก ${positive_emotions} ครั้ง ลบ ${negative_emotions} ครั้ง`;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        console.error("Psychologist ID not found in URL");
        setLoading(false);
        return;
      }

      const psychologistIdNumber = parseInt(id, 10);
      if (isNaN(psychologistIdNumber)) {
        console.error("Invalid Psychologist ID format");
        setLoading(false);
        return;
      }

      setPsychologistId(psychologistIdNumber);
      setLoading(true);

      try {
        const [patientsResponse, emotionsResponse] = await Promise.all([
          GetPatientsDashboardByPsychologistId(psychologistIdNumber),
          GetAllEmotions(),
        ]);

        if (patientsResponse?.data?.data) {
          const apiData: ApiResponse = patientsResponse.data;
          setPatients(apiData.data.patients);
        } else {
          setPatients([]);
        }

        if (Array.isArray(emotionsResponse?.data)) {
          setEmotionDefinitions(emotionsResponse.data);
        } else {
          setEmotionDefinitions([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPatients([]);
        setEmotionDefinitions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const filteredPatients = patients.filter((patient) => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${patient.patient_info.first_name} ${patient.patient_info.last_name}`.toLowerCase();
    return (
      patient.patient_info.first_name.toLowerCase().includes(searchLower) ||
      patient.patient_info.last_name.toLowerCase().includes(searchLower) ||
      fullName.includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="header">
          <h1>Emotion Analysis</h1>
        </div>
        <div className="loading">กำลังโหลดข้อมูล...</div>
      </div>
    );
  }

  if (!psychologistId) {
    return (
      <div className="dashboard-container">
        <div className="header">
          <h1>Emotion Analysis</h1>
        </div>
        <div className="loading">ไม่พบข้อมูลนักจิตวิทยา</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Emotion Analysis</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="ค้นหาผู้ป่วย..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="section-header">
        <h2>รายชื่อผู้ป่วย </h2>
        <p className="section-subtitle">จำนวนผู้ป่วยทั้งหมด: {filteredPatients.length} คน</p>
      </div>

      <div className="patients-grid">
        {filteredPatients.map((patientData) => {
          const { patient_info, primary_emotion_stats, latest_primary_emotion } = patientData;
          const emotionStyle = getEmotionStyle(latest_primary_emotion);

          return (
            <div key={patient_info.id} className="patient-card">
              <div className="patient-info">
                <div className="patient-name">
                  {patient_info.first_name} {patient_info.last_name}
                </div>
                <div className="patient-details">
                  <div className="detail-row">
                    <span className="icon">👤</span>
                    <span>{patient_info.age} ปี, {getGenderText(patient_info.gender_id)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="icon">📊</span>
                    <span>{getEmotionDescription(primary_emotion_stats)}</span>
                  </div>
                  <div className="detail-row emotion-row">
                    <span className="icon">📄</span>
                    <span>
                      {emotionStyle.isAnalyzed
                        ? `อารมณ์ล่าสุด: ${emotionStyle.color}`
                        : `ผู้ป่วยยังไม่ได้รับการวิเคราะห์อารมณ์`
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="patient-actions">
                <div
                  className={`emotion-tag ${!emotionStyle.isAnalyzed ? 'not-analyzed' : ''}`}
                  style={emotionStyle.isAnalyzed ? {
                    backgroundColor: emotionStyle.bgColor,
                    borderColor: emotionStyle.borderColor,
                    color: emotionStyle.borderColor
                  } : {backgroundColor: "#000000ff",   // สีพื้นหลัง (ถ้าต้องการ)
                      borderColor: "#000000ff",       // สีขอบ (ถ้าต้องการ)
                      color: "black"}}
                >
                  {emotionStyle.color}
                </div>
                <button
                  className="action-button view-details"
                  onClick={() => handleViewDetails(patient_info.id)}
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && patients.length > 0 && (
        <div className="no-results">
          ไม่พบข้อมูลผู้ป่วยที่ตรงกับการค้นหา "{searchTerm}"
        </div>
      )}

      {patients.length === 0 && (
        <div className="no-results">
          ไม่พบผู้ป่วยสำหรับนักจิตวิทยาคนนี้
        </div>
      )}
    </div>
  );
};

export default PatientsDashboard;
