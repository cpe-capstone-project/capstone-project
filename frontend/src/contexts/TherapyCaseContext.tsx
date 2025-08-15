import React, { createContext, useContext } from "react";
import { GetTherapyCaseByPatientId } from "../services/https/TherapyCase";
import type { TherapyCaseInterface } from "../interfaces/ITherapyCase";

interface TherapyCaseContextType {
  getTherapyCaseByPatient: (id: number) => Promise<TherapyCaseInterface | null>;
}

const TherapyCaseContext = createContext<TherapyCaseContextType | undefined>(undefined);

export const TherapyCaseProvider = ({ children }: { children: React.ReactNode }) => {

  const getTherapyCaseByPatient = async (id: number): Promise<TherapyCaseInterface | null> => {
    const res = await GetTherapyCaseByPatientId(id);
    if (res?.status === 200) {
      return res.data;
    }
    return null;
  };

  return (
    <TherapyCaseContext.Provider value={{ getTherapyCaseByPatient }}>
      {children}
    </TherapyCaseContext.Provider>
  );
};

export const useTherapyCase = () => {
  const context = useContext(TherapyCaseContext);
  if (!context) {
    throw new Error("useTherapyCase must be used within a TherapyCaseProvider");
  }
  return context;
};
