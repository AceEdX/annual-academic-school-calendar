

## Capture Live Calendar Screenshots for Landing Page Preview

### Problem
The calendar page is behind authentication and payment gates, so we can't directly screenshot it. We need actual screenshots of the calendar features to use in the landing page preview carousel.

### Approach
We will temporarily add a public preview route that renders the calendar UI without requiring login, capture 3 high-quality screenshots of different views, save them as image assets, then remove the temporary route.

### Step-by-Step

**Step 1: Create a temporary public preview page**
Create `src/pages/PreviewCapture.tsx` -- a simplified version of the calendar page that renders the `Index` component with a mock user object and no auth checks. This allows the browser tool to access and screenshot it.

**Step 2: Add a temporary route**
Add `/preview-capture` route in `src/App.tsx` pointing to the new page.

**Step 3: Capture 3 screenshots using the browser tool**
- **Screenshot 1 -- Month Calendar View**: The main calendar grid with the color-coded events, navigation, stats bar, and event sidebar visible
- **Screenshot 2 -- Year View**: Switch to "Year View" mode showing all 13 months in a grid layout  
- **Screenshot 3 -- Event Filters / Event Details**: Show the filter toggles and event list with categories highlighted

Each screenshot will be taken at 1920x1080 for crisp, high-resolution preview images.

**Step 4: Save screenshots as assets**
Replace the existing preview images:
- `src/assets/preview-table-view.jpeg` (Month Calendar View)
- `src/assets/preview-calendar-view-1.jpeg` (Year View)
- `src/assets/preview-calendar-view-2.jpeg` (Filters and Events)

**Step 5: Update carousel captions**
Update the `SCREENSHOTS` array in `Landing.tsx` with accurate titles and descriptions matching the actual screenshots taken.

**Step 6: Clean up**
- Delete `src/pages/PreviewCapture.tsx`
- Remove the `/preview-capture` route from `App.tsx`

**Step 7: Add auto-play transitions**
Enhance the carousel with smooth auto-playing transitions (4-second interval) with:
- Fade/slide CSS animation between slides
- Pause on hover
- Animated progress bar indicator
- Manual navigation still works

### Files to modify
| File | Change |
|------|--------|
| `src/pages/PreviewCapture.tsx` | Create temporarily, then delete |
| `src/App.tsx` | Add temporary route, then remove |
| `src/assets/preview-*.jpeg` | Replace with actual screenshots |
| `src/pages/Landing.tsx` | Update carousel captions and add auto-play |
| `src/index.css` | Add progress bar animation keyframes |

### No new dependencies needed
All changes use existing React hooks and CSS transitions.

