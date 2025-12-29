export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidUrl = (value: string) => {
  try {
    // URL constructor ensures protocol presence; relax requirement by prefixing http if missing
    const hasProtocol = /^https?:\/\//i.test(value);
    const url = new URL(hasProtocol ? value : `https://${value}`);
    return Boolean(url.hostname);
  } catch {
    return false;
  }
};

/**
 * Extracts error message from axios error response
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    // Axios error structure
    if ("response" in error && error.response) {
      const axiosError = error as { response: { data?: { message?: string | string[] } } };
      if (axiosError.response.data?.message) {
        // Handle array of error messages (validation errors)
        if (Array.isArray(axiosError.response.data.message)) {
          return axiosError.response.data.message.join(", ");
        }
        // Handle specific common errors with helpful messages
        const msg = axiosError.response.data.message;
        if (msg.includes("property companyId should not exist")) {
          return "Erreur de configuration: companyId ne doit pas être envoyé (extrait du token JWT)";
        }
        return msg;
      }
    }
    // Generic error with message
    if ("message" in error && typeof error.message === "string") {
      return error.message;
    }
  }
  return "Une erreur est survenue. Veuillez réessayer.";
};

