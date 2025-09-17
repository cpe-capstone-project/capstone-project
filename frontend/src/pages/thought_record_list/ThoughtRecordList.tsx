import React, { useEffect, useState } from "react";
import { useThoughtRecord } from "../../contexts/ThoughtRecordContext";
import ThoughtRecordSummary from "../../components/thought-record-summary/ThoughtRecordSummary";
import {
  Select,
  Spin,
  Alert,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  Button,
  DatePicker,
  Pagination,
} from "antd";
import { EyeOutlined, CalendarOutlined, ClearOutlined } from "@ant-design/icons";
import { FaPlus, FaRegCommentDots, FaRedoAlt } from "react-icons/fa";
import { GiDramaMasks } from "react-icons/gi";
import { useNavigate } from "react-router";
import "./ThoughtRecordList.css";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);
const { Title, Text, Paragraph } = Typography;

type FilterType =
  | "all"
  | "today"
  | "thisWeek"
  | "thisMonth"
  | "thisYear"
  | "customDate"
  | "customMonth"
  | "customYear"
  | "customWeek";

function ThoughtRecordList() {
  const { records, loading, error, fetchRecords } = useThoughtRecord();
  const navigate = useNavigate();

  // state พร้อม localStorage
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (localStorage.getItem("tr_sortOrder") as "asc" | "desc") || "desc"
  );
  const [filterType, setFilterType] = useState<FilterType>(
    (localStorage.getItem("tr_filterType") as FilterType) || "all"
  );
  const [selectedDate, setSelectedDate] = useState<any>(
    localStorage.getItem("tr_selectedDate")
      ? dayjs(localStorage.getItem("tr_selectedDate"))
      : null
  );
  const [selectedMonth, setSelectedMonth] = useState<any>(
    localStorage.getItem("tr_selectedMonth")
      ? dayjs(localStorage.getItem("tr_selectedMonth"))
      : null
  );
  const [selectedYear, setSelectedYear] = useState<any>(
    localStorage.getItem("tr_selectedYear")
      ? dayjs(localStorage.getItem("tr_selectedYear"))
      : null
  );
  const [selectedWeek, setSelectedWeek] = useState<any>(
    localStorage.getItem("tr_selectedWeek")
      ? dayjs(localStorage.getItem("tr_selectedWeek"))
      : null
  );
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  // pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8); // จำนวน card ต่อหน้า

  // save state ลง localStorage
  useEffect(() => {
    localStorage.setItem("tr_sortOrder", sortOrder);
    localStorage.setItem("tr_filterType", filterType);
    if (selectedDate) localStorage.setItem("tr_selectedDate", selectedDate.toString());
    else localStorage.removeItem("tr_selectedDate");
    if (selectedMonth) localStorage.setItem("tr_selectedMonth", selectedMonth.toString());
    else localStorage.removeItem("tr_selectedMonth");
    if (selectedYear) localStorage.setItem("tr_selectedYear", selectedYear.toString());
    else localStorage.removeItem("tr_selectedYear");
    if (selectedWeek) localStorage.setItem("tr_selectedWeek", selectedWeek.toString());
    else localStorage.removeItem("tr_selectedWeek");
  }, [sortOrder, filterType, selectedDate, selectedMonth, selectedYear, selectedWeek]);

  // กรองข้อมูล
  const getFilterValue = () => {
    const today = dayjs();
    switch (filterType) {
      case "today":
        return { date: today.format("YYYY-MM-DD") };
      case "thisWeek":
        return { week: today.startOf("isoWeek").format("YYYY-MM-DD") };
      case "thisMonth":
        return { month: today.format("YYYY-MM") };
      case "thisYear":
        return { year: today.format("YYYY") };
      case "customDate":
        return selectedDate ? { date: selectedDate.format("YYYY-MM-DD") } : {};
      case "customWeek":
        return selectedWeek ? { week: selectedWeek.format("YYYY-MM-DD") } : {};
      case "customMonth":
        return selectedMonth ? { month: selectedMonth.format("YYYY-MM") } : {};
      case "customYear":
        return selectedYear ? { year: selectedYear.format("YYYY") } : {};
      default:
        return {};
    }
  };

  // fetch records
  useEffect(() => {
    const filter = getFilterValue();
    fetchRecords("UpdatedAt", sortOrder, filter);
    setCurrentPage(1); // รีเซ็ตหน้าเมื่อเปลี่ยน filter
  }, [sortOrder, filterType, selectedDate, selectedMonth, selectedYear, selectedWeek]);

  const handleClearFilter = () => {
    setFilterType("all");
    setSelectedDate(null);
    setSelectedMonth(null);
    setSelectedYear(null);
    setSelectedWeek(null);
  };

  const filterOptions = [
    { value: "all", label: "ทั้งหมด" },
    { value: "today", label: "วันนี้" },
    { value: "thisWeek", label: "สัปดาห์นี้" },
    { value: "thisMonth", label: "เดือนนี้" },
    { value: "thisYear", label: "ปีนี้" },
    { value: "customDate", label: "เลือกวันที่" },
    { value: "customWeek", label: "เลือกสัปดาห์" },
    { value: "customMonth", label: "เลือกเดือน" },
    { value: "customYear", label: "เลือกปี" },
  ];

  // สีสำหรับวัน
  const recordDateColors = records.reduce((acc: Record<string, string[]>, r: any) => {
    const dateStr = dayjs(r.UpdatedAt).format("YYYY-MM-DD");
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(r.TagColors?.trim() || "#1890ff");
    return acc;
  }, {});

  const renderDateWithDots = (current: any) => {
    const dateStr = current.format("YYYY-MM-DD");
    const colors = recordDateColors[dateStr] || [];
    const isToday = current.isSame(dayjs(), "day");
    const isHovered = hoveredDate === dateStr;
    const isSelected =
      (filterType === "customDate" &&
        selectedDate?.format("YYYY-MM-DD") === dateStr) ||
      (filterType === "customWeek" &&
        selectedWeek &&
        current.isSame(
          selectedWeek.startOf("isoWeek").add(current.isoWeekday() - 1, "day"),
          "day"
        ));

    const gridColumns = colors.length === 1 ? "1fr" : "repeat(2, 6px)";

    return (
      <div
        style={{
          width: "100%",
          textAlign: "center",
          position: "relative",
          paddingTop: 4,
          cursor: "pointer",
        }}
        title={colors.length > 0 ? `มี ${colors.length} บันทึก` : undefined}
        onMouseEnter={() => setHoveredDate(dateStr)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        <div
          style={{
            width: 24,
            height: 24,
            lineHeight: "24px",
            borderRadius: "50%",
            backgroundColor: isSelected
              ? "#bae7ff"
              : isHovered
              ? "#cce4ff"
              : isToday
              ? "#1890ff33"
              : undefined,
            color:
              isSelected || isHovered
                ? "#1890ff"
                : isToday
                ? "#1890ff"
                : undefined,
            margin: "0 auto",
            fontWeight: isToday || isHovered || isSelected ? "bold" : "normal",
            transition: "all 0.2s",
          }}
        >
          {current.date()}
        </div>
        {colors.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: gridColumns,
              gap: 2,
              justifyContent: "center",
              marginTop: 2,
            }}
          >
            {colors.slice(0, 4).map((color, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: color,
                  justifySelf: "center",
                }}
              />
            ))}
            {colors.length > 4 && (
              <div
                style={{
                  gridColumn: "span 2",
                  fontSize: 10,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                +{colors.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // slice ข้อมูลตามหน้า
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedRecords = records.slice(startIdx, startIdx + pageSize);

  return (
    <section style={{ padding: "32px", backgroundColor: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Title level={2} style={{ margin: 0 }}>
          บันทึกความคิด (Thought Records)
        </Title>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-end" }}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Select
              value={sortOrder}
              onChange={setSortOrder}
              options={[
                { value: "desc", label: "ล่าสุด" },
                { value: "asc", label: "เก่าสุด" },
              ]}
              style={{ width: 100 }}
              dropdownMatchSelectWidth={false}
              getPopupContainer={() => document.body}
            />
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value)}
              options={filterOptions}
              style={{ width: 160 }}
              placeholder="กรองข้อมูล"
              suffixIcon={<CalendarOutlined />}
              dropdownMatchSelectWidth={false}
              getPopupContainer={() => document.body}
            />
            {/* DatePicker */}
            {["customDate", "customWeek", "customMonth", "customYear"].includes(filterType) && (
              <>
                {filterType === "customDate" && (
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    dateRender={renderDateWithDots}
                    placeholder="เลือกวันที่"
                    style={{ width: 200 }}
                    format="DD/MM/YYYY"
                    getPopupContainer={() => document.body}
                  />
                )}
                {filterType === "customWeek" && (
                  <DatePicker
                    picker="date"
                    value={selectedWeek}
                    onChange={setSelectedWeek}
                    dateRender={renderDateWithDots}
                    placeholder="เลือกวันในสัปดาห์"
                    style={{ width: 200 }}
                    format="DD/MM/YYYY"
                    getPopupContainer={() => document.body}
                  />
                )}
                {filterType === "customMonth" && (
                  <DatePicker
                    picker="month"
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    placeholder="เลือกเดือน"
                    style={{ width: 200 }}
                    format="MM/YYYY"
                    getPopupContainer={() => document.body}
                  />
                )}
                {filterType === "customYear" && (
                  <DatePicker
                    picker="year"
                    value={selectedYear}
                    onChange={setSelectedYear}
                    placeholder="เลือกปี"
                    style={{ width: 120 }}
                    format="YYYY"
                    getPopupContainer={() => document.body}
                  />
                )}
              </>
            )}
            {filterType !== "all" && (
              <Button icon={<ClearOutlined />} onClick={handleClearFilter} title="ล้างการกรอง" />
            )}
            <Button
              type="primary"
              icon={<FaPlus />}
              style={{ borderRadius: "var(--radius-full)" }}
              onClick={() => navigate("/patient/thought_records/create")}
            >
              สร้างบันทึก
            </Button>
          </div>
        </div>
      </div>

      {/* แสดงสถานะการกรอง */}
      {filterType !== "all" && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            backgroundColor: "#f0f7ff",
            border: "1px solid #d6e4ff",
            borderRadius: 6,
            fontSize: 14,
            color: "#1890ff",
          }}
        >
          <CalendarOutlined style={{ marginRight: 8 }} /> กรองข้อมูล:{" "}
          {filterOptions.find((opt) => opt.value === filterType)?.label}
          {filterType === "customDate" && selectedDate && (
            <span> - {selectedDate.format("DD/MM/YYYY")}</span>
          )}
          {filterType === "customWeek" && selectedWeek && (
            <span> - สัปดาห์ที่ {selectedWeek.format("WW/YYYY")}</span>
          )}
          {filterType === "customMonth" && selectedMonth && (
            <span> - {selectedMonth.format("MM/YYYY")}</span>
          )}
          {filterType === "customYear" && selectedYear && (
            <span> - {selectedYear.format("YYYY")}</span>
          )}
        </div>
      )}

      {/* Body */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <Spin size="large" tip="กำลังโหลด..." />
        </div>
      ) : error ? (
        <Alert message="เกิดข้อผิดพลาด" description={error} type="error" showIcon />
      ) : records.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            backgroundColor: "#fafafa",
            borderRadius: 8,
            border: "1px dashed #d9d9d9",
          }}
        >
          <CalendarOutlined style={{ fontSize: 48, color: "#bfbfbf", marginBottom: 16 }} />
          <Title level={4} style={{ color: "#8c8c8c" }}>
            {filterType === "all" ? "ไม่มีบันทึกความคิด" : "ไม่พบข้อมูลในช่วงเวลาที่เลือก"}
          </Title>
          <Text type="secondary">
            {filterType === "all"
              ? "เริ่มต้นสร้างบันทึกความคิดแรกของคุณ"
              : "ลองเปลี่ยนการกรองข้อมูลหรือสร้างบันทึกใหม่"}
          </Text>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">
              พบ {records.length} รายการ{" "}
              {filterType !== "all" && <span style={{ color: "#1890ff" }}> (กรองแล้ว)</span>}
            </Text>
          </div>

          {records.length > 0 && (
  <ThoughtRecordSummary records={records} />
)}

          <Row gutter={[24, 24]}>
            {paginatedRecords.map((record) => (
              <Col key={record.ID} xs={24} sm={24} md={12} lg={8} xl={6}>
                <div className="card-hover-wrapper">
                  <Card
                    title={
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 6,
                            height: 24,
                            backgroundColor: record.TagColors?.trim() || "#1890ff",
                            borderRadius: 2,
                          }}
                        />
                        <Paragraph
                          style={{
                            margin: 0,
                            maxWidth: "calc(100% - 12px)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: 500,
                            fontSize: 15,
                            color: "#1f1f1f",
                          }}
                          title={record.Situation || "-"}
                        >
                          {record.Situation || "-"}
                        </Paragraph>
                      </div>
                    }
                    hoverable
                    style={{
                      borderRadius: 16,
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
                      height: "100%",
                      backgroundColor: "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    bodyStyle={{ display: "flex", flexDirection: "column", flexGrow: 1 }}
                  >
                    <div style={{ flexGrow: 1 }}>
                      <Space direction="vertical" size="small" style={{ width: "100%" }}>
                        <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                          <Paragraph ellipsis={{ rows: 1 }}>
                            <FaRegCommentDots style={{ marginRight: 6, color: "#519bf1ff" }} />
                            <Text strong>ความคิด:</Text> {record.Thoughts || "-"}
                          </Paragraph>
                        </div>
                        <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                          <Paragraph ellipsis={{ rows: 1 }}>
                            <GiDramaMasks style={{ marginRight: 6, color: "#519bf1ff" }} />
                            <Text strong>พฤติกรรม:</Text> {record.Behaviors || "-"}
                          </Paragraph>
                        </div>
                        <div className="field-box" style={{ borderLeftColor: "#519bf1ff" }}>
                          <Paragraph ellipsis={{ rows: 1 }}>
                            <FaRedoAlt style={{ marginRight: 6, color: "#519bf1ff" }} />
                            <Text strong>ความคิดทางเลือก:</Text>{" "}
                            {record.AlternateThought || "-"}
                          </Paragraph>
                        </div>
                      </Space>
                    </div>

                    {record.Emotions && record.Emotions.length > 0 && (
                      <div className="emotion-box">
                        {record.Emotions.length <= 2 ? (
                          record.Emotions.map((emotion: any) => (
                            <span
                              key={emotion.ID}
                              className="emotion-tag"
                              style={{ background: emotion.EmotionsColor || "#519bf1" }}
                              title={emotion.ThaiEmotionsname || emotion.Emotionsname}
                            >
                              {emotion.ThaiEmotionsname || emotion.Emotionsname}
                            </span>
                          ))
                        ) : (
                          <>
                            <span
                              className="emotion-tag"
                              style={{
                                background: record.Emotions[0].EmotionsColor || "#519bf1",
                              }}
                              title={
                                record.Emotions[0].ThaiEmotionsname ||
                                record.Emotions[0].Emotionsname
                              }
                            >
                              {record.Emotions[0].ThaiEmotionsname ||
                                record.Emotions[0].Emotionsname}
                            </span>
                            <span
                              className="emotion-tag indicator"
                              title={`และอีก ${record.Emotions.length - 1} อารมณ์`}
                            >
                              +{record.Emotions.length - 1}
                            </span>
                          </>
                        )}
                      </div>
                    )}

                    <Divider style={{ margin: "12px 0" }} />
                    <Text type="secondary" style={{ fontSize: 12, marginTop: "auto" }}>
                      สร้างเมื่อ:{" "}
                      {record.UpdatedAt
                        ? new Date(record.UpdatedAt).toLocaleString("th-TH")
                        : "-"}
                    </Text>
                    <Button
                      className="view-more-button"
                      type="primary"
                      shape="circle"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/patient/thought_records/${record.ID}`)}
                    />
                  </Card>
                </div>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={records.length}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size || 8);
              }}
              showSizeChanger
              pageSizeOptions={["4", "8", "12", "16"]}
              showTotal={(total, range) => `${range[0]}-${range[1]} จากทั้งหมด ${total} รายการ`}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default ThoughtRecordList;
