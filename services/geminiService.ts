import { GeminiModel, Message } from "../types";

export const sendMessageStream = async (
  model: GeminiModel,
  history: Message[],
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  let fullResponse = "";
  
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        history: history.map(msg => ({ role: msg.role, text: msg.content })),
        message
      })
    });

    if (!response.ok) {
      let errorMessage = `Error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData?.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        }
      } catch {
        // Fallback to text if not json
      }
      throw new Error(errorMessage);
    }

    if (!response.body) {
      throw new Error("ReadableStream not yet supported in this browser.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk);
    }
  } catch (error) {
    console.error("Error in stream:", error);
    throw error;
  }

  return fullResponse;
};
