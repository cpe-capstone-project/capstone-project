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

```mermaid
graph TD
    FE["**Frontend**\nReact + TypeScript + Vite + Ant Design"]
    BE["**Backend**\nGo (Golang) REST API"]
    DB["**Database**\nSQLite"]

    FE <--> BE
    BE <--> DB

    BE --> GF["**Gemini Flash 2.5**\nSummary"]
    BE --> HF["**Hugging Face API**\nEmotion"]
    BE --> GCT["**Google Cloud Translation**\nTranslation"]
```
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

```
capstone-project/
├── backend/                  # Go Backend
│   ├── ai/                   # AI integration (Gemini, Emotion Analysis)
│   ├── config/               # Configuration files
│   ├── controller/           # Request handlers
│   ├── entity/               # Data models / entities
│   ├── middlewares/          # Authentication & middleware
│   ├── routers/              # API route definitions
│   ├── services/             # Business logic
│   ├── test/                 # Unit tests
│   ├── uploads/              # Uploaded files storage
│   ├── go.mod                # Go module definition
│   ├── go.sum                # Go dependencies checksum
│   └── main.go               # Application entry point
│
├── frontend/                 # React Frontend
│   ├── public/               # Static assets
│   ├── src/                  # Source code
│   ├── .env                  # Environment variables
│   ├── index.html            # Entry HTML
│   ├── package.json          # Node.js dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── vite.config.ts        # Vite configuration
│   └── eslint.config.js      # ESLint configuration
│
├── .gitignore
└── README.md
```

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

## 🗄️ Class Diagram

```mermaid
erDiagram
  Patients {
    int id PK
    string first_name
    string last_name
    date birthday
    string email
    string phone_number
    string address
    string password
    bool consent
    string image
    int age
    int psychologist_id FK
    int gender_id FK
    int role_id FK
  }

  Psychologists {
    int id PK
    string first_name
    string last_name
    date birthday
    string email
    string password
    string phone_number
    string address
    string medical_license
    string verify_code
    int age
    int gender_id FK
    int role_id FK
  }

  Admin {
    int id PK
    string first_name
    string last_name
    string email
    string password
    int role_id FK
  }

  Genders {
    int id PK
    string gender
  }

  Roles {
    int id PK
    string name
  }

  Checklist {
    int id PK
    date date
    string timezone
    string tasks
    string other
    string done
    int version
    int patient_id FK
  }

  Request {
    int id PK
    string type
    text detail
    string other
    date meeting_start
    date meeting_end
    int patient_id FK
    int psychologist_id FK
  }

  Feedback {
    int id PK
    string title
    string content
    date startdate
    date enddate
    int psychologist_id FK
    int patient_id FK
    int feedback_time_id FK
    int feedback_type_id FK
  }

  FeedbackTime {
    int id PK
    string name_time
  }

  FeedbackType {
    int id PK
    string name_type
  }

  FeedbackDiary {
    int id FK
    int feedback_id FK
    int diary_id FK
  }

  Diaries {
    int id PK
    string title
    string content
    date updated_at
    string tag_color1
    string tag_color2
    string tag_color3
    int therapy_case_id FK
  }

  DiarySummaryEntry {
    int id PK
    int diary_summary_id FK
    int diary_id FK
  }

  DiarySummaries {
    int id PK
    string time_frame
    date start_date
    date end_date
    string summary_text
    string keyword
    int therapy_case_id FK
  }

  TherapyCases {
    int id PK
    string title
    string description
    date start_date
    int patient_id FK
    int psychologist_id FK
    int status_id FK
  }

  CaseStatus {
    int id PK
    string name
  }

  ThoughtRecords {
    int id PK
    string situation
    string thought
    string behavior
    string alternate_thought
    int therapy_case_id FK
    int emotions_id FK
    int situation_tag_id FK
  }

  SituationTag {
    int id PK
    string situation_name
    string color
    bool user_create
  }

  ThoughtRecordEmotion {
    int emotion_id FK
    int thought_record_id FK
  }

  Emotions {
    int id PK
    string emotions_name
    float score
    string thai_name
    string category
    string emotions_color
  }

  EmotionAnalysisResults {
    int id PK
    string input_text
    string translated_text
    string primary_emotion
    date analysis_timestamp
    string model_version
    int diary_id FK
    int thought_record_id FK
    int patient_id FK
  }

  SubEmotionAnalysis {
    int id PK
    float confidence_percentage
    int emotion_analysis_result_id FK
    int emotion_id FK
  }

  Patients ||--o{ Checklist : has
  Patients ||--o{ Request : makes
  Patients ||--o{ Feedback : receives
  Patients ||--o{ Diaries : writes
  Patients ||--o{ EmotionAnalysisResults : has
  Patients ||--|| Genders : has
  Patients ||--|| Roles : has
  Patients }o--|| Psychologists : assigned-to

  Psychologists ||--o{ Request : handles
  Psychologists ||--o{ Feedback : gives
  Psychologists ||--o{ TherapyCases : manages
  Psychologists ||--|| Genders : has
  Psychologists ||--|| Roles : has

  Admin ||--|| Roles : has

  Feedback ||--|| FeedbackTime : has
  Feedback ||--|| FeedbackType : has
  Feedback ||--o{ FeedbackDiary : links

  FeedbackDiary ||--|| Diaries : references

  Diaries ||--o{ DiarySummaryEntry : has
  Diaries ||--|| TherapyCases : belongs-to
  DiarySummaryEntry }o--|| DiarySummaries : part-of

  DiarySummaries ||--|| TherapyCases : linked-to

  TherapyCases ||--|| CaseStatus : has
  TherapyCases ||--o{ ThoughtRecords : contains

  ThoughtRecords ||--o{ ThoughtRecordEmotion : has
  ThoughtRecords ||--|| SituationTag : tagged-with
  ThoughtRecords ||--|| Emotions : uses

  ThoughtRecordEmotion ||--|| Emotions : references

  EmotionAnalysisResults ||--o{ SubEmotionAnalysis : contains
  EmotionAnalysisResults ||--|| Diaries : from
  EmotionAnalysisResults ||--|| ThoughtRecords : from

  SubEmotionAnalysis ||--|| Emotions : references
```


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
```

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
```
### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
### Environment Variables
```bash
สร้างไฟล์ .env ใน frontend/ directory:
VITE_API_URL=<backend-api-url>
VITE_GEMINI_API_KEY=<your-gemini-api-key>
VITE_HUGGINGFACE_API_KEY=<your-huggingface-api-key>
VITE_GOOGLE_TRANSLATE_API_KEY=<your-google-translate-api-key>
