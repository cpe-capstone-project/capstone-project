// src/types/window.d.ts
export {};

declare global {
  interface Window {
    // ทำให้ "เหมือนกันเป๊ะ" กับที่เคยประกาศไว้ใน NavBar.tsx
    confirmAppointment: (id: string, status: string) => void;
  }
}
