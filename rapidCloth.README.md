# RapidCloth - System Architecture & Comprehensive Guide

## 1. System Overview

RapidCloth is a comprehensive, multi-role e-commerce platform that supports both standard retail purchases and clothing rentals, integrated with real-time delivery tracking and AI-powered virtual try-on features. 

The system follows a modular, distributed front-end architecture supported by a centralized Node.js/Express backend and MongoDB for data persistence.

### Tech Stack
- **Backend:** Node.js, Express.js, MongoDB (Mongoose), Socket.io (Real-time tracking).
- **Frontends:** React.js, Vite, TailwindCSS (assumed based on standard modern setups).
- **Authentication:** JWT (JSON Web Tokens) with strict Role-Based Access Control (RBAC).

---

## 2. Frontend Services & Data Flow (Role-Based)

The application is split into specialized frontends to handle specific user roles efficiently.

### A. Customer Frontend (`/frontend`)
- **Role:** `user`
- **Key Features:** Browsing products, AI Try-On, Cart management, Checkout (Buy/Rent), Order tracking.
- **Data Flow:** 
  1. User logs in -> Receives JWT.
  2. Browses products (`GET /api/products`).
  3. Adds to cart (`POST /api/cart`) or uses AI Try-On (`POST /api/try-on`).
  4. Places order (`POST /api/orders`).
  5. Listens to real-time delivery updates via Socket.io when order is `out-for-delivery`.

### B. Seller Dashboard (Integrated or Separate)
- **Role:** `seller`
- **Key Features:** Product catalog management, order fulfillment, store profile management, analytics.
- **Data Flow:**
  1. Seller registers and gets approved by Admin.
  2. Uploads products (`POST /api/seller/dashboard/products`).
  3. Receives order notifications (`GET /api/seller/orders`).
  4. Prepares order for pickup (Status moves to `picking`).

### C. Delivery Partner App (`/partnerFrontend`)
- **Role:** `delivery`
- **Key Features:** Online/Offline toggling, order acceptance, map navigation, earnings tracking, COD remittance.
- **Data Flow:**
  1. Delivery partner toggles online (`PUT /api/delivery/status`).
  2. System auto-assigns an order based on proximity.
  3. Partner accepts order (`POST /api/delivery/order/:id/accept`).
  4. Emits real-time location via Socket.io (`location-update`).
  5. Marks order as delivered (`POST /api/delivery/order/:id/deliver` with OTP).

### D. Zone Admin Portal (`/adminfrontend`)
- **Role:** `admin`
- **Key Features:** Zone-specific analytics, seller approval, dispute resolution.
- **Data Flow:**
  1. Admin logs in; JWT payload contains `zoneId`.
  2. Fetches zone stats (`GET /api/admin/stats`).
  3. Approves/rejects local sellers (`PUT /api/admin/sellers/:id/approve`).

### E. Superadmin Portal (`/superadmin`)
- **Role:** `superadmin`
- **Key Features:** Global visibility, Zone creation, Admin assignment, platform-wide metrics.
- **Data Flow:**
  1. Creates geographical zones (`POST /api/superadmin/zones`).
  2. Assigns admins to zones.
  3. Monitors platform-wide financial and operational health.

---

## 3. Backend Architecture & Component Interaction

### Core Components
1. **Express Server (`src/index.js`):** The main entry point. Handles middleware (CORS, Rate Limiting, Helmet), route registration, and initializes Socket.io.
2. **Controllers:** Business logic for each domain (e.g., `delivery.controller.js`, `order.controller.js`).
3. **Models:** Mongoose schemas defining the database structure (`User`, `Order`, `Product`, `Zone`).
4. **Middlewares:**
   - `auth.middleware.js`: Verifies JWT and role (`verifyToken`, `isSeller`, `isAdmin`, etc.).
   - `upload.middleware.js`: Handles multipart/form-data for images using Multer.
5. **Background Jobs:**
   - A `setInterval` job runs every 60 seconds to check for expired rentals and automatically initiates return workflows.

### Real-Time Interaction (Socket.io)
- The backend spins up an HTTP server wrapping Express to attach Socket.io.
- Delivery partners emit their GPS coordinates.
- Customers subscribe to their specific `orderId` room to receive real-time map updates.

---

## 4. API Endpoints & Payloads

### 4.1 Authentication (`/api/auth`)
- **POST `/api/auth/register`**
  - **Payload:** `{ "name": "John Doe", "email": "john@example.com", "password": "pass", "role": "user" }`
  - **Response:** `{ "token": "jwt_string", "user": { ... } }`

### 4.2 Products & Cart (`/api/products`, `/api/cart`)
- **POST `/api/cart/add`**
  - **Payload:** `{ "productId": "id", "quantity": 1, "isRental": true, "rentalDays": 5 }`
- **GET `/api/products/:id`**
  - **Response:** `{ "product": { "name": "Shirt", "price": 500, "stock": 10, ... } }`

### 4.3 Orders (`/api/orders`)
- **POST `/api/orders/place`**
  - **Headers:** `Authorization: Bearer <token>`
  - **Payload:** 
    ```json
    {
      "deliveryAddress": { "street": "123 Main St", "city": "NYC", "state": "NY", "zip": "10001" },
      "deliveryLocation": { "lat": 40.7128, "lng": -74.0060 },
      "paymentMethod": "cod"
    }
    ```
  - **Response:** `{ "orderId": "id", "status": "placed", "estimatedDeliveryMinutes": 30 }`

### 4.4 Delivery Partner (`/api/delivery`)
- **PUT `/api/delivery/status`**
  - **Payload:** `{ "isOnline": true }`
- **POST `/api/delivery/location`**
  - **Payload:** `{ "lat": 40.7130, "lng": -74.0065 }`

### 4.5 Admin & Superadmin (`/api/admin`, `/api/superadmin`)
- **POST `/api/superadmin/zones`**
  - **Payload:** `{ "name": "North Zone", "boundaries": [...] }`
- **PUT `/api/admin/sellers/:id/approve`**
  - **Payload:** `{ "status": "approved" }`

---

## 5. Architectural Suggestions, Edge Cases & Tips for Production

To elevate RapidCloth from a development prototype to a robust, production-ready enterprise application, consider the following enhancements:

### A. Handling Edge Cases
1. **Inventory Race Conditions:**
   - *Issue:* If two users try to buy the last piece of a product simultaneously, the stock might go negative.
   - *Fix:* Implement database transactions (MongoDB Sessions) or atomic updates (`$inc: { stock: -quantity }` with a query condition `stock: { $gte: quantity }`) during the checkout phase.
2. **Delivery Boy Rejections & Timeouts:**
   - *Issue:* What if a delivery boy ignores the assigned order?
   - *Fix:* Implement a strict TTL (Time-To-Live) using Redis or Agenda.js. If an order isn't accepted within 60 seconds, auto-reassign to the next nearest partner and penalize the unresponsive partner's metric.
3. **Payment Failures & Rollbacks:**
   - *Issue:* A user's payment gets deducted, but the backend crashes before creating the order.
   - *Fix:* Use Webhooks from your payment gateway (Razorpay/Stripe). The order should be created as `payment-pending` *before* the transaction, and only marked as `confirmed` upon receiving a successful webhook event.
4. **Auto-Return Cron Job Scale:**
   - *Issue:* Running `setInterval` for DB scans every minute on the main Node thread will block the event loop as data grows.
   - *Fix:* Move cron jobs to a separate worker process using a message queue (BullMQ/RabbitMQ) or AWS EventBridge.

### B. System Optimization & Scalability Tips
1. **Caching (Redis):**
   - Implement Redis to cache the product catalog (`GET /api/products`), zone statistics, and configuration settings. This will drastically reduce MongoDB read loads.
2. **Image Delivery (CDN):**
   - Currently, images seem to be stored locally (`/uploads` route). This will fail in a multi-server setup.
   - *Fix:* Migrate image uploads directly to AWS S3 (or Cloudinary) and serve them via a CDN (CloudFront) to reduce server bandwidth and improve image load times on the frontends.
3. **Process Management & Clustering:**
   - Use `PM2` in production to run multiple instances of the Node backend (Cluster Mode) taking advantage of multi-core CPUs.
4. **Database Indexing:**
   - Ensure geospatial indexes (`2dsphere`) are correctly applied on `deliveryLocation` and `hubLocation` to make proximity queries lightning fast.
   - Add compound indexes for frequent queries, e.g., `(zoneId, status)` on Orders.

### C. Security Best Practices
- **Rate Limiting:** Already implemented, but consider stricter limits on sensitive routes (e.g., `/api/auth/login`, OTP endpoints).
- **Input Validation:** Use `Joi` or `Zod` to rigorously validate all incoming request payloads to prevent NoSQL injection and malformed data crashes.
- **WebSocket Security:** Ensure Socket.io connections are authenticated by parsing the JWT from the handshake query/headers before allowing the connection.

### D. Codebase Quality
- **TypeScript:** Transitioning the backend from JavaScript to TypeScript will catch countless runtime errors during compile-time and greatly improve developer experience (intellisense).
- **Testing:** Implement automated testing using `Jest` and `Supertest`. Start with critical paths: Checkout flow, Payment webhook handling, and Delivery assignment logic.
