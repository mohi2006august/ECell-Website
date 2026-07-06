// The interactions catalogue. Each entry becomes a row on /interactions and
// links to its own page at /interactions/<slug>. Add a new interaction by
// adding an entry here AND creating src/pages/interactions/<slug>.astro.
export const interactions = [
  {
    slug: 'sticky-wall',
    title: 'Sticky Wall',
    tagline: 'Pin a note to the shared board',
    icon: 'solar:notes-linear',
    accent: '#fbbf24',
  },
  {
    slug: 'event-wishlist',
    title: 'Event Wishlist',
    tagline: 'Suggest and upvote events you want',
    icon: 'solar:lightbulb-bolt-linear',
    accent: '#fb7185',
  },
  {
    slug: 'cofounders',
    title: 'Find a Cofounder',
    tagline: 'Post what you’re building and who you need',
    icon: 'solar:users-group-two-rounded-linear',
    accent: '#7dd3fc',
  },
  {
    slug: 'tv',
    title: 'E-Cell TV',
    tagline: 'A retro reel of memories, on loop',
    icon: 'solar:tv-linear',
    accent: '#a3e635',
  },
  {
    slug: 'glossary',
    title: 'Startup Glossary',
    tagline: 'Flip cards for MVP, TAM, GTM & more',
    icon: 'solar:book-2-linear',
    accent: '#c4b5fd',
  },
  {
    slug: 'would-you-rather',
    title: 'Would You Rather',
    tagline: 'Founder-edition dilemmas, your call',
    icon: 'solar:like-linear',
    accent: '#fb923c',
  },
  {
    slug: 'question-box',
    title: 'Question Drop Box',
    tagline: 'Ask founders, mentors & the team',
    icon: 'solar:inbox-in-linear',
    accent: '#2dd4bf',
  },
  {
    slug: 'idea-machine',
    title: 'Idea Machine',
    tagline: 'Pull the lever for a startup idea',
    icon: 'solar:magic-stick-3-linear',
    accent: '#f472b6',
  },
];

export default interactions;
