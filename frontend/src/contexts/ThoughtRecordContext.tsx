import React, { createContext, useContext, useEffect, useState } from "react";
import {
    GetThoughtRecords,
    GetThoughtRecordById,
    CreateThoughtRecord,
    UpdateThoughtRecordById,
    DeleteThoughtRecordById,
} from "../services/https/ThoughtRecord";
import type { ThoughtRecordInterface } from "../interfaces/IThoughtRecord";

interface ThoughtRecordContextType {
    records: ThoughtRecordInterface[];
    loading: boolean;
    error: string | null;
    fetchRecords: (
        sortBy?: "CreatedAt" | "UpdatedAt",
        order?: "asc" | "desc"
    ) => void;
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

    // Fetch all thought records
    const fetchRecords = (
        sortBy: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
        order: "asc" | "desc" = "desc"
    ) => {
        setLoading(true);
        GetThoughtRecords(sortBy, order)
            .then((res) => {
                if (res?.status === 200) {
                    // รองรับหลาย Emotions
                    const data = Array.isArray(res.data)
                        ? res.data.map((r: ThoughtRecordInterface) => ({
                              ...r,
                              Emotions: r.Emotions ? r.Emotions : [], // ถ้าไม่มี Emotions ให้เป็น []
                          }))
                        : [];
                    setRecords(data);
                    setError(null);
                } else {
                    setError("Failed to load thought records");
                }
            })
            .catch(() => setError("Failed to fetch thought records"))
            .finally(() => setLoading(false));
    };

    // Fetch single thought record by ID
    const getRecordById = async (id: number): Promise<ThoughtRecordInterface | null> => {
        const res = await GetThoughtRecordById(id);
        if (res?.status === 200) {
            return {
                ...res.data,
                Emotions: res.data.Emotions ? res.data.Emotions : [],
            };
        }
        return null;
    };

    // Create new thought record
    const createRecord = async (data: ThoughtRecordInterface): Promise<ThoughtRecordInterface | null> => {
        const res = await CreateThoughtRecord(data);
        if (res?.status === 201 || res?.status === 200) {
            fetchRecords();
            return res.data;
        }
        return null;
    };

    // Update existing thought record
    const updateRecord = async (id: number, data: ThoughtRecordInterface): Promise<boolean> => {
        const res = await UpdateThoughtRecordById(id, data);
        if (res?.status === 200) {
            fetchRecords();
            return true;
        }
        return false;
    };

    // Delete thought record
    const deleteRecord = async (id: number): Promise<boolean> => {
        const res = await DeleteThoughtRecordById(id);
        if (res?.status === 204 || res?.status === 200) {
            fetchRecords();
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
    if (!context) {
        throw new Error("useThoughtRecord must be used within a ThoughtRecordProvider");
    }
    return context;
};
