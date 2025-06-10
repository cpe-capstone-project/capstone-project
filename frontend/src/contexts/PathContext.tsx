import React, { createContext, useContext } from "react";
import { useLocation } from "react-router";

// ---------- Interface ----------
interface PathContextType {
  fullPath: string;
  pathSegments: string[];
  basePath: string;
  backPath: string;
  withSubPath: (subPath: string) => string;
  getBackPath: (steps?: number) => string;
}

// ---------- Context ----------
const PathContext = createContext<PathContextType | undefined>(undefined);

// ---------- Provider ----------
export const PathContextProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const fullPath = location.pathname;
  const pathSegments = fullPath.split("/").filter(Boolean);

  const getBackPath = (steps: number = 1): string => {
    const safeSteps = Math.max(0, Math.min(steps, pathSegments.length));
    const newPath = pathSegments.slice(0, -safeSteps).join("/");
    return newPath ? `/${newPath}` : "/";
  };

  const withSubPath = (subPath: string): string => `${getBackPath(0)}/${subPath}`;

  const contextValue: PathContextType = {
    fullPath,
    pathSegments,
    basePath: getBackPath(1),
    backPath: getBackPath(1),
    withSubPath,
    getBackPath,
  };

  return (
    <PathContext.Provider value={contextValue}>
      {children}
    </PathContext.Provider>
  );
};

// ---------- Hook ----------
export const usePath = (): PathContextType => {
  const context = useContext(PathContext);
  if (!context) {
    throw new Error("usePath must be used within a PathContextProvider");
  }
  return context;
};
