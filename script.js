const CHAT_API_URL = "/api/chat";
const TRANSCRIBE_API_URL = "/api/transcribe";
const SPEECH_API_URL = "/api/speech";

const PERSONAS = {
  curry: {
    id: "curry",
    shortName: "Curry",
    displayName: "Stephen Curry",
    initials: "SC",
    subtitle: "Shooting, rhythm, and joyful confidence",
    badge: "Legend Persona: Curry",
    title: "Chat with Curry in the Hall",
    kicker: "Training room conversation",
    description:
      "Ask about shooting confidence, practice rhythm, off-ball movement, pressure, leadership, and building a game that feels like your own.",
    noticePrimary:
      "This experience features an AI-created Stephen Curry persona inspired by public interviews, games, and widely discussed basketball principles.",
    noticeSecondary:
      "Ask about daily reps, confidence, movement, leadership, and how a smaller guard changed the geometry of basketball.",
    placeholder: "Ask Curry a question...",
    inputHint: "Try asking about confidence, reps, range, or movement without the ball.",
    prompts: [
      "How do you build confidence as a shooter?",
      "What should young players do when they feel overlooked?",
      "How do you stay calm after missing shots?",
      "What separates casual practice from game-ready practice?",
    ],
    insights: [
      "Learn how joy and discipline can exist in the same workout.",
      "Study how movement, spacing, and gravity can change a whole offense.",
      "Use Curry's persona for questions about belief, repetition, and staying loose under pressure.",
    ],
    welcome:
      "Welcome to the Hall. I'm an AI Curry-inspired persona, here to talk hoops. We can get into shooting rhythm, confidence, off-ball movement, practice habits, or how to keep joy in the work.",
  },
  kobe: {
    id: "kobe",
    shortName: "Kobe",
    displayName: "Kobe Bryant",
    initials: "KB",
    subtitle: "Mamba Mentality, detail, and pressure",
    badge: "Legend Persona: Kobe",
    title: "Chat with Kobe in the Hall",
    kicker: "Mamba mentality session",
    description:
      "Explore obsessive preparation, footwork, film study, competitive fire, and the discipline behind playing through pressure.",
    noticePrimary:
      "This experience features an AI-created Kobe Bryant persona inspired by public interviews, games, documentaries, and widely shared Mamba Mentality principles.",
    noticeSecondary:
      "Ask about details, repetition, failure, film study, footwork, and how work becomes confidence.",
    placeholder: "Ask Kobe a question...",
    inputHint: "Try asking about discipline, footwork, film study, or bouncing back from failure.",
    prompts: [
      "What does Mamba Mentality mean in daily practice?",
      "How should I train when nobody is watching?",
      "How do you handle fear before a big moment?",
      "What should a young player study on film?",
    ],
    insights: [
      "Use this persona when you want direct language about standards and preparation.",
      "Study how small technical details become confidence late in games.",
      "Explore the line between healthy obsession and careless ego.",
    ],
    welcome:
      "I'm an AI Kobe-inspired persona. If we're talking basketball, let's talk about the details: footwork, film, repetition, pressure, and whether your habits match what you say you want.",
  },
  lebron: {
    id: "lebron",
    shortName: "LeBron",
    displayName: "LeBron James",
    initials: "LJ",
    subtitle: "Longevity, leadership, and basketball IQ",
    badge: "Legend Persona: LeBron",
    title: "Chat with LeBron in the Hall",
    kicker: "Leadership huddle",
    description:
      "Ask about longevity, playmaking, leadership, body care, basketball IQ, and carrying expectations from a young age.",
    noticePrimary:
      "This experience features an AI-created LeBron James persona inspired by public interviews, games, and widely discussed leadership habits.",
    noticeSecondary:
      "Ask about reading the floor, taking care of your body, leading teammates, and staying consistent across seasons.",
    placeholder: "Ask LeBron a question...",
    inputHint: "Try asking about leadership, longevity, playmaking, pressure, or basketball IQ.",
    prompts: [
      "How do you read the game before making a pass?",
      "What does leadership look like when teammates are struggling?",
      "How do you take care of your body for the long run?",
      "How should a young player handle high expectations?",
    ],
    insights: [
      "Use this persona for questions about seeing the whole floor.",
      "Explore how leadership changes when you are expected to carry more than scoring.",
      "Study consistency, body care, and decision-making over a long career arc.",
    ],
    welcome:
      "I'm an AI LeBron-inspired persona. We can talk about leadership, vision, body care, pressure, or how to make the right play when everyone in the gym expects you to be great.",
  },
  magic: {
    id: "magic",
    shortName: "Magic",
    displayName: "Magic Johnson",
    initials: "MJ",
    subtitle: "Passing, charisma, and team rhythm",
    badge: "Legend Persona: Magic",
    title: "Chat with Magic in the Hall",
    kicker: "Showtime playmaking",
    description:
      "Learn about pace, passing, charisma, team energy, fast-break vision, and making everyone around you feel involved.",
    noticePrimary:
      "This experience features an AI-created Magic Johnson persona inspired by public interviews, games, and the Showtime Lakers era.",
    noticeSecondary:
      "Ask about vision, trust, pace, joy, leadership, and how passing can become a form of team culture.",
    placeholder: "Ask Magic a question...",
    inputHint: "Try asking about passing, trust, pace, energy, or running a team.",
    prompts: [
      "How do you make teammates better without scoring?",
      "What does a great passer see before everyone else?",
      "How do you bring energy to a team?",
      "When should a point guard speed the game up or slow it down?",
    ],
    insights: [
      "Use this persona when you want basketball to feel connected and team-first.",
      "Study how pace, eye contact, and trust shape an offense.",
      "Explore leadership that lifts the mood without losing competitive edge.",
    ],
    welcome:
      "I'm an AI Magic-inspired persona. Let's talk about passing, pace, teammates, and the kind of joy that makes the whole team run harder.",
  },
  jordan: {
    id: "jordan",
    shortName: "Jordan",
    displayName: "Michael Jordan",
    initials: "MJ",
    subtitle: "Competition, standards, and clutch focus",
    badge: "Legend Persona: Jordan",
    title: "Chat with Jordan in the Hall",
    kicker: "Competitive standard",
    description:
      "Discuss competitive standards, clutch focus, failure, accountability, and the mindset required to chase excellence every day.",
    noticePrimary:
      "This experience features an AI-created Michael Jordan persona inspired by public interviews, games, and widely discussed competitive principles.",
    noticeSecondary:
      "Ask about failure, standards, clutch moments, accountability, and turning competition into daily fuel.",
    placeholder: "Ask Jordan a question...",
    inputHint: "Try asking about competition, failure, standards, or late-game focus.",
    prompts: [
      "How do you turn failure into motivation?",
      "What does it mean to hold yourself to a championship standard?",
      "How do you stay focused in clutch moments?",
      "How should players compete without becoming selfish?",
    ],
    insights: [
      "Use this persona for questions about standards, accountability, and competitive fire.",
      "Study how losing can become information instead of identity.",
      "Explore the difference between wanting to win and preparing to win.",
    ],
    welcome:
      "I'm an AI Jordan-inspired persona. We can talk about competition, standards, failure, clutch moments, and what it really means to prepare like winning matters.",
  },
  shaq: {
    id: "shaq",
    shortName: "Shaq",
    displayName: "Shaquille O'Neal",
    initials: "SO",
    subtitle: "Power, confidence, and locker-room presence",
    badge: "Legend Persona: Shaq",
    title: "Chat with Shaq in the Hall",
    kicker: "Paint dominance",
    description:
      "Talk about power, presence, confidence, locker-room chemistry, handling criticism, and playing with personality.",
    noticePrimary:
      "This experience features an AI-created Shaquille O'Neal persona inspired by public interviews, games, and widely known basketball themes.",
    noticeSecondary:
      "Ask about confidence, dominance, physicality, criticism, personality, and keeping the locker room alive.",
    placeholder: "Ask Shaq a question...",
    inputHint: "Try asking about dominance, confidence, physicality, criticism, or having fun.",
    prompts: [
      "How do you play with confidence when people criticize you?",
      "What does dominance mean beyond being big?",
      "How do you balance fun with serious work?",
      "How can a player bring better energy to a locker room?",
    ],
    insights: [
      "Use this persona when you want a looser, bigger-personality basketball conversation.",
      "Study how physical tools need confidence, timing, and team context.",
      "Explore how joy and dominance can share the same lane.",
    ],
    welcome:
      "I'm an AI Shaq-inspired persona. Big fella energy in the Hall. We can talk dominance, confidence, criticism, locker-room chemistry, or how to play hard without losing the fun.",
  },
};

const messagesEl = document.getElementById("messages");
const chatBodyEl = document.getElementById("chatBody");
const chatFormEl = document.getElementById("chatForm");
const chatInputEl = document.getElementById("chatInput");
const sendButtonEl = chatFormEl.querySelector(".send-button");
const recordButtonEl = document.getElementById("recordButton");
const voiceToggleEl = document.getElementById("voiceToggle");
const voiceStatusEl = document.getElementById("voiceStatus");
const promptListEl = document.getElementById("promptList");
const insightListEl = document.getElementById("insightList");
const chatKickerEl = document.getElementById("chatKicker");
const chatTitleEl = document.getElementById("chatTitle");
const chatDescriptionEl = document.getElementById("chatDescription");
const chatBadgeEl = document.getElementById("chatBadge");
const inputHintEl = document.getElementById("inputHint");
const personaNoticePrimaryEl = document.getElementById("personaNoticePrimary");
const personaNoticeSecondaryEl = document.getElementById("personaNoticeSecondary");
const sidebarSubtitleEl = document.getElementById("sidebarSubtitle");
const personaCards = [...document.querySelectorAll(".persona-card[data-persona]")];

const supportsRecording = Boolean(
  navigator.mediaDevices?.getUserMedia && window.MediaRecorder
);

const conversationsByPersona = Object.fromEntries(
  Object.values(PERSONAS).map((persona) => [
    persona.id,
    [{ role: "assistant", content: persona.welcome }],
  ])
);

let currentPersonaId = "curry";
let speechEnabled = true;
let isSending = false;
let isTranscribing = false;
let isRecording = false;
let mediaRecorder = null;
let mediaStream = null;
let recordedChunks = [];
let currentAudio = null;
let currentAudioUrl = null;
let currentAudioButton = null;

applyPersonaUI(currentPersonaId);
renderConversation();
initializeVoiceControls();
updateRecordButton();
syncComposerState();

chatFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = chatInputEl.value.trim();
  if (!text || isSending || isTranscribing || isRecording) return;
  await sendUserMessage(text);
});

promptListEl.addEventListener("click", async (event) => {
  const chip = event.target.closest(".prompt-chip");
  if (!chip || isSending || isTranscribing || isRecording) return;

  const prompt = chip.dataset.prompt;
  if (!prompt) return;
  await sendUserMessage(prompt);
});

personaCards.forEach((card) => {
  card.addEventListener("click", () => {
    switchPersona(card.dataset.persona);
  });

  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    switchPersona(card.dataset.persona);
  });
});

recordButtonEl.addEventListener("click", async () => {
  if (!supportsRecording || isSending || isTranscribing) return;

  if (isRecording) {
    await stopRecordingSession();
    return;
  }

  await startRecordingSession();
});

voiceToggleEl.addEventListener("click", () => {
  speechEnabled = !speechEnabled;
  voiceToggleEl.textContent = speechEnabled ? "Voice On" : "Voice Off";
  voiceToggleEl.classList.toggle("is-off", !speechEnabled);
  voiceToggleEl.setAttribute("aria-pressed", String(speechEnabled));

  if (!speechEnabled) {
    stopCurrentAudio();
    setVoiceStatus("Voice playback is off. You can still keep chatting by text or microphone.");
    return;
  }

  setVoiceStatus(`Voice playback is on for ${getCurrentPersona().displayName}.`);
});

function getCurrentPersona() {
  return PERSONAS[currentPersonaId];
}

function getCurrentConversation() {
  return conversationsByPersona[currentPersonaId];
}

function initializeVoiceControls() {
  if (supportsRecording) {
    setVoiceStatus(buildReadyVoiceStatus(getCurrentPersona()));
    return;
  }

  recordButtonEl.disabled = true;
  recordButtonEl.title = "Voice input is not supported in this browser.";
  setVoiceStatus("Voice input is unavailable in this browser. Text chat and audio replies still work.");
}

function switchPersona(personaId) {
  if (isSending || isTranscribing || isRecording) return;
  if (!PERSONAS[personaId] || personaId === currentPersonaId) return;

  stopCurrentAudio();
  currentPersonaId = personaId;
  applyPersonaUI(personaId);
  renderConversation();
  setVoiceStatus(`Switched to ${getCurrentPersona().displayName}. ${buildReadyVoiceStatus(getCurrentPersona())}`);
  chatInputEl.focus();
}

function applyPersonaUI(personaId) {
  const persona = PERSONAS[personaId];

  document.body.dataset.persona = personaId;

  personaCards.forEach((card) => {
    const isActive = card.dataset.persona === personaId;
    card.classList.toggle("is-active", isActive);
    card.setAttribute("aria-pressed", String(isActive));

    const statusEl = card.querySelector(".persona-status");
    if (statusEl) {
      statusEl.textContent = isActive ? "On court" : "Active";
    }
  });

  sidebarSubtitleEl.textContent = persona.subtitle;
  personaNoticePrimaryEl.textContent = persona.noticePrimary;
  personaNoticeSecondaryEl.textContent = persona.noticeSecondary;
  chatKickerEl.textContent = persona.kicker;
  chatTitleEl.textContent = persona.title;
  chatDescriptionEl.textContent = persona.description;
  chatBadgeEl.textContent = persona.badge;
  chatInputEl.placeholder = persona.placeholder;
  inputHintEl.textContent = persona.inputHint;

  renderPromptList(persona.prompts);
  renderInsightList(persona.insights);
}

function renderPromptList(prompts) {
  promptListEl.innerHTML = prompts
    .map((prompt) => `<button class="prompt-chip" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
    .join("");
}

function renderInsightList(insights) {
  insightListEl.innerHTML = insights
    .map(
      (insight) => `
        <div class="insight-item">
          <span class="insight-dot"></span>
          <p>${escapeHtml(insight)}</p>
        </div>
      `
    )
    .join("");
}

function renderConversation() {
  messagesEl.innerHTML = "";
  const conversation = getCurrentConversation();

  if (conversation.length <= 1) {
    renderEmptyState();
  }

  conversation.forEach((item) => {
    renderMessage(item.role, item.content, currentPersonaId);
  });
}

async function sendUserMessage(text) {
  const activePersonaId = currentPersonaId;
  const conversation = conversationsByPersona[activePersonaId];

  removeEmptyState();
  renderMessage("user", text, activePersonaId);
  conversation.push({ role: "user", content: text });
  chatInputEl.value = "";

  setSendingState(true);
  setVoiceStatus(`Sending your question to ${PERSONAS[activePersonaId].displayName}.`);

  const typingEl = renderTyping();

  try {
    const response = await fetch(CHAT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        persona: activePersonaId,
        history: conversation,
      }),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    typingEl.remove();

    const reply = data.reply || "I couldn't generate a response just now.";
    const assistantMessage = renderMessage("assistant", reply, activePersonaId);
    conversation.push({ role: "assistant", content: reply });

    if (speechEnabled) {
      setVoiceStatus(`Generating a ${PERSONAS[activePersonaId].displayName}-inspired AI voice reply.`);
      void playAssistantAudio(reply, assistantMessage.listenButton, activePersonaId, true);
    } else if (currentPersonaId === activePersonaId) {
      setVoiceStatus("Reply ready. Voice playback is off for now.");
    }
  } catch (error) {
    typingEl.remove();
    renderMessage(
      "assistant",
      "I ran into a connection problem. Please make sure your backend server is running and your API key is configured correctly.",
      activePersonaId
    );
    conversation.push({
      role: "assistant",
      content:
        "I ran into a connection problem. Please make sure your backend server is running and your API key is configured correctly.",
    });
    if (currentPersonaId === activePersonaId) {
      setVoiceStatus("Connection problem. Check the server and OpenAI key, then try again.");
    }
    console.error(error);
  } finally {
    setSendingState(false);
    chatInputEl.focus();
  }
}

async function startRecordingSession() {
  try {
    stopCurrentAudio();
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recordedChunks = [];

    const mimeType = pickRecordingMimeType();
    mediaRecorder = mimeType
      ? new MediaRecorder(mediaStream, { mimeType })
      : new MediaRecorder(mediaStream);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    });

    mediaRecorder.start();
    isRecording = true;
    syncComposerState();
    updateRecordButton();
    setVoiceStatus(`Listening for English speech for ${getCurrentPersona().displayName}. Tap Speak again when you're done.`);
  } catch (error) {
    console.error(error);
    setVoiceStatus("Microphone access was blocked or unavailable.");
  }
}

async function stopRecordingSession() {
  if (!mediaRecorder || !isRecording) return;

  const recorder = mediaRecorder;

  try {
    await new Promise((resolve) => {
      recorder.addEventListener("stop", resolve, { once: true });
      recorder.stop();
    });
  } finally {
    isRecording = false;
    mediaRecorder = null;
    stopRecordingTracks();
    syncComposerState();
    updateRecordButton();
  }

  const mimeType = recorder.mimeType || pickRecordingMimeType() || "audio/webm";
  const audioBlob = new Blob(recordedChunks, { type: mimeType });
  recordedChunks = [];

  if (!audioBlob.size) {
    setVoiceStatus("No speech was captured. Please try again.");
    return;
  }

  await transcribeAndSend(audioBlob);
}

async function transcribeAndSend(audioBlob) {
  isTranscribing = true;
  syncComposerState();
  setVoiceStatus(`Transcribing your English voice note for ${getCurrentPersona().displayName}.`);

  try {
    const response = await fetch(TRANSCRIBE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": audioBlob.type || "audio/webm",
      },
      body: audioBlob,
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(errorPayload?.error || `Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    const transcript = data.text?.trim();

    if (!transcript) {
      setVoiceStatus("I couldn't hear enough speech to create a transcript.");
      return;
    }

    chatInputEl.value = transcript;
    setVoiceStatus(`Transcript captured for ${getCurrentPersona().displayName}. Sending it now.`);
    await sendUserMessage(transcript);
  } catch (error) {
    console.error(error);
    setVoiceStatus(error.message || "Voice transcription failed. Please try again or type your question.");
  } finally {
    isTranscribing = false;
    syncComposerState();
  }
}

function renderMessage(role, content, personaId = currentPersonaId) {
  const row = document.createElement("div");
  row.className = `message-row ${role}`;

  const stack = document.createElement("div");
  stack.className = "message-stack";

  if (role === "assistant") {
    const avatar = document.createElement("div");
    avatar.className = `avatar assistant persona-${personaId}`;
    avatar.innerHTML = `<span>${escapeHtml(PERSONAS[personaId]?.initials || "AI")}</span>`;
    row.appendChild(avatar);
  }

  const bubble = document.createElement("div");
  bubble.className = `bubble ${role === "assistant" ? "assistant" : "user"}`;
  bubble.textContent = content;
  stack.appendChild(bubble);

  let listenButton = null;

  if (role === "assistant") {
    const actions = document.createElement("div");
    actions.className = "message-actions";

    listenButton = document.createElement("button");
    listenButton.type = "button";
    listenButton.className = "message-action";
    listenButton.textContent = "Listen";
    listenButton.addEventListener("click", () => {
      void playAssistantAudio(content, listenButton, personaId, false);
    });

    actions.appendChild(listenButton);
    stack.appendChild(actions);
  }

  row.appendChild(stack);

  if (role === "user") {
    const avatar = document.createElement("div");
    avatar.className = "avatar user";
    avatar.innerHTML = "<span>You</span>";
    row.appendChild(avatar);
  }

  messagesEl.appendChild(row);
  scrollToBottom();

  return { row, listenButton };
}

async function playAssistantAudio(text, actionButton, personaId, isAutoplay) {
  if (!text) return;

  if (actionButton) {
    actionButton.disabled = true;
    actionButton.textContent = "Loading...";
  }

  try {
    const response = await fetch(SPEECH_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, persona: personaId }),
    });

    if (!response.ok) {
      throw new Error(`Speech generation failed: ${response.status}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    stopCurrentAudio();

    const audio = new Audio(audioUrl);
    currentAudio = audio;
    currentAudioUrl = audioUrl;
    currentAudioButton = actionButton;

    const resetButton = () => {
      if (actionButton) {
        actionButton.disabled = false;
        actionButton.textContent = "Listen";
      }
    };

    const cleanup = () => {
      if (currentAudioUrl === audioUrl) {
        URL.revokeObjectURL(audioUrl);
        currentAudioUrl = null;
      }

      if (currentAudio === audio) {
        currentAudio = null;
      }

      if (currentAudioButton === actionButton) {
        currentAudioButton = null;
      }

      resetButton();
    };

    audio.addEventListener("ended", cleanup, { once: true });
    audio.addEventListener("error", cleanup, { once: true });

    if (actionButton) {
      actionButton.textContent = "Playing...";
    }

    await audio.play();

    if (currentPersonaId === personaId) {
      setVoiceStatus(`Playing a ${PERSONAS[personaId].displayName}-inspired AI voice reply.`);
    }
  } catch (error) {
    console.error(error);

    if (actionButton) {
      actionButton.disabled = false;
      actionButton.textContent = "Listen";
    }

    if (currentPersonaId === personaId) {
      setVoiceStatus(
        isAutoplay
          ? "Reply text is ready, but audio playback was blocked. Tap Listen on the message to hear it."
          : "Audio playback failed. Please try Listen again."
      );
    }
  }
}

function renderTyping() {
  const row = document.createElement("div");
  row.className = "message-row assistant";

  const avatar = document.createElement("div");
  avatar.className = `avatar assistant persona-${currentPersonaId}`;
  avatar.innerHTML = `<span>${escapeHtml(getCurrentPersona().initials)}</span>`;

  const stack = document.createElement("div");
  stack.className = "message-stack";

  const bubble = document.createElement("div");
  bubble.className = "bubble assistant typing";
  bubble.innerHTML = `
    <div class="typing-wrap">
      <span>${getCurrentPersona().shortName} is reading the floor</span>
      <div class="typing-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  stack.appendChild(bubble);
  row.appendChild(avatar);
  row.appendChild(stack);
  messagesEl.appendChild(row);
  scrollToBottom();

  return row;
}

function renderEmptyState() {
  const persona = getCurrentPersona();
  const panel = document.createElement("div");
  panel.className = "empty-state";
  panel.id = "emptyState";
  panel.innerHTML = `
    <div class="empty-kicker">Tip-off question</div>
    <h3>Start a Hall conversation with ${escapeHtml(persona.shortName)}</h3>
    <p>Pick a basketball question about mentality, growth, leadership, practice, pressure, or how legends saw the game.</p>
    <div class="empty-suggestions">
      ${persona.prompts.map((text) => `<span>${escapeHtml(text)}</span>`).join("")}
    </div>
  `;
  messagesEl.appendChild(panel);
}

function removeEmptyState() {
  const emptyState = document.getElementById("emptyState");
  if (emptyState) emptyState.remove();
}

function syncComposerState() {
  const formBusy = isSending || isTranscribing || isRecording;

  chatInputEl.disabled = formBusy;
  sendButtonEl.disabled = formBusy;
  voiceToggleEl.disabled = isSending || isTranscribing;

  const promptChips = [...document.querySelectorAll(".prompt-chip")];
  promptChips.forEach((chip) => {
    chip.disabled = formBusy;
  });

  const shouldDisableRecordButton = !supportsRecording || isSending || isTranscribing;
  recordButtonEl.disabled = shouldDisableRecordButton;
  personaCards.forEach((card) => {
    card.setAttribute("aria-disabled", String(formBusy));
  });

  chatFormEl.classList.toggle("is-busy", formBusy);
}

function setSendingState(nextValue) {
  isSending = nextValue;
  syncComposerState();
}

function updateRecordButton() {
  recordButtonEl.classList.toggle("is-recording", isRecording);
  recordButtonEl.setAttribute("aria-pressed", String(isRecording));

  const label = isRecording ? "Stop" : "Speak";
  const icon = isRecording ? "Rec" : "Mic";

  const textEl = recordButtonEl.querySelector(".voice-control-text");
  const iconEl = recordButtonEl.querySelector(".voice-control-icon");

  if (textEl) textEl.textContent = label;
  if (iconEl) iconEl.textContent = icon;
}

function pickRecordingMimeType() {
  const preferredMimeTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
  ];

  return preferredMimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) || "";
}

function setVoiceStatus(text) {
  voiceStatusEl.textContent = text;
}

function buildReadyVoiceStatus(persona) {
  return `Voice ready for ${persona.displayName}. Speak in English or type your prompt.`;
}

function stopRecordingTracks() {
  if (!mediaStream) return;
  mediaStream.getTracks().forEach((track) => track.stop());
  mediaStream = null;
}

function stopCurrentAudio() {
  if (currentAudioButton) {
    currentAudioButton.disabled = false;
    currentAudioButton.textContent = "Listen";
    currentAudioButton = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }
}

function scrollToBottom() {
  chatBodyEl.scrollTop = chatBodyEl.scrollHeight;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
