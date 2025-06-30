export const errors = {
  /** The client is not signed as a client */
  client_001: {
    code: "client_001",
    description: "The client is not signed as a client",
  },

  /** Invalid authentication token */
  client_002: { code: "client_002", description: "Invalid authentication token" },

  /** Client account is suspended */
  client_003: { code: "client_003", description: "Client account is suspended" },
} as const;

// Type qui extrait les clés de `errors` pour l'auto-complétion
type ASErrorCode = keyof typeof errors;

// Type d'une erreur
type ASError = (typeof errors)[ASErrorCode];
