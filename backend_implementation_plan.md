# ElectroHub (Kurama) Backend Implementation Plan
## Node.js/Express, Prisma ORM, and PostgreSQL Database

This document details the blueprint for developing a scalable, high-performance, and type-safe backend for the **ElectroHub** smart electrical solutions ecommerce platform. The backend is designed using **Node.js/Express** as the application layer, **Prisma** as the database ORM, and **PostgreSQL** as the relational database engine.

---

## 1. System Architecture

The application will follow a modular **Controller-Service-Repository** pattern to ensure clean separation of concerns, high testability, and ease of maintainability.

```mermaid
graph TD
    Client[React Frontend App] -->|HTTPS REST Requests| Router[Express Router Layer]
    Router -->|Validation & Route Rules| Controller[Controllers Layer]
    Controller -->|Business Logic & Calculations| Service[Services Layer]
    Service -->|Database Operations| Prisma[Prisma ORM Client]
    Prisma -->|Raw SQL / Queries| PostgreSQL[(PostgreSQL Database)]
```

### Backend Directory Structure
```text
kurama-backend/
├── prisma/
│   ├── schema.prisma        # Prisma database schema definition
│   └── seed.js              # Initial database seed script (migrating local data)
├── src/
│   ├── config/
│   │   ├── db.js            # Prisma client instance initialization
│   │   └── env.js           # Environment variables configuration
│   ├── controllers/         # Extract request parameters & return response payloads
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── order.controller.js
│   │   ├── client.controller.js
│   │   └── setting.controller.js
│   ├── middleware/          # Routing hooks & policies
│   │   ├── auth.middleware.js      # JWT verify & client authentication
│   │   ├── admin.middleware.js     # Admin role verification
│   │   └── error.middleware.js     # Centralized global error handling
│   ├── routes/              # Express endpoint router definitions
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── order.routes.js
│   │   ├── client.routes.js
│   │   └── setting.routes.js
│   ├── services/            # Main core business logic, statistics & calculations
│   │   ├── auth.service.js
│   │   ├── product.service.js
│   │   ├── order.service.js
│   │   ├── client.service.js
│   │   └── setting.service.js
│   └── index.js             # Express application bootstrapper
├── .env                     # Local environment configurations (ignored in git)
├── package.json
└── README.md
```

---

## 2. Optimized Database Schema

The schema is built on top of PostgreSQL using **Prisma ORM**. It includes structural optimization parameters (indexes, cascade operations, and appropriate decimal types) and models categories, brands, gammes, products, clients, and orders.

### Prisma Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

enum Role {
  CLIENT
  ADMIN
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}

enum ProductTag {
  BEST_SELLER
  NEW
  TRENDING
  SALE
  NONE
}

// ─────────────────────────────────────────────────────────────────────────────
// MODELS
// ─────────────────────────────────────────────────────────────────────────────

model User {
  id           Int      @id @default(autoincrement())
  fullName     String
  email        String   @unique
  phone        String   @unique
  company      String?
  wilaya       String
  commune      String
  approved     Boolean  @default(false)
  role         Role     @default(CLIENT)
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  orders       Order[]

  @@index([email])
  @@index([phone])
}

model Category {
  id               Int        @id @default(autoincrement())
  name             String     @unique // e.g. "distribution", "smart"
  parentCategory   String?
  image            String?
  products         Product[]
  gammes           Gamme[]
}

model Brand {
  id       Int       @id @default(autoincrement())
  name     String    @unique // e.g. "SIEMENS", "SCHNEIDER"
  origin   String?
  image    String?
  products Product[]
  gammes   Gamme[]
}

model Gamme {
  id         Int       @id @default(autoincrement())
  name       String    // e.g. "Elite", "Pro"
  image      String?
  brandId    Int
  brand      Brand     @relation(fields: [brandId], references: [id], onDelete: Cascade)
  categoryId Int
  category   Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  products   Product[]

  @@unique([name, brandId, categoryId]) // Prevent duplicate gamme definitions
}

model Product {
  id                  Int          @id @default(autoincrement())
  ref                 String       @unique // e.g. "REF-S1-098"
  name                String
  description         String       @db.Text
  priceBought         Decimal      @db.Decimal(12, 2) // Wholesale purchase price (essential for profit tracking)
  priceSold           Decimal      @db.Decimal(12, 2) // Default selling price
  promotionPercentage Decimal      @default(0.0)      // Active discount
  quantity            Int          @default(0)        // Stock inventory count
  inStock             Boolean      @default(true)
  rating              Float        @default(5.0)
  image               String       // Primary thumbnail image path
  images              String[]     // Additional slideshow images
  tag                 ProductTag   @default(NONE)
  details             String[]     // Technical features list bullet points
  sizes               String[]     // Available specs (e.g. 16A, 32A, Single-Phase)
  colors              Json         // Array of colors: [{ name: "Standard Black", hex: "#000000" }]
  positives           String[]     // Highlighting selling points
  negatives           String[]     // Limitations checklist
  
  // Relations
  categoryId          Int
  category            Category     @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  brandId             Int
  brand               Brand        @relation(fields: [brandId], references: [id], onDelete: Restrict)
  gammeId             Int?
  gamme               Gamme?       @relation(fields: [gammeId], references: [id], onDelete: SetNull)

  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  orderItems          OrderItem[]

  @@index([categoryId])
  @@index([brandId])
  @@index([gammeId])
  @@index([ref])
}

model Order {
  id              Int         @id @default(autoincrement())
  orderId         String      @unique // Custom generated ID: EH-YYYY-XXXXX
  date            DateTime    @default(now())
  clientName      String      // Snapshot of name at order placement
  clientPhone     String      // Snapshot of phone at order placement
  clientEmail     String      // Snapshot of email at order placement
  wilaya          String
  commune         String
  addressDetails  String?
  shippingFee     Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(12, 2) // Calculated grand total
  status          OrderStatus @default(PENDING)
  
  // Relations
  userId          Int?
  client          User?       @relation(fields: [userId], references: [id], onDelete: SetNull)
  items           OrderItem[]

  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  @@index([userId])
  @@index([orderId])
}

model OrderItem {
  id        Int      @id @default(autoincrement())
  name      String   // Snapshot of product name
  price     Decimal  @db.Decimal(12, 2) // Price sold at placement time
  quantity  Int
  image     String?  // Snapshot of image path
  size      String?  // Chosen specification
  color     String?  // Chosen color enclosure option
  
  // Relations
  orderId   Int
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId Int?
  product   Product? @relation(fields: [productId], references: [id], onDelete: SetNull)

  @@index([orderId])
}

model SystemSettings {
  id              Int      @id @default(1) // Single row config
  deliveryApiKey  String?
  metaPixelId     String?
  minFreeDelivery Decimal  @default(15000.00) @db.Decimal(12, 2)
  updatedAt       DateTime @updatedAt
}
```

---

## 3. Core REST API Endpoints

The API is fully structured under the `/api` namespace prefix. All data payload transfers use the standard application/json format.

### 3.1 Public & Client Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new corporate client | None |
| **POST** | `/api/auth/login` | Login to receive JWT session token | None |
| **GET** | `/api/auth/me` | Fetch currently logged-in user details | Client/Admin |
| **PUT** | `/api/auth/profile` | Update profile information | Client |
| **GET** | `/api/products` | Get list of products with filters, sorting & pagination | None |
| **GET** | `/api/products/:id` | Get details of a single product | None |
| **GET** | `/api/categories` | Fetch list of active categories | None |
| **GET** | `/api/brands` | Fetch list of premium brands | None |
| **GET** | `/api/gammes` | Fetch list of product collections/gammes | None |
| **POST** | `/api/orders` | Submit checkout COD order (automatically calculates fees) | None |
| **GET** | `/api/orders/my-orders`| Fetch purchase history of logged-in client | Client |
| **GET** | `/api/settings/public` | Get `minFreeDelivery` and public configurations | None |

### 3.2 Administrative Endpoints (Admin Access Only)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/admin/dashboard/stats` | Fetch real-time analytics data | Admin |
| **GET** | `/api/admin/products` | Fetch all products with bought prices | Admin |
| **POST** | `/api/admin/products` | Create a new product entry | Admin |
| **PUT** | `/api/admin/products/:id` | Update an existing product | Admin |
| **DELETE**| `/api/admin/products/:id` | Delete a product (soft or hard delete) | Admin |
| **GET** | `/api/admin/orders` | Retrieve list of all client orders | Admin |
| **PUT** | `/api/admin/orders/:id` | Update status of order | Admin |
| **GET** | `/api/admin/clients` | Retrieve all client accounts | Admin |
| **PUT** | `/api/admin/clients/:id/approve` | Toggle client verification | Admin |
| **PUT** | `/api/admin/settings` | Save global configurations (Free Delivery, APIs) | Admin |

---

## 4. Key Business Logic Flows

### 4.1 Shop Filtering Flow (`GET /api/products`)

To handle the complex frontend filters (search query, categories, brands, gammes, pricing ranges, and sorting rules), the backend executes a dynamic query using Prisma.

```javascript
// Example of Product Filter Query Assembly (Service Layer)
async function getFilteredProducts(filters) {
  const { category, brand, gamme, search, minPrice, maxPrice, sort } = filters;
  
  const where = { inStock: true };

  if (category) {
    where.category = { name: { equals: category, mode: 'insensitive' } };
  }
  if (brand) {
    where.brand = { name: { equals: brand, mode: 'insensitive' } };
  }
  if (gamme) {
    where.gamme = { name: { equals: gamme, mode: 'insensitive' } };
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { ref: { contains: search, mode: 'insensitive' } }
    ];
  }
  if (minPrice || maxPrice) {
    where.priceSold = {};
    if (minPrice) where.priceSold.gte = parseFloat(minPrice);
    if (maxPrice) where.priceSold.lte = parseFloat(maxPrice);
  }

  let orderBy = { id: 'desc' }; // Default sort
  if (sort === 'price_asc') orderBy = { priceSold: 'asc' };
  if (sort === 'price_desc') orderBy = { priceSold: 'desc' };
  if (sort === 'rating') orderBy = { rating: 'desc' };

  return await prisma.product.findMany({
    where,
    orderBy,
    include: {
      category: true,
      brand: true,
      gamme: true
    }
  });
}
```

### 4.2 Order Placement and Shipping Resolution Flow

When an order is created:
1. **Dynamic Shipping Computation**: Fetch the current `minFreeDelivery` settings. If the subtotal matches or exceeds the threshold, `shippingFee` is set to `0`. If not, it calculates the fee based on the target `wilaya` (e.g. Algiers: `400 DA`, Blida: `500 DA`, Oran/Constantine: `700 DA`, Rest of DZ: `900 DA`).
2. **Inventory Checking**: Verify that each item in the cart has sufficient stock. If yes, decrement the inventory count (`quantity`) for the items.
3. **Write Transaction**: Generate a unique `orderId` (e.g. `EH-2026-8941`) and persist the Order and OrderItems as a single database transaction.

```javascript
// Database Transaction for Checkout
const orderResult = await prisma.$transaction(async (tx) => {
  // Validate stock and deduct inventory
  for (const item of items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (!product || product.quantity < item.quantity) {
      throw new Error(`Insufficient stock for product ${product?.name || item.productId}`);
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { quantity: product.quantity - item.quantity }
    });
  }

  // Create order records
  return await tx.order.create({
    data: {
      orderId: generateUniqueOrderId(),
      clientName,
      clientPhone,
      clientEmail,
      wilaya,
      commune,
      shippingFee,
      total,
      userId,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image
        }))
      }
    }
  });
});
```

### 4.3 Admin Dashboard Analytics Flow

The Admin Dashboard displays key business stats. The backend calculates these indicators directly using aggregated database metrics:

```mermaid
classDiagram
    class DashboardMetrics {
        +TotalRevenue
        +ProfitMade
        +AverageOrderValue
        +PendingOrdersCount
    }
```

1. **Total Revenue**: Sum of the total invoiced amount of all confirmed, shipped, and delivered orders.
   $$\text{Total Revenue} = \sum (\text{Order.total} - \text{Order.shippingFee})$$
2. **Profit Made**: Difference between the selling price and purchase price of all products sold.
   $$\text{Profit Made} = \sum_{order} \sum_{item} \left( (\text{item.price} - \text{product.priceBought}) \times \text{item.quantity} \right)$$
3. **Average Order Value (AOV)**:
   $$\text{AOV} = \frac{\text{Total Revenue}}{\text{Total Orders Count}}$$

---

## 5. Migration & Setup Strategy

### 5.1 Environment Configuration (`.env`)
Ensure variables are loaded correctly before bootstrapping the server:
```bash
PORT=5000
NODE_ENV=production
DATABASE_URL="postgresql://db_user:db_password@localhost:5432/electrohub_db?schema=public"
JWT_SECRET="YOUR_SUPER_SECURE_JWT_SECRET_STRING_HERE"
```

### 5.2 Initial Setup Checklist
1. **Database Bootstrapping**: Setup local PostgreSQL server and create a database named `electrohub_db`.
2. **Apply Database Migration**: Run standard migrations to setup tables:
   ```bash
   npx prisma migrate dev --name init
   ```
3. **Seed Database**: Execute seed runner (`node prisma/seed.js`) to import all initial products, categories, brands, gammes, settings, and mock accounts from the frontend.
4. **Boot Server**:
   ```bash
   npm run build && npm start
   ```

---

> [!NOTE]
> Setting up indices on `Product(ref, categoryId, brandId, gammeId)` and `Order(orderId, userId)` ensures that search actions, filtering page loads, and user order retrieval maintain a latency sub-50ms even when scaling past 100k items.

> [!IMPORTANT]
> The database schema enforces data immutability by snapshotting product attributes (like `name`, `price`, `image`) inside the `OrderItem` records upon order confirmation. This prevents future modifications to products from corrupting historical accounting logs.
