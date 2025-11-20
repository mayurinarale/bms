# BookMyShow inspired movie booking UI

This project recreates the seat-selection experience from BookMyShow (BMS) for the movie **Maarutha** using React + Vite. The layout, pricing slabs, and statuses were modelled using the exported `BMS.html` file and the reference screenshots included in the repository.

## Getting started

```bash
cd /Users/shaunak/Documents/BMS/movie-booking
npm install
npm run dev
```

By default Vite runs on `http://localhost:5173`. The UI is responsive, so feel free to resize the viewport to mimic mobile vs. desktop breakpoints.

## Features

- Show-time selector mirroring the BMS pill design.
- Quantity picker that locks the number of seats before selection.
- Tiered seat groups (Recliner, Prime, Classic Plus, Classic) populated from the scraped `BMS.html`.
- Seat states for available, selected, sold, and blocked seats along with an availability legend.
- Running summary card that updates the payable amount and selected seat labels in real time.

## Next steps

The UI is static by design, but the seat configuration lives in `src/App.jsx`, so you can point the groups to live data or an API later. Styling is handled through `src/App.css` and uses pure CSS to stay close to the source experience. Feel free to plug in your own backend, integrate payment gateways, or expand the flow with snack combos, offers, and seat filters.*** End Patch
