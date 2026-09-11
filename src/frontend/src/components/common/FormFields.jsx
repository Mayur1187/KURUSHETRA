export function TextArea({ label, error, id, rows = 6, ...rest }) {
  const inputId = id || rest.name;
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`field-input ${error ? "field-input-error" : ""}`}
        {...rest}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export function Select({ label, error, id, options = [], ...rest }) {
  const inputId = id || rest.name;
  return (
    <div className="field">
      {label && (
        <label className="field-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <select id={inputId} className={`field-input ${error ? "field-input-error" : ""}`} {...rest}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default TextArea;
