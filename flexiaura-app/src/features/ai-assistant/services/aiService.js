const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }

    const networkError = new Error(
      "Unable to reach the FlexiAura backend. Make sure it is running.",
    );
    networkError.code = "NETWORK_ERROR";
    throw networkError;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const requestError = new Error(
      data?.error?.message || `Request failed with status ${response.status}.`,
    );
    requestError.status = response.status;
    requestError.code = data?.error?.code || "REQUEST_FAILED";
    throw requestError;
  }

  return data;
}

export async function sendChatMessage({ sessionId, message, signal }) {
  return request("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, message }),
    signal,
  });
}

export async function resetConversation(sessionId) {
  return request("/api/ai/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId }),
  });
}

export async function getConversationHistory(sessionId) {
  return request(`/api/conversation/${encodeURIComponent(sessionId)}`);
}

export async function deleteConversation(sessionId) {
  return request(`/api/conversation/${encodeURIComponent(sessionId)}`, {
    method: "DELETE",
  });
}

export { API_BASE_URL };
