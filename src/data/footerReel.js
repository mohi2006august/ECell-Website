// ─────────────────────────────────────────────────────────────────────────
// Footer retro-TV reel  →  shown by <RetroReel /> (src/components/RetroReel.astro)
//
// EDIT ME: this is the playlist for the little TV in the footer. Add your
// E-Cell YouTube videos, Cloudinary clips, or photos here. Items play/rotate
// in order, muted, and loop. Delete the seed items below once you add yours.
//
// Item types:
//   YouTube video (autoplays muted):
//     { type: 'youtube', id: 'dQw4w9WgXcQ', caption: 'E-Summit Aftermovie' }
//     …or paste a full link instead of an id:
//     { type: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ', caption: '...' }
//
//   Video file / Cloudinary mp4 (autoplays muted, loops):
//     { type: 'video', src: 'https://res.cloudinary.com/<cloud>/video/upload/clip.mp4', caption: 'PitchQuest' }
//
//   Photo / memory (Cloudinary or any image URL, or a local /images/… path):
//     { type: 'image', src: 'https://res.cloudinary.com/<cloud>/image/upload/photo.jpg', caption: 'E-Conclave 2025' }
//
// caption is optional (shown as a small overlay on the screen).
// ─────────────────────────────────────────────────────────────────────────

export const footerReel = [
  // ▼▼ Seed placeholders — replace these with your real links ▼▼
  { type: 'image', src: '/images/ecell-logo.png', caption: 'E-Cell VJIT' },
  { type: 'image', src: '/images/team-placeholder.svg', caption: 'Our Community' },

  // ▼▼ Examples (uncomment and edit) ▼▼
  // { type: 'youtube', url: 'https://youtu.be/XXXXXXXXXXX', caption: 'E-Summit Aftermovie' },
  // { type: 'video', src: 'https://res.cloudinary.com/<cloud>/video/upload/highlight.mp4', caption: 'Hackathon 2025' },
  // { type: 'image', src: 'https://res.cloudinary.com/<cloud>/image/upload/pitchquest.jpg', caption: 'PitchQuest' },
];

export default footerReel;
