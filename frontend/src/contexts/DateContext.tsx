import React, { createContext, useContext } from "react";
import { format, parseISO } from "date-fns";
import { th, enUS } from "date-fns/locale";

interface DateContextType {
  formatLong: (isoDate: string, locale?: "th" | "en") => string;
  formatShort: (isoDate: string) => string;
  formatISODate: (isoDate: string) => string;
  customFormat: (isoDate: string, pattern: string, locale?: "th" | "en") => string;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const DateContextProvider = ({ children }: { children: React.ReactNode }) => {
  const getLocale = (lang: "th" | "en") => (lang === "th" ? th : enUS);

  const formatLong = (isoDate: string, locale: "th" | "en" = "en") =>
    format(parseISO(isoDate), "EEEE, d MMMM yyyy", { locale: getLocale(locale) });

  const formatShort = (isoDate: string) =>
    format(parseISO(isoDate), "dd/MM/yyyy");

  const formatISODate = (isoDate: string) =>
    format(parseISO(isoDate), "yyyy-MM-dd");

  const customFormat = (isoDate: string, pattern: string, locale: "th" | "en" = "en") =>
    format(parseISO(isoDate), pattern, { locale: getLocale(locale) });

  return (
    <DateContext.Provider
      value={{ formatLong, formatShort, formatISODate, customFormat }}
    >
      {children}
    </DateContext.Provider>
  );
};

export const useDate = (): DateContextType => {
  const context = useContext(DateContext);
  if (!context) {
    throw new Error("useDate must be used within a DateProvider");
  }
  return context;
};
