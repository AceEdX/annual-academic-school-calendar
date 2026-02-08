

## Annual School Academic Calendar by AceEdX -- Rebranding and Auth Flow Update

### Overview
This plan covers three main changes:
1. **Rebrand** the entire app from "SchoolCal" to "Annual School Academic Calendar by AceEdX" with blue, gold, and white brand colors
2. **Embed the AceEdX logo** (uploaded image) throughout the app
3. **Redirect logged-in users** to the landing/purchase page (instead of requiring them to navigate there manually)

---

### 1. Add the AceEdX Logo to the Project

Copy the uploaded logo file (`Ace_EduX_Logo_3.png`) into `src/assets/` so it can be imported in React components.

---

### 2. Update Brand Colors (Blue, Gold, White)

Modify `src/index.css` CSS custom properties to use AceEdX brand colors:

- **Primary** -- Blue (from the logo gradient, approximately `hsl(210, 70%, 45%)` or similar deep blue)
- **Accent** -- Gold/amber (keeping the current warm gold `hsl(38, 92%, 50%)` which already matches)
- **Background/Card** -- White and near-white tones
- **Primary foreground** -- White text on blue backgrounds

This affects the entire app since all components use these CSS variables via Tailwind.

---

### 3. Update Landing Page (`src/pages/Landing.tsx`)

- **Navbar**: Replace the GraduationCap icon + "SchoolCal" text with the AceEdX logo image. Update title text.
- **Hero Section**: Change heading to **"Annual School Academic Calendar"** with "by AceEdX" as a subtitle/badge.
- **CTA buttons**: Will automatically pick up the new blue primary color.
- **Footer**: Update branding text to reference AceEdX.
- **Razorpay theme color**: Update from teal to brand blue in `PaymentModal.tsx`.

---

### 4. Update Auth Page (`src/pages/Auth.tsx`)

- Replace the GraduationCap icon with the AceEdX logo image.
- Update heading text from "School Calendar" references to "Annual School Academic Calendar by AceEdX".

---

### 5. Update Calendar Page Header (`src/pages/Index.tsx`)

- Replace the GraduationCap icon in the header with the AceEdX logo.
- Change the title from "School Annual Calendar" to "Annual School Academic Calendar by AceEdX".

---

### 6. Redirect Logged-In Users to Landing Page

Currently, when a user logs in via `Auth.tsx`, they are redirected to `/` (the landing page). The landing page already checks if the user has paid and redirects to `/calendar` if so. If they haven't paid, they see the landing page with the "Buy Now" button.

This flow already works correctly -- logged-in users who haven't paid will land on the purchase page. No routing changes are needed; the existing logic handles this.

---

### 7. Update Page Title (`index.html`)

Change the document title and meta tags from "Lovable App" to "Annual School Academic Calendar by AceEdX".

---

### Files to Modify

| File | Changes |
|------|---------|
| `src/assets/` | Add `Ace_EduX_Logo_3.png` |
| `src/index.css` | Update primary color from teal to brand blue |
| `src/pages/Landing.tsx` | New heading, AceEdX logo, updated branding text |
| `src/pages/Auth.tsx` | AceEdX logo, updated heading text |
| `src/pages/Index.tsx` | AceEdX logo in header, updated title |
| `src/components/PaymentModal.tsx` | Update Razorpay theme color to brand blue |
| `index.html` | Update document title and meta description |

---

### Technical Details

**Color values derived from the logo:**
- Primary blue: `hsl(215, 65%, 42%)` -- deep blue from logo
- Accent gold: `hsl(38, 92%, 50%)` -- matches the gold "A" and "d" in the logo text (already set)
- Background: `hsl(0, 0%, 100%)` -- pure white
- Card: `hsl(0, 0%, 100%)` -- white cards

**Logo usage:**
- Import as ES6 module: `import aceEdxLogo from "@/assets/Ace_EduX_Logo_3.png"`
- Render as an `<img>` tag with appropriate sizing (e.g., `h-10` in navbar, `h-16` on auth page)

**No new dependencies required** -- all changes use existing Tailwind utilities and React patterns.

