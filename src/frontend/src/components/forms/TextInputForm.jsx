import { useState } from "react";
import { Button } from "../common/Button";
import { TextArea } from "../common/FormFields";

export function TextInputForm({ onSubmit, submitting }) {
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Please enter some input before submitting.");
      return;
    }
    setError(null);
    onSubmit({ text });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextArea
        label="Your input"
        name="text"
        placeholder="Describe what you'd like the AI to process..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        error={error}
      />
      <Button type="submit" loading={submitting} fullWidth>
        Submit for processing
      </Button>
    </form>
  );
}

export default TextInputForm;
