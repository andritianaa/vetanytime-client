// Tremor Toast [v0.0.4]

import React from "react";

import { cn } from "@/lib/utils";
import * as ToastPrimitives from "@radix-ui/react-toast";
import {
  RiCheckboxCircleFill,
  RiCloseCircleFill,
  RiErrorWarningFill,
  RiInformationFill,
  RiLoader2Fill,
} from "@remixicon/react";

const ToastProvider = ToastPrimitives.Provider;
ToastProvider.displayName = "ToastProvider";

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, forwardedRef) => (
  <ToastPrimitives.Viewport
    ref={forwardedRef}
    className={cn(
      "fixed right-0 top-0 z-[9999] m-0 flex w-full max-w-[100vw] list-none flex-col gap-2 p-[var(--viewport-padding)] [--viewport-padding:_15px] sm:max-w-md sm:gap-4",
      className
    )}
    {...props}
  />
));

ToastViewport.displayName = "ToastViewport";

interface ActionProps {
  label: string;
  altText: string;
  onClick: () => void | Promise<void>;
}

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  variant?:
    | "info"
    | "success"
    | "warning"
    | "error"
    | "loading"
    | "destructive";
  title?: string;
  description?: string;
  action?: ActionProps;
  disableDismiss?: boolean;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(
  (
    {
      className,
      variant,
      title,
      description,
      action,
      disableDismiss = false,
      ...props
    }: ToastProps,
    forwardedRef
  ) => {
    let Icon: React.ReactNode;

    switch (variant) {
      case "success":
        Icon = (
          <RiCheckboxCircleFill
            className="size-5 shrink-0 text-emerald-600 "
            aria-hidden="true"
          />
        );
        break;
      case "warning":
        Icon = (
          <RiErrorWarningFill
            className="size-5 shrink-0 text-amber-500 "
            aria-hidden="true"
          />
        );
        break;
      case "error":
        Icon = (
          <RiCloseCircleFill
            className="size-5 shrink-0 text-red-600 "
            aria-hidden="true"
          />
        );
        break;
      case "destructive":
        Icon = (
          <RiCloseCircleFill
            className="size-5 shrink-0 text-red-600 "
            aria-hidden="true"
          />
        );
        break;
      case "loading":
        Icon = (
          <RiLoader2Fill
            className="size-5 shrink-0 animate-spin text-gray-600 "
            aria-hidden="true"
          />
        );
        break;
      default:
        Icon = (
          <RiInformationFill
            className="size-5 shrink-0 text-blue-500 "
            aria-hidden="true"
          />
        );
        break;
    }

    return (
      <ToastPrimitives.Root
        ref={forwardedRef}
        className={cn(
          // base
          "flex h-fit min-h-16 w-full overflow-hidden rounded-md border shadow-lg shadow-black/5",
          // background color
          "bg-white ",
          // border color
          "border-gray-200 ",
          // swipe
          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
          // transition
          "data-[state=open]:animate-slideLeftAndFade",
          "data-[state=closed]:animate-hide",
          className
        )}
        tremor-id="tremor-raw"
        {...props}
      >
        <div
          className={cn(
            // base
            "flex flex-1 items-start gap-3 p-4",
            // border
            !disableDismiss || action ? "border-r border-gray-200 " : ""
          )}
        >
          {Icon}
          <div className="flex flex-col gap-1">
            {title && (
              <ToastPrimitives.Title className="text-sm font-semibold text-gray-900">
                {title}
              </ToastPrimitives.Title>
            )}
            {description && (
              <ToastPrimitives.Description className="text-sm text-gray-600">
                {description}
              </ToastPrimitives.Description>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          {action && (
            <>
              <ToastPrimitives.Action
                altText={action.altText}
                className={cn(
                  // base
                  "flex flex-1 items-center justify-center px-6 text-sm font-semibold transition-colors",
                  // hover
                  "hover:bg-gray-50",
                  // text color
                  "text-gray-800",
                  // active
                  "active:bg-gray-100",
                  {
                    "text-red-600": variant === "error",
                  }
                )}
                onClick={(event) => {
                  event.preventDefault();
                  action.onClick();
                }}
                type="button"
              >
                {action.label}
              </ToastPrimitives.Action>
              <div className="h-px w-full bg-gray-200" />
            </>
          )}
          {!disableDismiss && (
            <ToastPrimitives.Close
              className={cn(
                // base
                "flex flex-1 items-center justify-center px-6 text-sm transition-colors",
                // text color
                "text-gray-600",
                // hover
                "hover:bg-gray-50",
                // active
                "active:bg-gray-100",
                action ? "h-1/2" : "h-full"
              )}
              aria-label="Close"
            >
              Close
            </ToastPrimitives.Close>
          )}
        </div>
      </ToastPrimitives.Root>
    );
  }
);
Toast.displayName = "Toast";

type ToastActionElement = ActionProps;

export {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastActionElement,
  type ToastProps,
};
