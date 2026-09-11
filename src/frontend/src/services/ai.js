import { api } from "./api";

/**
 * The frontend never calls an AI provider directly and never holds an
 * AI API key - every AI request is proxied through the Flask backend
 * so keys stay server-side and the provider stays swappable.
 */
export async function runAIProcessing({ projectId, requestType, inputData }) {
  return api.processing.submit({
    project_id: projectId,
    request_type: requestType,
    input_data: inputData,
  });
}

export async function getProcessingStatus(requestId) {
  return api.processing.status(requestId);
}
