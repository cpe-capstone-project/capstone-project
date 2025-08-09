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
    updateRecord: (id: number, data: ThoughtRecordInterface) => Promise<boolean | null>;
    deleteRecord: (id: number) => Promise<boolean>;
}

const ThoughtRecordContext = createContext<ThoughtRecordContextType | undefined>(undefined);

export const ThoughtRecordProvider = ({ children }: { children: React.ReactNode }) => {
    const [records, setRecords] = useState<ThoughtRecordInterface[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecords = (
        sortBy: "CreatedAt" | "UpdatedAt" = "UpdatedAt",
        order: "asc" | "desc" = "desc"
    ) => {
        setLoading(true);
        GetThoughtRecords(sortBy, order)
            .then((res) => {
                console.log("📦 ThoughtRecord response", res); // ✅ เพิ่มบรรทัดนี้
                if (res?.status === 200) {
                    setRecords(res.data);
                    setError(null);
                } else {
                    setError("Failed to load thought records");
                }
            })

            .catch(() => setError("Failed to fetch thought records"))
            .finally(() => setLoading(false));
    };

    const getRecordById = async (id: number): Promise<ThoughtRecordInterface | null> => {
        const res = await GetThoughtRecordById(id);
        return res?.status === 200 ? res.data : null;
    };

    const createRecord = async (
        data: ThoughtRecordInterface
    ): Promise<ThoughtRecordInterface | null> => {
        const res = await CreateThoughtRecord(data);
        if (res?.status === 201 || res?.status === 200) {
            fetchRecords();
            return res.data;
        }
        return null;
    };

    const updateRecord = async (
        id: number,
        data: ThoughtRecordInterface
    ): Promise<boolean | null> => {
        const res = await UpdateThoughtRecordById(id, data);
        if (res?.status === 200) {
            fetchRecords();
            return true;
        }
        return false;
    };

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

export const useThoughtRecord = () => {
    const context = useContext(ThoughtRecordContext);
    if (!context) {
        throw new Error("useThoughtRecord must be used within a ThoughtRecordProvider");
    }
    return context;
};
