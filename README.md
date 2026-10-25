# SHWAC Mock API (for Vercel & Local Demo)

A zero-dependency Node.js mock API designed for **SHWAC Customer & Technician mobile apps**.

## How to Deploy to Vercel (Free in 30 seconds)

### Option A: Via GitHub (Recommended)
1. Create a new repository on GitHub: `shwac-mock-api`.
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "SHWAC Mock API"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USER>/shwac-mock-api.git
   git push -u origin main
   ```
3. Open [vercel.com/new](https://vercel.com/new).
4. Select `shwac-mock-api` and click **Deploy**.
5. Vercel will give you a public URL (e.g. `https://shwac-mock-api.vercel.app`).
6. Your Flutter app API URL will be:
   `https://shwac-mock-api.vercel.app/api/v1`

---

### Option B: Run locally on your laptop
```bash
node api/index.js
```
The server will run on `http://localhost:8000/api/v1`.
(For Android Emulator, use `http://10.0.2.2:8000/api/v1`).
