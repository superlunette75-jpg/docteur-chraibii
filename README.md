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
  render.js              fills the page in one language (shared by the browser and the prerender)
  app.js                 languages, animations, booking sheet
  en/, ar/               English and Arabic pages (generated)
  sitemap.xml, robots.txt, llms.txt   (generated)
  images/                photos (generated, webp) and icons/
netlify/functions/chat.mjs   AI assistant (Claude API), served at /api/chat
scripts/prerender.mjs    writes the 3 language pages, SEO tags, sitemap, robots.txt, llms.txt
```

## Languages

- `/` French, `/en/` English, `/ar/` Arabic: each has its own address, title, description and structured data, so Google can show the right one.
- On the home page, a first-time visitor sees the language of their phone (French, English or Arabic). Any other phone language (Dutch, German, Spanish…) gets English. A language chosen with the FR / EN / ع buttons is remembered.

## SEO and AI search

After any change to `site/data.js` or `site/index.html`, run `npm install` once, then `npm run prerender`, and commit the result. It writes the complete text of every section into the HTML (Google and AI assistants read it without JavaScript), plus:
- title, description, canonical and hreflang links, Open Graph tags
- schema.org data: Dentist / MedicalClinic (address, map, hours, rating, treatments, languages), WebPage and FAQPage
- `sitemap.xml`, `robots.txt` (search engines and AI crawlers allowed) and `llms.txt` (plain summary for AI assistants)

**Set the real domain** in `siteUrl` in `site/data.js` (currently `https://dr-chraibi.netlify.app`), then run `npm run prerender` again.

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
