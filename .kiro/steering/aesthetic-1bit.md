# Steering: 1-bit Instrument Aesthetic ("retro skin, modern use")

## Design tokens

- Paper (background): `#F4F1EA` (warm ivory)
- Ink (foreground): `#141413` (lamp black)
- Single accent: `#7A1F1F` (dried-blood red) used ONLY for status chips and the
  Exorcist Gate seal — never decorative.
- Dimmed ink: `#5A564D`. Evidence highlight: ink on `#EFE6C8` (candle glow).
- Two-color 1-bit rule applies to every rendered artifact surface (canvas,
  memory grid, cartridge screens). The chrome (page shell) may use the paper/
  ink/dimmed tokens — still no gradients.

## Hard bans (AI-slop tells)

No purple/indigo gradients, no Inter/Roboto, no default shadcn surfaces, no
rounded-2xl card stacks, no glassmorphism, no drop shadows at 10% opacity, no
emoji as UI icons, no centered hero with pill badge.

## Typography

- UI chrome: a characterful serif or mono stack with real personality
  (e.g. "IM Fell English SC" for the parlor frame, monospace pixel stack for
  the machine). Never system-ui as identity.
- Machine surfaces (canvas/grid): our own bitmap rendering; text drawn on
  canvas uses the cartridge's 1-bit glyphs.

## Motion and sound

- Motion: mechanical, immediate (no easing curves longer than 150ms). The
  automatic-writing effect reveals text character-by-character with a scratch
  cadence.
- Sound: 100% procedural Web Audio (paper scratch, static bursts, click).
  Master mute + "silence the dead" toggle. Zero audio files, zero copyrighted
  material.

## Cognitive states are materials, not labels (post-review, 2026-11-12)

The three truth states render as TEXTURE, primarily in the evidence panel:
- `verified` = clean solid pixels (candlelight clarity)
- `inferred` = halftone / dithered region (shadow)
- `unknown` = static / snow / torn-image glitch (mist)
Corrupted memory shows as static on the machine surface itself. The main
screen never displays the word UNKNOWN — the evidence panel speaks like a
coroner's report; the picture simply carries the damage. "No ghost responds"
(an unrecognizable or living file) is a themed, graceful séance failure,
never an error dialog.

## Accessibility and responsiveness (modern-use floor)

- Contrast >= 4.5:1 for all text (ink on paper is ~15:1).
- Full keyboard operation; visible focus; prefers-reduced-motion honored.
- Three-panel layout stacks to tabs under 900px; the judge may open this on a
  phone — it must not be broken there.
- All imagery passes through Atkinson dithering (6-neighbor error diffusion,
  25% error discarded) at exact device pixels; never rescale a dithered
  bitmap blindly.

## Copy voice

Understated, precise, a little haunted. Technical terms exact. No exclamation
marks. English only.
