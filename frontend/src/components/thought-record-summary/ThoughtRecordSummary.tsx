// components/thought_record-summary/ThoughtRecordSummary.tsx
import React, { useMemo } from "react";
import { Card, Typography, Row, Col, Progress, Tag, Space, Statistic, Divider } from "antd";
import {
    BookOutlined,
    HeartOutlined,
    BarChartOutlined,
    SmileOutlined,
    FrownOutlined
} from "@ant-design/icons";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { ThoughtRecordInterface } from "../../interfaces/IThoughtRecord";

const { Title, Text } = Typography;

interface Props {
    records: ThoughtRecordInterface[];
}

function ThoughtRecordSummary({ records }: Props) {
    // จำนวนบันทึกทั้งหมด
    const totalRecords = records.length;

    // คำนวณ top 3 emotions
    const topEmotions = useMemo(() => {
        const freq: Record<string, { count: number; color: string }> = {};
        records.forEach((r) => {
            r.Emotions?.forEach((e) => {
                const name = e.ThaiEmotionsname || e.Emotionsname;
                if (!name) return;
                if (!freq[name]) freq[name] = { count: 0, color: e.EmotionsColor || "#519bf1" };
                freq[name].count++;
            });
        });
        return Object.entries(freq)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3);
    }, [records]);

    // คำนวณสัดส่วนอารมณ์ negative/positive
    const emotionRatio = useMemo(() => {
        let neg = 0, pos = 0;
        records.forEach((r) => {
            r.Emotions?.forEach((e) => {
                const category = e.Category?.trim().toLowerCase();
                if (category === "negativeemotions") neg++;
                else if (category === "positiveemotions") pos++;
            });
        });
        const total = neg + pos || 1;
        return {
            neg,
            pos,
            percent: {
                neg: Math.round((neg / total) * 100),
                pos: Math.round((pos / total) * 100),
            },
        };
    }, [records]);

    // ข้อมูลสำหรับ Pie Chart (อารมณ์ทั้งหมด)
    const emotionPieData = useMemo(() => {
        const freq: Record<string, { count: number; color: string }> = {};
        let totalEmotions = 0;

        records.forEach((r) => {
            r.Emotions?.forEach((e) => {
                const name = e.ThaiEmotionsname || e.Emotionsname;
                if (!name) return;
                if (!freq[name]) freq[name] = { count: 0, color: e.EmotionsColor || "#519bf1" };
                freq[name].count++;
                totalEmotions++;
            });
        });

        return Object.entries(freq)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([name, { count, color }]) => ({
                name,
                value: count,
                color,
                percentage: Math.round((count / (totalEmotions || 1)) * 100)
            }));
    }, [records]);

    // Custom label function for pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        if (percent < 0.05) return null; // ไม่แสดง label ถ้าน้อยกว่า 5%

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={11}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // top 3 สถานการณ์ positive
    const topPositiveSituations = useMemo(() => {
        const freq: Record<string, { count: number; color: string }> = {};
        records.forEach((r) => {
            if (!r.SituationTag?.Name) return;
            const hasPositive = r.Emotions?.some((e) =>
                (e.Category?.trim().toLowerCase() || "") === "positiveemotions"
            );
            if (hasPositive) {
                const tagName = r.SituationTag.Name;
                if (!freq[tagName]) {
                    freq[tagName] = { count: 0, color: r.SituationTag.Color || "#52c41a" };
                }
                freq[tagName].count++;
            }
        });
        return Object.entries(freq)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3);
    }, [records]);

    // top 3 สถานการณ์ negative
    const topNegativeSituations = useMemo(() => {
        const freq: Record<string, { count: number; color: string }> = {};
        records.forEach((r) => {
            if (!r.SituationTag?.Name) return;
            const hasNegative = r.Emotions?.some((e) =>
                (e.Category?.trim().toLowerCase() || "") === "negativeemotions"
            );
            if (hasNegative) {
                const tagName = r.SituationTag.Name;
                if (!freq[tagName]) {
                    freq[tagName] = { count: 0, color: r.SituationTag.Color || "#ff4d4f" };
                }
                freq[tagName].count++;
            }
        });
        return Object.entries(freq)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 3);
    }, [records]);

    return (
        <Card
            title={
                <>
                    <Title level={4} style={{ margin: 0, color: "#1890ff" }}>
                        <BarChartOutlined style={{ marginRight: 8 }} />
                        สรุปภาพรวมบันทึกความคิด
                    </Title>

                </>
            }
            style={{
                marginBottom: 24,
                borderRadius: 16,
                boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                border: "1px solid #f0f0f0"
            }}
        >
            {/* แถวที่ 1: สถิติพื้นฐาน */}
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={8}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            background: "linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%)",
                            borderRadius: 12,
                            textAlign: "center"
                        }}
                    >
                        <Statistic
                            title={
                                <Space>
                                    <BookOutlined style={{ color: "#1890ff" }} />
                                    <span style={{ fontWeight: 500 }}>จำนวนบันทึกทั้งหมด</span>
                                </Space>
                            }
                            value={totalRecords}
                            suffix="รายการ"
                            valueStyle={{ color: "#1890ff", fontSize: 32, fontWeight: "bold" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={16}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            background: "linear-gradient(135deg, #fff2e8 0%, #ffd8bf 100%)",
                            borderRadius: 12
                        }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Space>
                                <HeartOutlined style={{ fontSize: 20, color: "#fa8c16" }} />
                                <Text strong style={{ fontSize: 16 }}>อารมณ์ที่พบบ่อยที่สุด (Top 3)</Text>
                            </Space>
                            <Space wrap size={[8, 8]}>
                                {topEmotions.length > 0 ? (
                                    topEmotions.map(([name, { color, count }], index) => (
                                        <Tag
                                            key={name}
                                            color={color}
                                            style={{
                                                fontSize: 14,
                                                padding: "4px 12px",
                                                borderRadius: 20,
                                                fontWeight: index === 0 ? "bold" : "normal"
                                            }}
                                        >
                                            #{index + 1} {name} ({count} ครั้ง)
                                        </Tag>
                                    ))
                                ) : (
                                    <Text type="secondary">ยังไม่มีข้อมูล</Text>
                                )}
                            </Space>
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* แถวที่ 2: สัดส่วนอารมณ์ + Pie chart */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: "#fafafa",
                            height: "100%"
                        }}
                        bodyStyle={{ padding: "16px" }}
                    >
                        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
                            <Text strong style={{ fontSize: 16, marginBottom: 30 }}>สัดส่วนอารมณ์ในการบันทึก</Text>

                            {/* แสดงผลเปอร์เซ็นต์และจำนวน */}
                            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                <Row gutter={[12, 16]}>
                                    <Col xs={24} sm={12}>
                                        <div style={{ textAlign: "center" }}>
                                            <SmileOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 16 }} />
                                            <div>
                                                <Text strong style={{ color: "#52c41a", fontSize: 24, display: "block" }}>
                                                    {emotionRatio.percent.pos}%
                                                </Text>
                                                <Text style={{ fontSize: 13, color: "#52c41a" }}>
                                                    อารมณ์ดี ({emotionRatio.pos} ครั้ง)
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <div style={{ textAlign: "center" }}>
                                            <FrownOutlined style={{ fontSize: 24, color: "#ff4d4f", marginBottom: 16 }} />
                                            <div>
                                                <Text strong style={{ color: "#ff4d4f", fontSize: 24, display: "block" }}>
                                                    {emotionRatio.percent.neg}%
                                                </Text>
                                                <Text style={{ fontSize: 13, color: "#ff4d4f" }}>
                                                    อารมณ์ไม่ดี ({emotionRatio.neg} ครั้ง)
                                                </Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Progress bar */}
                                <div style={{ marginTop: 26 }}>
                                    <Progress
                                        percent={emotionRatio.percent.pos}
                                        strokeColor="#52c41a"
                                        trailColor="#ff4d4f"
                                        showInfo={false}
                                        strokeWidth={10}
                                    />
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginTop: 4,
                                        fontSize: 12,
                                        color: "#666"
                                    }}>
                                        <span>อารมณ์ดี</span>
                                        <span>อารมณ์ไม่ดี</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: "#fafafa",
                            height: "100%"
                        }}
                        bodyStyle={{ padding: "16px" }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Text strong style={{ fontSize: 16 }}>แผนภูมิอารมณ์ทั้งหมด</Text>
                            {emotionPieData.length > 0 ? (
                                <div style={{ width: "100%", height: 220 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={emotionPieData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={renderCustomizedLabel}
                                                outerRadius={70}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {emotionPieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value: any, name: any, props: any) => [
                                                    `${value} ครั้ง (${props.payload.percentage}%)`,
                                                    name
                                                ]}
                                                labelFormatter={(name) => `อารมณ์: ${name}`}
                                            />
                                            <Legend
                                                formatter={(value) => (
                                                    <span style={{ fontSize: 11 }}>{value}</span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div style={{
                                    height: 220,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <Text type="secondary" style={{ fontSize: 13 }}>
                                        ยังไม่มีข้อมูลอารมณ์
                                    </Text>
                                </div>
                            )}
                        </Space>
                    </Card>
                </Col>
            </Row>

            {/* แถวที่ 3: สถานการณ์ที่ส่งผลต่ออารมณ์ */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)",
                            height: "100%"
                        }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Space>
                                <SmileOutlined style={{ fontSize: 20, color: "#52c41a" }} />
                                <Text strong style={{ fontSize: 16 }}>
                                    สถานการณ์ที่ทำให้รู้สึกดี (Top 3)
                                </Text>
                            </Space>
                            <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                                {topPositiveSituations.length > 0 ? (
                                    topPositiveSituations.map(([name, { color, count }], index) => (
                                        <Tag
                                            key={name}
                                            color={color}
                                            style={{
                                                fontSize: 13,
                                                padding: "4px 10px",
                                                borderRadius: 16,
                                                fontWeight: index === 0 ? "bold" : "normal"
                                            }}
                                        >
                                            #{index + 1} {name} ({count} ครั้ง)
                                        </Tag>
                                    ))
                                ) : (
                                    <Text type="secondary">ยังไม่มีข้อมูล</Text>
                                )}
                            </Space>
                        </Space>
                    </Card>
                </Col>

                <Col xs={24} lg={12}>
                    <Card
                        size="small"
                        bordered={false}
                        style={{
                            borderRadius: 12,
                            background: "linear-gradient(135deg, #fff2f0 0%, #ffccc7 100%)",
                            height: "100%"
                        }}
                    >
                        <Space direction="vertical" style={{ width: "100%" }}>
                            <Space>
                                <FrownOutlined style={{ fontSize: 20, color: "#ff4d4f" }} />
                                <Text strong style={{ fontSize: 16 }}>
                                    สถานการณ์ที่ทำให้รู้สึกไม่ดี (Top 3)
                                </Text>
                            </Space>
                            <Space wrap size={[8, 8]} style={{ marginTop: 8 }}>
                                {topNegativeSituations.length > 0 ? (
                                    topNegativeSituations.map(([name, { color, count }], index) => (
                                        <Tag
                                            key={name}
                                            color={color}
                                            style={{
                                                fontSize: 13,
                                                padding: "4px 10px",
                                                borderRadius: 16,
                                                fontWeight: index === 0 ? "bold" : "normal"
                                            }}
                                        >
                                            #{index + 1} {name} ({count} ครั้ง)
                                        </Tag>
                                    ))
                                ) : (
                                    <Text type="secondary">ยังไม่มีข้อมูล</Text>
                                )}
                            </Space>
                        </Space>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
}

export default ThoughtRecordSummary;