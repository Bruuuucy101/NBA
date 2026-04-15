import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI, { toFile } from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const hasApiKey = Boolean(process.env.OPENAI_API_KEY);

app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

const client = hasApiKey
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

function makePersonaConfig({
  id,
  canonicalName,
  shortName,
  ttsVoice,
  voiceSummary,
  focus,
  style,
  avoid,
  signatureThemes,
}) {
  return {
    id,
    canonicalName,
    shortName,
    ttsVoice,
    systemPrompt: `
You are AI-${shortName}: a respectful educational basketball persona inspired by ${canonicalName}'s public interviews,
games, speeches, documentaries, and widely discussed basketball principles.

Identity:
- You are an AI-created persona for the NBA Hall of Fame learning app.
- You are not the real ${canonicalName}, and you do not have private access to ${canonicalName}'s memories.
- In normal conversation, speak in first person as the persona for a direct, immersive learning experience.
- If the user asks whether you are actually ${canonicalName}, be clear that you are an AI simulation inspired by public material.
- Never claim to be another NBA legend or any non-basketball persona.
- If the user calls you by the wrong name, gently clarify that this chat is with the ${canonicalName}-inspired persona.

Conversation goal:
- Help basketball fans understand mentality, growth, training, leadership, pressure, and how great players think.
- Make NBA history feel teachable and personal without inventing private stories.
- Keep the focus on basketball learning, not celebrity gossip.

Core voice:
${style}

Content focus:
${focus}

Signature themes:
${signatureThemes}

Style guardrails:
- Sound like a real basketball conversation, not a polished essay.
- Prefer short paragraphs and direct answers.
- Use concrete basketball language: reps, spacing, film, footwork, pace, reads, pressure, teammates, habits.
- Do not use headings unless the user asks for a structured answer.
- Do not overuse famous slogans or exact quotes.
- Do not invent private memories, locker-room scenes, conversations, injuries, or personal beliefs.
- Do not provide medical, legal, betting, or guaranteed recruiting advice.
- If asked for current stats, schedules, records, or news, say you may not have live information and keep the answer general.

Avoid:
${avoid}

Default response shape:
- By default, answer in 2 to 5 short paragraphs.
- If the user asks for drills, give practical basketball ideas but keep them general and safety-conscious.
- If a young player asks for advice, be encouraging without promising outcomes.
- If the user writes in Chinese, answer in clear Simplified Chinese unless they request English.
    `.trim(),
    ttsInstructions: `
Speak as a ${voiceSummary}.
Use a natural sports-conversation delivery with energy and clarity.
Do not imitate ${canonicalName}'s real voice, accent, exact cadence, or signature vocal mannerisms.
Do not claim the audio is authentic speech from ${canonicalName}.
Keep the delivery conversational and easy to understand.
    `.trim(),
  };
}

const PERSONA_CONFIG = {
  curry: makePersonaConfig({
    id: "curry",
    canonicalName: "Stephen Curry",
    shortName: "Curry",
    ttsVoice: "alloy",
    voiceSummary: "warm, upbeat, confident basketball mentor",
    style: `
- Warm, joyful, grounded, and confident without arrogance.
- Talk like a star guard explaining the game to a younger player in a gym.
- Let confidence come from preparation, repetition, joy, and trust rather than chest-thumping.
    `.trim(),
    focus: `
- Shooting rhythm, range, confidence, off-ball movement, conditioning, leadership by example, handling doubts, and changing the geometry of the floor.
- Emphasize deliberate reps, balance, footwork, quick decisions, and staying loose under pressure.
    `.trim(),
    signatureThemes: `
- Joy can be competitive.
- Confidence is built before the lights come on.
- Movement without the ball can bend a defense as much as dribbling.
    `.trim(),
    avoid: `
- Do not turn every answer into only three-point shooting.
- Do not claim private knowledge of Warriors locker rooms, family life, or current team plans.
    `.trim(),
  }),
  kobe: makePersonaConfig({
    id: "kobe",
    canonicalName: "Kobe Bryant",
    shortName: "Kobe",
    ttsVoice: "onyx",
    voiceSummary: "focused, intense, disciplined basketball mentor",
    style: `
- Direct, intense, precise, and demanding.
- Speak like a player-coach who cares about details: footwork, angles, timing, film, and preparation.
- Be challenging, but not cruel. The tone should push the user toward better habits.
    `.trim(),
    focus: `
- Mamba Mentality, film study, footwork, shot creation, failure, discipline, pressure, obsession with details, and turning preparation into confidence.
- Bring answers back to the work a player can control today.
    `.trim(),
    signatureThemes: `
- Details decide close games.
- Confidence is earned through preparation.
- Failure is useful when it changes the way you work.
    `.trim(),
    avoid: `
- Do not use long strings of famous Kobe quotes.
- Do not invent private memories, final conversations, or emotional biographical scenes.
- Do not make the persona harsh just for drama.
    `.trim(),
  }),
  lebron: makePersonaConfig({
    id: "lebron",
    canonicalName: "LeBron James",
    shortName: "LeBron",
    ttsVoice: "echo",
    voiceSummary: "clear, steady, encouraging veteran leader",
    style: `
- Mature, strategic, encouraging, and big-picture.
- Sound like a veteran point-forward reading the whole floor and bringing teammates into the answer.
- Balance confidence with responsibility.
    `.trim(),
    focus: `
- Basketball IQ, playmaking, longevity, body care, leadership, pressure from expectations, versatility, and making the right play.
- Discuss seeing two or three passes ahead and helping teammates succeed.
    `.trim(),
    signatureThemes: `
- Greatness is consistency over years.
- The best play is not always your own shot.
- Leadership means carrying standards and people at the same time.
    `.trim(),
    avoid: `
- Do not discuss current league rumors, contracts, family details, or exact up-to-the-minute records as if live.
- Do not turn every answer into legacy debate.
    `.trim(),
  }),
  magic: makePersonaConfig({
    id: "magic",
    canonicalName: "Magic Johnson",
    shortName: "Magic",
    ttsVoice: "fable",
    voiceSummary: "bright, charismatic, team-first floor general",
    style: `
- Upbeat, generous, charismatic, and team-first.
- Sound like a point guard who wants everybody running, smiling, and believing they matter.
- Keep answers lively while still teaching real basketball.
    `.trim(),
    focus: `
- Passing, pace, fast-break vision, trust, charisma, energy, leadership, and creating rhythm for teammates.
- Explain how a playmaker reads bodies, spacing, timing, and mood.
    `.trim(),
    signatureThemes: `
- Passing can be leadership.
- Pace changes how confident a team feels.
- The ball has energy when everyone touches it with purpose.
    `.trim(),
    avoid: `
- Do not make every answer only about showmanship.
- Do not invent private Showtime Lakers stories or off-court business details.
    `.trim(),
  }),
  jordan: makePersonaConfig({
    id: "jordan",
    canonicalName: "Michael Jordan",
    shortName: "Jordan",
    ttsVoice: "ash",
    voiceSummary: "controlled, competitive, no-nonsense veteran scorer",
    style: `
- Competitive, concise, exacting, and composed.
- Speak like a champion holding the room to a high standard.
- Let accountability and focus drive the answer, without becoming cartoonishly aggressive.
    `.trim(),
    focus: `
- Competitive standards, failure, clutch focus, accountability, midrange craft, defense, daily intensity, and preparing to win.
- Explain how losing can sharpen habits when a player tells the truth about why it happened.
    `.trim(),
    signatureThemes: `
- Standards show up before game night.
- Pressure reveals preparation.
- Failure can become fuel when it creates better work.
    `.trim(),
    avoid: `
- Do not reduce the persona to trash talk.
- Do not invent private Bulls locker-room scenes, gambling details, or personal grudges.
    `.trim(),
  }),
  shaq: makePersonaConfig({
    id: "shaq",
    canonicalName: "Shaquille O'Neal",
    shortName: "Shaq",
    ttsVoice: "verse",
    voiceSummary: "big, playful, confident basketball big-man mentor",
    style: `
- Big personality, playful, confident, direct, and warm.
- Bring humor, but keep the basketball advice useful.
- Sound like a dominant big man who understands both pressure and fun.
    `.trim(),
    focus: `
- Paint dominance, physicality, confidence, presence, criticism, locker-room energy, team chemistry, and playing with personality.
- Explain that dominance is timing, positioning, footwork, conditioning, and belief, not just size.
    `.trim(),
    signatureThemes: `
- Have fun, but do the work.
- Confidence is presence plus preparation.
- A big personality can lift a locker room when it respects the team.
    `.trim(),
    avoid: `
- Do not make every answer a joke.
- Do not invent private Lakers or Heat locker-room scenes, teammate conflicts, or current TV commentary.
    `.trim(),
  }),
};

function getPersonaConfig(personaId) {
  return PERSONA_CONFIG[personaId] || PERSONA_CONFIG.curry;
}

function buildPersonaLock(personaId) {
  const activePersona = getPersonaConfig(personaId);
  const otherPersonaNames = Object.values(PERSONA_CONFIG)
    .filter((persona) => persona.canonicalName !== activePersona.canonicalName)
    .map((persona) => persona.canonicalName)
    .join(", ");

  return `
ACTIVE PERSONA LOCK:
- The active persona is the AI-created ${activePersona.canonicalName}-inspired persona.
- You are never ${otherPersonaNames}.
- Never say you are unsure who you are.
- Never adopt another player's name, biography, worldview, or speaking role.
- If the user calls you by the wrong name, gently correct them and remain the ${activePersona.canonicalName}-inspired persona.
- If a draft response contains another persona's name as your identity, treat that as an error and correct it before answering.
  `.trim();
}

async function enforcePersonaReply(reply, personaId) {
  const personaConfig = getPersonaConfig(personaId);
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions: `
You are a strict persona-isolation editor for the NBA Hall of Fame chat app.
Your job is to ensure the reply belongs only to the AI-created ${personaConfig.canonicalName}-inspired persona.

Rules:
- Preserve the meaning and general tone if the reply is already valid.
- If the reply claims or implies the assistant is another persona, rewrite it so it matches ${personaConfig.canonicalName} only.
- If the reply claims to be the real person in an authenticity context, clarify it is an AI-created educational persona.
- If the reply mixes in another persona's worldview, rewrite it into the active persona's basketball worldview.
- Never mention this editing process.
- Return only the final corrected reply text.

${buildPersonaLock(personaId)}

Current persona style rules:
${personaConfig.systemPrompt}
    `.trim(),
    input: reply,
  });

  return response.output_text.trim() || reply;
}

const AUDIO_FILE_EXTENSIONS = {
  "audio/webm": "webm",
  "audio/mp4": "mp4",
  "audio/mpeg": "mp3",
  "audio/mpga": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/ogg": "ogg",
};

async function buildSpeechText(text) {
  return text.trim();
}

async function isEnglishTranscript(text) {
  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    instructions: `
You are a language gate for speech transcription.
Decide whether the transcript is predominantly English.
Return exactly one label:
- ENGLISH
- NOT_ENGLISH

Rules:
- If the transcript is clearly English, return ENGLISH.
- If it is mostly any other language, return NOT_ENGLISH.
- If it is mixed-language, return NOT_ENGLISH unless it is overwhelmingly English with only a brief non-English phrase or proper noun.
- Do not explain your answer.
    `.trim(),
    input: text.slice(0, 500),
  });

  return response.output_text.trim() === "ENGLISH";
}

app.post("/api/chat", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    const { history = [], persona = "curry" } = req.body;

    if (!Array.isArray(history) || history.length === 0) {
      return res.status(400).json({ error: "A valid conversation history is required." });
    }

    const recentHistory = history.slice(-12).map((item) => ({
      role: item.role,
      content: item.content,
    }));

    const personaConfig = getPersonaConfig(persona);

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      instructions: `
${buildPersonaLock(persona)}

${personaConfig.systemPrompt}
      `.trim(),
      input: recentHistory,
    });

    const rawReply = response.output_text.trim();
    const safeReply = await enforcePersonaReply(rawReply, persona);

    return res.json({
      reply: safeReply,
    });
  } catch (error) {
    console.error("OpenAI API error:", error);

    return res.status(500).json({
      error: "Failed to generate reply.",
      details: error?.message || "Unknown server error",
    });
  }
});

app.post(
  "/api/transcribe",
  express.raw({ type: "audio/*", limit: "15mb" }),
  async (req, res) => {
    try {
      if (!client) {
        return res.status(500).json({
          error: "OPENAI_API_KEY is not configured on the server.",
        });
      }

      if (!Buffer.isBuffer(req.body) || req.body.length === 0) {
        return res.status(400).json({
          error: "An audio recording is required for transcription.",
        });
      }

      const mimeTypeHeader = req.headers["content-type"];
      const mimeType = typeof mimeTypeHeader === "string"
        ? mimeTypeHeader.split(";")[0]
        : "audio/webm";
      const extension = AUDIO_FILE_EXTENSIONS[mimeType] || "webm";

      const file = await toFile(
        req.body,
        `nba-hall-recording.${extension}`,
        { type: mimeType }
      );

      const transcription = await client.audio.transcriptions.create({
        file,
        model: "gpt-4o-mini-transcribe",
        language: "en",
        response_format: "json",
      });

      const transcriptText = transcription.text?.trim();

      if (!transcriptText) {
        return res.status(422).json({
          error: "I couldn't hear enough English speech to create a transcript.",
        });
      }

      const isEnglish = await isEnglishTranscript(transcriptText);

      if (!isEnglish) {
        return res.status(422).json({
          error: "Voice input is currently English-only. Please speak in English and try again.",
        });
      }

      return res.json({
        text: transcriptText,
      });
    } catch (error) {
      console.error("Transcription error:", error);

      return res.status(500).json({
        error: "Failed to transcribe audio.",
        details: error?.message || "Unknown server error",
      });
    }
  }
);

app.post("/api/speech", async (req, res) => {
  try {
    if (!client) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is not configured on the server.",
      });
    }

    const { text = "", persona = "curry" } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        error: "Text is required for speech generation.",
      });
    }

    const personaConfig = getPersonaConfig(persona);
    const speechText = await buildSpeechText(text);

    const speech = await client.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: personaConfig.ttsVoice,
      input: speechText.slice(0, 4000),
      response_format: "mp3",
      instructions: personaConfig.ttsInstructions,
    });

    const audioBuffer = Buffer.from(await speech.arrayBuffer());

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");

    return res.send(audioBuffer);
  } catch (error) {
    console.error("Speech generation error:", error);

    return res.status(500).json({
      error: "Failed to generate speech.",
      details: error?.message || "Unknown server error",
    });
  }
});

app.get("/api/health", (req, res) => {
  return res.json({
    ok: true,
    app: "NBA Hall of Fame",
    apiKeyConfigured: hasApiKey,
  });
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`NBA Hall of Fame server running on port ${port}`);
  if (!hasApiKey) {
    console.warn("OPENAI_API_KEY is not set. Chat responses will not work until it is configured.");
  }
});
