import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useDiary } from "../../contexts/DiaryContext";
import type { DiaryInterface } from "../../interfaces/IDiary";
import { usePath } from "../../contexts/PathContext";
import { colorOptions } from "../../constants/colors";
import { useMediaQuery } from "react-responsive";

import { FloatButton, Modal } from "antd";
import {
  CloseOutlined,
  CommentOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
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
import DiarySidebar from "./DiarySidebar";
import DiaryFeedback from "./DiaryFeedback";
import ColorPickerTooltip from "../../components/color-picker-tooltip/ColorPickerTooltip";
import { useTherapyCase } from "../../contexts/TherapyCaseContext";
import "./DiaryDetail.css";
import EmotionDisplay from "../../components/emotion-display/EmotionDisplay";

function DiaryDetail() {
  const patientId = Number(localStorage.getItem("id"));
  const { id } = useParams();
  const { basePath } = usePath();
  const { diaries, updateDiary, createDiary } = useDiary();
  const { getTherapyCaseByPatient } = useTherapyCase();

  // console.log("Diaries in DiaryDetail:", diaries);

  const [speechLang, setSpeechLang] = useState("th-TH");

  // state สำหรับเก็บ diary ปัจจุบัน, ต้นฉบับ, และสถานะการแก้ไข
  const [diary, setDiary] = useState<DiaryInterface>();
  const [originalDiary, setOriginalDiary] = useState<DiaryInterface>();
  const [isModified, setIsModified] = useState(false);

  const [fullscreen, setFullscreen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Tablet แนวตั้ง (ไม่เกิน 1024px) และ Mobile แนวตั้ง (ไม่เกิน 768px)
  const isTabletPortrait = useMediaQuery({
    query: "(max-width: 1024px) and (orientation: portrait)",
  });
  const isMobilePortrait = useMediaQuery({
    query: "(max-width: 768px) and (orientation: portrait)",
  });

  // ฟังก์ชันเมื่อเลือกไอเท็มใน Sidebar
  const handleSelectDiary = (diaryId: number) => {
    navigate(`${basePath}/${diaryId}`);
    // บนมือถือให้เปิด Editor แบบเต็มจออัตโนมัติ
    if (isMobilePortrait) {
      setFullscreen(true);
      setShowFeedback(false);
    }
    // if (isTabletPortrait) {
    //   setFullscreen(true);
    //   setShowFeedback(false);
    // }
  };

  // แก้ไข: ใช้ object แทน array สำหรับ tagColors
  const [tagColors, setTagColors] = useState({
    TagColor1: "",
    TagColor2: "",
    TagColor3: "",
  });

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

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
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
    ],
    content: '<p style="text-align: left;"></p>',
    editable: diary ? !diary.Confirmed : true,
  });

  // ฟังก์ชันบันทึกข้อมูล diary
  const handleSave = async () => {
    if (!editor || !diary || diary.ID === undefined) return;

    // หยุดการบันทึกเสียงถ้ายังฟังอยู่
    if (listening) {
      SpeechRecognition.stopListening();
      resetTranscript();
    }

    const updatedDiary: DiaryInterface = {
      ...diary,
      Content: editor.getHTML(),
      TagColor1: tagColors.TagColor1,
      TagColor2: tagColors.TagColor2,
      TagColor3: tagColors.TagColor3,
    };

    const success = await updateDiary(diary.ID, updatedDiary);
    if (success) {
      setDiary(updatedDiary);
      setOriginalDiary(updatedDiary);
      editor.commands.setContent(updatedDiary.Content || "<p></p>");
      setIsModified(false);
    }
  };

  // ฟังก์ชันสร้างไดอารี่ใหม่
  const handleCreateDiary = async () => {
    const therapyCases = await getTherapyCaseByPatient(patientId);
    if (!therapyCases || typeof therapyCases.ID === "undefined") {
      return;
    }

    const newDiary: DiaryInterface = {
      Title: "ไดอารี่ใหม่",
      Content: '<p style="text-align: left;"></p>',
      TherapyCaseID: therapyCases.ID,
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

    // ตรวจสอบการเปลี่ยนแปลงของ tagColors
    const colorsChanged =
      tagColors.TagColor1 !== (originalDiary.TagColor1 || "") ||
      tagColors.TagColor2 !== (originalDiary.TagColor2 || "") ||
      tagColors.TagColor3 !== (originalDiary.TagColor3 || "");

    setIsModified(contentChanged || titleChanged || colorsChanged);
  }, [editor, diary, originalDiary, tagColors]);

  useEffect(() => {
    if (editor && diary) {
      editor.setEditable(!diary.Confirmed);
    }
  }, [editor, diary?.Confirmed]);

  // โหลด diary ตาม id ที่เลือก
  useEffect(() => {
    if (!id || !editor || diaries.length === 0) return;
    const found = diaries.find((d) => d.ID === Number(id));
    if (found) {
      setDiary(found);
      setOriginalDiary(found);
      editor.commands.clearContent();
      editor.commands.setContent(
        found.Content?.trim()
          ? found.Content
          : '<p style="text-align: left;"></p>'
      );

      // ตั้งค่า tagColors จากข้อมูลที่โหลดมา
      setTagColors({
        TagColor1: found.TagColor1 || "",
        TagColor2: found.TagColor2 || "",
        TagColor3: found.TagColor3 || "",
      });

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
      const prevLength = prevTranscriptRef.current.length;
      const newText = transcript.slice(prevLength).trim();
      if (newText) {
        editor.chain().focus().insertContent(newText).run();
        prevTranscriptRef.current = transcript;
        setIsModified(true);

        // Reset transcript after delay
        setTimeout(() => {
          resetTranscript();
          prevTranscriptRef.current = "";
        }, 5000);
      }
    }
  }, [transcript, editor]);

  // แก้ไข: อัปเดต tagColors เมื่อ diary เปลี่ยน
  useEffect(() => {
    if (diary) {
      setTagColors({
        TagColor1: diary.TagColor1 || "",
        TagColor2: diary.TagColor2 || "",
        TagColor3: diary.TagColor3 || "",
      });
    }
  }, [diary?.ID]); // ใช้ diary?.ID แทน diary เพื่อหลีกเลี่ยง infinite loop

  // ฟังก์ชันสำหรับอัปเดต tagColors
  const handleTagColorsChange = (newColors: string[]) => {
    const updatedTagColors = {
      TagColor1: newColors[0] || "",
      TagColor2: newColors[1] || "",
      TagColor3: newColors[2] || "",
    };
    setTagColors(updatedTagColors);

    // อัปเดต diary state ด้วย
    if (diary) {
      setDiary({
        ...diary,
        TagColor1: updatedTagColors.TagColor1,
        TagColor2: updatedTagColors.TagColor2,
        TagColor3: updatedTagColors.TagColor3,
      });
    }
  };

  // ฟังก์ชันรีเซ็ต tagColors
  const handleResetTagColors = () => {
    if (originalDiary) {
      const resetColors = {
        TagColor1: originalDiary.TagColor1 || "",
        TagColor2: originalDiary.TagColor2 || "",
        TagColor3: originalDiary.TagColor3 || "",
      };
      setTagColors(resetColors);

      if (diary) {
        setDiary({
          ...diary,
          TagColor1: resetColors.TagColor1,
          TagColor2: resetColors.TagColor2,
          TagColor3: resetColors.TagColor3,
        });
      }
    }
  };

  // ถ้าไม่มี diary หรือ editor ให้ return null
  if (!diary || !editor) return null;

  // // แปลง tagColors object เป็น array สำหรับ ColorPickerTooltip
  const tagColorsArray = [
    tagColors.TagColor1,
    tagColors.TagColor2,
    tagColors.TagColor3,
  ].filter((color) => color !== ""); // กรองเฉพาะสีที่มีค่า

  return (
    <section className="diary-detail-container">
      {!browserSupportsSpeechRecognition && (
        <div className="speech-recognition-warning">
          Browser does not support speech recognition.
        </div>
      )}
      <div className="diary-detail-content">
        {/* ========== Desktop (≥ 1025px หรือไม่ใช่แนวตั้ง) — 3 ส่วนเหมือนเดิม ========== */}
        {!isTabletPortrait && !isMobilePortrait && (
          <>
            {/* Left Sidebar */}
            <section className={`sidebar-anim${fullscreen ? " hide" : ""}`}>
              <DiarySidebar onSelectDiary={handleSelectDiary} />
            </section>

            {/* Right Editor */}
            <section
              className={`diary-editor${fullscreen ? " fullscreen" : ""}${
                showFeedback ? " with-feedback" : ""
              }`}
            >
              {/* ====== กล่องหัวเรื่อง + ปุ่ม Save + ColorPicker (ของเดิมทั้งหมด) ====== */}
              <div className="title-container">
                <div className="title">
                  <h1>ชื่อเรื่อง</h1>
                  <input
                    type="text"
                    value={diary.Title}
                    onChange={(e) =>
                      setDiary({ ...diary, Title: e.target.value })
                    }
                    placeholder="พิมพ์ชื่อเรื่องที่นี่"
                    disabled={diary.Confirmed}
                  />
                </div>

                <div className="title-container-action">
                  <EmotionDisplay
                    emotionAnalysisResults={diary.EmotionAnalysisResults || []}
                    maxDisplay={3} // จำนวนอารมณ์สูงสุดที่จะแสดง (optional, default = 3)
                    diary={diary}
                  />
                  
                  <ColorPickerTooltip
                    colorOptions={colorOptions}
                    selectedColors={tagColorsArray}
                    onChange={handleTagColorsChange}
                    onReset={handleResetTagColors}
                  />

                  <button
                    onClick={() => setIsConfirmModalVisible(true)}
                    title="Save"
                    className="diary-save-btn"
                    disabled={
                      diary.Confirmed ||
                      !isModified ||
                      !diary?.Title?.trim() ||
                      !editor.getText().trim()
                    }
                  >
                    {diary.Confirmed ? "ยืนยันแล้ว" : "บันทึก"}
                  </button>
                </div>

                <Modal
                  title="ยืนยันการบันทึก"
                  open={isConfirmModalVisible}
                  centered
                  onOk={() => {
                    handleSave();
                    setIsConfirmModalVisible(false);
                  }}
                  onCancel={() => setIsConfirmModalVisible(false)}
                  okText="ยืนยัน"
                  cancelText="ยกเลิก"
                >
                  <p>
                    หลังจากบันทึกเสร็จสิ้นเรียบร้อยจะไม่สามารถกลับมาแก้ไขหรือลบไดอารี่ได้อีก
                  </p>
                  <p>คุณต้องการบันทึกไดอารี่นี้หรือไม่?</p>
                </Modal>
              </div>

              {/* Toolbar */}
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
                onSpeechToText={(lang) =>
                  listening
                    ? SpeechRecognition.stopListening()
                    : SpeechRecognition.startListening({
                        language: lang,
                        continuous: true,
                        interimResults: true,
                      })
                }
                isRecording={listening}
                browserSupportsSpeechRecognition={
                  browserSupportsSpeechRecognition
                }
                confirmSave={diary.Confirmed}
                speechLang={speechLang}
                setSpeechLang={setSpeechLang}
              />

              {/* Editor */}
              <EditorContent editor={editor} className="editor-content" />
            </section>

            {/* Feedback */}
            <section
              className={`diary-feedback-container${
                showFeedback ? "" : " hide"
              }`}
            >
              <DiaryFeedback onClose={() => setShowFeedback(false)} />
            </section>
          </>
        )}

        {/* ========== Tablet แนวตั้ง (≤ 1024px) — แสดง 2 ส่วน: Sidebar + (Editor หรือ Feedback) ========== */}
        {isTabletPortrait && !isMobilePortrait && (
          <>
            {/* Left Sidebar */}
            <section className="sidebar-anim">
              <DiarySidebar onSelectDiary={handleSelectDiary} />
            </section>

            {/* Right: สลับ Editor หรือ Feedback ให้กินที่เต็มฝั่งขวา */}
            {!showFeedback ? (
              <section className="diary-editor">
                {/* ====== กล่องหัวเรื่อง + ปุ่ม Save + ColorPicker (ของเดิมทั้งหมด) ====== */}
                <div className="title-container">
                  <div className="title">
                    <h1>ชื่อเรื่อง</h1>
                    <input
                      type="text"
                      value={diary.Title}
                      onChange={(e) =>
                        setDiary({ ...diary, Title: e.target.value })
                      }
                      placeholder="พิมพ์ชื่อเรื่องที่นี่"
                      disabled={diary.Confirmed}
                    />
                  </div>

                  <div className="title-container-action">
                    <ColorPickerTooltip
                      colorOptions={colorOptions}
                      selectedColors={tagColorsArray}
                      onChange={handleTagColorsChange}
                      onReset={handleResetTagColors}
                    />

                    <button
                      onClick={() => setIsConfirmModalVisible(true)}
                      title="Save"
                      className="diary-save-btn"
                      disabled={
                        diary.Confirmed ||
                        !isModified ||
                        !diary?.Title?.trim() ||
                        !editor.getText().trim()
                      }
                    >
                      {diary.Confirmed ? "ยืนยันแล้ว" : "บันทึก"}
                    </button>
                  </div>

                  <Modal
                    title="ยืนยันการบันทึก"
                    open={isConfirmModalVisible}
                    centered
                    onOk={() => {
                      handleSave();
                      setIsConfirmModalVisible(false);
                    }}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    okText="ยืนยัน"
                    cancelText="ยกเลิก"
                  >
                    <p>
                      หลังจากบันทึกเสร็จสิ้นเรียบร้อยจะไม่สามารถกลับมาแก้ไขหรือลบไดอารี่ได้อีก
                    </p>
                    <p>คุณต้องการบันทึกไดอารี่นี้หรือไม่?</p>
                  </Modal>
                </div>

                <Toolbar
                  editor={editor}
                  fullscreen={false} // tablet ไม่ใช้ fullscreen overlay
                  onToggleFullscreen={() => {}}
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
                  onSpeechToText={(lang) =>
                    listening
                      ? SpeechRecognition.stopListening()
                      : SpeechRecognition.startListening({
                          language: lang,
                          continuous: true,
                          interimResults: true,
                        })
                  }
                  isRecording={listening}
                  browserSupportsSpeechRecognition={
                    browserSupportsSpeechRecognition
                  }
                  confirmSave={diary.Confirmed}
                  speechLang={speechLang}
                  setSpeechLang={setSpeechLang}
                />

                <EditorContent editor={editor} className="editor-content" />
              </section>
            ) : (
              <section className="diary-feedback-container">
                <DiaryFeedback onClose={() => setShowFeedback(false)} />
              </section>
            )}
          </>
        )}

        {/* ========== Mobile แนวตั้ง (≤ 768px) — แสดงทีละ 1 ส่วนเต็มจอ ========== */}
        {isMobilePortrait && (
          <>
            {fullscreen ? (
              // แสดง Editor เต็มจอ
              <section className="diary-editor fullscreen">
                {/* ====== กล่องหัวเรื่อง + ปุ่ม Save + ColorPicker (ของเดิมทั้งหมด) ====== */}
                <div className="title-container">
                  <div className="title">
                    <h1>ชื่อเรื่อง</h1>
                    <input
                      type="text"
                      value={diary.Title}
                      onChange={(e) =>
                        setDiary({ ...diary, Title: e.target.value })
                      }
                      placeholder="พิมพ์ชื่อเรื่องที่นี่"
                      disabled={diary.Confirmed}
                    />
                  </div>

                  <div className="title-container-action">
                    <ColorPickerTooltip
                      colorOptions={colorOptions}
                      selectedColors={tagColorsArray}
                      onChange={handleTagColorsChange}
                      onReset={handleResetTagColors}
                    />

                    <button
                      onClick={() => setIsConfirmModalVisible(true)}
                      title="Save"
                      className="diary-save-btn"
                      disabled={
                        diary.Confirmed ||
                        !isModified ||
                        !diary?.Title?.trim() ||
                        !editor.getText().trim()
                      }
                    >
                      {diary.Confirmed ? "ยืนยันแล้ว" : "บันทึก"}
                    </button>
                  </div>

                  <Modal
                    title="ยืนยันการบันทึก"
                    open={isConfirmModalVisible}
                    centered
                    onOk={() => {
                      handleSave();
                      setIsConfirmModalVisible(false);
                    }}
                    onCancel={() => setIsConfirmModalVisible(false)}
                    okText="ยืนยัน"
                    cancelText="ยกเลิก"
                  >
                    <p>
                      หลังจากบันทึกเสร็จสิ้นเรียบร้อยจะไม่สามารถกลับมาแก้ไขหรือลบไดอารี่ได้อีก
                    </p>
                    <p>คุณต้องการบันทึกไดอารี่นี้หรือไม่?</p>
                  </Modal>
                </div>

                <Toolbar
                  editor={editor}
                  fullscreen={true}
                  onToggleFullscreen={() => setFullscreen(false)} // ปิดเพื่อกลับไป Sidebar
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
                  onSpeechToText={(lang) =>
                    listening
                      ? SpeechRecognition.stopListening()
                      : SpeechRecognition.startListening({
                          language: lang,
                          continuous: true,
                          interimResults: true,
                        })
                  }
                  isRecording={listening}
                  browserSupportsSpeechRecognition={
                    browserSupportsSpeechRecognition
                  }
                  confirmSave={diary.Confirmed}
                  speechLang={speechLang}
                  setSpeechLang={setSpeechLang}
                />

                <EditorContent editor={editor} className="editor-content" />
              </section>
            ) : showFeedback ? (
              // แสดง Feedback เต็มจอ
              <section className="diary-feedback-container fullscreen">
                <DiaryFeedback onClose={() => setShowFeedback(false)} />
              </section>
            ) : (
              // แสดง Sidebar เต็มจอ
              <section className="sidebar-anim fullscreen">
                <DiarySidebar onSelectDiary={handleSelectDiary} />
              </section>
            )}
          </>
        )}

        {/* Float button สำหรับฟังก์ชันเสริม */}
        <FloatButton.Group
          trigger="hover"
          type="primary"
          className="diary-float-button"
          icon={<PlusOutlined />}
        >
          <FloatButton icon={<EditOutlined />} onClick={handleCreateDiary} />
          <FloatButton
            icon={showFeedback ? <CloseOutlined /> : <CommentOutlined />}
            onClick={() => setShowFeedback((prev) => !prev)}
          />
        </FloatButton.Group>
      </div>
    </section>
  );
}

export default DiaryDetail;
