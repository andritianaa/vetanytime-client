"use client";

import { Eye, EyeOff, ShieldAlert, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { ControllerRenderProps, FieldPath, FieldValues } from "react-hook-form";

import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  calculatePasswordStrength,
  getPasswordFeedback,
  isCommonPassword,
} from "@/utils/password-utils";

interface PasswordInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  field: ControllerRenderProps<TFieldValues, TName>;
  label: string;
  placeholder?: string;
  description?: React.ReactNode;
  showStrengthMeter?: boolean;
  showPasswordToggle?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  className?: string;
  isConfirmPassword?: boolean;
  isNewPassword?: boolean; // For registration or new password creation
}

export function EnhancedPasswordInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  field,
  label,
  placeholder = "••••••••",
  description,
  showStrengthMeter = true,
  showPasswordToggle = true,
  disabled = false,
  autoComplete = "current-password",
  className,
  isConfirmPassword = false,
  isNewPassword = false,
}: PasswordInputProps<TFieldValues, TName>) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [feedback, setFeedback] = useState({ feedback: "", color: "" });
  const [isCommon, setIsCommon] = useState(false);

  useEffect(() => {
    if (!field.value || isConfirmPassword) return;

    // Calculate password strength
    const strength = calculatePasswordStrength(field.value);
    setPasswordStrength(strength);

    // Get feedback text and color
    const passwordFeedback = getPasswordFeedback(field.value);
    setFeedback(passwordFeedback);

    // Check if it's a common password
    setIsCommon(isCommonPassword(field.value));
  }, [field.value, isConfirmPassword]);

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 30) return "bg-red-500";
    if (passwordStrength < 60) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <FormItem className={className}>
      <div className="flex justify-between items-center">
        <FormLabel>{label}</FormLabel>
        {!isConfirmPassword && field.value && (
          <div className="flex items-center gap-1 text-xs">
            <span className={feedback.color}>
              {passwordStrength < 30
                ? "Weak"
                : passwordStrength < 60
                ? "Moderate"
                : "Strong"}
            </span>
            {isCommon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">
                      This is a commonly used password and should be avoided
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {passwordStrength >= 80 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs">Excellent password strength</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <FormControl>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder={placeholder}
            {...field}
            disabled={disabled}
            autoComplete={autoComplete}
            className={showPasswordToggle ? "pr-10" : ""}
          />
        </FormControl>
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1} // Remove from tab order to maintain focus flow
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Password Strength Meter */}
      {showStrengthMeter && !isConfirmPassword && field.value && (
        <div className="mt-1 space-y-1">
          <Progress
            value={passwordStrength}
            className={cn("h-1 w-full", getPasswordStrengthColor())}
          />
          <p className={cn("text-xs", feedback.color)}>{feedback.feedback}</p>
        </div>
      )}

      {description && !isConfirmPassword && !field.value && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <FormMessage />
    </FormItem>
  );
}
