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
import { Tooltip } from "antd";

type ToolbarProps = {
  editor: Editor;
  onReset?: () => void;
  onSpeechToText?: () => void;
  isRecording?: boolean;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
  browserSupportsSpeechRecognition?: boolean;
  confirmSave?: boolean;
};

function Toolbar({
  editor,
  onReset,
  onSpeechToText,
  isRecording,
  fullscreen,
  onToggleFullscreen,
  browserSupportsSpeechRecognition,
  confirmSave,
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
    <div className="toolbar" ref={scrollRef} onWheel={handleWheel}>
      <section className="toolbar-container">
        <div className="fullscreen-container">
          <Tooltip title={fullscreen ? "Exit Fullscreen" : "Fullscreen"}>
            <button onClick={onToggleFullscreen}>
              {fullscreen ? <RiFullscreenExitFill /> : <RiFullscreenFill />}
            </button>
          </Tooltip>
        </div>

        <div className="undo-redo-container">
          <Tooltip title="Undo">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!canUndo || confirmSave}
              className={!canUndo ? "disabled" : ""}
            >
              <RiArrowGoBackLine />
            </button>
          </Tooltip>
          <Tooltip title="Redo">
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!canRedo || confirmSave}
              className={!canRedo ? "disabled" : ""}
            >
              <RiArrowGoForwardLine />
            </button>
          </Tooltip>
        </div>

        <div className="formatter-container">
          <Tooltip title="Bold">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiBold />
            </button>
          </Tooltip>
          <Tooltip title="Italic">
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiItalic />
            </button>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive("strike") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiStrikethrough />
            </button>
          </Tooltip>
          <Tooltip title="Underline">
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={editor.isActive("underline") ? "active" : ""}
              disabled={confirmSave}
            >
              <AiOutlineUnderline />
            </button>
          </Tooltip>
          <Tooltip title="Highlight">
            <button
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              className={
                editor.isActive("highlight")
                  ? "active highlight-btn"
                  : "highlight-btn"
              }
              disabled={confirmSave}
            >
              <BiHighlight />
            </button>
          </Tooltip>
        </div>

        <Tooltip title="Heading">
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
            disabled={confirmSave}
          >
            <option value="">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </Tooltip>

        <div className="list-container">
          <Tooltip title="Ordered List">
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiListOrdered />
            </button>
          </Tooltip>
          <Tooltip title="Bullet List">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiListUnordered />
            </button>
          </Tooltip>
        </div>

        <div className="alignments-container">
          <Tooltip title="Align Left">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={isAlign("left") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiAlignLeft />
            </button>
          </Tooltip>
          <Tooltip title="Align Center">
            <button
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={isAlign("center") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiAlignCenter />
            </button>
          </Tooltip>
          <Tooltip title="Align Right">
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={isAlign("right") ? "active" : ""}
              disabled={confirmSave}
            >
              <RiAlignRight />
            </button>
          </Tooltip>
        </div>

        <Tooltip title="Horizontal Rule">
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            disabled={confirmSave}
          >
            <RiSeparator />
          </button>
        </Tooltip>

        <div className="speech-to-text-container">
          <Tooltip
            title={
              !browserSupportsSpeechRecognition
                ? "Browser does not support speech recognition"
                : "Speech to Text"
            }
          >
            <button
              onClick={() => {
                if (!browserSupportsSpeechRecognition) {
                  return;
                }
                if (onSpeechToText) onSpeechToText();
              }}
              className={isRecording ? "recording" : ""}
              style={isRecording ? { color: "red" } : {}}
              disabled={confirmSave}
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
          </Tooltip>
        </div>

        <Tooltip title="Reset">
          <button
            onClick={() => {
              if (onReset) onReset();
            }}
            className="reset-btn"
            disabled={confirmSave}
          >
            <RiResetRightFill />
          </button>
        </Tooltip>
      </section>
    </div>
  );
}

export default Toolbar;
