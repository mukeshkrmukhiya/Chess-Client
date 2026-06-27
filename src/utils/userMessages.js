const defaultMessage = 'Something went wrong. Please try again.';

// Converts technical API failures into user-friendly copy.
export const getFriendlyErrorMessage = (error, fallback = defaultMessage) => {
  if (!error?.response) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  const status = error.response.status;
  if (status === 400 || status === 401) return fallback;
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'We could not find what you were looking for.';
  if (status === 429) return 'Too many attempts. Please wait a moment and try again.';
  if (status >= 500) return 'The service is temporarily unavailable. Please try again shortly.';

  return fallback;
};
