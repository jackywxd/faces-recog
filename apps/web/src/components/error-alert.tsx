"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  X,
  RefreshCw,
  Wifi,
  Upload,
  AlertCircle,
  Info,
} from "lucide-react";
import { AppError } from "@/hooks/use-error-handler";
import { formatRelativeTime } from "@/lib/utils";

interface ErrorAlertProps {
  error: AppError;
  onDismiss?: ((errorId: string) => void) | undefined;
  onRetry?: ((errorId: string) => void) | undefined;
  className?: string;
}

export function ErrorAlert({
  error,
  onDismiss,
  onRetry,
  className,
}: ErrorAlertProps) {
  const getIcon = () => {
    switch (error.type) {
      case "network":
        return <Wifi className="h-4 w-4" />;
      case "upload":
        return <Upload className="h-4 w-4" />;
      case "validation":
        return <Info className="h-4 w-4" />;
      case "system":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (error.type) {
      case "validation":
        return "warning" as const;
      case "network":
      case "upload":
      case "system":
        return "destructive" as const;
      default:
        return "default" as const;
    }
  };

  const getTypeLabel = () => {
    switch (error.type) {
      case "network":
        return "网络错误";
      case "upload":
        return "上传错误";
      case "validation":
        return "验证错误";
      case "system":
        return "系统错误";
      default:
        return "错误";
    }
  };

  return (
    <Alert variant={getVariant()} className={className}>
      {getIcon()}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <AlertTitle className="flex items-center gap-2">
            {getTypeLabel()}
            <Badge variant="outline" className="text-xs">
              {formatRelativeTime(error.timestamp)}
            </Badge>
          </AlertTitle>
          <div className="flex items-center gap-1">
            {error.retryable && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRetry(error.id)}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className="h-3 w-3" />
                <span className="sr-only">重试</span>
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDismiss(error.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">关闭</span>
              </Button>
            )}
          </div>
        </div>
        <AlertDescription>{error.message}</AlertDescription>

        {error.code && (
          <div className="mt-2 text-xs text-muted-foreground">
            错误代码: {error.code}
          </div>
        )}
      </div>
    </Alert>
  );
}

interface ErrorListProps {
  errors: AppError[];
  onDismiss?: ((errorId: string) => void) | undefined;
  onRetry?: ((errorId: string) => void) | undefined;
  onClearAll?: (() => void) | undefined;
  maxErrors?: number;
  className?: string;
}

export function ErrorList({
  errors,
  onDismiss,
  onRetry,
  onClearAll,
  maxErrors = 3,
  className,
}: ErrorListProps) {
  if (errors.length === 0) {
    return null;
  }

  const displayErrors = errors.slice(0, maxErrors);
  const hasMore = errors.length > maxErrors;

  return (
    <div className={className}>
      <div className="space-y-3">
        {displayErrors.map((error) => (
          <ErrorAlert
            key={error.id}
            error={error}
            onDismiss={onDismiss}
            onRetry={onRetry}
          />
        ))}
      </div>

      {(hasMore || errors.length > 1) && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          {hasMore && <span>还有 {errors.length - maxErrors} 个错误</span>}
          {onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              清除所有错误
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
