"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border border-[var(--border)] p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "bg-[var(--background)] text-[var(--foreground)]",
        destructive:
          "border-[var(--destructive)] bg-[var(--destructive)] text-[var(--destructive-foreground)]",
        success:
          "border-green-500 bg-green-500 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

// --- Toast types ---

type ToastVariant = "default" | "destructive" | "success";

interface ToastData {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: ToastData[];
}

type ToastAction =
  | { type: "ADD_TOAST"; toast: ToastData }
  | { type: "REMOVE_TOAST"; id: string };

// --- Reducer ---

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [...state.toasts, action.toast] };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.id),
      };
    default:
      return state;
  }
}

// --- Context ---

interface ToastContextValue {
  toasts: ToastData[];
  toast: (data: Omit<ToastData, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextValue>({
  toasts: [],
  toast: () => "",
  dismiss: () => {},
});

// --- Provider ---

let toastCount = 0;

function generateId() {
  toastCount += 1;
  return `toast-${toastCount}-${Date.now()}`;
}

interface ToastProviderProps {
  children: React.ReactNode;
  duration?: number;
}

function ToastProvider({ children, duration = 5000 }: ToastProviderProps) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const dismiss = React.useCallback((id: string) => {
    dispatch({ type: "REMOVE_TOAST", id });
  }, []);

  const toast = React.useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = generateId();
      dispatch({ type: "ADD_TOAST", toast: { ...data, id } });

      const toastDuration = data.duration ?? duration;
      setTimeout(() => {
        dismiss(id);
      }, toastDuration);

      return id;
    },
    [duration, dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, dismiss }}>
      {children}
      <ToastViewport>
        {state.toasts.map((t) => (
          <Toast key={t.id} variant={t.variant}>
            <div className="grid gap-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && (
                <ToastDescription>{t.description}</ToastDescription>
              )}
            </div>
            <ToastClose onClick={() => dismiss(t.id)} />
          </Toast>
        ))}
      </ToastViewport>
    </ToastContext.Provider>
  );
}

// --- Hook ---

function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// --- Components ---

const ToastViewport = React.forwardRef<
  HTMLOListElement,
  React.HTMLAttributes<HTMLOListElement>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

interface ToastProps
  extends React.HTMLAttributes<HTMLLIElement>,
    VariantProps<typeof toastVariants> {}

const Toast = React.forwardRef<HTMLLIElement, ToastProps>(
  ({ className, variant, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
);
Toast.displayName = "Toast";

const ToastClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-[var(--foreground)]/50 opacity-0 transition-opacity hover:text-[var(--foreground)] focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100",
      className
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  useToast,
  type ToastData,
};
