import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // เพิ่ม useParams สำหรับรับ parameter
import { GetPatientsDashboardByPsychologistId } from "../../../services/https/EmotionAnalysis"; // import ฟังก์ชันใหม่
import "./EmotionDashBoard.css";

// Interface สำหรับข้อมูลที่จะได้รับจาก API
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

// ฟังก์ชันแปลงเพศจาก gender_id
const getGenderText = (genderId: number) => {
  switch(genderId) {
    case 1: return "ชาย";
    case 2: return "หญิง";
    case 3: return "อื่นๆ";
    default: return "ไม่ระบุ";
  }
};

// ฟังก์ชันแปลงอารมณ์เป็นสีและข้อความภาษาไทย
const getEmotionStyle = (emotion: string) => {
  // กรณีที่ยังไม่ได้วิเคราะห์อารมณ์
  if (!emotion || emotion === "" || emotion === "null") {
    return { 
      color: "ยังไม่ได้วิเคราะห์อารมณ์", 
      bgColor: "#f8f9fa", 
      borderColor: "#6c757d",
      isAnalyzed: false 
    };
  }
  
  const emotionLower = emotion.toLowerCase();
  
  // Positive Emotions
  if (emotionLower === "admiration") {
    return { color: "ชื่นชม", bgColor: "#f0f8f0", borderColor: "#77DD77", isAnalyzed: true };
  } else if (emotionLower === "amusement") {
    return { color: "ขบขัน", bgColor: "#fffdf0", borderColor: "#FFD93D", isAnalyzed: true };
  } else if (emotionLower === "approval") {
    return { color: "การยอมรับ", bgColor: "#f0f8ff", borderColor: "#6EC1E4", isAnalyzed: true };
  } else if (emotionLower === "caring") {
    return { color: "ความห่วงใย", bgColor: "#fff8fa", borderColor: "#FFB6C1", isAnalyzed: true };
  } else if (emotionLower === "curiosity") {
    return { color: "อยากรู้อยากเห็น", bgColor: "#f0ffff", borderColor: "#40E0D0", isAnalyzed: true };
  } else if (emotionLower === "desire") {
    return { color: "ความปรารถนา", bgColor: "#fff8f8", borderColor: "#FF4C4C", isAnalyzed: true };
  } else if (emotionLower === "excitement") {
    return { color: "ตื่นเต้น", bgColor: "#fff9f0", borderColor: "#FF914D", isAnalyzed: true };
  } else if (emotionLower === "gratitude") {
    return { color: "กตัญญู/ขอบคุณ", bgColor: "#fffdf0", borderColor: "#FFD700", isAnalyzed: true };
  } else if (emotionLower === "joy") {
    return { color: "ความสุข", bgColor: "#fffef0", borderColor: "#FFEA00", isAnalyzed: true };
  } else if (emotionLower === "love") {
    return { color: "ความรัก", bgColor: "#fff8fb", borderColor: "#FF69B4", isAnalyzed: true };
  } else if (emotionLower === "optimism") {
    return { color: "ความมองโลกในแง่ดี", bgColor: "#f8fff8", borderColor: "#32CD32", isAnalyzed: true };
  } else if (emotionLower === "pride") {
    return { color: "ความภาคภูมิใจ", bgColor: "#f8f9ff", borderColor: "#4169E1", isAnalyzed: true };
  } else if (emotionLower === "relief") {
    return { color: "ความโล่งอก", bgColor: "#f8fcff", borderColor: "#87CEEB", isAnalyzed: true };
  }
  // Negative Emotions
  else if (emotionLower === "anger") {
    return { color: "ความโกรธ", bgColor: "#fef8f8", borderColor: "#D72638", isAnalyzed: true };
  } else if (emotionLower === "annoyance") {
    return { color: "ความรำคาญ", bgColor: "#fff9f7", borderColor: "#FF6F3C", isAnalyzed: true };
  } else if (emotionLower === "disappointment") {
    return { color: "ความผิดหวัง", bgColor: "#f8f8f9", borderColor: "#708090", isAnalyzed: true };
  } else if (emotionLower === "disapproval") {
    return { color: "การไม่เห็นด้วย", bgColor: "#f9f8f7", borderColor: "#8B5E3C", isAnalyzed: true };
  } else if (emotionLower === "disgust") {
    return { color: "ความขยะแขยง", bgColor: "#f8f9f7", borderColor: "#556B2F", isAnalyzed: true };
  } else if (emotionLower === "embarrassment") {
    return { color: "ความอับอาย", bgColor: "#fbf8fa", borderColor: "#DB7093", isAnalyzed: true };
  } else if (emotionLower === "fear") {
    return { color: "ความกลัว", bgColor: "#f7f5ff", borderColor: "#4B0082", isAnalyzed: true };
  } else if (emotionLower === "grief") {
    return { color: "ความโศกเศร้า", bgColor: "#f7f8f8", borderColor: "#2F4F4F", isAnalyzed: true };
  } else if (emotionLower === "nervousness") {
    return { color: "ความประหม่า", bgColor: "#f8fafa", borderColor: "#5F9EA0", isAnalyzed: true };
  } else if (emotionLower === "remorse") {
    return { color: "ความสำนึกผิด", bgColor: "#f8f7f5", borderColor: "#654321", isAnalyzed: true };
  } else if (emotionLower === "sadness") {
    return { color: "ความเศร้า", bgColor: "#f7f9fb", borderColor: "#4682B4", isAnalyzed: true };
  }
  // Sentiment emotions
  else if (emotionLower === "positive") {
    return { color: "เชิงบวก", bgColor: "#f0f8f0", borderColor: "#28a745", isAnalyzed: true };
  } else if (emotionLower === "negative") {
    return { color: "เชิงลบ", bgColor: "#fef8f8", borderColor: "#dc3545", isAnalyzed: true };
  } else if (emotionLower === "neutral") {
    return { color: "เป็นกลาง", bgColor: "#f8f9fa", borderColor: "#6c757d", isAnalyzed: true };
  } 
  // ไม่พบอารมณ์ที่ตรงกัน
  else {
    return { 
      color: "ไม่ทราบอารมณ์", 
      bgColor: "#f8f9fa", 
      borderColor: "#6c757d",
      isAnalyzed: true 
    };
  }
};

// ฟังก์ชันสร้างข้อความอธิบายสถิติอารมณ์
const getEmotionDescription = (stats: PrimaryEmotionStats) => {
  const { positive_emotions, negative_emotions, total_records } = stats;
  
  if (total_records === 0) {
    return "ผู้ป่วยยังไม่ได้รับการวิเคราะห์อารมณ์";
  }

  return `วิเคราะห์ ${total_records} ครั้งล่าสุด: บวก ${positive_emotions} ครั้ง ลบ ${negative_emotions} ครั้ง`;
};

const PatientsDashboard: React.FC = () => {
  const [patients, setPatients] = useState<PatientWithEmotionStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [psychologistId, setPsychologistId] = useState<number | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // รับ id จาก URL parameter

  // ฟังก์ชันสำหรับดูรายละเอียดผู้ป่วย
  const handleViewDetails = (patientId: number) => {
    navigate(`/psychologist/EmotionAnalyzeDashboardDetail/${patientId}`);
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
        const response = await GetPatientsDashboardByPsychologistId(psychologistIdNumber);
        
        if (response && response.data && response.data.data) {
          const apiData: ApiResponse = response.data;
          setPatients(apiData.data.patients);
        } else {
          console.error("Invalid response format:", response);
          setPatients([]);
        }
      } catch (error) {
        console.error("Error fetching patients dashboard:", error);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // กรองข้อมูลตามคำค้นหา
  const filteredPatients = patients.filter(patient => {
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
                  } : {}}
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