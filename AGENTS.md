# AGENTS.md

- User details (name, email, phone) are saved to `public.profiles` by a database trigger on account creation, from sign-up metadata — keeps saving reliable even if the client navigates away.
- The calendar span and preparation boundary live in `src/data/calendarData.ts` constants; all views and exports derive months from `src/utils/calendarRange.ts` — one source of truth for dates.
