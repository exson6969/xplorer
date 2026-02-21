# EXPLORER AI Agent - Frontend UI Layout Documentation

## Project Concept
A specialized AI travel assistant focused exclusively on Chennai, India, helping users plan personalized itineraries with optimized timelines for places, hotels, and local experiences.

---

## Screen 1: Landing Page

**Layout Structure:**
- Header with logo on left and "Get Started" button on right
- Full-screen hero section with Chennai-themed visuals
- Scroll-triggered sections below hero
- Footer with additional navigation

**Content Sections:**
- Hero area with tagline and primary CTA
- Feature highlights in card layout
- How it works steps
- Destination teaser cards
- Call-to-action section

---

## Screen 2: Home Page

**Layout Structure:**
- Collapsible left sidebar with navigation icons
- Main content area centered on screen
- Bottom or right section for supplementary content

**Main Content:**
- Prominent chat input bar at center
- Quick filter chips below chat input
- Carousel or grid of suggested experiences
- Visual tags for popular categories

**Sidebar Navigation:**
- Home
- Trips
- History
- Collapse/expand control

---

## Authentication Middleware

**Trigger Points:**
- Clicking any interactive element
- Typing in chat input
- Accessing protected tabs

**Visual Treatment:**
- Background content becomes blurred
- Centered modal overlay appears
- Modal contains authentication options

**Modal Content:**
- Welcome header
- Social login buttons
- Email/password form
- Account creation link
- Terms acceptance text

---

## Screen 3: Trips Tab - Active Planning

**Layout Structure:**
- Split screen with left and right panels
- Left panel occupies approximately 60%
- Right panel occupies approximately 40%

**Left Panel - Chat Interface:**
- Message history with alternating user and AI bubbles
- Dynamic input area that changes based on AI questions
- Input types include calendar, radio options, text fields, number selectors
- Send button at bottom

**Right Panel - Itinerary Display:**
- Day selector tabs at top
- Vertical timeline of activities
- Each activity shows time, place, duration
- Summary section with totals
- Action buttons at bottom

---

## Screen 4: History Tab

**Layout Structure:**
- Main content area with list view
- Search bar at top
- Filtered or grouped results

**Content Display:**
- Date-based section headers
- Card format for each past trip
- Each card shows trip summary and date
- Action buttons for view and continue
- Pagination or infinite scroll

---

## Screen 5: Profile Tab (Future)

**Layout Structure:**
- Standard profile form layout
- Two-column or single column based on screen size
- Settings sections grouped logically

**Content Sections:**
- Personal information
- Travel preferences
- Notification settings
- Account management

---

## UI Component Guidelines

**Built with ShadCN UI library including:**
- Cards for content containers
- Buttons with multiple variants
- Input fields with various states
- Navigation menus
- Tabs for content switching
- Modals for overlays
- Carousels for rotating content
- Badges and chips for filters
- Avatars for user representation

**CSS Variables for Theming:**
- Background and foreground colors
- Primary and accent colors
- Muted tones for secondary elements
- Card styles and shadows
- Border radius values
- Dark mode variable overrides

---

## Responsive Layout Behavior

**Desktop View:**
- Full sidebar visible
- Split panels maintain ratio
- Multi-column layouts

**Tablet View:**
- Collapsed sidebar with icons only
- Panels may adjust ratio
- Cards reduce to 2 columns

**Mobile View:**
- Bottom navigation replaces sidebar
- Panels stack vertically
- Single column for all content
- Toggle between chat and timeline

---

## User Flow Summary

Landing Page → Home Page → Authentication → Trips Tab → Chat + Timeline Interaction → History Tab Access → Profile Management

---

This documentation outlines the UI layout structure for all screens while leaving visual design details to the creative team.