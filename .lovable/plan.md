

## Capture Live Calendar Screenshots for Preview Carousel

### Overview
Create a temporary public route to render the calendar without login/payment, capture 3 high-quality screenshots of different views, replace the current preview images, update the carousel, then clean up the temporary route.

### Step-by-Step

**Step 1: Create temporary preview page**
Create `src/pages/PreviewCapture.tsx` that renders the `Index` component directly with a mock user object and a no-op sign-out function. This bypasses the `CalendarPage` auth/payment checks entirely. The calendar data loads from `localStorage` defaults, so all 100+ pre-loaded events will display automatically.

**Step 2: Add temporary route**
Add `/preview-capture` to the routes in `src/App.tsx` pointing to this new page.

**Step 3: Capture 3 screenshots at 1920x1080**
Using the browser tool:
- **Screenshot 1 -- Month Calendar View**: The default view showing the March 2026 calendar grid with color-coded events, the stats bar across the top, category filters, and the "Events This Month" sidebar
- **Screenshot 2 -- Year View**: Click "Year View" to show all 13 months in a responsive grid
- **Screenshot 3 -- Event Detail / Filters**: Navigate back to month view, click on an event to show the event detail modal overlay on top of the calendar

**Step 4: Replace preview images**
Save the 3 captured screenshots as:
- `src/assets/preview-month-view.jpg` (Month Calendar)
- `src/assets/preview-year-view.jpg` (Year View)
- `src/assets/preview-event-detail.jpg` (Event Detail Modal)

**Step 5: Update carousel to use only 3 images**
Update `src/components/PreviewCarousel.tsx` to show only 3 slides with accurate titles/descriptions matching the actual screenshots:
1. "Month Calendar View" -- "Color-coded events on a clean calendar grid with category stats at a glance"
2. "Year Overview" -- "All 13 months displayed in a grid -- see the full academic year at once"
3. "Event Details" -- "Click any event to view, edit, or delete -- full customization at your fingertips"

Remove the old unused imports (`previewFilters`, `previewTable`).

**Step 6: Clean up**
- Delete `src/pages/PreviewCapture.tsx`
- Remove the `/preview-capture` route from `src/App.tsx`

### Files to modify
| File | Change |
|------|--------|
| `src/pages/PreviewCapture.tsx` | Create temporarily for screenshot capture, then delete |
| `src/App.tsx` | Add temporary route, then remove |
| `src/assets/preview-month-view.jpg` | Replace with fresh screenshot |
| `src/assets/preview-year-view.jpg` | Replace with fresh screenshot |
| `src/assets/preview-event-detail.jpg` | Replace with fresh screenshot |
| `src/components/PreviewCarousel.tsx` | Update to 3 slides only, remove unused imports |

### No new dependencies needed
Uses existing React components and browser screenshot tools.

