<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AgroSmart Monorepo

This project is now organized as:

- `apps/app`: existing React application
- `apps/site`: landing page built with React and Vite
- `backend`: API and services

## Run Locally

**Prerequisites:** Node.js

Install dependencies inside each workspace that you want to run:

1. `cd apps/app && npm install`
2. `cd apps/site && npm install`
3. `cd backend && npm install`

Then run each project independently:

1. Main app: `npm --prefix apps/app run dev`
2. Landing page: `npm --prefix apps/site run dev`
3. Backend: `npm --prefix backend run dev`
