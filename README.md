# TutelApp

## Netlify deployment

Netlify installs the frontend dependencies, builds the Expo web application
from `frontend/`, and publishes the static export from `frontend/dist/`.
Client-side routes fall back to `index.html` through the redirect configured
in `netlify.toml`.

The deployed frontend requires `EXPO_PUBLIC_BACKEND_URL` to point to the
running FastAPI backend. The backend is not bundled into the static site.
