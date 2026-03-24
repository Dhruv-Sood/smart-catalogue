# Smart Cataloging Backend

## Setup

1. Create a `.env` file in the root:
```
GEMINI_API_KEY=your_key_here
```
Get a key from [Google AI Studio](https://aistudio.google.com/apikey).

2. Run:
```bash
docker-compose up -d
```

API is available at `http://localhost:3001`.

That's it. MySQL and the backend both start automatically.

## Stop
```bash
docker-compose down        # keep data
docker-compose down -v     # wipe data
```
