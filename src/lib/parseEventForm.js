function str(formData, field) {
  const value = formData.get(field)?.toString().trim();
  return value ? value : null;
}

function num(formData, field) {
  const value = formData.get(field)?.toString().trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

function bool(formData, field) {
  return formData.get(field)?.toString() === 'true';
}

function json(formData, field) {
  const value = formData.get(field)?.toString().trim();
  if (!value) return null;
  return JSON.parse(value); // caller should catch
}

export function parseEventForm(formData) {
  return {
    title: str(formData, 'title'),
    slug: str(formData, 'slug'),
    short_description: str(formData, 'short_description'),
    long_description: str(formData, 'long_description'),
    date: str(formData, 'date'),
    time: str(formData, 'time'),
    venue: str(formData, 'venue'),
    location_map_link: str(formData, 'location_map_link'),
    mode: str(formData, 'mode'),
    event_type: str(formData, 'event_type'),
    status: str(formData, 'status'),
    is_featured: bool(formData, 'is_featured'),
    registration_open: bool(formData, 'registration_open'),
    max_participants: num(formData, 'max_participants'),
    registration_deadline: str(formData, 'registration_deadline'),
    requirements: str(formData, 'requirements'),
    prerequisites: str(formData, 'prerequisites'),
    is_team_event: bool(formData, 'is_team_event'),
    min_team_size: num(formData, 'min_team_size'),
    max_team_size: num(formData, 'max_team_size'),
    is_paid: bool(formData, 'is_paid'),
    price: num(formData, 'price'),
    payment_link: str(formData, 'payment_link'),
    prize_pool: str(formData, 'prize_pool'),
    poster_url: str(formData, 'poster_url'),
    recap_link: str(formData, 'recap_link'),
    certificate_template_url: str(formData, 'certificate_template_url'),
    gallery_images: json(formData, 'gallery_images'),
    speakers: json(formData, 'speakers'),
    judges: json(formData, 'judges'),
    chief_guest: json(formData, 'chief_guest'),
    winners: json(formData, 'winners'),
  };
}
