Lagos Service Hub — UI Wireframes

Design Principles
- Mobile-first responsive with breakpoints: 640px (sm), 768px (md), 1024px (lg)
- Consistent spacing scale (4px base), clear typographic hierarchy
- Accessible: proper labels, ARIA roles, keyboard navigation, visible focus
- Smooth micro-interactions and transitions (Framer Motion)
- 6-theme support: light, dark, midnight, warm-night, ocean-breeze, sunset-gold
- Lagos-only constraint visible where location appears (badges, filters)

Common Components (shared)
- Header: logo, navigation, theme toggle, auth actions
- Footer: links, contact, social
- Button: primary, secondary, outline, subtle; disabled; loading
- Input: text, email, password, number; with validation hints and icons
- Select/Autocomplete: category, price range, rating
- Badge: role, verification, location
- Card: seller, job, stat
- Modal/Drawer: filters (mobile), confirmations
- Pagination: page numbers, next/prev, page size (limit)
- Skeletons: list, card, form
- Toasts: success, error, info
- Tabs: profile sections, dashboard views
- Upload controls: drag-drop zones, file previews, progress
- Timeline: job status progression

1) Landing Page (Public)
- Layout
  - Header: sticky, transparent on hero, theme toggle, Login/Register
  - Main: hero, how-it-works, categories, featured sellers, trust indicators
  - Footer: links (About, Terms, Privacy, Contact)
- Components
  - Hero: title, subtitle, “Find a verified seller” CTA, background illustration
  - How-it-Works: 3 steps with icons (Browse → Fund Escrow → Get Service)
  - Categories: grid of cards (electrical, plumbing, cleaning, painting, etc.)
  - Featured Sellers: carousel with avatar, name, rating, category, Lagos badge, verified tick
  - Trust Indicators: escrow badge, ID-verified badge, audit oversight
- Interactions
  - CTA scrolls to browse with query preset
  - Category click navigates to Browse with filter applied
  - Carousel auto-play and manual arrows
- Mobile
  - Hero content centers; categories become 2-column; carousel shows 1 card
- Theme Integration
  - Hero background and CTA colors adapt per theme
- Loading
  - Categories skeleton tiles, carousel skeleton cards
- Error
  - Fetch errors show retry button
- Empty
  - If no featured sellers, display “New platform—be the first to join” banner

2) Browse/Search Page (Public)
- Layout
  - Header: search bar prominent
  - Main: filter panel (left on desktop), seller grid (right)
  - Footer: standard
- Components
  - Search Bar: input with autocomplete suggestions (seller name, category)
  - Filters: category select, location (fixed Lagos), rating slider, price range slider, sort select (rating, price, most verified)
  - Seller Cards: avatar, name, verified badge, rating stars, service summary, starting price, Lagos badge, “View Profile”
  - Pagination: page, limit, total
- Interactions
  - Autocomplete suggestions; pressing Enter triggers search
  - Filters update results; “Clear filters” button resets
  - Pagination maintains query params
- Mobile
  - Filters in drawer; “Filters” button above grid; search bar full-width
- Theme Integration
  - Card hover, filter drawer background adapt per theme
- Loading
  - Grid skeleton placeholders; filter controls disabled briefly
- Error
  - Inline alert with retry; maintain user input
- Empty
  - “No sellers match your filters” with “Try adjusting category or price”

3) Seller Profile Page (Public)
- Layout
  - Header: consistent
  - Main: hero, about, portfolio, testimonials, service details, contact CTA, availability
- Components
  - Hero: avatar, name, verification badge, rating, category chips, Lagos badge
  - About: 20-word summary, extended bio toggle
  - Portfolio: 4+ images, lightbox gallery
  - Testimonials: list with rating, comment, buyer name
  - Service Details: offerings, price tiers, inclusions/exclusions
  - Contact CTA: “Chat with Seller”
  - Availability: online/offline indicator
- Interactions
  - Lightbox on image click
  - CTA navigates to chat with job context option
- Mobile
  - Content stacks; portfolio becomes 2-column; sticky CTA at bottom
- Theme Integration
  - Lightbox overlay adapts to theme; badges colored per theme palette
- Loading
  - Skeleton for hero, portfolio placeholders
- Error
  - Profile fetch error with retry
- Empty
  - No testimonials: “Be the first to review”

4) Registration Page
- Layout
  - Header: minimal
  - Main: single-column form, role selection
  - Footer: terms link
- Components
  - Role Selector: Buyer/Seller toggle cards
  - Form: email, password (strength meter), first/last name, phone, address (Lagos), theme preference select, terms checkbox
  - Submit button
- Interactions
  - Password strength meter updates real-time (length, complexity)
  - Terms checkbox required
- Mobile
  - Single column; inputs full-width
- Theme Integration
  - Inputs, focus rings, meter colors adjust per theme
- Loading
  - Submit shows inline spinner; disables inputs
- Error
  - Validation messages under fields; top-level alert for server errors
- Empty
  - N/A (form entry)

5) Login Page
- Layout
  - Header: minimal
  - Main: card with form
- Components
  - Email, password inputs
  - Remember me checkbox
  - Forgot password link
  - Register redirect
  - Social login placeholders (disabled buttons)
- Interactions
  - Remember me saves session hint
- Mobile
  - Single column; card full-width on small screens
- Theme Integration
  - Card background and inputs adapt
- Loading
  - Spinner on login; disable form
- Error
  - Invalid credentials message; link to reset
- Empty
  - N/A

6) Buyer Dashboard
- Layout
  - Header: theme toggle, user menu
  - Main: greeting, quick stats, active jobs list, recent chats, browse CTA
- Components
  - Greeting: time-based message with name
  - Quick Stats: cards (active, completed, total spent)
  - Active Jobs: cards with status badge, seller avatar, next action
  - Recent Chats: list of conversations with unread count
  - Browse CTA: button to browse page
- Interactions
  - Job card actions: Pay deposit, Submit satisfaction report, Rate seller
  - Chat click opens chat page
- Mobile
  - Stack stats above jobs; chats below
- Theme Integration
  - Stat card accents vary per theme
- Loading
  - Skeletons for stats and job cards
- Error
  - Dashboard fetch error with retry
- Empty
  - “No active jobs. Browse verified sellers” with CTA

7) Seller Dashboard
- Layout
  - Header: user menu, theme toggle
  - Sidebar: collapsible navigation (Profile, Jobs, Earnings, Messages, Settings)
  - Main: greeting, quick stats, job requests, recent messages, portfolio manager, verification banner
- Components
  - Greeting
  - Stats: pending jobs, completed jobs, total earnings, average rating
  - Job Requests: cards with accept/decline actions
  - Messages: list with unread badge
  - Portfolio Manager: add/remove images, drag-drop, reorder
  - Verification Banner: status (pending/verified/rejected), actions to upload ID
- Interactions
  - Accept/Decline triggers confirmation modal
  - Upload images with progress bar
- Mobile
  - Sidebar collapses into hamburger; content stack
- Theme Integration
  - Sidebar and banners adapt; verified badge color per theme
- Loading
  - Skeletons for stats, job requests
- Error
  - Inline alerts for actions failing
- Empty
  - No requests: “You’ll see job requests here”

8) Seller Onboarding Wizard (Multi-step)
- Layout
  - Header: progress indicator
  - Main: step content; footer: Back/Next/Submit
- Components
  - Step 1: personal details (name, phone, address in Lagos)
  - Step 2: service details (category, summary, pricing tiers)
  - Step 3: ID upload (drag-drop/browse, file type/size validation, preview)
  - Step 4: portfolio upload (min 4 images, drag-drop, preview grid)
  - Step 5: review and submit (summary of inputs)
- Interactions
  - Validation per step; cannot proceed until valid
  - Progress bar shows step index and completion
- Mobile
  - Full-width steps; sticky footer actions
- Theme Integration
  - Progress bar and step headers adapt
- Loading
  - Upload progress indicators
- Error
  - Validation hints; server error banners on submit
- Empty
  - Placeholder previews before uploads

9) Job Details Page
- Layout
  - Header: consistent
  - Main: job summary, status timeline, payment breakdown, chat window, role-based actions, payment status
- Components
  - Summary: service, agreed amount, buyer/seller info, Lagos badges
  - Status Timeline: proposed → funded → in_progress → partial_completed → completed; disputed/cancelled markers
  - Payment Breakdown: 70% deposit, 10% commission, 90% payout; tooltips explaining calculations
  - Chat Window: messages list, input, attachments; job context banner
  - Actions:
    - Buyer: Pay deposit, Submit satisfaction report, Rate seller
    - Seller: Accept job, Mark milestone complete, Request release
  - Payment Status: card with Paystack reference and states
- Interactions
  - Socket updates for chat and status changes
  - Satisfaction form modal (>= 50% slider)
- Mobile
  - Timeline compresses to step badges; chat in full-screen modal
- Theme Integration
  - Timeline colors adapt; payment card variant per theme
- Loading
  - Skeletons for summary and timeline; chat loader
- Error
  - Payment verification error banner; retry
- Empty
  - No messages yet: “Start conversation to coordinate”

10) Chat Page
- Layout
  - Split view: conversations (left) + active chat (right)
  - Mobile: full-screen chat, back button to conversations
- Components
  - Conversations List: avatars, last message preview, unread indicators, job badges
  - Active Chat: message bubbles (sender right, recipient left), input, send button, attachments
  - Job Context Banner: job title, status, quick action link
- Interactions
  - WebSocket connect; typing indicator; read receipts
  - File attachment preview and upload progress
- Mobile
  - Conversations become a screen; active chat is another; back to list
- Theme Integration
  - Bubble colors and background adapt
- Loading
  - Skeleton list while fetching; spinner on send
- Error
  - Connection error toast; auto-reconnect attempts
- Empty
  - “No conversations yet. Start from a seller profile.”

11) Payment Flow Pages
- Layout
  - Summary: amount breakdown and job details
  - Paystack: iframe/redirect container
  - Success: confirmation and next steps
  - Failure: error message with retry
- Components
  - Amount Breakdown: 70% deposit calculation based on agreed amount; 10% commission note
  - Paystack Container: responsive iframe or redirect instruction
  - Status Cards: success/failure with references
- Interactions
  - Initialize triggers API; handle Paystack callback; verify reference
- Mobile
  - Full-width summary; stacked actions
- Theme Integration
  - Status card colors adapt per theme
- Loading
  - Spinner during initialization and verification
- Error
  - Verification failure with actionable retry
- Empty
  - N/A

12) Satisfaction Report Form
- Layout
  - Modal or page: form centered
- Components
  - Completion Slider: min 50%, max 100%
  - Satisfaction Level: radio group (satisfied/neutral/unsatisfied)
  - Comments: textarea
  - Photo Upload: optional before/after images (drag-drop, preview)
  - Submit Button
- Interactions
  - Form validation; percent must be ≥50%; upload size/type checks
- Mobile
  - Full-width inputs; sticky submit bar
- Theme Integration
  - Slider and radio styling per theme
- Loading
  - Submit spinner; disable controls
- Error
  - Validation messages; server error alert
- Empty
  - N/A

13) Admin Dashboard
- Layout
  - Header: admin menu, theme toggle
  - Sidebar: sections (Overview, Verifications, Escrow, Disputes, Reports, Search)
  - Main: content area with tabs/cards/tables
- Components
  - Overview Stats: total users, active jobs, revenue, pending verifications
  - Verification Queue: seller cards with approve/reject actions
  - Escrow Management: jobs awaiting release with amounts and action buttons
  - Disputes List: flagged jobs with status and details
  - Financial Reports: charts (line/bar), tables with pagination
  - Search: input for users/jobs; results list
- Interactions
  - Approve/Reject prompt; logs to audit
  - Release escrow action confirms and calls API
  - Date range controls for reports
- Mobile
  - Sidebar collapses; cards stack; tables become cards
- Theme Integration
  - Charts and tables adapt to theme; high-contrast variants available
- Loading
  - Skeletons for stats and tables; progress on actions
- Error
  - Inline errors; toast notifications; retry actions
- Empty
  - No disputes: “No active disputes”

Theme System Integration Points
- Header theme toggle persists to user profile (PATCH /v1/users/me)
- CSS variables control backgrounds, text, accents per theme
- High-contrast considerations for midnight and warm-night
- Motion reduced when prefers-reduced-motion is enabled

Accessibility Notes
- All interactive elements have labels and ARIA roles
- Focus outlines visible; keyboard navigation across forms, modals, drawers
- Color contrast meets WCAG AA; test across all six themes

Performance/Observability
- Lazy-load heavy sections (portfolio gallery, charts)
- Virtualize long lists (browse, messages) where needed
- Skeletons reduce perceived latency
- Log significant UI actions (admin releases, ID uploads) with correlation IDs

Routing Overview
- Public: /, /browse, /sellers/:id, /login, /register
- Buyer: /buyer (dashboard), /jobs/:id, /chat
- Seller: /seller (dashboard), /onboarding, /jobs/:id, /chat
- Admin: /admin, /admin/verifications, /admin/escrow, /admin/disputes, /admin/reports

