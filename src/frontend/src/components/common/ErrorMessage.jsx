const FRIENDLY_MESSAGES = {
  NETWORK_ERROR: "Can't reach the server. Check that the backend is running.",
  VALIDATION_ERROR: "Some fields need your attention.",
  AUTH_ERROR: "Please log in again to continue.",
  FORBIDDEN: "You don't have access to that.",
  NOT_FOUND: "We couldn't find what you were looking for.",
  AI_ERROR: "The AI service had trouble with this request. Please try again.",
  SERVER_ERROR: "Something went wrong on our end.",
};

export function ErrorMessage({ error, onRetry }) {
  if (!error) return null;
  const code = error.code || "SERVER_ERROR";
  const message = error.message || FRIENDLY_MESSAGES[code] || "Something went wrong.";

  return (
    <div className="error-box" role="alert">
      <p className="error-title">Unable to complete this request</p>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;
