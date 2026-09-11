const STAGES = ["Preparing data", "Validating input", "AI analyzing", "Generating result"];

export function ProcessingStatus({ active }) {
  if (!active) return null;

  return (
    <div className="processing-status">
      <div className="spinner" aria-hidden="true" />
      <div>
        <p className="processing-status-title">Processing your request...</p>
        <ul className="processing-status-stages">
          {STAGES.map((stage) => (
            <li key={stage}>{stage}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ProcessingStatus;
