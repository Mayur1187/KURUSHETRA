/**
 * DOMAIN MODULE - placeholder for a custom input form.
 *
 * Replace TextInputForm in WorkspacePage with this component once the
 * problem statement defines what inputs are actually needed (e.g. a
 * structured form, a special file type, multiple fields).
 */
import { TextInputForm } from "../../../components/forms/TextInputForm";

export function DomainInputForm({ onSubmit, submitting }) {
  // Currently just delegates to the generic text form.
  return <TextInputForm onSubmit={onSubmit} submitting={submitting} />;
}

export default DomainInputForm;
