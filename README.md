# Show-Time
A modern and responsive website design for ShowTime, an online platform to browse and book shows, concerts, and events easily with an interactive UI using HTML, CSS, and JavaScript.
# ShowTime – Online Show Booking Website

A modern, vibrant, and responsive show booking UI where users can browse, search, and book tickets for movies, concerts, theatre, comedy, and sports.

## ✨ Features
- Dark, neon-themed design with gradients and glassmorphism
- Smooth scroll navigation
- Dynamic Featured Shows rendered from a JavaScript data array
- Search filtering by location, date, and genre
- Category carousel (Movies, Theatre, Concerts, Comedy, Sports)
- Interactive booking with seat selection and live totals
- Simple login/signup dialog and newsletter subscribe demo
- Responsive layout for mobile, tablet, and desktop

## 🗂 Project Structure
```
ShowTime/
├─ index.html      # HTML structure and sections
├─ style.css       # Dark neon theme, glassmorphism, responsive styles
├─ script.js       # Rendering, filters, interactions, seat booking
└─ read.md         # This documentation
```

## 🚀 Getting Started
- Open index.html directly in your browser.
  - Windows: double-click `index.html` or run `start C:\Users\agraw\ShowTime\index.html` in PowerShell.

Optional: run a local static server (recommended for future API integrations)
- Node: `npx serve` (then open the provided URL)
- Python: `python -m http.server 8080`

## 🧭 Using the App
- Navigation: Use the top navbar or the Book Now button for smooth scrolling.
- Search: Filter by Location, Date, and Genre. Results update in Featured Shows.
- Categories: Click a category chip (e.g., Movies, Concerts) to refine results.
- Featured Shows: Click “Book Ticket” on any card to jump to booking with that show preselected.
- Booking:
  - Choose a show, date, and time.
  - Select seats in the grid. Total updates live based on price × seats.
  - Click Confirm Booking (demo alert confirms selection).
- Auth: Log in / Sign up opens a demo dialog.
- Newsletter: Subscribing triggers a demo alert.

## 🛠 Tech & Design
- HTML5, CSS3, and vanilla JavaScript (no frameworks)
- Fonts: Google Fonts (Poppins / Inter)
- Styling: Gradients, neon buttons, glass cards, and responsive grid/flex
- Images: Royalty-free Unsplash images (used via CDN)

## 🔧 Customization
- Colors and Theme: Edit CSS variables at the top of `style.css` under `:root`.
- Shows Data: Update or extend the `showsData` array in `script.js` to change Featured Shows (title, date, location, price, image, etc.).
- Seat Map:
  - Change rows/cols via `seatConfig` in `script.js`.
  - Demo occupancy is randomly generated per show/date/time selection.
- Sections: Add or remove sections in `index.html` as needed.

## ♿ Accessibility Notes
- Semantic landmarks (header, nav, main sections, footer)
- Keyboard-focusable elements and accessible labels
- ARIA roles and labels for seat selection and carousels

## 🌐 Deployment
- GitHub Pages: Push this folder to a GitHub repo and enable Pages (root). Open the provided URL.
- Netlify/Vercel: Drag-and-drop deploy the folder or connect your repo.

## ⚠️ Notes
- This is a front-end demo. Authentication, payments, real seat inventory, and backend APIs are not implemented.
- Seat occupancy is randomized for demonstration.

## ✅ Roadmap Ideas
- Real authentication and user profiles
- Persistent cart/checkout flow with payments
- Real-time seat availability from an API
- Sorting, pagination, and more advanced filters
- Admin dashboard for show management

---
© ShowTime. For demo and educational use.
