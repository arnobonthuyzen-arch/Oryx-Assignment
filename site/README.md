# Salt Within Reach — NFC landing page

Next.js implementation of the `NFC Landing Page.dc.html` design from the Claude
Design handoff bundle (`../project/`). This is the page an Oryx Desert Salt
grinder's NFC tag opens when tapped: the brand story, the ceramic
grinder/refill pitch, and a CTA to the Oryx Desert Salt shop.

## Stack

- Next.js 14 (App Router), plain JS — no other frameworks.
- Fonts (Space Grotesk, Poppins) are self-hosted at build time via
  `next/font/google` — no runtime request to Google Fonts.
- No component library / CSS framework — one global stylesheet
  (`app/globals.css`) mirroring the design's exact type scale, spacing and
  color values.
- All interactivity (scroll reveals, parallax, count-up stats, scroll
  progress bar, hero video) is plain DOM/IntersectionObserver code in a single
  client component (`app/page.js`), with `prefers-reduced-motion` respected.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build
npm run start     # production server
```

## Structure

```
app/
  layout.js     # fonts, <html>/<body>, metadata
  page.js       # the whole page (client component)
  globals.css   # all styles
  icon.png      # favicon (Oryx head mark)
public/
  assets/       # photography + hero video, copied from project/assets
```

## Notes

- The CTA points to `https://oryxdesertsalt.co.za` — edit `CTA_URL` /
  `CTA_LABEL` at the top of `app/page.js` to change it.
- The original `.dc.html` prototype worked around its preview host not
  supporting HTTP range requests (needed for Safari video playback) by
  fetching the whole video and handing the `<video>` a blob URL. A normal
  Next.js/Node static file server serves range requests correctly, so this
  build uses a plain `<video>` + `<source>` instead.
