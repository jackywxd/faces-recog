"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useErrorHandler } from "@/hooks/use-error-handler";
import { ErrorList } from "./error-alert";

interface ErrorContextValue {
  errorHandler: ReturnType<typeof useErrorHandler>;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

interface ErrorProviderProps {
  children: ReactNode;
  showErrorList?: boolean;
  maxDisplayErrors?: number;
}

export function ErrorProvider({
  children,
  showErrorList = true,
  maxDisplayErrors = 3,
}: ErrorProviderProps) {
  const errorHandler = useErrorHandler();

  return (
    <ErrorContext.Provider value={{ errorHandler }}>
      {children}
      {showErrorList && errorHandler.errors.length > 0 && (
        <div className="fixed top-4 right-4 z-50 w-full max-w-sm">
          <ErrorList
            errors={errorHandler.errors}
            onDismiss={errorHandler.clearError}
            onRetry={(errorId) => {
              // 重试逻辑 - 这里可以根据错误类型执行不同的重试操作
              console.log("重试错误:", errorId);
              errorHandler.clearError(errorId);
            }}
            onClearAll={errorHandler.clearAllErrors}
            maxErrors={maxDisplayErrors}
          />
        </div>
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context.errorHandler;
}
