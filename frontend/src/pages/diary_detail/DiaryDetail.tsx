import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { usePath } from "../../contexts/PathContext";
import { useDate } from "../../contexts/DateContext";
import { FloatButton } from "antd";
import { CommentOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { th } from "date-fns/locale";
import useSpeechToText from "../../hooks/useSpeechToText";

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
import { IoChevronBackOutline } from "react-icons/io5";
import { SlOptions } from "react-icons/sl";
import { groupByDate } from "../../utils/GroupByDate";
import "./DiaryDetail.css";

function DiaryDetail() {
  // ดึง id จาก URL
  const { id } = useParams();
  // ดึงข้อมูล diary และฟังก์ชันอัปเดต diary จาก context
  const { diaries, updateDiary } = useDiary();
  // ดึง path และฟังก์ชันจัดการ path
  const { basePath, getBackPath } = usePath();
  // ฟังก์ชันจัดรูปแบบวันที่
  const { formatShort } = useDate();

  // state สำหรับเก็บ diary ปัจจุบัน, ต้นฉบับ, และสถานะการแก้ไข
  const [diary, setDiary] = useState<DiaryInterface | null>(null);
  const [originalDiary, setOriginalDiary] = useState<DiaryInterface | null>(null);
  const [isModified, setIsModified] = useState(false);

  // จัดกลุ่ม diary ตามวันที่
  const grouped = groupByDate(diaries, "UpdatedAt", th);

  // ใช้งาน speech-to-text hook
  const { text, startListening, stopListening, isRecording } = useSpeechToText();

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
    content: "",
  });

  // ฟังก์ชันบันทึกข้อมูล diary
  const handleSave = () => {
    if (!editor || !diary || diary.ID === undefined) return;
    const updatedDiary = {
      ...diary,
      Content: editor.getHTML(),
    };
    updateDiary(diary.ID, updatedDiary);
    setDiary(updatedDiary);
    setOriginalDiary(updatedDiary);
    setIsModified(false);
  };

  // ป้องกัน insert ข้อความซ้ำจาก speech-to-text
  const prevTextRef = useRef("");
  useEffect(() => {
    if (text && editor) {
      // หาข้อความใหม่ที่ยังไม่เคย insert
      const newText = text.replace(prevTextRef.current, "").trim();
      if (newText) {
        editor.chain().focus().insertContent(newText + " ").run();
        prevTextRef.current = text;
      }
    }
  }, [text, editor]);

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

  // ตรวจสอบการเปลี่ยนแปลงของเนื้อหาและชื่อเรื่อง
  const checkChanges = useCallback(() => {
    if (!editor || !originalDiary || !diary) return;
    const contentChanged = editor.getHTML() !== originalDiary.Content;
    const titleChanged = diary.Title !== originalDiary.Title;
    setIsModified(contentChanged || titleChanged);
  }, [editor, diary, originalDiary]);

  // ติดตามการเปลี่ยนแปลงใน editor เพื่ออัปเดตสถานะ isModified
  useEffect(() => {
    if (!editor || !diary || !originalDiary) return;
    checkChanges();
    editor.on("update", checkChanges);
    return () => {
      editor.off("update", checkChanges);
    };
  }, [editor, diary, originalDiary, checkChanges]);

  // ถ้าไม่มี diary หรือ editor ให้ return null
  if (!diary || !editor) return null;

  return (
    <section className="diary-detail-container">
      {/* left side bar */}
      <aside className="left-side">
        <div className="control">
          {/* ปุ่มย้อนกลับ */}
          <Link to={`${getBackPath(2)}`} className="back-container">
            <IoChevronBackOutline />
            <strong>Back</strong>
          </Link>
          <SlOptions />
        </div>
        {/* วนลูปแสดงกลุ่ม diary ตามวันที่ */}
        {Object.entries(grouped).map(([label, items]) => (
          <div key={label} className="diary-group">
            <h2>{label}</h2>
            {items.map((item) => {
              const isActive = Number(id) === item.ID;
              return (
                <Link
                  className={`left-side-diary ${isActive ? "active" : ""}`}
                  key={item.ID}
                  to={`${basePath}/${item.ID}`}
                >
                  <div className="left-side-diary-info">
                    <header>
                      <h1>{item.Title}</h1>
                      <p>{item.UpdatedAt && formatShort(item.UpdatedAt)}</p>
                    </header>
                    <div
                      className="content"
                      dangerouslySetInnerHTML={{ __html: item.Content ?? "" }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </aside>

      {/* right text editor */}
      <section className="right-side">
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
              !isModified ||
              !diary.Title.trim() ||
              !editor.getText().trim()
            }
          >
            Save
          </button>
        </div>
        <hr />
        {/* Toolbar สำหรับจัดการ editor และปุ่มบันทึกเสียง */}
        <Toolbar
          editor={editor}
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
          onSpeechToText={() => (isRecording ? stopListening() : startListening())}
          isRecording={isRecording}
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
        <FloatButton icon={<EditOutlined />} />
        <FloatButton icon={<CommentOutlined />} />
      </FloatButton.Group>
    </section>
  );
}

export default DiaryDetail;