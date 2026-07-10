# 🚀 ShopAI ko Live Deploy Karna (Render + MongoDB Atlas)

Free hai, ~15-20 minute lagenge. Neeche diye steps exact order mein follow karo.

---

## STEP 1 — MongoDB Atlas (cloud database) — 5 min

1. Jaao: https://www.mongodb.com/cloud/atlas/register aur free account banao
2. "Build a Database" → **M0 Free** tier choose karo → Create
3. **Database Access** (left sidebar) → "Add New Database User"
   - Username/password set karo (yaad rakhna, baad mein chahiye)
4. **Network Access** (left sidebar) → "Add IP Address" → **"Allow Access from Anywhere"** (0.0.0.0/0) choose karo → Confirm
5. **Database** → "Connect" button → "Drivers" → connection string copy karo, kuch aisa dikhega:
   ```
   mongodb+srv://username:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. `<password>` ki jagah apna actual password daalo, aur `/?` se pehle database name daalo:
   ```
   mongodb+srv://username:yourpassword@cluster0.xxxxx.mongodb.net/ai_ecommerce?retryWrites=true&w=majority
   ```
   👉 Ye pura string kahin save kar lo, Step 3 mein chahiye hoga.

---

## STEP 2 — Code ko GitHub pe push karo — 5 min

Agar GitHub account nahi hai toh https://github.com/signup pe bana lo. Phir:

```bash
cd ai-ecommerce-project
git init
git add .
git commit -m "Initial commit - ShopAI e-commerce project"
```

GitHub pe naya repository banao (github.com → New repository → naam do "ai-ecommerce-project" → Create), phir:

```bash
git remote add origin https://github.com/<aapka-username>/ai-ecommerce-project.git
git branch -M main
git push -u origin main
```

---

## STEP 3 — Render pe Deploy karo — 5 min

1. Jaao: https://render.com/register → "Sign up with GitHub" se account banao
2. Dashboard → **New +** → **Web Service**
3. Apna GitHub repo (`ai-ecommerce-project`) connect karo aur select karo
4. Ye settings bharo (ya render.yaml khud se detect ho jayega):
   - **Name:** shopai-ecommerce
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free
5. **Environment Variables** section mein ye add karo (Add Environment Variable click karke):

   | Key | Value |
   |---|---|
   | `MONGO_URI` | Step 1 wala connection string |
   | `JWT_SECRET` | koi bhi random lambi string, jaise `myshopaisecret2026xyz` |
   | `JWT_EXPIRE` | `7d` |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | (deploy hone ke baad wala URL, Step 4 mein daalna) |
   | `RAZORPAY_KEY_ID` | (agar payments chahiye — https://dashboard.razorpay.com se) |
   | `RAZORPAY_KEY_SECRET` | (same as above) |
   | `EMAIL_SERVICE` | `gmail` |
   | `EMAIL_USER` | apna gmail (agar reset-password email chahiye) |
   | `EMAIL_PASS` | Gmail App Password (normal password nahi) |

   💡 Razorpay aur Email optional hain — inke bina bhi site chalegi, bas payment aur forgot-password email kaam nahi karenge.

6. **Create Web Service** click karo → Render build + deploy shuru karega (2-3 min)
7. Build complete hone ke baad, top pe ek URL milega jaisa: `https://shopai-ecommerce.onrender.com`

---

## STEP 4 — Final touches — 2 min

1. Us URL ko copy karke Render dashboard mein wapas jao → Environment → `FRONTEND_URL` ko us URL se update karo → Save (auto-redeploy hoga)
2. Database mein sample products daalne ke liye, Render dashboard → "Shell" tab kholo aur run karo:
   ```
   npm run seed
   ```
   (Ye demo products + admin/user login create karega)

---

## ✅ Result

Ab `https://shopai-ecommerce.onrender.com` (aapka actual URL) kisi ke bhi browser mein khulega — poori website live hai!

**Demo login:**
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user1234`

⚠️ **Note:** Render ka free tier 15 min inactivity ke baad "sleep" ho jata hai — pehli request thoda slow (20-30 sec) hogi jab wapas jagega. Ye normal hai, free tier ki limitation hai.

---

## ❓ Kuch atka?

- Build fail ho raha ho → Render ke "Logs" tab mein exact error dikhega, wo mujhe bhejo
- Database connect na ho → Atlas Network Access mein 0.0.0.0/0 add kiya check karo
- Site khulti hai but products nahi dikh rahe → `npm run seed` run karna bhool gaye ho shayad
