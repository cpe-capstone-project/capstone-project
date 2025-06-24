// import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  RiBold,
  RiItalic,
  RiStrikethrough,
  RiListOrdered,
  RiListUnordered,
  RiSeparator,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiAlignLeft,
  RiAlignCenter,
  RiAlignRight,
  RiResetRightFill,
  RiMic2Line,
  RiFullscreenFill,
  RiFullscreenExitFill,
} from "react-icons/ri";
import { AiOutlineUnderline } from "react-icons/ai";
import { BiHighlight } from "react-icons/bi";
import { FiAlertTriangle } from "react-icons/fi";
import "./Toolbar.css";
import { useRef } from "react";

type ToolbarProps = {
  editor: Editor;
  onReset?: () => void;
  onSpeechToText?: () => void;
  isRecording?: boolean;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  browserSupportsSpeechRecognition?: boolean;
};

function Toolbar({
  editor,
  onReset,
  onSpeechToText,
  isRecording,
  fullscreen,
  onToggleFullscreen,
  browserSupportsSpeechRecognition,
}: ToolbarProps) {
  const canUndo = editor.can().undo();
  const canRedo = editor.can().redo();

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current) {
      // ป้องกัน scroll แนวตั้ง
      e.preventDefault();
      // แปลงการ scroll แนวตั้ง เป็นแนวนอน
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  if (!editor) return null;
  const isAlign = (align: string) =>
    editor.getAttributes("heading").textAlign === align ||
    editor.getAttributes("paragraph").textAlign === align;

  return (
    <div 
      className="toolbar"
      ref={scrollRef}
      onWheel={handleWheel}
    >
      {/* <section className="fullscreen-container">
        <button
          onClick={onToggleFullscreen}
          title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
          // style={{ marginRight: "var(--space-xl)" }}
        >
          {fullscreen ? <RiFullscreenExitFill /> : <RiFullscreenFill />}
        </button>
      </section> */}

      <section className="toolbar-container">
        <div className="fullscreen-container">
          <button
            onClick={onToggleFullscreen}
            title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
            // style={{ marginRight: "var(--space-xl)" }}
          >
            {fullscreen ? <RiFullscreenExitFill /> : <RiFullscreenFill />}
          </button>
        </div>
      
        <div className="undo-redo-container">
          {/* Undo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            title="Undo"
            disabled={!canUndo}
            className={!canUndo ? "disabled" : ""}
          >
            <RiArrowGoBackLine />
          </button>

          {/* Redo */}
          <button
            onClick={() => editor.chain().focus().redo().run()}
            title="Redo"
            disabled={!canRedo}
            className={!canRedo ? "disabled" : ""}
          >
            <RiArrowGoForwardLine />
          </button>
        </div>

        {/* Font Family */}
        {/* <select
          onChange={(e) =>
            editor.chain().focus().setFontFamily(e.target.value).run()
          }
          value={editor.getAttributes("textStyle").fontFamily || ""}
          title="Font"
        >
          <option value="">Default</option>
          <option value="'Prompt', sans-serif">Prompt (EN/TH)</option>
          <option value="'Sarabun', sans-serif">Sarabun (EN/TH)</option>
          <option value="'Noto Sans Thai', sans-serif">Noto Sans Thai</option>
          <option value="'Kanit', sans-serif">Kanit (Modern)</option>
          <option value="'Mitr', sans-serif">Mitr (Friendly)</option>
        </select> */}

        <div className="formatter-container">
          {/* Text Styles */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "active" : ""}
            title="Bold"
          >
            <RiBold />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "active" : ""}
            title="Italic"
          >
            <RiItalic />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={editor.isActive("strike") ? "active" : ""}
            title="Strikethrough"
          >
            <RiStrikethrough />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "active" : ""}
            title="Underline"
          >
            <AiOutlineUnderline />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={
              editor.isActive("highlight")
                ? "active highlight-btn"
                : "highlight-btn"
            }
            title="Highlight"
          >
            <BiHighlight />
          </button>
        </div>

        {/* Headings */}
        <select
          onChange={(e) => {
            const level = e.target.value;
            if (level === "") {
              editor.chain().focus().setParagraph().run();
            } else {
              const levelNum = Number(level) as 1 | 2 | 3;
              editor.chain().focus().toggleHeading({ level: levelNum }).run();
            }
          }}
          value={
            editor.isActive("heading", { level: 1 })
              ? "1"
              : editor.isActive("heading", { level: 2 })
              ? "2"
              : editor.isActive("heading", { level: 3 })
              ? "3"
              : ""
          }
          title="Heading"
        >
          <option value="">Paragraph</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>

        <div className="list-container">
          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "active" : ""}
            title="Ordered List"
          >
            <RiListOrdered />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive("bulletList") ? "active" : ""}
            title="Bullet List"
          >
            <RiListUnordered />
          </button>
        </div>

        <div className="alignments-container">
          {/* Alignments */}
          <button
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={isAlign("left") ? "active" : ""}
            title="Align Left"
          >
            <RiAlignLeft />
          </button>

          <button
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={isAlign("center") ? "active" : ""}
            title="Align Center"
          >
            <RiAlignCenter />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={isAlign("right") ? "active" : ""}
            title="Align Right"
          >
            <RiAlignRight />
          </button>
        </div>

        {/* Horizontal Rule */}
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <RiSeparator />
        </button>

        {/* Speech to Text */}
        <div className="speech-to-text-container">
          <button
            onClick={() => {
              if (!browserSupportsSpeechRecognition) {
                // setShowSpeechAlert(true);
                return;
              }
              if (onSpeechToText) onSpeechToText();
            }}
            title={
              !browserSupportsSpeechRecognition
                ? "Browser does not support speech recognition"
                : "Speech to Text"
            }
            className={isRecording ? "recording" : ""}
            style={isRecording ? { color: "red" } : {}}
          >
            <RiMic2Line
              className={isRecording ? "mic-animate" : ""}
              style={{
                color: !browserSupportsSpeechRecognition
                  ? "var(--color-yellow-alert)"
                  : undefined,
              }}
            />
            {!browserSupportsSpeechRecognition && (
              <FiAlertTriangle className="speech-warning-icon" />
            )}
            {isRecording && <span className="mic-dot"></span>}
          </button>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => {
            if (onReset) onReset();
          }}
          title="Reset"
          className="reset-btn"
        >
          <RiResetRightFill />
        </button>
      </section>
    </div>
  );
}

export default Toolbar;
