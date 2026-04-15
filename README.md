# NBA Hall of Fame

NBA Hall of Fame is a lightweight full-stack web app for chatting with AI-created educational personas inspired by basketball legends. The current roster includes Stephen Curry, Kobe Bryant, LeBron James, Magic Johnson, Michael Jordan, and Shaquille O'Neal.

The app focuses on basketball learning: mindset, practice habits, leadership, pressure, film study, confidence, and how different players approached the game.

## Features

- Multi-persona NBA legend chat experience
- Persona-specific prompts, descriptions, and suggested questions
- Express backend with OpenAI API integration
- Speech-to-text microphone input
- AI-generated text-to-speech replies
- Persona isolation guardrails on the server
- Responsive HTML, CSS, and vanilla JavaScript frontend

## Important Disclaimer

All player personas are AI-created educational simulations. They are not the real players, do not represent the players personally, and do not have access to private memories or current private information.

Audio replies are AI-generated persona-inspired voices. They are not authentic recordings or voice clones of the real players.

## Tech Stack

- Node.js
- Express
- OpenAI API
- HTML
- CSS
- JavaScript

## Project Structure

```text
index.html       Main page structure
styles.css       Responsive visual design
script.js        Frontend chat, persona, and audio logic
server.js        Express routes and OpenAI integration
package.json     Scripts and dependencies
README.md        Project documentation
```

## Requirements

Before running locally, install:

- Node.js
- npm
- An OpenAI API key

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root:

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000
```

Start the server:

```bash
npm start
```

Open the app:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm start
```

Runs the Express server.

```bash
npm run dev
```

Runs the same server entry point for local development.

## API Routes

`POST /api/chat`

Generates a persona-based chat reply from recent conversation history.

`POST /api/transcribe`

Accepts recorded audio and returns an English transcript.

`POST /api/speech`

Generates an MP3 audio response from assistant text.

`GET /api/health`

Returns basic server health and whether an API key is configured.

## Voice Notes

Microphone input depends on browser recording support. The current transcription flow is English-only, and the server rejects speech that is not predominantly English.

Text chat can still work without microphone access, as long as the backend has a valid `OPENAI_API_KEY`.

## Common Issues

### OPENAI_API_KEY is not configured

Make sure `.env` exists in the project root and contains a valid key:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

Restart the server after changing `.env`.

### Port already in use

If port `3000` is busy, either stop the other process or change the `PORT` value in `.env`.

### Audio playback is blocked

Some browsers block autoplay. Click the `Listen` button on an assistant message to play the generated audio manually.

## Deployment

For Render or similar Node hosting:

- Build command: `npm install`
- Start command: `npm start`
- Environment variable: `OPENAI_API_KEY`
- Optional environment variable: `PORT`

## Development Notes

Do not commit `.env`, API keys, or `node_modules`.

The persona behavior depends on server prompts in `server.js`. Update those prompts carefully if you add more legends or change the tone of the experience.
