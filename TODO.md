INTERACTION PAGE - 

2. **Founder Personality Quiz**  
   “What kind of founder are you?” Result types like Builder, Pitcher, Operator, Designer, Hacker.

6. **Digital Confession Booth**  
   Anonymous prompts like “My startup idea is…”, “I failed at…”, “I need a cofounder who…”.

9. **Paper Plane Message Sender**  
   Type a message, fold it into a paper plane, and it flies onto a public message board.

10. **E-Cell Arcade Cabinet**  
   Small arcade-style hub containing mini interactions/games.

18. **Polaroid Memory Wall**  
   Photos/cards scattered like physical Polaroids; drag, flip, zoom.




25. **Poll Station**  
   Quick campus polls: “Next workshop topic?”, “Best event format?”, “Hackathon theme?”


27. **Startup Hot Takes Wall**  
   Users post spicy opinions; others upvote/react.

29. **Build Buddy Match Prompt**  
   Lightweight form: “I’m good at X, looking for Y.”



33. **Startup Survival Game**  
   Choose actions each round: hire, build, pitch, pivot, fundraise.

36. **Cofounder Compatibility Game**  
   Pick traits and get a “team chemistry” score.

42. **Startup Trading Cards**  
   Generate a card for yourself: role, power stat, weakness, special ability.



60. **E-Cell FAQ Bot Terminal**  
   Not full AI, just clickable questions in a terminal interface.

1. **Campus Icebreaker Roulette**  
   Spin a wheel and get a random conversation starter for meeting another E-Cell person.

2. **“Who Should I Talk To?” Matcher**  
   User selects what they need: design help, coding help, pitch help, confidence, team. It suggests a type of person to find.

8. **Skill Marketplace**  
   Cards like “I can make posters”, “I can edit reels”, “I can code frontend”, “I need pitch help.”

11. **“Roast My Idea” Booth**  
   Submit a startup idea and get funny pre-written roast-style feedback, not AI-heavy.

15. **Random Team Name Generator**  
   Generates hackathon/team names like “The Pivot Pirates”, “Bug to Business”, etc.

17. **Cofounder Red Flag / Green Flag Game**  
   Swipe cards: “Replies after 3 days”, “Ships fast”, “Only talks about funding.”

19. **Event Memory Capsule**  
   Students leave notes after events. Later it becomes an archive per event.

28. **E-Cell Wall of Questions**  
   Anonymous questions people are scared to ask about startups, careers, team, pitching.

29. **Founder Myth or Fact**  
   Quick interactive cards breaking myths: “You need funding first”, “You need a perfect idea.”-

43. **Mentor Wishlist Wall**  
   Students vote on what mentors they want: founder, designer, investor, developer, marketer.

44. **Event Afterparty Wall**  
   After each event: photos, ratings, quotes, funniest moment, best learning.


WEBSITE - 

Replace dummy data with actual data


UPDATE admin panel

domain setup
security check in
rate limiting

TESTING


4. **SEO basics missing** — no favicon, no meta description, no Open Graph/Twitter card tags, no `sitemap.xml`, no `robots.txt`.
5. **No tests** — zero test files or test setup (Jest/Vitest/Playwright/Cypress).
6. **No CI/CD** — no `.github/workflows`, no committed `vercel.json`/`netlify.toml`.
7. **No README** — nothing documenting setup, scripts, or contribution process.



|
| File storage | Cloudflare R2 (generated ticket PDFs, backups) |
| Image storage | Cloudinary (event posters, media, CDN) |

| Analytics | Cloudflare Web Analytics (privacy-friendly, no cookies) |


update and test admin dashboard 


- CAPTCHA / spam protection on registrations, rate limiting


- Mobile scanner app (Flutter) as an alternative to the web scanner



-----

certificate generation + feedback after event architecture

**Best Flow**
1. **Event happens**
   - Admin marks event as `completed`.
   - Console unlocks a “Post-event” panel for that event.

2. **Admin creates feedback form**
   - Basic fields:
     - Overall rating
     - Session quality
     - Speaker/mentor rating
     - Organization rating
     - What did you learn?
     - What can be improved?
     - Would you attend again?
     - Testimonial permission checkbox
   - Optional custom questions per event.
   - Admin can set:
     - Feedback deadline
     - Certificate availability
     - Certificate template

3. **Feedback link goes live**
   - Public link:
     - `/events/[slug]/feedback`
   - Student enters:
     - registered email
   - System verifies they were registered.
   - also checks attendance if you track scanned QR check-ins. (yep thtats important , only give it for present attendees , not for every participant)

4. **Student submits feedback**
   - If valid:
     - Feedback is saved.
     - Certificate is generated instantly.
   - If already submitted:
     - Show existing certificate/download link.
   - If not eligible:
     - “No eligible registration found” or “Attendance not marked.”

5. **Certificate generation**
   - Certificate should use:
     - Student name
     - Event name
     - Event date
     - Organizer name
     - Certificate ID
   - Generated as PDF.
   - Stored or regenerated on demand.

6. **Certificate delivery**
   - Confirmation page:
     - “Thanks for your feedback”
     - Certificate preview/download
     - Optional “Share on LinkedIn” button
   - Email:
     - Send certificate PDF or certificate download link.

7. **Admin analytics**
   - Console shows:
     - Number of feedback responses
     - Average rating
     - Common improvement themes
     - Testimonials
     - Export CSV
     - individual answer.

**Database Shape**
You’d probably want:

`event_feedback_forms`
- `id`
- `event_id`
- `is_enabled`
- `certificate_enabled`
- `feedback_required_for_certificate`
- `deadline`
- `questions jsonb`
- `created_at`

`event_feedback_responses`
- `id`
- `event_id`
- `registration_id`
- `ticket_id`
- `rating_overall`
- `rating_content`
- `rating_speaker`
- `rating_organization`
- `answers jsonb`
- `testimonial`
- `allow_testimonial`
- `created_at`

`certificates`
- `id`
- `event_id`
- `registration_id`
- `feedback_response_id`
- `certificate_id`
- `pdf_url`
- `issued_at`

Maybe add to `events`:
- `feedback_open`
- `certificate_enabled`
- `certificate_template`
- `certificate_signatory_name`
- `certificate_signatory_title`

**Eligibility Logic**

   - Must be registered
   - Must be checked in/scanned
   - Must submit feedback
   - Then certificate unlocks


For team events:
- Each attendee should submit individual feedback.
- Each attendee gets their own certificate.
- Team leader should not generate certificates for everyone automatically.

**Admin UX**
Inside console event detail:

Tabs:
- Details
- Registrations
- Attendance
- Feedback
- Certificates

Feedback tab:
- Enable feedback
- Edit questions
- Responses table
- Export CSV

Certificates tab:
- Enable certificates
- Pick template
- Preview with dummy name
- Generate missing certificates


VERIFICATION OF CERTIFICATES STRICTLY NOT NEEDED


should i even store the certificates ,
like once i have a proper template, is it possible to generate certificate on the fly whenever needed?
just place in name and event name stuff etc 

possible using vercel serverless?