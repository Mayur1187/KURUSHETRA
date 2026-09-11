import { useRef, useState } from "react";

const MAX_SIZE_MB = 20;

export function FileUploader({ onFileSelect, accept, label = "Upload a file" }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      setFileName(null);
      return;
    }

    setError(null);
    setFileName(file.name);
    onFileSelect?.(file);
  };

  return (
    <div className="field">
      <label className="field-label">{label}</label>
      <div className="file-uploader" onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" accept={accept} hidden onChange={handleChange} />
        <p>{fileName || "Click to choose a file, or drag it here"}</p>
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

export default FileUploader;
