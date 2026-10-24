# Cabinet dentaire Dr. Chraibi (Saada, Marrakech)

Phone-first website for the clinic, in French, English and Arabic (right-to-left). It does two main things:

1. **Book an appointment**: the patient picks a treatment, a day and a time slot (built from the opening hours), then the request is sent to the clinic's WhatsApp, already written. The clinic confirms on WhatsApp.
2. **Talk to the assistant**: a chatbot answers questions in FR / EN / AR / Darija, asks about the problem (pain, gums, whitening…), proposes the right treatment ("Do you want to book…?") and, on "yes", shows the calendar inside the chat.

## Structure

```
site/                    static site (published as is, no build step)
  index.html             page
  styles.css             look (colour tokens in :root)
  data.js                ALL content: phone, WhatsApp, hours, services, FR/EN/AR texts, reviews
  booking.js             calendar + WhatsApp message
  chat.js                chat UI + built-in assistant (works with no server)
  app.js                 languages, sections, animations, booking sheet
  images/                photos (generated, webp) and icons/
netlify/functions/chat.mjs   AI assistant (Claude API), served at /api/chat
```

## Deploy on Netlify

1. Connect this repository in Netlify. `netlify.toml` already sets `publish = "site"` and the functions folder.
2. In **Site settings → Environment variables**, add `ANTHROPIC_API_KEY` (from console.anthropic.com) to turn on the AI assistant.
   Optional: `CLAUDE_MODEL` to use another model (default `claude-opus-5-5`).
3. Deploy. Without the key, the chat still works using the built-in assistant in `site/chat.js` (keyword-based, trilingual).

## Things to check with the clinic

- WhatsApp number: `212602828763` (the number on Google Maps). Change `whatsapp` in `site/data.js` if the clinic uses another one.
- Hours are taken from Google Maps (Mon–Fri 09:00–19:00, Sat 09:00–13:00). Add a lunch break in `breaks` if needed, and the slot length in `slotMinutes`.
- Services list: adjust to what Dr. Chraibi actually offers (from his card).
- Slots shown are the opening-hour slots; the site cannot see the real agenda, so the clinic confirms each request on WhatsApp.

Deep links: `/#reserver` opens the booking, `/#assistant` opens the chat, `?lang=ar` / `?lang=en` force a language.
