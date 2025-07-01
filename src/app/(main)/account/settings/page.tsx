"use client";

import { z } from 'zod';

import { EditPasswordForm } from '@/app/(main)/account/settings/edit-password-form';
import { EditPersonalInfoForm } from '@/app/(main)/account/settings/edit-personal-info-form';
import { Footer } from '@/components/layout/footer';

// Définir le schéma de validation
const profileFormSchema = z.object({
  fullname: z.string().optional(),
  username: z.string().min(3, {
    message: "The username must contain at least 3 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  theme: z.enum(["light", "dark", "system"]),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfileSettingsPage() {
  return (
    <>
      <div className="flex w-full justify-center">
        <div className="container  mx-auto px-4 sm:px-6 mt-24 space-y-8">
          <EditPersonalInfoForm />
          <EditPasswordForm />
        </div>
      </div>

      <Footer />
    </>
  );
}
