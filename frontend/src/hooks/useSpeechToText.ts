/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";

type SpeechRecognitionType = typeof window.SpeechRecognition | typeof window.webkitSpeechRecognition;

const getSpeechRecognition = (): SpeechRecognitionType | null => {
  return (
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition ||
    null
  );
};

const useSpeechToText = (lang: string = "th-TH") => { // เพิ่ม lang parameter
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = lang; // ใช้ค่าภาษา
    recognition.interimResults = false;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let fullText = "";
      for (let i = 0; i < event.results.length; i++) {
        fullText += event.results[i][0].transcript + " ";
      }
      setText(fullText.trim());
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      if (isRecording) {
        recognition.start();
      }
    };

    recognitionRef.current = recognition;
    // อัปเดตเมื่อ lang เปลี่ยน
  }, [lang, isRecording]);

  const startListening = () => {
    setText("");
    setIsRecording(true);
    recognitionRef.current?.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  return {
    text,
    isRecording,
    startListening,
    stopListening,
    hasRecognition: !!recognitionRef.current,
  };
};

export default useSpeechToText;