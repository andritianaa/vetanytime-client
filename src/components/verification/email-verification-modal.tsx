// src/components/verification/email-verification-modal.tsx
"use client";

import { AlertCircle, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

import { resendVerificationEmail } from '@/actions/email-verification';
import { Button } from '@/components/ui/button';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export interface EmailVerificationModalProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  clientEmail: string;
}

export function EmailVerificationModal({
  isOpen,
  clientEmail,
}: EmailVerificationModalProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const { toast } = useToast();

  const resetState = () => {
    setNewEmail("");
    setShowChangeEmail(false);
    setIsLoading(false);
  };

  const handleSendVerification = async () => {
    setIsLoading(true);
    try {
      await resendVerificationEmail(showChangeEmail ? newEmail : undefined);

      toast({
        title: "Verification email sent",
        description: `We've sent a verification link to ${
          showChangeEmail ? newEmail : clientEmail
        }`,
      });

      resetState();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to send verification email",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={false}
      onOpenChange={(open) => {
        if (!open) resetState();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Verify your email address
          </DialogTitle>
          <DialogDescription>
            Your email address hasn't been verified yet. Please check your inbox
            for a verification link or request a new one.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-700">
                Why verify your email?
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Email verification helps protect your account and ensures you
                won't miss important notifications.
              </p>
            </div>
          </div>

          {!showChangeEmail ? (
            <div className="bg-muted p-3 rounded-md flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Current email</p>
                <p className="text-sm">{clientEmail}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChangeEmail(true)}
              >
                Change
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="new-email">New email address</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter your new email address"
              />
              <p className="text-xs text-muted-foreground">
                We'll send the verification link to this new email address
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
          {showChangeEmail && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowChangeEmail(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSendVerification}
            disabled={isLoading || (showChangeEmail && !newEmail)}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send verification {showChangeEmail ? "to new email" : "again"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
