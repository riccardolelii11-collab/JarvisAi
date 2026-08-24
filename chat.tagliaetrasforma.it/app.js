const messages = document.querySelector('#messages');
const composer = document.querySelector('#composer');
const prompt = document.querySelector('#prompt');
const micButton = document.querySelector('#micButton');
const dictationButton = document.querySelector('#dictationButton');
const voiceStatus = document.querySelector('#voiceStatus');
const coreLabel = document.querySelector('#coreLabel');
const messageCount = document.querySelector('#messageCount');
const clearButton = document.querySelector('#clearButton');
const clock = document.querySelector('#clock');
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let recognitionMode = 'main';
let recognitionTranscript = '';

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString('it-IT', { hour12: false });
}
setInterval(updateClock, 1000);
updateClock();

function addMessage(author, text, isUser = false) {
  const message = document.createElement('div');
  message.className = `message ${isUser ? 'user-message' : 'jarvis-message'}`;
  message.innerHTML = `<div class="message-meta"><span>${author}</span><time>NOW</time></div><p></p>`;
  message.querySelector('p').textContent = text;
  messages.append(message);
  messages.scrollTop = messages.scrollHeight;
  messageCount.textContent = `${String(messages.children.length).padStart(2, '0')} MESSAGES`;
  return message;
}

async function answerTo(text) {
  const loadingMessage = addMessage('JARVIS', 'ELABORAZIONE...');

  try {
    const response = await fetch('https://jarvis.tagliaetrasforma.it/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.message || 'Il backend ha restituito un errore.');
    }

    if (typeof data.reply !== 'string' || !data.reply.trim()) {
      throw new Error('Il backend non ha restituito una risposta valida.');
    }

    loadingMessage.querySelector('p').textContent = data.reply;
    messages.scrollTop = messages.scrollHeight;
  } catch (error) {
    const errorMessage = error instanceof TypeError
      ? 'Impossibile raggiungere JARVIS. Controlla la connessione o la configurazione CORS.'
      : error.message;
    loadingMessage.querySelector('p').textContent = `Errore: ${errorMessage}`;
    messages.scrollTop = messages.scrollHeight;
  }
}

composer.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = prompt.value.trim();
  if (!text) return;
  addMessage('TU', text, true);
  prompt.value = '';
  answerTo(text);
});

function setListeningState(active, mode = recognitionMode) {
  micButton.classList.toggle('active', active && mode === 'main');
  dictationButton.classList.toggle('active', active && mode === 'dictation');
  voiceStatus.textContent = active ? (mode === 'dictation' ? 'TRASCRIZIONE ATTIVA...' : 'ASCOLTO ATTIVO...') : 'IN ATTESA DELLA TUA VOCE';
  coreLabel.textContent = active ? 'RECEIVING' : 'LISTENING';
}

function submitPrompt() {
  const text = prompt.value.trim();
  if (!text) return;
  addMessage('TU', text, true);
  prompt.value = '';
  answerTo(text);
}

function startRecognition(mode) {
  if (!SpeechRecognition) {
    voiceStatus.textContent = 'MICROFONO NON SUPPORTATO DAL BROWSER';
    return;
  }
  recognitionMode = mode;
  recognitionTranscript = '';
  if (!recognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'it-IT';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => setListeningState(true, recognitionMode);
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((result) => result[0].transcript).join('');
      recognitionTranscript = transcript;
      prompt.value = transcript;
    };
    recognition.onerror = () => setListeningState(false);
    recognition.onend = () => {
      const completedMode = recognitionMode;
      const completedTranscript = recognitionTranscript.trim();
      setListeningState(false, completedMode);
      if (completedMode === 'main' && completedTranscript) submitPrompt();
    };
  }
  if (micButton.classList.contains('active') || dictationButton.classList.contains('active')) {
    recognition.stop();
  } else {
    recognition.start();
  }
}

micButton.addEventListener('click', () => startRecognition('main'));
dictationButton.addEventListener('click', () => startRecognition('dictation'));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && document.activeElement !== prompt) startRecognition('main');
});

clearButton.addEventListener('click', () => {
  messages.innerHTML = '';
  messageCount.textContent = '00 MESSAGES';
  addMessage('JARVIS', 'Nuova sessione inizializzata. Sono in ascolto.', false);
});