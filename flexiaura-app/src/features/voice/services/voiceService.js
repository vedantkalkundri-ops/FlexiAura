export function getSpeechRecognitionConstructor() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognitionConstructor());
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getAvailableVoices() {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

export function createSpeechRecognition({
  lang = "en-US",
  continuous = false,
  interimResults = true,
} = {}) {
  const SpeechRecognition = getSpeechRecognitionConstructor();

  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = continuous;
  recognition.interimResults = interimResults;
  recognition.maxAlternatives = 1;

  return recognition;
}

export function speakText(
  text,
  {
    lang = "en-US",
    rate = 1,
    pitch = 1,
    volume = 1,
    voice = null,
    onStart,
    onEnd,
    onError,
  } = {},
) {
  if (!text || !text.trim()) {
    return null;
  }

  if (!isSpeechSynthesisSupported()) {
    onError?.(new Error("Speech synthesis is not supported in this environment."));
    return null;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = pitch;
  utterance.volume = volume;

  const availableVoice =
    voice ||
    getAvailableVoices().find((candidate) =>
      candidate.lang.toLowerCase().startsWith(lang.toLowerCase().slice(0, 2)),
    );

  if (availableVoice) {
    utterance.voice = availableVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (event) => onError?.(event.error || event);

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return utterance;
}

export function stopSpeaking() {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function isSpeaking() {
  return isSpeechSynthesisSupported() && window.speechSynthesis.speaking;
}
