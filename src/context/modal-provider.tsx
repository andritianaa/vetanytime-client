"use client";

import { EmailVerificationModal } from '@/components/verification/email-verification-modal';
import { useClient } from '@/hooks/use-user';

export const ModalProvider = () => {
  const { client } = useClient();
  return (
    <div>
      {client && (
        <EmailVerificationModal
          isOpen={!client.isEmailVerified}
          clientEmail={client.email}
        />
      )}
    </div>
  );
};
