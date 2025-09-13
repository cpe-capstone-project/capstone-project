// context/DiaryContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  GetDiary,
  GetDiariesByPatientAndTherapyCase,
  GetDiaryById,
  CreateDiary,
  UpdateDiaryById,
  DeleteDiaryById,
} from "../services/https/Diary";
import type { DiaryInterface } from "../interfaces/IDiary";

interface DiaryContextType {
  diaries: DiaryInterface[];
  loading: boolean;
  error: string | null;
  fetchDiaries: (
    sortBy?: "CreatedAt" | "UpdatedAt",
    order?: "asc" | "desc"
  ) => void;
  fetchDiariesByPatientAndTherapyCase: (
    patientId: number | string,
    therapyCaseId: number | string,
    sortBy?: "CreatedAt" | "UpdatedAt",
    order?: "asc" | "desc"
  ) => void;
  getDiaryById: (id: number) => Promise<DiaryInterface | null>;
  createDiary: (data: DiaryInterface) => Promise<DiaryInterface | null>;
  updateDiary: (id: number, data: DiaryInterface) => Promise<boolean | null>;
  deleteDiary: (id: number) => Promise<boolean>;
}

const DiaryContext = createContext<DiaryContextType | undefined>(undefined);

export const DiaryContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [diaries, setDiaries] = useState<DiaryInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

const fetchDiaries = (
  sortBy?: "CreatedAt" | "UpdatedAt",
  order?: "asc" | "desc"
) => {
  setLoading(true);

  // ถ้าไม่ได้รับค่า sortBy หรือ order ให้ลองอ่านจาก localStorage
  const sortField =
    sortBy || (localStorage.getItem("diary_sortField") as "CreatedAt" | "UpdatedAt") || "UpdatedAt";
  const sortOrder =
    order || (localStorage.getItem("diary_sortOrder") as "asc" | "desc") || "desc";

  GetDiary(sortField, sortOrder)
    .then((res) => {
      if (res?.status === 200) {
        setDiaries(res.data);
        setError(null);
      } else {
        setError("Failed to load diaries");
      }
    })
    .catch(() => setError("Failed to fetch diaries"))
    .finally(() => setLoading(false));
};

const fetchDiariesByPatientAndTherapyCase = (
  patientId: number | string,
  therapyCaseId: number | string,
  sortBy?: "CreatedAt" | "UpdatedAt",
  order?: "asc" | "desc"
) => {
  setLoading(true);

  const sortField =
    sortBy || (localStorage.getItem("diary_sortField") as "CreatedAt" | "UpdatedAt") || "UpdatedAt";
  const sortOrder =
    order || (localStorage.getItem("diary_sortOrder") as "asc" | "desc") || "desc";

  GetDiariesByPatientAndTherapyCase(patientId, therapyCaseId, sortField, sortOrder)
    .then((res) => {
      if (res?.status === 200) {
        setDiaries(res.data);
        setError(null);
      } else {
        setError("Failed to load diaries");
      }
    })
    .catch(() => setError("Failed to fetch diaries"))
    .finally(() => setLoading(false));
};


  const getDiaryById = async (id: number): Promise<DiaryInterface | null> => {
    const res = await GetDiaryById(id);
    return res?.status === 200 ? res.data : null;
  };

  const createDiary = async (
    data: DiaryInterface
  ): Promise<DiaryInterface | null> => {
    const res = await CreateDiary(data);
    if (res?.status === 201 || res?.status === 200) {
      fetchDiaries();
      return res.data;
    }
    return res;
  };

  const updateDiary = async (
    id: number,
    data: DiaryInterface
  ): Promise<boolean | null> => {
    const res = await UpdateDiaryById(id, data);
    if (res?.status === 200) {
      fetchDiaries();
      return true;
    }
    return false;
  };

  const deleteDiary = async (id: number): Promise<boolean> => {
    const res = await DeleteDiaryById(id);
    if (res?.status === 204 || res?.status === 200) {
      fetchDiaries();
      return true;
    }
    return false;
  };

  useEffect(() => {
    fetchDiaries();
  }, []);

  return (
    <DiaryContext.Provider
      value={{
        diaries,
        loading,
        error,
        fetchDiaries,
        fetchDiariesByPatientAndTherapyCase,
        getDiaryById,
        createDiary,
        updateDiary,
        deleteDiary,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
};

export const useDiary = () => {
  const context = useContext(DiaryContext);
  if (!context) throw new Error("useDiary must be used within a DiaryProvider");
  return context;
};
