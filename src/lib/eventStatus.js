export function getRegistrationStatus(event, registeredCount = 0, now = new Date()) {
  const maxParticipants = Number(event?.max_participants);
  const hasParticipantLimit = Number.isFinite(maxParticipants) && maxParticipants > 0;
  const participantCount = Number.isFinite(Number(registeredCount)) ? Number(registeredCount) : 0;
  const deadline = event?.registration_deadline ? new Date(event.registration_deadline) : null;
  const deadlinePassed = Boolean(deadline && !Number.isNaN(deadline.getTime()) && deadline <= now);
  const manuallyOpen = event?.registration_open === true;
  const full = hasParticipantLimit && participantCount >= maxParticipants;

  let reason = 'open';
  if (!manuallyOpen) reason = 'manual';
  else if (deadlinePassed) reason = 'deadline';
  else if (full) reason = 'full';

  return {
    canRegister: manuallyOpen && !deadlinePassed && !full,
    deadlinePassed,
    full,
    manuallyOpen,
    reason,
    registeredCount: participantCount,
    maxParticipants: hasParticipantLimit ? maxParticipants : null,
    remainingSlots: hasParticipantLimit ? Math.max(maxParticipants - participantCount, 0) : null,
  };
}

export function getRegistrationStatusLabel(status) {
  if (status.canRegister) return 'Registration open';
  if (status.reason === 'deadline') return 'Registration closed';
  if (status.reason === 'full') return 'Registration full';
  return "Registration isn't open yet";
}
