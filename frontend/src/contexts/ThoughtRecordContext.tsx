import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GetThoughtRecords,
  GetThoughtRecordById,
  CreateThoughtRecord,
  UpdateThoughtRecordById,
  DeleteThoughtRecordById,
} from "../services/https/ThoughtRecord";
import { useTherapyCase } from "./TherapyCaseContext";
import type { ThoughtRecordInterface } from "../interfaces/IThoughtRecord";

interface ThoughtRecordFilter {
  date?: string;
  week?: string;
  month?: string;
  year?: string;
}

interface ThoughtRecordContextType {
  records: ThoughtRecordInterface[];
  loading: boolean;
  error: string | null;
  fetchRecords: (filter?: ThoughtRecordFilter) => void;
  getRecordById: (id: number) => Promise<ThoughtRecordInterface | null>;
  createRecord: (data: ThoughtRecordInterface) => Promise<ThoughtRecordInterface | null>;
  updateRecord: (id: number, data: ThoughtRecordInterface) => Promise<boolean>;
  deleteRecord: (id: number) => Promise<boolean>;
}

const ThoughtRecordContext = createContext<ThoughtRecordContextType | undefined>(undefined);

export const ThoughtRecordProvider = ({ children }: { children: React.ReactNode }) => {
  const [records, setRecords] = useState<ThoughtRecordInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getTherapyCaseByPatient } = useTherapyCase();

 const fetchRecords = async (filter?: ThoughtRecordFilter) => {
  setLoading(true);
  try {
    const patientId = Number(localStorage.getItem("id"));
    if (!patientId) throw new Error("No patient id found in localStorage");

    const therapyCase = await getTherapyCaseByPatient(patientId);
    if (!therapyCase) throw new Error("No therapy case found for patient");
    console.log("Fetched therapy case:", therapyCase);

    // ❌ เปลี่ยน id เป็น ID
    const data = await GetThoughtRecords(patientId, therapyCase.ID!, "UpdatedAt", "desc", filter);

    const normalized = Array.isArray(data)
      ? data.map((r: ThoughtRecordInterface) => ({ ...r, Emotions: r.Emotions || [] }))
      : [];
    setRecords(normalized);
    setError(null);
  } catch (e: any) {
    setError(e.message || "Failed to fetch thought records");
    setRecords([]);
  } finally {
    setLoading(false);
  }
};


  const getRecordById = async (id: number): Promise<ThoughtRecordInterface | null> => {
    const res = await GetThoughtRecordById(id);
    if (res?.status === 200) return { ...res.data, Emotions: res.data.Emotions || [] };
    return null;
  };

  const createRecord = async (data: ThoughtRecordInterface): Promise<ThoughtRecordInterface | null> => {
    const res = await CreateThoughtRecord(data);
    if (res?.status === 201 || res?.status === 200) {
      await fetchRecords();
      return res.data;
    }
    return null;
  };

  const updateRecord = async (id: number, data: ThoughtRecordInterface): Promise<boolean> => {
    const res = await UpdateThoughtRecordById(id, data);
    if (res?.status === 200) {
      await fetchRecords();
      return true;
    }
    return false;
  };

  const deleteRecord = async (id: number): Promise<boolean> => {
    const res = await DeleteThoughtRecordById(id);
    if (res?.status === 204 || res?.status === 200) {
      await fetchRecords();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  return (
    <ThoughtRecordContext.Provider
      value={{
        records,
        loading,
        error,
        fetchRecords,
        getRecordById,
        createRecord,
        updateRecord,
        deleteRecord,
      }}
    >
      {children}
    </ThoughtRecordContext.Provider>
  );
};

// Custom hook
export const useThoughtRecord = () => {
  const context = useContext(ThoughtRecordContext);
  if (!context) throw new Error("useThoughtRecord must be used within a ThoughtRecordProvider");
  return context;
};
