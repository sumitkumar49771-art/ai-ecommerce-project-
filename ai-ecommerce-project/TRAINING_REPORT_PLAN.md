# 6-Week Industrial Training Report — Week-Wise Plan
### Project: ShopAI — AI Powered E-Commerce Platform

Use this as the structure for your training report / logbook. The corresponding
part of the project for each week is already built in this repository — you
just need to add your own progress screenshots and what you learned.

---

### 📅 Week 1 — Planning & Environment Setup
- Finalized the project title, and defined the objectives and scope.
- Decided the tech stack: HTML/CSS/JS, Node.js, Express.js, MongoDB, Razorpay.
- Installed and set up Node.js, MongoDB, VS Code, and Postman.
- Initialized the Git repository.
- Designed the ER diagram / database schema (User, Product, Category, Brand,
  Cart, Order, Review, Coupon, Settings).
- **Deliverable:** Project proposal + folder structure (`backend/`, `frontend/`).

### 📅 Week 2 — Backend Foundation
- Set up the Express server (`server.js`) and MongoDB connection (`config/db.js`).
- Built Mongoose models: `User.js`, `Product.js`, `Cart.js`, `Order.js`,
  `Category.js`, `Brand.js`.
- Built the authentication system: register/login APIs with JWT and bcrypt
  password hashing (`authController.js`, `authRoutes.js`,
  `middleware/authMiddleware.js`).
- Added the forgot/reset password flow (sending email via Nodemailer,
  `utils/emailService.js`).
- Tested all APIs using Postman.
- **Deliverable:** Working auth APIs + database models.

### 📅 Week 3 — Core E-commerce APIs
- Built Product CRUD APIs (`productController.js`, `productRoutes.js`) —
  listing, search, filtering by category/brand, pagination, sorting, and
  product detail.
- Built Category and Brand management APIs.
- Built Cart APIs (add/remove/update items) — `cartController.js`.
- Built Order/checkout APIs, order cancellation, and the return-request
  workflow — `orderController.js`.
- Built the coupon system (`couponController.js`, `utils/couponValidator.js`).
- Built a zone-based shipping cost calculator (`utils/shippingCalculator.js`,
  configurable via the `Settings` model).
- Integrated Razorpay for payments (`config/razorpay.js`, `paymentController.js`).
- Built product reviews & ratings (`reviewController.js`).
- Used the seed script (`seed/seedData.js`) to add sample products and demo users.
- **Deliverable:** Complete backend REST API (auth + catalog + cart + orders
  + payments + reviews + coupons).

### 📅 Week 4 — AI Feature Development ⭐
- Designed the AI recommendation engine: feature vectors (tags + category +
  name) and the **cosine similarity** algorithm (`utils/aiRecommendation.js`).
- Built the "Similar Products" feature for the product-detail page.
- Built the personalized "Recommended For You" feature, based on the user's
  browsing history.
- Built AI Smart Search — natural language query parsing (e.g. "shoes under
  2000"), with queries logged to the `SearchLog` model.
- Built the AI chatbot (rule-based) — handles order/return/price-search
  queries, with conversations logged to the `ChatLog` model.
- Built the AI Deal Score — picks "hot deals" based on discount %, rating,
  and views (`/api/ai/deals`, `/api/ai/deal-score/:productId`).
- Exposed everything via `/api/ai/*` routes (`aiController.js`, `aiRoutes.js`).
- **Deliverable:** Working AI module + API endpoints, tested in Postman.

### 📅 Week 5 — Frontend Development
- Built the static pages: `index.html`, `products.html`, `product-detail.html`,
  `cart.html`, `checkout.html`, `orders.html`, `invoice.html`, `wishlist.html`,
  `compare.html`, `login.html`, `register.html`, `forgot-password.html`,
  `reset-password.html`.
- Built the admin dashboard (`admin.html`, `js/admin.js`) — product/category/
  brand/coupon management and analytics charts (`js/vendor/chart.umd.js`).
- Built `css/style.css` for a responsive design.
- Wired up the JS integration (`js/api.js`, `main.js`, `auth.js`, `products.js`,
  `cart.js`, `checkout.js`, `compare.js`, `invoice.js`, `toast.js`) — fetching
  data from the backend via the fetch API and rendering it.
- Integrated the AI chatbot widget, AI search bar, and AI deal badges into the
  frontend. Integrated the Razorpay checkout button.
- **Deliverable:** Fully functional UI connected to the backend + AI features
  + admin dashboard.

### 📅 Week 6 — Testing, Deployment & Documentation
- Did end-to-end testing: register → login → browse → AI recommendations →
  add to cart → apply coupon → checkout (Razorpay) → order history → return
  request → admin approval.
- Fixed bugs and polished the UI.
- Completed the README.md documentation (setup steps, API list, folder
  structure).
- (Optional) Deployment: backend on Render/Railway, MongoDB Atlas cloud
  database, frontend on Netlify/Vercel.
- Submitted the final presentation/PPT and training report.
- **Deliverable:** Final working project + report + demo video/screenshots.

---

## 🏭 Industrial-Grade Additions

To bring this beyond a basic student project, the backend follows practices used in real production APIs:

- **Security:** `helmet` (secure HTTP headers), `express-rate-limit` (brute-force / abuse protection on all `/api` routes, with a stricter limit on login/register), CORS.
- **Reliability:** Centralized error-handling middleware (`middleware/errorMiddleware.js`) with a consistent JSON error format, a 404 handler for unmatched routes, and process-level safety nets for unhandled promise rejections.
- **Performance:** `compression` (gzip) on all responses, paginated product listings (`?page=&limit=&sort=`) instead of returning the entire catalog at once.
- **Observability:** `morgan` request logging, and a `/api/health` endpoint for uptime monitoring.
- **UX polish:** Non-blocking toast notifications instead of browser `alert()` popups, sortable/paginated product listing, category quick-browse chips, star ratings and dynamic badges (Bestseller / Low Stock / Top Rated).
- **Payments & communication:** Razorpay order creation for a real payment flow, Nodemailer for transactional emails (password reset).

### New API additions
| Endpoint | Description |
|---|---|
| `GET /api/health` | Server health/uptime check |
| `GET /api/products?page=1&limit=12&sort=priceAsc` | Paginated, sortable product listing |
| `GET /api/auth/users` | (admin) List all registered users |
| `POST /api/payments/create-order` | Create a Razorpay payment order |
| `POST /api/coupons/validate` | Validate a coupon code at checkout |
| `GET /api/ai/deals` | AI-picked deal-of-the-day products |
| `PUT /api/orders/:id/return-request` | Customer requests a return |
| `PUT /api/orders/:id/return-decision` | (admin) Approve/reject a return |
| `GET /api/admin/product-analytics` | (admin) Product & sales analytics |
