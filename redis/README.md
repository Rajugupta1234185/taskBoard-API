# Redis Setup Options

## Option A — Upstash (Free Cloud Redis) ✅ Recommended

No installation required. Works from any machine.

### Steps:
1. Go to **https://upstash.com** and sign up (free)
2. Click **"Create Database"**
3. Choose a name (e.g. `taskboard`), select the region nearest to you
4. Once created, open the database → go to the **"Details"** tab
5. Copy the value labeled **`UPSTASH_REDIS_URL`** — it looks like:
   ```
   rediss://default:AbCdEfGh@us1-example-12345.upstash.io:12345
   ```
6. In your `.env` file, set:
   ```
   REDIS_URL=rediss://default:AbCdEfGh@us1-example-12345.upstash.io:12345
   ```
   And **remove or comment out** `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`.

---

## Option B — Docker (Local)

Requires Docker Desktop to be running.

### Steps:
1. Start **Docker Desktop** from the Start menu
2. Open a terminal in this `redis/` folder:
   ```bash
   docker-compose up -d
   ```
3. Redis will be available at `localhost:6379` with password `12345`
4. In your `.env` file, keep:
   ```
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=12345
   ```
   And **remove or comment out** `REDIS_URL`.

### Stop Redis:
```bash
docker-compose down
```

### View Redis logs:
```bash
docker-compose logs -f redis
```
