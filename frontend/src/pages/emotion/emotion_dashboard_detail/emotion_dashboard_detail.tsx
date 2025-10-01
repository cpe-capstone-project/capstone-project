import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { GetDashboardDetails_1ByID, GetPatientDashboardByID, GetEmotionDetailsDashBoardByIDAndTime, 
  GetEmotionDetailsPrimaryEmoDashBoardByIDandTime, GetEmotionDetailsSubWeekDashBoardByIDandTime, 
  GetAllEmotions } from "../../../services/https/EmotionAnalysis";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import "./emotion_dashboard_detail.css";
import { ArrowLeft} from 'lucide-react';
// Interfaces
interface PatientBasicInfo {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  age: number;
}

interface EmotionData {
  emotions_name: string;
  confidence_percentage: number;
}

interface EmotionDetailData {
  emotions_name: string;
  proportion: number;
  emotions_category: string;
}

interface PrimaryEmotionDetail {
  emotion_name: string;
  count: number;
  percentage: number;
}

interface CategorySummary {
  category: string;
  count: number;
  percentage: number;
}

interface PrimaryEmotionResponse {
  total_records: number;
  emotion_details: PrimaryEmotionDetail[];
  category_summary: CategorySummary[];
}

interface SubEmotionDetail {
  emotion_name: string;
  confidence_percentage: number;
}

interface EmotionAnalysisGroup {
  emotion_analysis_results_id: number;
  analysis_timestamp: string;
  sub_emotions: SubEmotionDetail[];
}

// Interface สำหรับข้อมูลอารมณ์จาก API
interface EmotionMasterData {
  emotions_name: string;
  category: string;
  thai_emotions_name: string;
  emotion_color: string;
}

const EmotionAnalyzeDashboardDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [patientData, setPatientData] = useState<PatientBasicInfo | null>(null);
  const [emotionData, setEmotionData] = useState<EmotionData[]>([]);
  const [emotionDetailData, setEmotionDetailData] = useState<EmotionDetailData[]>([]);
  const [primaryEmotionData, setPrimaryEmotionData] = useState<PrimaryEmotionResponse | null>(null);
  const [emotionMasterData, setEmotionMasterData] = useState<EmotionMasterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [barChartLoading, setBarChartLoading] = useState(false);
  
  // Mode state (1 = diary, 2 = thought record)
  const [mode, setMode] = useState<number>(1);
  
  // Date picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Date state - default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // Chart period state - changed to week/month
  const [periodType, setPeriodType] = useState<'week' | 'month'>('week');
  const [barPeriodType, setBarPeriodType] = useState<'week' | 'month'>('week');
  const [currentChartPeriod, setCurrentChartPeriod] = useState({ start: '', end: '' });
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  
  // Initialize with default values first, will be updated in useEffect
  const [chartDateRange, setChartDateRange] = useState({ start: '', end: '' });
  const [barChartDateRange, setBarChartDateRange] = useState({ start: '', end: '' });
  const [subEmotionData, setSubEmotionData] = useState<EmotionAnalysisGroup[]>([]);
  const [subEmotionLoading, setSubEmotionLoading] = useState(false);

  // Helper functions to get emotion data from master data
  const getEmotionColor = (emotionName: string): string => {
    const emotionInfo = emotionMasterData.find(
      emotion => emotion.emotions_name.toLowerCase() === emotionName.toLowerCase()
    );
    return emotionInfo?.emotion_color || '#6c757d';
  };

  const getEmotionThaiName = (emotionName: string): string => {
    const emotionInfo = emotionMasterData.find(
      emotion => emotion.emotions_name.toLowerCase() === emotionName.toLowerCase()
    );
    return emotionInfo?.thai_emotions_name || '';
  };

  const getEmotionDisplayName = (emotionName: string): string => {
    const thaiName = getEmotionThaiName(emotionName);
    if (thaiName) {
      return `${emotionName}/${thaiName}`;
    }
    return emotionName;
  };

  // Get week range based on selected date (Sunday to Saturday)
  const getWeekRange = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate start of week (Sunday)
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    
    // Calculate end of week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    return {
      start: startOfWeek.toISOString().split('T')[0],
      end: endOfWeek.toISOString().split('T')[0]
    };
  };

  // Get month range based on selected date
  const getMonthRange = (dateString: string) => {
    const date = new Date(dateString);
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: endOfMonth.toISOString().split('T')[0]
    };
  };

  const formatThaiDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Format week range for display
  const formatWeekRange = (startDate: string, endDate: string): string => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString('th-TH', { month: 'short' });
    const endMonth = end.toLocaleDateString('th-TH', { month: 'short' });
    const year = start.getFullYear();
    
    if (start.getMonth() === end.getMonth()) {
      // Same month
      return `${startDay}-${endDay} ${startMonth} ${year}`;
    } else {
      // Different months
      return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${year}`;
    }
  };

  // Format month range for display
  const formatMonthRange = (startDate: string, endDate: string): string => {
    const date = new Date(startDate);
    return date.toLocaleDateString('th-TH', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Initialize date ranges
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const weekRange = getWeekRange(today);
    if (chartDateRange.start && chartDateRange.end && 
      (chartDateRange.start !== currentChartPeriod.start || 
       chartDateRange.end !== currentChartPeriod.end)) {
    setCurrentChartPeriod(chartDateRange);
    fetchEmotionDetailData();
    fetchPrimaryEmotionData();
    fetchSubEmotionData();
  }
  }, []);

  // Fetch emotion master data
  const fetchEmotionMasterData = async () => {
    try {
      const response = await GetAllEmotions();
      if (response.data && Array.isArray(response.data)) {
        setEmotionMasterData(response.data);
      } else {
        console.error("Invalid emotion master data structure:", response);
        setEmotionMasterData([]);
      }
    } catch (error) {
      console.error("Error fetching emotion master data:", error);
      setEmotionMasterData([]);
    }
  };

  // Fetch patient data
  const fetchPatientData = async () => {
    if (!id) return;
    
    try {
      const response = await GetPatientDashboardByID(id);
      if (response.data && response.data.data) {
        setPatientData(response.data.data);
      } else {
        console.error("Invalid patient data structure:", response);
        setError("โครงสร้างข้อมูลผู้ป่วยไม่ถูกต้อง");
      }
    } catch (error) {
      console.error("Error fetching patient:", error);
      setError("ไม่สามารถดึงข้อมูลผู้ป่วยได้");
    }
  };

  // Fetch emotion data for daily analysis
  const fetchEmotionData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await GetDashboardDetails_1ByID(Number(id), mode, selectedDate);
      
      if (response.data && Array.isArray(response.data)) {
        setEmotionData(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setEmotionData(response.data.data);
      } else {
        console.error("Invalid emotion data structure:", response);
        setEmotionData([]);
      }
      setError(null);
    } catch (error) {
      console.error("Error fetching emotion data:", error);
      setError("ไม่สามารถดึงข้อมูลการวิเคราะห์อารมณ์ได้");
      setEmotionData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch emotion detail data for pie chart
  const fetchEmotionDetailData = async () => {
    if (!id || !chartDateRange.start || !chartDateRange.end) return;
    
    try {
      setChartLoading(true);
      const response = await GetEmotionDetailsDashBoardByIDAndTime(
        Number(id), 
        chartDateRange.start, 
        chartDateRange.end
      );
      
      if (response.data && Array.isArray(response.data)) {
        setEmotionDetailData(response.data);
      } else {
        console.error("Invalid emotion detail data structure:", response);
        setEmotionDetailData([]);
      }
    } catch (error) {
      console.error("Error fetching emotion detail data:", error);
      setEmotionDetailData([]);
    } finally {
      setChartLoading(false);
    }
  };

  // Fetch primary emotion data for bar chart
  const fetchPrimaryEmotionData = async () => {
    if (!id || !chartDateRange.start || !chartDateRange.end) return;
    
    try {
      setBarChartLoading(true);
      const response = await GetEmotionDetailsPrimaryEmoDashBoardByIDandTime(
        Number(id), 
        chartDateRange.start, 
        chartDateRange.end
      );
      
      if (response.data) {
        setPrimaryEmotionData(response.data);
      } else {
        console.error("Invalid primary emotion data structure:", response);
        setPrimaryEmotionData(null);
      }
    } catch (error) {
      console.error("Error fetching primary emotion data:", error);
      setPrimaryEmotionData(null);
    } finally {
      setBarChartLoading(false);
    }
  };

  // Check if date is in same period
  const isInSamePeriod = (oldDate: string, newDate: string, periodType: 'week' | 'month') => {
    if (periodType === 'week') {
      const oldWeek = getWeekRange(oldDate);
      const newWeek = getWeekRange(newDate);
      return oldWeek.start === newWeek.start && oldWeek.end === newWeek.end;
    } else {
      const oldMonth = getMonthRange(oldDate);
      const newMonth = getMonthRange(newDate);
      return oldMonth.start === newMonth.start && oldMonth.end === newMonth.end;
    }
  };

  // Update chart date range when selected date or period type changes
  const updateChartDateRange = () => {
  const newRange = periodType === 'week' ? getWeekRange(selectedDate) : getMonthRange(selectedDate);
  
  // Only update if range actually changed
  if (newRange.start !== chartDateRange.start || newRange.end !== chartDateRange.end) {
    setChartDateRange(newRange);
  }
};

  const fetchSubEmotionData = async () => {
    if (!id || !chartDateRange.start || !chartDateRange.end) return;
    
    try {
      setSubEmotionLoading(true);
      const response = await GetEmotionDetailsSubWeekDashBoardByIDandTime(
        Number(id), 
        chartDateRange.start, 
        chartDateRange.end
      );
      console.log("Sub emotion data response:", response);
      
      if (response?.data && Array.isArray(response.data)) {
        setSubEmotionData(response.data);
      } else {
        console.warn("Invalid sub emotion data structure:", response);
        setSubEmotionData([]);
      }
    } catch (error) {
      console.error("Error fetching sub emotion data:", error);
      setSubEmotionData([]);
    } finally {
      setSubEmotionLoading(false);
    }
  };

  useEffect(() => {
    fetchEmotionMasterData();
  }, []);

  useEffect(() => {
    if (chartDateRange.start && chartDateRange.end) {
      fetchSubEmotionData();
    }
  }, [id, chartDateRange]);

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  useEffect(() => {
    fetchEmotionData();
  }, [id, mode, selectedDate]);

  useEffect(() => {
    updateChartDateRange();
  }, [selectedDate, periodType]);

  useEffect(() => {
    if (chartDateRange.start && chartDateRange.end) {
      fetchEmotionDetailData();
      fetchPrimaryEmotionData();
    }
  }, [id, chartDateRange]);

  // Toggle mode between diary (1) and thought record (2)
  const toggleMode = () => {
    setMode(mode === 1 ? 2 : 1);
  };

  // Handle date change with period check
  // แทนที่ handleDateChange function เดิม
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = event.target.value;
    const oldDate = selectedDate;
    
    // Check if new date is in same period for both week and month
    const sameWeek = isInSamePeriod(oldDate, newDate, 'week');
    const sameMonth = isInSamePeriod(oldDate, newDate, 'month');
    
    setSelectedDate(newDate);
    setShowDatePicker(false);
    
    // Only update chart data if period has changed
    const periodChanged = (periodType === 'week' && !sameWeek) || (periodType === 'month' && !sameMonth);
    
    if (periodChanged) {
      const newRange = periodType === 'week' ? getWeekRange(newDate) : getMonthRange(newDate);
      setChartDateRange(newRange);
      setCurrentChartPeriod(newRange);
    }
  };

  // แทนที่ handlePeriodTypeChange function เดิม
  const handlePeriodTypeChange = (type: 'week' | 'month') => {
    const oldPeriodType = periodType;
    setPeriodType(type);
    setShowPeriodDropdown(false);
    
    // Force update chart data when period type changes
    if (oldPeriodType !== type) {
      const newRange = type === 'week' ? getWeekRange(selectedDate) : getMonthRange(selectedDate);
      setChartDateRange(newRange);
      setCurrentChartPeriod(newRange);
    }
  };

  // Get day of week in Thai
  const getDayOfWeekThai = (dateString: string): string => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const date = new Date(dateString);
    return dayNames[date.getDay()];
  };

  // Prepare pie chart data
  const pieChartData = emotionDetailData.map(item => ({
    name: item.emotions_name,
    value: Math.round(item.proportion * 100 * 100) / 100, // Convert to percentage with 2 decimals
    proportion: item.proportion,
    category: item.emotions_category.trim(),
    displayName: getEmotionDisplayName(item.emotions_name)
  }));

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{data.displayName}</p>
          <p className="tooltip-value">{`${data.value}%`}</p>
          <p className="tooltip-category">{data.category}</p>
        </div>
      );
    }
    return null;
  };

  // Calculate total percentage for progress bars
  const maxConfidence = Math.max(...emotionData.map(e => e.confidence_percentage), 1);

  // Get current period label
  const currentPeriodLabel = periodType === 'week' ? 'รายสัปดาห์' : 'รายเดือน';
  const currentBarPeriodLabel = barPeriodType === 'week' ? 'รายสัปดาห์' : 'รายเดือน';
  
  // Get date range display text
  const getDateRangeDisplay = () => {
    if (!chartDateRange.start || !chartDateRange.end) return '';
    
    if (periodType === 'week') {
      return formatWeekRange(chartDateRange.start, chartDateRange.end);
    } else {
      return formatMonthRange(chartDateRange.start, chartDateRange.end);
    }
  };

  // Get bar chart date range display text
  const getBarDateRangeDisplay = () => {
    if (!barChartDateRange.start || !barChartDateRange.end) return '';
    
    if (barPeriodType === 'week') {
      return formatWeekRange(barChartDateRange.start, barChartDateRange.end);
    } else {
      return formatMonthRange(barChartDateRange.start, barChartDateRange.end);
    }
  };

  const formatDayOfWeek = (dateString: string): string => {
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
    const date = new Date(dateString);
    return dayNames[date.getDay()];
  };

  if (!id) {
    return <div className="error-container">ไม่พบรหัสผู้ป่วย</div>;
  }

  if (loading && !patientData) {
    return <div className="loading-container">กำลังโหลดข้อมูล...</div>;
  }

  if (error && !patientData) {
    return (
      <div className="dashboard-detail-container">
        <div className="header">
          <button onClick={() => navigate(-1)} className="back-button">
            ← กลับสู่หน้าหลัก
          </button>
        </div>
        <div className="error-container">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-detail-container">
      {/* Header */}
      <div className="header">
        <button
            onClick={() => navigate(-1)}
            className="!inline-flex !items-center !px-4 !py-2 !text-sm !font-medium !text-gray-600 !hover:!text-gray-900 !transition-colors"
            >
            <ArrowLeft className="!h-5 !w-5 !mr-2" />
            กลับ
          </button>
      </div>

      <div className="dashboard-layout">
        {/* Left Section - Patient Card */}
        <div className="patient-card">
          <div className="patient-header">
            <h2 className="patient-title">
              patient {String(patientData?.id || '').padStart(3, '0')}
            </h2>
            <div className="patient-age">{patientData?.age} ปี, {patientData?.first_name?.includes('ชาย') ? 'ชาย' : 'หญิง'}</div>
          </div>

          {/* Emotion Analysis Section */}
          <div className="analysis-card">
            <h3 className="analysis-title">ข้อมูลอารมณ์รายวันของ{mode === 1 ? 'ไดอารี่' : 'thought record'}</h3>
            
            {/* Updated Date Display with Calendar Icon */}
            <div className="analysis-date-container">
              <div className="analysis-date-display">
                <span className="date-text">วันที่ {formatThaiDate(selectedDate)}</span>
                <button 
                  className="calendar-icon-btn"
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  title="เลือกวันที่"
                >
                  📅
                </button>
              </div>
              
              {showDatePicker && (
                <div className="date-picker-dropdown">
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="date-picker"
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </div>

            {loading ? (
              <div className="analysis-loading">กำลังโหลด...</div>
            ) : emotionData.length > 0 ? (
              <div className="emotion-bars">
                {emotionData.map((emotion, index) => (
                  <div key={index} className="emotion-item">
                    <div className="emotion-info">
                      <div 
                        className="emotion-dot"
                        style={{ backgroundColor: getEmotionColor(emotion.emotions_name) }}
                      ></div>
                      <span className="emotion-label">{getEmotionDisplayName(emotion.emotions_name)}</span>
                      <span className="emotion-percentage">
                        {emotion.confidence_percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="emotion-progress-container">
                      <div 
                        className="emotion-progress-bar"
                        style={{ 
                          width: `${(emotion.confidence_percentage / maxConfidence) * 100}%`,
                          backgroundColor: getEmotionColor(emotion.emotions_name),
                          background: getEmotionColor(emotion.emotions_name)
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-emotion-data">ไม่มีข้อมูลการวิเคราะห์อารมณ์</div>
            )}

            {/* Control Button */}
            <div className="control-buttons">
              <button 
                className={`mode-button ${mode === 1 ? 'active' : ''}`}
                onClick={toggleMode}
              >
                {mode === 1 ? 'เปลี่ยนเป็น thought record' : 'เปลี่ยนเป็นไดอารี่'}
              </button>
            </div>
          </div>
        </div>

        {/* Right Section - Pie Chart */}
        <div className="chart-section">
          <div className="chart-header">
            <h3>กราฟแสดงสัดส่วนอารมณ์</h3>
            <div className="period-selector">
              <button 
                className="period-toggle"
                onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
              >
                {currentPeriodLabel} ▼
              </button>
              
              {showPeriodDropdown && (
                <div className="period-dropdown">
                  <div className="period-type-buttons">
                    <button 
                      className={`period-type-btn ${periodType === 'week' ? 'active' : ''}`}
                      onClick={() => handlePeriodTypeChange('week')}
                    >
                      รายสัปดาห์
                    </button>
                    <button 
                      className={`period-type-btn ${periodType === 'month' ? 'active' : ''}`}
                      onClick={() => handlePeriodTypeChange('month')}
                    >
                      รายเดือน
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="chart-date-range">
            {getDateRangeDisplay()}
          </div>

          <div className="chart-content">
            {chartLoading ? (
              <div className="chart-loading">กำลังโหลดข้อมูลกราฟ...</div>
            ) : pieChartData.length > 0 ? (
              <div className="chart-with-legend">
                <div className="pie-chart-container">
                  <ResponsiveContainer width="100%" height={400}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={getEmotionColor(entry.name)} 
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="emotion-legend">
                  {(() => {
                    const positiveEmotions = pieChartData.filter(item => 
                      item.category.toLowerCase().includes('positive') || 
                      ['joy', 'excitement', 'pride', 'love', 'approval', 'gratitude', 'admiration', 'amusement', 'caring', 'desire', 'optimism', 'relief'].includes(item.name.toLowerCase())
                    );
                    const negativeEmotions = pieChartData.filter(item => 
                      item.category.toLowerCase().includes('negative') || 
                      ['sadness', 'anger', 'disappointment', 'fear', 'nervousness', 'annoyance', 'embarrassment', 'disgust', 'grief', 'remorse'].includes(item.name.toLowerCase())
                    );
                    const neutralEmotions = pieChartData.filter(item => 
                      item.category.toLowerCase().includes('neutral') || 
                      // item.name.toLowerCase() === 'neutral'
                      ['curiosity','neutral','realization','confusion','surprise'].includes(item.name.toLowerCase())
                    );
                    
                    return (
                      <div className="legend-categories">
                        {positiveEmotions.length > 0 && (
                          <div className="legend-category-group">
                            <h5 className="category-header positive">Positive Emotions</h5>
                            <div className="legend-items-grid">
                              {positiveEmotions.map((item, index) => (
                                <div key={index} className="legend-item-compact">
                                  <div 
                                    className="legend-color-dot"
                                    style={{ backgroundColor: getEmotionColor(item.name) }}
                                  ></div>
                                  <span className="legend-text">
                                    {item.displayName} ({item.value}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {negativeEmotions.length > 0 && (
                          <div className="legend-category-group">
                            <h5 className="category-header negative">Negative Emotions</h5>
                            <div className="legend-items-grid">
                              {negativeEmotions.map((item, index) => (
                                <div key={index} className="legend-item-compact">
                                  <div 
                                    className="legend-color-dot"
                                    style={{ backgroundColor: getEmotionColor(item.name) }}
                                  ></div>
                                  <span className="legend-text">
                                    {item.displayName} ({item.value}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {neutralEmotions.length > 0 && (
                          <div className="legend-category-group">
                            <h5 className="category-header neutral">Neutral</h5>
                            <div className="legend-items-grid">
                              {neutralEmotions.map((item, index) => (
                                <div key={index} className="legend-item-compact">
                                  <div 
                                    className="legend-color-dot"
                                    style={{ backgroundColor: getEmotionColor(item.name) }}
                                  ></div>
                                  <span className="legend-text">
                                    {item.displayName} ({item.value}%)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="no-chart-data">
                ไม่มีข้อมูลการวิเคราะห์อารมณ์สำหรับช่วงเวลาที่เลือก
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Primary Emotion Bar Chart */}
      <div className="bar-chart-section">
        <div className="bar-chart-header">
          <h3>กราฟแท่งอารมณ์หลัก</h3>
          <div className="bar-chart-period">
            {getDateRangeDisplay()}
          </div>
        </div>

        <div className="bar-chart-content">
          {barChartLoading ? (
            <div className="chart-loading">กำลังโหลดข้อมูลกราฟแท่ง...</div>
          ) : primaryEmotionData && primaryEmotionData.emotion_details && primaryEmotionData.emotion_details.length > 0 ? (
            <div className="horizontal-bar-container">
              <div className="emotion-bars-horizontal">
                {primaryEmotionData.emotion_details
                  .sort((a: PrimaryEmotionDetail, b: PrimaryEmotionDetail) => b.percentage - a.percentage)
                  .map((emotion: PrimaryEmotionDetail, index: number) => (
                    <div key={index} className="emotion-bar-item-fixed">
                      <div className="emotion-bar-label">
                        <span className="emotion-name">{getEmotionDisplayName(emotion.emotion_name)}</span>
                        <span className="emotion-count">({emotion.count} ครั้ง)</span>
                      </div>
                      <div className="emotion-bar-container">
                        <div 
                          className="emotion-bar-fill"
                          style={{ 
                            width: `${emotion.percentage}%`,
                            backgroundColor: getEmotionColor(emotion.emotion_name)
                          }}
                        ></div>
                        <span className="emotion-bar-percentage">
                          {emotion.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              {/* Category Summary Cards */}
              <div className="category-cards">
                <h4 className="category-cards-title">สรุปตามหมวดหมู่</h4>
                <div className="category-cards-grid">
                  {primaryEmotionData.category_summary
                    .sort((a: CategorySummary, b: CategorySummary) => b.percentage - a.percentage)
                    .map((category: CategorySummary, index: number) => {
                      const getCategoryColor = (catName: string): string => {
                        const name = catName.toLowerCase().trim();
                        if (name.includes('positive')) return '#d4edda';
                        if (name.includes('negative')) return '#f8d7da';
                        return '#e2e3e5';
                      };
                      
                      const getCategoryBorderColor = (catName: string): string => {
                        const name = catName.toLowerCase().trim();
                        if (name.includes('positive')) return '#28a745';
                        if (name.includes('negative')) return '#dc3545';
                        return '#6c757d';
                      };

                      const categoryColor = getCategoryColor(category.category);
                      const borderColor = getCategoryBorderColor(category.category);

                      return (
                        <div 
                          key={index} 
                          className="category-card"
                          style={{ 
                            backgroundColor: categoryColor,
                            borderLeft: `4px solid ${borderColor}`
                          }}
                        >
                          <div className="category-card-count">{category.count}</div>
                          <div className="category-card-name">
                            {category.category.replace('Emotions', '').trim()}
                          </div>
                          <div className="category-card-percentage">
                            {category.percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-chart-data">
              ไม่มีข้อมูลอารมณ์หลักสำหรับช่วงเวลาที่เลือก
            </div>
          )}
        </div>
      </div>

      {/* Sub Emotion Weekly Chart Section */}
      <div className="sub-emotion-chart-section">
        <div className="sub-emotion-header">
          <h3>กราฟแสดงอารมณ์ทั้งหมด</h3>
          <div className="sub-emotion-period">
            {getDateRangeDisplay()}
          </div>
        </div>

        <div className="sub-emotion-content">
          {subEmotionLoading ? (
            <div className="chart-loading">กำลังโหลดข้อมูลกราฟรายอารมณ์ทั้งหมด...</div>
          ) : subEmotionData && subEmotionData.length > 0 ? (
            <div className="vertical-bars-container">
              <div className="vertical-bars-wrapper">
                {subEmotionData.map((group: EmotionAnalysisGroup, groupIndex: number) => (
                  <div key={groupIndex} className="emotion-group">
                    <div className="group-header">
                      <span className="group-timestamp">
                        {getDayOfWeekThai(group.analysis_timestamp)} ที่ {new Date(group.analysis_timestamp).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      
                    </div>
                    <div className="vertical-bars-group">
                      {group.sub_emotions
                        .sort((a: SubEmotionDetail, b: SubEmotionDetail) => b.confidence_percentage - a.confidence_percentage)
                        .map((emotion: SubEmotionDetail, emotionIndex: number) => (
                          <div key={emotionIndex} className="vertical-bar-item">
                            <div className="vertical-bar-container">
                              <div 
                                className="vertical-bar-fill"
                                style={{ 
                                  height: `${emotion.confidence_percentage * 2}px`,
                                  backgroundColor: getEmotionColor(emotion.emotion_name),
                                  maxHeight: '200px'
                                }}
                              ></div>
                              <div className="vertical-bar-percentage">
                                {emotion.confidence_percentage.toFixed(1)}%
                              </div>
                            </div>
                            <div className="vertical-bar-label">
                              <span className="emotion-name-vertical">{getEmotionDisplayName(emotion.emotion_name)}</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="no-chart-data">
              ไม่มีข้อมูลอารมณ์รายสัปดาห์สำหรับช่วงเวลาที่เลือก
            </div>
          )}
        </div>
      </div>    

    </div>
  );
};

export default EmotionAnalyzeDashboardDetail;