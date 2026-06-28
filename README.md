# FCC2026 AV Project

This is the **AV room receiver** for the FCC2026 AI gimmick.

Open this page on the AV PC connected to the projector/screen. It listens for the approved command through Supabase Realtime, speaks the AI initiation line, and plays the initiation video.

## Files

- `index.html` — AV receiver page
- `av.js` — Supabase Realtime listener and video playback
- `styles.css` — FCC2026 visual theme
- `config.js` — public Supabase URL, anon key, shared session ID
- `assets/initiation.mp4` — your initiation/rickroll video, to be added by you

## Add your video

Put the video here:

```text
assets/initiation.mp4
```

Recommended format: MP4/H.264, 1920×1080.

## Run locally

From inside this folder:

```bash
python -m http.server 5501
```

Then open:

```text
http://localhost:5501/
```

Click **Enable AV Audio / Video** once. This is required because browsers block audio/video until the user interacts with the page.

## Configure

Edit `config.js`:

```js
SUPABASE_URL: "https://YOUR-PROJECT.supabase.co",
SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY",
SESSION_ID: "fcc2026-main-stage",
VIDEO_PATH: "assets/initiation.mp4"
```

Use exactly the same `SESSION_ID` in the Stage project.

## Publish to GitHub Pages

Create a repository, for example:

```text
fcc2026-av
```

Upload this folder's contents to the repository root. Then enable:

```text
Settings > Pages > Deploy from branch > main > /root
```

The live URL will look like:

```text
https://YOUR-GITHUB-USERNAME.github.io/fcc2026-av/
```

## AV operation

1. Open the AV URL on the AV room PC.
2. Connect the PC to projector/screen and sound system.
3. Click **Enable AV Audio / Video** once.
4. Keep the browser tab open.
5. Wait for the stage command.
6. When Stage says the approved phrase, this page plays `assets/initiation.mp4`.

## Display fit note

The AV receiver screen is designed for projector/full-screen use. Press `F11` in Chrome/Edge for full screen. The centre card now scales the FCC2026 artwork to fit within 16:9 displays without cutting the button or status area.
