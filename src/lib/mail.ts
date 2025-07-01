// src/lib/mail.ts
import nodemailer from 'nodemailer';

import {
  composeTemplate, generatePlainTextVersion, loadEmailComponent, loadEmailTemplate,
  replaceTemplateVariables
} from '@/utils/template-loader';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_CLIENT,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Send a password reset email to the client
 * 
 * @param email The recipient's email address
 * @param token The password reset token
 */
export async function sendResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  // Calculate expiration time (1 hour from now)
  const expirationDate = new Date(Date.now() + 3600000);
  const expirationTime = expirationDate.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // Load the email template
  const template = loadEmailTemplate('reset-password');

  // Replace template variables
  const variables = {
    resetUrl,
    expirationTime,
    clientEmail: email,
    currentYear: new Date().getFullYear().toString(),
    subject: "Reset Your Password - Nextas",
  };

  const emailContent = replaceTemplateVariables(template, variables);

  // Generate plain text version
  const textContent = generatePlainTextVersion(emailContent);

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@nextas.com',
    to: email,
    subject: "Reset Your Password - Nextas",
    html: emailContent,
    text: textContent,
  });
}

/**
 * Send a welcome email to newly registered clients
 * 
 * @param email The recipient's email address
 * @param username The client's username
 */
export async function sendWelcomeEmail(email: string, username: string) {
  const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
  const docsUrl = `${process.env.NEXT_PUBLIC_APP_URL}/docs`;
  const supportUrl = `${process.env.NEXT_PUBLIC_APP_URL}/support`;
  const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings/notifications`;

  // Load the email template
  const template = loadEmailTemplate('welcome');

  // Replace template variables
  const variables = {
    username,
    dashboardUrl,
    docsUrl,
    supportUrl,
    unsubscribeUrl,
    clientEmail: email,
    currentYear: new Date().getFullYear().toString(),
    subject: "Welcome to Nextas!",
  };

  const emailContent = replaceTemplateVariables(template, variables);

  // Generate plain text version
  const textContent = generatePlainTextVersion(emailContent);

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@nextas.com',
    to: email,
    subject: "Welcome to Nextas!",
    html: emailContent,
    text: textContent,
  });
}

/**
 * Send an email verification link to a client
 * 
 * @param email The recipient's email address
 * @param username The client's username
 * @param token The verification token
 */
export async function sendEmailVerification(email: string, username: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  // Load the email template
  const template = loadEmailTemplate('verify-email');

  // Replace template variables
  const variables = {
    username,
    verificationUrl,
    clientEmail: email,
    currentYear: new Date().getFullYear().toString(),
    subject: "Verify Your Email Address - Nextas",
  };

  const emailContent = replaceTemplateVariables(template, variables);

  // Generate plain text version
  const textContent = generatePlainTextVersion(emailContent);

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@nextas.com',
    to: email,
    subject: "Verify Your Email Address - Nextas",
    html: emailContent,
    text: textContent,
  });
}

/**
 * Generic email sending function that can be used for any email template
 * 
 * @param options Email options
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  template: 'reset-password' | 'welcome' | 'verify-email';
  variables: Record<string, string>;
  components?: Record<string, string>;
}) {
  const { to, subject, template, variables, components = {} } = options;

  // Load base template
  let emailTemplate = loadEmailTemplate(template);

  // Load and compose components if requested
  if (Object.keys(components).length > 0) {
    const loadedComponents: Record<string, string> = {};

    for (const [name, content] of Object.entries(components)) {
      if (content) {
        // Use provided content
        loadedComponents[name] = content;
      } else {
        // Load component from file
        loadedComponents[name] = loadEmailComponent(name);
      }
    }

    emailTemplate = composeTemplate(emailTemplate, loadedComponents);
  }

  // Add standard variables
  const allVariables = {
    ...variables,
    subject,
    currentYear: new Date().getFullYear().toString(),
  };

  // Replace template variables
  const emailContent = replaceTemplateVariables(emailTemplate, allVariables);

  // Generate plain text version
  const textContent = generatePlainTextVersion(emailContent);

  // Send the email
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@nextas.com',
    to,
    subject,
    html: emailContent,
    text: textContent,
  });
}