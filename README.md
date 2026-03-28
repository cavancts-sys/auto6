# Auto Assets — Self-Hosted Package

A fully self-contained Node.js server for the Auto Assets car dealership website.

## Requirements

- **Node.js 18+** — https://nodejs.org
- **PostgreSQL database** — any of these work for free:
  - [Neon](https://neon.tech) (recommended, serverless Postgres)
  - [Supabase](https://supabase.com)
  - [Railway](https://railway.app)
  - Your own PostgreSQL server

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create your `.env` file**
   ```bash
   cp .env.example .env
   ```
   Then open `.env` and paste your PostgreSQL connection string.

3. **Start the server**
   ```bash
   npm start
   ```

   The server will:
   - Connect to your database
   - Create the `cars` table automatically if it doesn't exist
   - Seed it with the initial 12-car inventory on first run
   - Serve the website at `http://localhost:3000`

## Admin Panel

Go to `/admin` on your running site and log in with the password set in `ADMIN_TOKEN` (default: `autoassets2024`).

Changes made in the admin panel are saved to the database and visible to all visitors immediately.

## Custom Domain

Point your domain's DNS to your server's IP address and optionally put Nginx or Caddy in front as a reverse proxy.

Example Nginx config:
```nginx
server {
    server_name yourdomain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | *required* | PostgreSQL connection string |
| `PORT` | `3000` | Port to listen on |
| `ADMIN_TOKEN` | `autoassets2024` | Admin panel password |
