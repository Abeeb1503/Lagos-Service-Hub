Lagos Service Hub Frontend

Setup
- Node.js 18+
- Install dependencies: npm install
- Run dev server: npm run dev
- Build: npm run build
- Preview build: npm run preview
- Lint: npm run lint
- Format: npm run format

Deployment
- Simplified (Vercel-only, no Socket.IO): see DEPLOYMENT.md
- Full production (Socket.IO on Render/Railway): see DEPLOYMENT_FULL_SOCKETIO.md

Tech Stack
- Vite + React 18
- Tailwind CSS with CSS variables for themes
- Framer Motion for animations
- React Router v6
- ESLint + Prettier

Themes
- Light (Gold & Blue)
- Dark(Gold & Blue)
- Midnight
- Ocean Breeze
- Warm Night
- Sunset Gold

Notes
- Theme persists in localStorage and applies via html class (theme-*)
- All components use Tailwind utilities bound to CSS variables (bg-bg, text-text, bg-primary, etc.)

To add your logo: Place logo file in public/logo.png and update Header.jsx line 39
