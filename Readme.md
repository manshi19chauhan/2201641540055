# URL Shortener Microservice

A robust HTTP URL Shortener Microservice with analytics and a Material UI React frontend.

## Features

- Shorten long URLs with optional custom shortcodes and validity period.
- Globally unique short links.
- Default validity: 30 minutes if not specified.
- Redirection to original URL via short link.
- Analytics: track clicks, referrer, and coarse-grained location.
- REST API with endpoints for creation, stats, and redirection.

-**Mandatory**: All logging uses the provided custom logging middleware.

- Responsive React frontend (Material UI) for shortening and analytics.

### Backend

1. Install dependencies:

   ```

   cd Backend Test Submission

   npm install

   ```
2. Start the backend:

   ```

   npm run dev

   ```

   The backend runs on [http://localhost:4000](http://localhost:4000).

### Frontend

1. Install dependencies:

   ```

   cd Frontend Test Submission

   npm install

   ```
2. Start the frontend:

   ```

   npm run dev

   ```

   The frontend runs on [http://localhost:3000](http://localhost:3000).

## API Endpoints

-**POST /shorturls**

  Create a short URL.

  Body: `{ "url": "...", "validity": 30, "shortcode": "custom" }`

-**GET /shorturls/:shortcode**

  Get analytics for a short URL.

-**GET /:shortcode**

  Redirect to the original URL.

## Project Structure

-`Backend Test Submission/` — Express server, persistent storage, logging middleware integration.

-` Frontend Test Submission` `/ ` — React app (Material UI), user interface for shortening and analytics.

-`logging-middleware/` — Custom logging logic (used by backend).

## Notes

- All logs are sent via the custom logging middleware.
- For demo, backend uses a JSON file for storage.
- Frontend and backend must run simultaneously for full functionality.
