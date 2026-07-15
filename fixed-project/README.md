# 🛒 ShopAI — AI Powered E-Commerce Platform
### 6 Weeks Industrial Training Project

[![CI](https://github.com/sumitkumar49771-art/ai-ecommerce-project-/actions/workflows/ci.yml/badge.svg)](https://github.com/sumitkumar49771-art/ai-ecommerce-project-/actions/workflows/ci.yml)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?logo=razorpay&logoColor=white)
![Tests](https://img.shields.io/badge/tests-16%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**🔗 Live Demo:** [ai-ecommerce-project-fe9j.onrender.com](https://ai-ecommerce-project-fe9j.onrender.com)
*(hosted on Render's free tier — the first request after inactivity can take ~50s to wake up)*

**Demo Logins:**
| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@example.com   | Admin@123  |
| User  | user@example.com    | User@1234  |

A full-stack e-commerce web application built with **HTML/CSS/JavaScript**, **Node.js + Express.js**, and **MongoDB**, featuring a built-in **AI recommendation & smart search engine**, an **admin dashboard**, and **Razorpay payment integration**.

---

## 📸 Screenshots

> Add your own screenshots here — drop PNG/JPG files into `docs/screenshots/` and
> reference them like the rows below. A quick way to grab clean ones: open the
> live demo, resize the browser window, and use your OS screenshot tool
> (Win + Shift + S on Windows) instead of a full-tab capture so no browser
> chrome/other tabs show up.

| Home Page | Product Listing |
|---|---|
| ![Home](docs/screenshots/home.png) | ![Products](docs/screenshots/products.png) |

| Admin Dashboard | Mobile View |
|---|---|
| ![Admin](docs/screenshots/admin.png) | ![Mobile](docs/screenshots/mobile.png) |

---

## 📁 Folder Structure

```
ai-ecommerce-project/
│
├── backend/
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   └── razorpay.js            # Razorpay client setup
│   ├── models/
│   │   ├── User.js                # Auth, addresses, wishlist, browsing history
│   │   ├── Product.js             # Product schema (AI tags + text index)
│   │   ├── Category.js
│   │   ├── Brand.js
│   │   ├── Cart.js
│   │   ├── Order.js                # Includes return-request workflow
│   │   ├── Review.js
│   │   ├── Coupon.js
│   │   ├── Settings.js             # Shipping zones, free-delivery threshold
│   │   ├── SearchLog.js            # Logs AI smart-search queries
│   │   └── ChatLog.js              # Logs AI chatbot conversations
│   ├── controllers/
│   │   ├── authController.js       # Register/Login/Profile/Addresses/Wishlist/Password reset
│   │   ├── productController.js    # CRUD + pagination + similar products
│   │   ├── categoryController.js
│   │   ├── brandController.js
│   │   ├── cartController.js
│   │   ├── orderController.js      # Checkout, cancel, returns, admin analytics
│   │   ├── paymentController.js    # Razorpay order creation
│   │   ├── reviewController.js
│   │   ├── couponController.js
│   │   ├── settingsController.js
│   │   ├── adminController.js      # Product analytics, search/chat logs
│   │   └── aiController.js         # ⭐ AI recommendations, smart search, chatbot, deals
│   ├── routes/
│   │   └── ...                     # One route file per controller above
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT protect + admin guard
│   │   └── errorMiddleware.js      # Centralized error handling + 404 handler
│   ├── utils/
│   │   ├── aiRecommendation.js     # ⭐ CORE AI ENGINE (see below)
│   │   ├── shippingCalculator.js   # Zone-based shipping cost/ETA
│   │   ├── couponValidator.js
│   │   ├── emailService.js         # Nodemailer (password reset emails)
│   │   └── imageMatcher.js, curatedImages.js, imagePlaceholder.js
│   ├── scripts/
│   │   ├── refreshProductImages.js
│   │   ├── applySummerSale.js
│   │   └── fixShippingZones.js
│   ├── seed/
│   │   └── seedData.js             # Sample products + demo users
│   ├── server.js                   # App entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html                  # Home page (AI search + recommendations)
│   ├── products.html               # Product listing + filters + pagination
│   ├── product-detail.html         # Product detail + AI "similar products" + reviews
│   ├── cart.html
│   ├── checkout.html               # Address, shipping, coupon, Razorpay
│   ├── orders.html                 # Order history + cancel/return requests
│   ├── invoice.html                # Printable order invoice
│   ├── wishlist.html
│   ├── compare.html                # Side-by-side product comparison
│   ├── login.html / register.html
│   ├── forgot-password.html / reset-password.html
│   ├── admin.html                  # Admin dashboard (products, orders, coupons, analytics)
│   ├── css/style.css
│   └── js/
│       ├── api.js                  # Fetch helper + auth token handling
│       ├── main.js                 # Navbar/footer + AI chatbot widget
│       ├── auth.js, cart.js, checkout.js, products.js, compare.js, invoice.js, toast.js
│       ├── admin.js                # Admin dashboard logic
│       └── vendor/chart.umd.js     # Charts for admin analytics
│
└── README.md
```

---

## 🤖 AI Features (the "AI" part of the project)

This project implements **real, explainable AI/ML techniques** — no external
paid API key required, so it runs 100% offline and is easy to demo/viva:

1. **Content-Based Product Recommendation Engine** (`utils/aiRecommendation.js`)
   - Converts each product into a feature vector (tags + category + name words).
   - Uses **Cosine Similarity** (the same math behind many production
     recommender systems) to find "Similar Products" on the product page.

2. **Personalized "Recommended For You"**
   - Tracks each logged-in user's browsing history.
   - Averages the feature vectors of everything they viewed to build a
     "preference profile", then ranks the whole catalog against it.
   - Falls back to most-viewed products for new users (cold-start handling).

3. **AI Smart Search Assistant**
   - Accepts natural language queries like *"shoes under 2000"* or
     *"headphones between 1000 and 3000"*.
   - A simple NLU parser extracts keywords + price constraints from the
     sentence, then queries MongoDB accordingly. Queries are logged
     (`SearchLog`) for the admin dashboard.

4. **AI Shopping Chatbot**
   - Rule-based conversational assistant (bottom-right widget) that answers
     questions about orders, returns, trending products, and price-based
     product search. Conversations are logged (`ChatLog`).
   - Structured so it can be swapped for a real LLM (OpenAI/Claude API) later
     — see the commented `OPENAI_API_KEY` line in `.env.example`.

5. **AI Deal Score**
   - Scores products as "hot deals" based on discount %, rating and recent
     views, surfaced via `/api/ai/deals` and `/api/ai/deal-score/:productId`.

---

## 🛍️ Core E-Commerce Features

- **Auth & Profile:** JWT login/register, bcrypt password hashing, forgot/reset
  password via email (Nodemailer), saved addresses, wishlist.
- **Catalog:** Categories, brands, paginated & sortable product listing,
  product reviews & ratings, product comparison page.
- **Cart & Checkout:** Cart CRUD, coupon codes, zone-based shipping cost
  calculation, **Razorpay** payment integration.
- **Orders:** Order placement, cancellation, return requests (with admin
  approve/reject), printable invoice.
- **Admin Dashboard:** Manage products/categories/brands/coupons/settings,
  view order & product analytics, AI search/chat logs.

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally (or a MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env      # then edit MONGO_URI / JWT_SECRET / RAZORPAY keys / SMTP creds
npm run seed               # inserts sample products + demo users
npm run dev                 # starts server on http://localhost:5000
```

### 3. Frontend
The frontend is plain HTML/CSS/JS and is already served by Express as static
files. Once the backend is running, just open:
```
http://localhost:5000
```
in your browser. (You can also open the `frontend/*.html` files directly
with a Live Server extension — just make sure the backend is running on
port 5000 since `frontend/js/api.js` points there.)

### 4. Running Tests
```bash
cd backend
npm test
```
16 Jest unit tests cover the AI recommendation engine (cosine similarity,
similar-products ranking, smart-search NLU parsing, deal scoring) and the
placeholder-image generator — the core logic-heavy pieces of the project.

### 5. Demo Logins (created by the seed script)
| Role  | Email               | Password  |
|-------|---------------------|-----------|
| Admin | admin@example.com   | Admin@123  |
| User  | user@example.com    | User@1234  |

---

## ✅ Testing & CI/CD

- **Unit tests** (`backend/__tests__/`) run with **Jest**, focused on the
  parts of the codebase with real logic to verify — the AI engine's math
  (feature vectors, cosine similarity, deal scoring) and the smart-search
  NLU parser — rather than trivial CRUD wrappers.
- **GitHub Actions** (`.github/workflows/ci.yml`) runs automatically on
  every push/PR to `main`: installs dependencies, syntax-checks every
  backend and frontend JS file, and runs the full Jest suite. See the
  **Actions** tab on GitHub for the run history, and the green badge at
  the top of this README for current status.

---

## 🔌 Key API Endpoints

| Method | Endpoint                              | Description                          |
|--------|-----------------------------------------|---------------------------------------|
| POST   | `/api/auth/register`                    | Create account |
| POST   | `/api/auth/login`                       | Login, returns JWT |
| POST   | `/api/auth/forgot-password`             | Send password reset email |
| PUT    | `/api/auth/reset-password/:token`       | Reset password |
| GET    | `/api/auth/addresses` / `POST`          | Manage saved addresses |
| GET    | `/api/auth/wishlist` / `POST /:productId` | Manage wishlist |
| GET    | `/api/products?page=&limit=&sort=`      | Paginated, sortable product listing |
| GET    | `/api/products/:id`                     | Product detail + AI similar products |
| GET    | `/api/categories` / `/api/brands`       | Catalog taxonomy |
| GET    | `/api/reviews/product/:productId`       | Product reviews |
| GET    | `/api/ai/recommendations`               | 🤖 Personalized AI recommendations |
| POST   | `/api/ai/smart-search`                  | 🤖 Natural language product search |
| POST   | `/api/ai/chatbot`                       | 🤖 AI shopping assistant chat |
| GET    | `/api/ai/deals`                         | 🤖 AI-picked deal-of-the-day products |
| GET    | `/api/cart` / `POST /api/cart`          | Manage cart |
| POST   | `/api/coupons/validate`                 | Validate a coupon code at checkout |
| POST   | `/api/payments/create-order`            | Create a Razorpay order |
| POST   | `/api/orders`                           | Place order (checkout) |
| GET    | `/api/orders/my`                        | Logged-in user's orders |
| PUT    | `/api/orders/:id/return-request`        | Request a return |
| GET    | `/api/admin/product-analytics`          | (admin) Product analytics |
| GET    | `/api/health`                           | Server health/uptime check |

---

## 🛠️ Tech Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (fetch API), Chart.js (admin analytics)
- **Backend:** Node.js, Express.js, JWT auth, bcrypt password hashing
- **Database:** MongoDB + Mongoose ODM
- **Payments:** Razorpay
- **Email:** Nodemailer
- **AI Layer:** Custom content-based filtering (cosine similarity) + rule-based NLU

## 🏭 Industrial-Grade Practices
- **Security:** `helmet` (secure HTTP headers), `express-rate-limit` (brute-force / abuse
  protection on all `/api` routes, with a stricter limit on login/register), CORS.
- **Reliability:** Centralized error-handling middleware with a consistent JSON error
  format, a 404 handler, and process-level safety nets for unhandled promise rejections.
- **Performance:** `compression` (gzip) on all responses, paginated product listings.
- **Observability:** `morgan` request logging, `/api/health` endpoint for uptime monitoring.
- **UX polish:** Non-blocking toast notifications, sortable/paginated listing, category
  quick-browse chips, star ratings, dynamic badges (Bestseller / Low Stock / Top Rated).

## 📌 Possible Extensions (for report / viva questions)
- Swap the rule-based chatbot for a real LLM using the OpenAI/Claude API.
- Add collaborative filtering (recommendations based on *other* similar users).
- Add product image search using a vision model.
- Deploy backend on Render/Railway, MongoDB Atlas cloud database, frontend on Netlify/Vercel.
