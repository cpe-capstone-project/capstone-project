import { useState, useEffect, useCallback, useRef } from "react";
// import { useParams, Link } from "react-router";
import { useNavigate, useParams } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { usePath } from "../../contexts/PathContext";
// import { useDate } from "../../contexts/DateContext";
import { FloatButton } from "antd";
import { CommentOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
// import { th } from "date-fns/locale";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

// TipTap Extensions
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";

// Components & Styles
import Toolbar from "../../components/text-editor/Toolbar";
// import { IoChevronBackOutline } from "react-icons/io5";
// import { SlOptions } from "react-icons/sl";
// import { groupByDate } from "../../utils/GroupByDate";
import DiarySidebar from "./DiarySidebar";
import "./DiaryDetail.css";
// import { RiFullscreenFill, RiFullscreenExitFill } from "react-icons/ri";

function DiaryDetail() {
  // ดึง id จาก URL
  const { id } = useParams();
  // ดึง path และฟังก์ชันจัดการ path
  const { basePath } = usePath();
  // ดึงข้อมูล diary และฟังก์ชันอัปเดต diary จาก context
  const { diaries, updateDiary, createDiary } = useDiary();

  // state สำหรับเก็บ diary ปัจจุบัน, ต้นฉบับ, และสถานะการแก้ไข
  const [diary, setDiary] = useState<DiaryInterface>();
  const [originalDiary, setOriginalDiary] = useState<DiaryInterface>();
  const [isModified, setIsModified] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);

  const navigate = useNavigate();

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();
  const prevTranscriptRef = useRef("");

  // ใช้สำหรับลบ space หรือ whitespace ที่อยู่ก่อนปิดแท็ก <p>
  function normalizeHTML(html: string) {
    return html.trim().replace(/\s+(<\/\w+>)/g, "$1");
  }

  // สร้าง editor ด้วย TipTap และกำหนด extension ที่ต้องการ
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      Underline,
      Highlight,
      TiptapLink.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "<p></p>",
  });

  // ฟังก์ชันบันทึกข้อมูล diary
  const handleSave = async () => {
    if (!editor || !diary || diary.ID === undefined) return;
    // หยุดการบันทึกเสียงถ้ายังฟังอยู่
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }

    const updatedDiary = {
      ...diary,
      Content: editor.getHTML(),
    };

    const success = await updateDiary(diary.ID, updatedDiary);
    if (success) {
      setDiary(updatedDiary);
      setOriginalDiary(updatedDiary);
      editor.commands.setContent(updatedDiary.Content || "<p></p>");
      // requestAnimationFrame(() => checkChanges());
    } else {
      // message.error("Failed to save diary.");
    }
  };

  // ฟังก์ชันสร้างไดอารี่ใหม่
  const handleCreateDiary = async () => {
    const newDiary: DiaryInterface = {
      Title: "New Diary",
      Content: "<p></p>",
      TherapyCaseID: 1,
      // เพิ่ม field อื่นๆ ตามที่จำเป็น เช่น วันที่, ผู้ใช้ ฯลฯ
    };
    const res = await createDiary(newDiary);
    if (res) {
      navigate(`${basePath}/${res.ID}`);
    }
  };

  // ตรวจสอบการเปลี่ยนแปลงของเนื้อหาและชื่อเรื่อง
  const checkChanges = useCallback(() => {
    if (!editor || !originalDiary || !diary) return;
    const currentContent = normalizeHTML(editor.getHTML());
    const originalContent = normalizeHTML(originalDiary.Content ?? "");
    const contentChanged = currentContent !== originalContent;
    const titleChanged = diary.Title !== originalDiary.Title;
    setIsModified(contentChanged || titleChanged);
  }, [editor, diary, originalDiary]);

  // โหลด diary ตาม id ที่เลือก
  useEffect(() => {
    if (!id || !editor || diaries.length === 0) return;
    const found = diaries.find((d) => d.ID === Number(id));
    if (found) {
      setDiary(found);
      setOriginalDiary(found);
      editor.commands.clearContent();
      editor.commands.setContent(found.Content || "<p></p>");
      setIsModified(false);
    }
  }, [id, diaries, editor]);

  // Subscribe editor update event เพียงอันเดียว
  useEffect(() => {
    if (!editor) return;
    checkChanges();
    editor.on("update", checkChanges);
    return () => {
      editor.off("update", checkChanges);
    };
  }, [editor, checkChanges]);

  // Insert ข้อความจาก speech-to-text และอัปเดต isModified ทันที
  useEffect(() => {
    if (transcript && editor) {
      const newText = transcript.replace(prevTranscriptRef.current, "").trim();

      // ป้องกันข้อความซ้ำ
      if (newText && newText !== prevTranscriptRef.current.trim()) {
        editor.chain().focus().insertContent(newText).run();
        prevTranscriptRef.current = transcript;
        setIsModified(true);

        // รอ 5 วินาที ค่อย reset
        setTimeout(() => {
          resetTranscript();
        }, 5000);
      }
    }
  }, [transcript, editor]);

  // ถ้าไม่มี diary หรือ editor ให้ return null
  if (!diary || !editor) return null;

  return (
    <section className="diary-detail-container">
      {!browserSupportsSpeechRecognition && (
        <div className="speech-recognition-warning">
          Browser does not support speech recognition.
        </div>
      )}
      <div className="diary-detail-content">
        {/* left side bar */}
        <div className={`sidebar-anim${fullscreen ? " hide" : ""}`}>
          <DiarySidebar />
        </div>

        {/* right text editor */}
        <section className={`right-side${fullscreen ? " fullscreen" : ""}`}>
          <div className="title-container">
            <div className="title">
              <h1>Title</h1>
              {/* กล่องแก้ไขชื่อเรื่อง */}
              <input
                type="text"
                value={diary.Title}
                onChange={(e) => setDiary({ ...diary, Title: e.target.value })}
              />
            </div>
            {/* ปุ่มบันทึก */}
            <button
              onClick={handleSave}
              title="Save"
              className="diary-save-btn"
              disabled={
                !isModified || !diary?.Title?.trim() || !editor.getText().trim()
              }
            >
              Save
            </button>
          </div>
          <hr />
          {/* Toolbar สำหรับจัดการ editor และปุ่มบันทึกเสียง */}
          <Toolbar
            editor={editor}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen((f) => !f)}
            onReset={() => {
              if (editor) {
                editor.commands.clearContent();
                if (diary) {
                  const updatedDiary = { ...diary, Content: "<p></p>" };
                  setDiary(updatedDiary);
                }
                setIsModified(true);
              }
            }}
            onSpeechToText={
              listening
                ? () => SpeechRecognition.stopListening()
                : () =>
                    SpeechRecognition.startListening({
                      language: "th-TH",
                      continuous: true,
                    })
            }
            isRecording={listening}
            browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
          />
          {/* พื้นที่แสดง editor */}
          <EditorContent editor={editor} className="editor-content" />
        </section>
        {/* Float button สำหรับฟังก์ชันเสริม */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          className="diary-float-button"
          icon={<PlusOutlined />}
        >
          <FloatButton icon={<EditOutlined />} onClick={handleCreateDiary} />
          <FloatButton icon={<CommentOutlined />} />
        </FloatButton.Group>
      </div>
    </section>
  );
}

export default DiaryDetail;
