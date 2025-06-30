export const getActionName = (action: string) => {
  return action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getActionBadgeVariant = (action: string) => {
  switch (action) {
    case "LOGIN_SUCCESS":
    case "CLIENT_SIGNUP":
    case "PLAN_UPGRADE":
      return "default"; // Primary color
    case "EDIT_THEME":
    case "EDIT_IMAGE":
    case "EDIT_LANGAGE":
    case "EDIT_PASSWORD":
    case "PROFILE_UPDATE":
      return "secondary"; // Secondary color
    case "RESET_PASSWORD":
    case "FORGOT_PASSWORD":
      return "outline"; // Outline style
    case "LOGIN_FAILURE":
    case "DELETE_ACCOUNT":
      return "destructive"; // Destructive color
    default:
      return "secondary";
  }
};

export const getActionDescription = (action: string) => {
  switch (action) {
    case "LOGIN_SUCCESS":
      return "You successfully logged in";
    case "EDIT_THEME":
      return "You changed your theme preference";
    case "EDIT_IMAGE":
      return "You updated your profile image";
    case "EDIT_LANGAGE":
      return "You changed your language settings";
    case "EDIT_PASSWORD":
      return "You updated your password";
    case "RESET_PASSWORD":
      return "Your password was reset";
    case "FORGOT_PASSWORD":
      return "You requested a password reset";
    case "LOGIN_FAILURE":
      return "Failed login attempt";
    case "CLIENT_SIGNUP":
      return "You created your account";
    case "PLAN_UPGRADE":
      return "You upgraded your subscription plan";
    case "PROFILE_UPDATE":
      return "You updated your profile information";
    case "DELETE_ACCOUNT":
      return "Account deletion request";
    case "PAYMENT_SUCCESS":
      return "Payment processed successfully";
    case "ADMIN_SESSION_TERMINATED":
      return "Payment processed successfully";
    default:
      return "Unknown action";
  }
};

export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const AVAILABLE_ACTIONS = [
  "LOGIN_SUCCESS",
  "EDIT_THEME",
  "EDIT_IMAGE",
  "EDIT_LANGAGE",
  "EDIT_PASSWORD",
  "RESET_PASSWORD",
  "FORGOT_PASSWORD",
  "LOGIN_FAILURE",
  "CLIENT_SIGNUP",
  "PLAN_UPGRADE",
  "PROFILE_UPDATE",
  "DELETE_ACCOUNT",
  "PAYMENT_SUCCESS",
];
