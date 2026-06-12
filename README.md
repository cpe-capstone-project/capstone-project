# 🧠 Web Application to Support the CBT (Cognitive Behavioral Therapy)

เว็บแอปพลิเคชันสำหรับช่วยสนับสนุนกระบวนการบำบัดด้วย CBT

## 📋 Overview

โครงงานนี้เป็นการพัฒนาเว็บแอปพลิเคชันเพื่อสนับสนุนกระบวนการบำบัดด้วยวิธี Cognitive Behavioral Therapy (CBT) ซึ่งเป็นวิธีการบำบัดทางจิตวิทยาที่ได้รับความนิยม แต่ในปัจจุบันยังมีข้อจำกัดด้านการใช้งานในรูปแบบเอกสารกระดาษที่ไม่สะดวกต่อการจัดเก็บและการวิเคราะห์ข้อมูล [4]

ระบบที่พัฒนาขึ้นมุ่งเน้นการอำนวยความสะดวกให้ผู้ป่วยสามารถบันทึกไดอารี่ (Diary) และบันทึกความคิด อารมณ์และพฤติกรรม (Thought Record) ได้อย่างเป็นระบบ พร้อมทั้งมีการประมวลผลและสรุปข้อมูลเพื่อให้ผู้ป่วยตระหนักถึงรูปแบบทางอารมณ์และความคิดของตนเอง ขณะเดียวกันนักจิตวิทยาสามารถเข้าถึงข้อมูล วิเคราะห์พฤติกรรม และให้ข้อเสนอแนะเชิงบำบัดได้อย่างเป็นโครงสร้าง [4]

ระบบถูกออกแบบให้เป็นระบบปิด ใช้งานเฉพาะภายในโรงพยาบาลมหาวิทยาลัยเทคโนโลยีสุรนารี [4]

---

## 👥 Team Members

| ชื่อ | รหัสนักศึกษา |
|------|-------------|
| นายรวิพล มุ่งดี | B6506469 |
| นายหฤษฎ์ เพ็งผ่อง | B6508302 |
| นายณัฐภูมิ อุปมัย | B6509712 |
| นายเกริกฐิติ วราชัย | B6514617 |
| นายธีปรัชญ์ เมธีภูริวัจน์ | B6515287 |

**อาจารย์ที่ปรึกษา:** อาจารย์ ดร. สุภาพร บุญฤทธิ์

**สาขาวิชา:** วิศวกรรมคอมพิวเตอร์ สำนักวิชาวิศวกรรมศาสตร์ มหาวิทยาลัยเทคโนโลยีสุรนารี

**รายวิชา:** ENG23 4080 โครงงานวิศวกรรมคอมพิวเตอร์ ประจำภาคการศึกษาที่ 1 ปีการศึกษา 2568

---

## 🏗️ System Architecture

<!-- TODO: ใส่รูป System Architecture Diagram ที่นี่ -->
<!-- ![System Architecture Diagram](path/to/system-architecture-diagram.png) -->

┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Frontend │ │ Backend │ │ Database │
│ React + TS + │◄─────►│ Go (Golang) │◄─────►│ SQLite │
│ Vite + Ant │ │ REST API │ │ │
└─────────────────┘ └────────┬─────────┘ └─────────────────┘
│
┌────────────┼────────────┐
▼ ▼ ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│ Gemini │ │ Hugging │ │ Google Cloud │
│Flash 2.5 │ │ Face API │ │ Translation │
│(Summary) │ │(Emotion) │ │ API │
└──────────┘ └──────────┘ └──────────────┘


---

## 🛠️ Tech Stack

### Frontend
- **React** + **TypeScript** — ส่วนติดต่อผู้ใช้ [4]
- **Vite** — Build tool พร้อม HMR [3]
- **Ant Design** — UI Component Library
- **HTML/CSS** — โครงสร้างและการจัดรูปแบบ

### Backend
- **Go (Golang)** — REST API และการประมวลผลข้อมูล [4]

### Database
- **SQLite** — จัดเก็บข้อมูลผู้ใช้ ไดอารี่ บันทึกความคิด และผลวิเคราะห์ [4]

### AI & NLP
- **Google Gemini Flash 2.5 API** — สรุปข้อมูลไดอารี่และบันทึกความคิด [4]
- **SamLowe/roberta-base-go_emotions** (Hugging Face) — วิเคราะห์อารมณ์จากข้อความ (28 หมวดหมู่อารมณ์) [4]
- **Google Cloud Translation API** — แปลภาษาไทยเป็นอังกฤษก่อนวิเคราะห์อารมณ์ [4]

### Tools
- Git / GitHub
- Visual Studio Code
- Chrome DevTools
- Postman
- DB Browser for SQLite
- Figma (UI/UX Design)

---

## 📁 Project Structure
capstone-project/
├── backend/ # Go Backend
│ ├── ai/ # AI integration (Gemini, Emotion Analysis)
│ ├── config/ # Configuration files
│ ├── controller/ # Request handlers
│ ├── entity/ # Data models / entities
│ ├── middlewares/ # Authentication & middleware
│ ├── routers/ # API route definitions
│ ├── services/ # Business logic
│ ├── test/ # Unit tests
│ ├── uploads/ # Uploaded files storage
│ ├── go.mod # Go module definition
│ ├── go.sum # Go dependencies checksum
│ └── main.go # Application entry point
│
├── frontend/ # React Frontend
│ ├── public/ # Static assets
│ ├── src/ # Source code
│ ├── .env # Environment variables
│ ├── index.html # Entry HTML
│ ├── package.json # Node.js dependencies
│ ├── tsconfig.json # TypeScript configuration
│ ├── vite.config.ts # Vite configuration
│ └── eslint.config.js # ESLint configuration
│
├── .gitignore
└── README.md


---

## 👤 User Roles

ระบบมีผู้ใช้งาน 3 ประเภท [4]:

### 1. ผู้ป่วย (Patient)
- ลงทะเบียนและจัดการโปรไฟล์
- บันทึกไดอารี่ (Diary Record) — เขียนเรื่องราวอย่างอิสระ
- บันทึกความคิด (Thought Record) — บันทึกตามฟอร์มมาตรฐาน CBT (สถานการณ์, ความคิด, อารมณ์, พฤติกรรม, ความคิดทางเลือก)
- ดูสรุปข้อมูลไดอารี่และบันทึกความคิด (AI-powered)
- ดูผลวิเคราะห์อารมณ์
- รับความคิดเห็น/คำแนะนำจากนักจิตวิทยา

### 2. นักจิตวิทยา (Psychologist)
- ลงทะเบียน (ต้องรอ Admin อนุมัติ)
- จัดการผู้ป่วย — สร้าง/แก้ไขเคสการบำบัด
- ดูไดอารี่และบันทึกความคิดของผู้ป่วย
- ส่งความคิดเห็น/ข้อเสนอแนะ (Feedback) กลับไปยังผู้ป่วย
- ดู Dashboard วิเคราะห์อารมณ์ (รายวัน/รายสัปดาห์/รายเดือน)

### 3. ผู้ดูแลระบบ (Admin)
- อนุมัติการลงทะเบียนของนักจิตวิทยา
- จัดการ (ลบ) บัญชีผู้ใช้

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 📝 Diary Record | บันทึกไดอารี่รายวัน แสดงผลแบบรายการและปฏิทิน |
| 💭 Thought Record | บันทึกความคิดตามฟอร์ม CBT (5 ส่วน: สถานการณ์, ความคิด, อารมณ์, พฤติกรรม, ความคิดทางเลือก) |
| 🤖 AI Summary | สรุปไดอารี่/บันทึกความคิดด้วย Google Gemini Flash 2.5 API (รายวัน/รายสัปดาห์/รายเดือน) |
| 😊 Emotion Analysis | วิเคราะห์อารมณ์ 28 หมวดหมู่ด้วย NLP Model (SamLowe/roberta-base-go_emotions) |
| 📊 Dashboard | แสดงกราฟอารมณ์รายวัน/สัปดาห์/เดือน พร้อมสัดส่วนอารมณ์ |
| 💬 Feedback | นักจิตวิทยาให้คำแนะนำต่อไดอารี่/บันทึกความคิดของผู้ป่วย |
| 🔐 Authentication | ระบบยืนยันตัวตน จัดการสิทธิ์ และเข้ารหัสรหัสผ่าน |
| 🏥 Case Management | จัดการเคสการบำบัดอย่างเป็นระบบ (สถานะ: กำลังบำบัด/หยุดบำบัด/ยุติบำบัด) |
| 🏷️ Situation Tags | จัดหมวดหมู่สถานการณ์ใน Thought Record ด้วยแท็กสี |

---

## 🗄️ Database Schema

<!-- TODO: ใส่รูป Class Diagram ที่นี่ -->
<!-- ![Class Diagram](path/to/class-diagram.png) -->

### ER Diagram Overview
Patients ──── Therapy Cases ──── Psychologists
│
┌──────────┼──────────┐
▼ ▼ ▼
Diaries Thought Feedback
│ Records │
▼ │ ▼
Diary ▼ Feedback Time
Summaries Emotions Feedback Type
│ │
└────┬─────┘
▼
Emotion Analysis Results
│
▼
Sub Emotion Analysis


### ตารางหลัก

| Table | Description |
|-------|-------------|
| Patients | ข้อมูลผู้ป่วย (ชื่อ, อีเมล, เบอร์โทร, ที่อยู่, วันเกิด, เพศ) |
| Psychologists | ข้อมูลนักจิตวิทยา (ชื่อ, อีเมล, ใบอนุญาตประกอบวิชาชีพ, verify_code) |
| Admin | ข้อมูลผู้ดูแลระบบ |
| Therapy Cases | เคสการบำบัด (หัวข้อ, รายละเอียด, วันเริ่ม, สถานะ) |
| Case Status | สถานะของเคส (กำลังบำบัด/หยุดบำบัด/ยุติบำบัด) |
| Diaries | บันทึกไดอารี่ (หัวข้อ, เนื้อหา, แท็กสี) |
| Diary Summaries | สรุปไดอารี่จาก AI (ช่วงเวลา, ข้อความสรุป, keyword) |
| Thought Records | บันทึกความคิด (สถานการณ์, ความคิด, พฤติกรรม, ความคิดทางเลือก) |
| Situation Tags | ประเภทสถานการณ์ (ชื่อ, สี, ผู้สร้าง) |
| Emotions | อารมณ์ 28 หมวดหมู่ (ชื่อ EN/TH, หมวดหมู่, สี) |
| Emotion Analysis Results | ผลวิเคราะห์อารมณ์ (input, translated text, primary emotion, timestamp) |
| Sub Emotion Analysis | อารมณ์ย่อย (confidence %, score) |
| Feedback | ข้อเสนอแนะจากนักจิตวิทยา (หัวข้อ, เนื้อหา, ช่วงวันที่) |
| Feedback Time | ช่วงเวลาของ feedback |
| Feedback Type | ประเภทของ feedback |

---

## 🚀 Getting Started

### Prerequisites
- **Go** (1.20+)
- **Node.js** (18+)
- **npm**

### Backend Setup
```bash
cd backend
go mod download
go run main.go


### ตารางหลัก

| Table | Description |
|-------|-------------|
| Patients | ข้อมูลผู้ป่วย (ชื่อ, อีเมล, เบอร์โทร, ที่อยู่, วันเกิด, เพศ) |
| Psychologists | ข้อมูลนักจิตวิทยา (ชื่อ, อีเมล, ใบอนุญาตประกอบวิชาชีพ, verify_code) |
| Admin | ข้อมูลผู้ดูแลระบบ |
| Therapy Cases | เคสการบำบัด (หัวข้อ, รายละเอียด, วันเริ่ม, สถานะ) |
| Case Status | สถานะของเคส (กำลังบำบัด/หยุดบำบัด/ยุติบำบัด) |
| Diaries | บันทึกไดอารี่ (หัวข้อ, เนื้อหา, แท็กสี) |
| Diary Summaries | สรุปไดอารี่จาก AI (ช่วงเวลา, ข้อความสรุป, keyword) |
| Thought Records | บันทึกความคิด (สถานการณ์, ความคิด, พฤติกรรม, ความคิดทางเลือก) |
| Situation Tags | ประเภทสถานการณ์ (ชื่อ, สี, ผู้สร้าง) |
| Emotions | อารมณ์ 28 หมวดหมู่ (ชื่อ EN/TH, หมวดหมู่, สี) |
| Emotion Analysis Results | ผลวิเคราะห์อารมณ์ (input, translated text, primary emotion, timestamp) |
| Sub Emotion Analysis | อารมณ์ย่อย (confidence %, score) |
| Feedback | ข้อเสนอแนะจากนักจิตวิทยา (หัวข้อ, เนื้อหา, ช่วงวันที่) |
| Feedback Time | ช่วงเวลาของ feedback |
| Feedback Type | ประเภทของ feedback |

---

## 🚀 Getting Started

### Prerequisites
- **Go** (1.20+)
- **Node.js** (18+)
- **npm**

### Backend Setup
```bash
cd backend
go mod download
go run main.go

### Frontend Setup
```bash
cd frontend
npm install
npm run dev

### Environment Variables
```bash
สร้างไฟล์ .env ใน frontend/ directory:
VITE_API_URL=<backend-api-url>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
VITE_HUGGINGFACE_API_KEY=<your-huggingface-api-key>
VITE_GOOGLE_TRANSLATE_API_KEY=<your-google-translate-api-key>
