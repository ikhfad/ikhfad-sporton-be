# Sporton Backend API Documentation

## Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [API Endpoints](#3-api-endpoints)
4. [OpenAPI/Swagger Specification](#4-openapiswagger-specification)

---

## 1. Overview

### Purpose

The Sporton Backend API provides a comprehensive e-commerce solution for sports equipment retail. It offers a complete set of endpoints for managing products, categories, banking information, and customer transactions.

### Base URL

```
http://localhost:5000/api
```

For production:

```
https://api.sporton.example.com/v1
```

### Content Type

All API requests and responses use JSON format:

```
Content-Type: application/json
```

For file uploads (images):

```
Content-Type: multipart/form-data
```

---

## 2. Authentication

The Sporton API uses **JSON Web Token (JWT)** authentication. Most write operations require a valid JWT token, while read operations for categories and products are publicly accessible.

### Obtaining a Token

**Endpoint**: `POST /api/auth/signin`

**Request Body**:

```json
{
  "email": "admin@example.com",
  "password": "your-secure-password"
}
```

**Successful Response**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

### Using the Token

Include the token in the `Authorization` header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- **Token Lifetime**: 24 hours
- Users must re-authenticate after expiration

### Error Responses

```json
{
  "message": "Authentication Required!"
}
// Status: 401 - No token provided

{
  "message": "Invalid Token!"
}
// Status: 401 - Token is invalid or expired
```

### Admin User Initialization

**Endpoint**: `POST /api/auth/initiate-admin-user`

**Request Body**:

```json
{
  "name": "Admin Name",
  "email": "admin@example.com",
  "password": "secure-password-here"
}
```

**Response (201 Created)**:

```json
{
  "message": "Admin user created successfully!"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "We can only have 1 admin user, if you want to create new admin user, please delete the user manually from the database"
}
```

---

## 3. API Endpoints

### Authentication Endpoints

#### POST /api/auth/signin

Authenticate user and receive JWT token.

| Attribute | Type   | Required | Description          |
| --------- | ------ | -------- | -------------------- |
| email     | string | Yes      | User's email address |
| password  | string | Yes      | User's password      |

**Response (201 Created)**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@example.com"
  }
}
```

---

#### POST /api/auth/initiate-admin-user

Create the first admin user (only works when no users exist).

| Attribute | Type   | Required | Description            |
| --------- | ------ | -------- | ---------------------- |
| name      | string | Yes      | Admin user's full name |
| email     | string | Yes      | Admin user's email     |
| password  | string | Yes      | Admin user's password  |

**Response (201 Created)**:

```json
{
  "message": "Admin user created successfully!"
}
```

---

### Categories Endpoints

Categories organize products (e.g., Football, Basketball, Running).

#### GET /api/categories

Retrieve all categories (public endpoint - no authentication required).

**Response (200 OK)**:

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Football",
    "description": "Professional football equipment and apparel",
    "imageUrl": "/categories/football-1699999999000.png",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Basketball",
    "description": "Basketballs, hoops, and training equipment",
    "imageUrl": "/categories/basketball-1699999999000.png",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET /api/categories/:id

Retrieve a specific category by ID.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Category's MongoDB ObjectId |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Football",
  "description": "Professional football equipment and apparel",
  "imageUrl": "/categories/football-1699999999000.png",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Invalid Category ID format"
}
```

**Error Response (404 Not Found)**:

```json
{
  "message": "Category not found"
}
```

---

#### POST /api/categories

Create a new category (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body (form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Category name |
| description | string | Yes | Category description |
| image | file | Yes | Category image (JPEG, PNG, WebP, SVG) |

**Response (201 Created)**:

```json
{
  "_id": "507f1f77bcf86cd799439015",
  "name": "Tennis",
  "description": "Tennis rackets, balls, and accessories",
  "imageUrl": "/categories/tennis-1699999999000.png",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### PATCH /api/categories/:id

Update a category (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body (form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New category name |
| description | string | No | New category description |
| image | file | No | New category image |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Updated Tennis",
  "description": "Updated description",
  "imageUrl": "/categories/tennis-updated-1700000000000.png",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

---

#### DELETE /api/categories/:id

Delete a category (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:

```json
{
  "message": "Category and associated image deleted successfully"
}
```

---

### Products Endpoints

#### GET /api/products

Retrieve all products (public endpoint - no authentication required).

**Response (200 OK)**:

```json
[
  {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Pro Dry Jersey Red",
    "description": "High-performance breathable jersey for athletes",
    "stock": 50,
    "price": 29.99,
    "imageUrl": "/products/jersey-red-1699999999000.png",
    "category": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Football"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439013",
    "name": "Vanguard Running Shoes",
    "description": "Lightweight running shoes with superior cushioning",
    "stock": 25,
    "price": 89.99,
    "imageUrl": "/products/running-shoes-1699999999000.png",
    "category": {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Running"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET /api/products/:id

Retrieve a specific product by ID.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Product's MongoDB ObjectId |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439012",
  "name": "Official Size Basketball",
  "description": "FIBA approved official size basketball",
  "stock": 30,
  "price": 49.99,
  "imageUrl": "/products/basketball-1699999999000.png",
  "category": {
    "_id": "507f1f77bcf86cd799439010",
    "name": "Basketball"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Invalid Product ID format"
}
```

**Error Response (404 Not Found)**:

```json
{
  "message": "Product not found"
}
```

---

#### POST /api/products

Create a new product (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body (form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name |
| description | string | Yes | Product description |
| stock | number | Yes | Available stock quantity |
| price | number | Yes | Product price |
| category | string | Yes | Category ObjectId |
| image | file | Yes | Product image (JPEG, PNG, WebP) |

**Response (201 Created)**:

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Ace Tennis Racket",
  "description": "Professional grade tennis racket",
  "stock": 20,
  "price": 79.99,
  "imageUrl": "/products/tennis-racket-1699999999000.png",
  "category": "507f1f77bcf86cd799439017",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

#### PATCH /api/products/:id

Update a product (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body (form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | No | New product name |
| description | string | No | New product description |
| stock | number | No | New stock quantity |
| price | number | No | New product price |
| category | string | No | New category ObjectId |
| image | file | No | New product image |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439016",
  "name": "Updated Tennis Racket",
  "description": "Updated professional grade racket",
  "stock": 15,
  "price": 69.99,
  "imageUrl": "/products/tennis-racket-updated-1700000000000.png",
  "category": "507f1f77bcf86cd799439017",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

---

#### DELETE /api/products/:id

Delete a product (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:

```json
{
  "message": "Product and associated image deleted successfully"
}
```

---

### Banks Endpoints

#### GET /api/banks

Retrieve all bank accounts (public endpoint - no authentication required).

**Response (200 OK)**:

```json
[
  {
    "_id": "507f1f77bcf86cd799439018",
    "bankName": "BCA",
    "accountName": "PT Sporton Indonesia",
    "accountNumber": "1234567890",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439019",
    "bankName": "Mandiri",
    "accountName": "PT Sporton Indonesia",
    "accountNumber": "9876543210",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET /api/banks/:id

Retrieve a specific bank account by ID.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Bank's MongoDB ObjectId |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439018",
  "bankName": "BCA",
  "accountName": "PT Sporton Indonesia",
  "accountNumber": "1234567890",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (404 Not Found)**:

```json
{
  "message": "Bank not found"
}
```

---

#### POST /api/banks

Create a new bank account (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "bankName": "BNI",
  "accountName": "PT Sporton Indonesia",
  "accountNumber": "1122334455"
}
```

**Response (201 Created)**:

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "bankName": "BNI",
  "accountName": "PT Sporton Indonesia",
  "accountNumber": "1122334455",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "All fields are required"
}
```

---

#### PATCH /api/banks/:id

Update a bank account (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "bankName": "Updated BNI",
  "accountName": "PT Sporton Updated",
  "accountNumber": "5566778899"
}
```

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439020",
  "bankName": "Updated BNI",
  "accountName": "PT Sporton Updated",
  "accountNumber": "5566778899",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

---

#### DELETE /api/banks/:id

Delete a bank account (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:

```json
{
  "message": "Bank deleted successfully"
}
```

---

### Transactions Endpoints

#### POST /api/transactions/checkout

Create a new transaction/checkout (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body (form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| purchasedItems | JSON string | Yes | Array of {productId, qty} objects |
| totalPayment | number | Yes | Total payment amount |
| customerName | string | Yes | Customer's full name |
| customerContact | string | Yes | Customer's phone/email |
| customerAddress | string | |
| image | file | Yes | Payment proof image (JPEG, PNG, WebP) |

**Example purchasedItems JSON**:

```json
[
  { "productId": "507f1f77bcf86cd799439012", "qty": 2 },
  { "productId": "507f1f77bcf86cd799439013", "qty": 1 }
]
```

**Response (201 Created)**:

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "paymentProof": "/transactions/payment-proof-1699999999000.png",
  "status": "pending",
  "purchasedItems": [
    {
      "productId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Pro Dry Jersey Red",
        "price": 29.99
      },
      "qty": 2
    },
    {
      "productId": {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Vanguard Running Shoes",
        "price": 89.99
      },
      "qty": 1
    }
  ],
  "totalPayment": 149.97,
  "customerName": "John Doe",
  "customerContact": "john.doe@example.com",
  "customerAddress": "123 Main St, Jakarta",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Payment proof is required!"
}
// or
{
  "message": "Invalid format for purchasedItems"
}
```

---

#### GET /api/transactions

Retrieve all transactions (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Response (200 OK)**:

```json
[
  {
    "_id": "507f1f77bcf86cd799439021",
    "paymentProof": "/transactions/payment-proof-1699999999000.png",
    "status": "pending",
    "purchasedItems": [...],
    "totalPayment": 149.97,
    "customerName": "John Doe",
    "customerContact": "john.doe@example.com",
    "customerAddress": "123 Main St, Jakarta",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

#### GET /api/transactions/:id

Retrieve a specific transaction by ID.

**Parameters**:
| Name | Type | Required | Description |
|------|------|----------|-------------|
| id | string | Yes | Transaction's MongoDB ObjectId |

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "paymentProof": "/transactions/payment-proof-1699999999000.png",
  "status": "paid",
  "purchasedItems": [
    {
      "productId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Pro Dry Jersey Red",
        "price": 29.99
      },
      "qty": 2
    }
  ],
  "totalPayment": 59.98,
  "customerName": "John Doe",
  "customerContact": "john.doe@example.com",
  "customerAddress": "123 Main St, Jakarta",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Invalid Transaction ID format"
}
```

---

#### PATCH /api/transactions/:id

Update transaction status (requires authentication).

**Headers**: `Authorization: Bearer <token>`

**Request Body**:

```json
{
  "status": "paid"
}
```

**Valid Status Values**:
| Status | Description |
|--------|-------------|
| `pending` | Payment awaiting verification (initial status) |
| `paid` | Payment confirmed - stock is deducted |
| `rejected` | Payment rejected - no stock change |

**Status Workflow**:

- `pending` → `paid` (deducts product stock)
- `pending` → `rejected` (no stock change)
- `paid` → `rejected` (restocks items)

**Response (200 OK)**:

```json
{
  "_id": "507f1f77bcf86cd799439021",
  "paymentProof": "/transactions/payment-proof-1699999999000.png",
  "status": "paid",
  "purchasedItems": [...],
  "totalPayment": 59.98,
  "customerName": "John Doe",
  "customerContact": "john.doe@example.com",
  "customerAddress": "123 Main St, Jakarta",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-16T10:30:00.000Z"
}
```

**Error Response (400 Bad Request)**:

```json
{
  "message": "Invalid status. Only 'paid' or 'rejected' are allowed!"
}
```

---

## 4. OpenAPI/Swagger Specification

```yaml
openapi: 3.0.0
info:
  title: Sporton Backend API
  description: E-commerce API for sports equipment
  version: 1.0.0
  contact:
    name: API Support
    email: support@sporton.example.com

servers:
  - url: http://localhost:5000/api
    description: Development server
  - url: https://api.sporton.example.com/v1
    description: Production server

paths:
  /auth/signin:
    post:
      summary: Sign in user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email: { type: string, format: email }
                password: { type: string }
      responses:
        "200":
          description: Successful signin

  /auth/initiate-admin-user:
    post:
      summary: Create initial admin user
      tags: [Authentication]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name: { type: string }
                email: { type: string, format: email }
                password: { type: string }

  /categories:
    get:
      summary: Get all categories
      tags: [Categories]
      responses:
        "200":
          description: List of categories
    post:
      summary: Create category
      tags: [Categories]
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Category created

  /categories/{id}:
    get:
      summary: Get category by ID
      tags: [Categories]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Category found

  /products:
    get:
      summary: Get all products
      tags: [Products]
      responses:
        "200":
          description: List of products
    post:
      summary: Create product
      tags: [Products]
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Product created

  /products/{id}:
    get:
      summary: Get product by ID
      tags: [Products]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
      responses:
        "200":
          description: Product found

  /banks:
    get:
      summary: Get all banks
      tags: [Banks]
      responses:
        "200":
          description: List of banks
    post:
      summary: Create bank
      tags: [Banks]
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Bank created

  /transactions/checkout:
    post:
      summary: Create transaction
      tags: [Transactions]
      security:
        - bearerAuth: []
      responses:
        "201":
          description: Transaction created

  /transactions/{id}:
    get:
      summary: Get transaction by ID
      tags: [Transactions]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }
    patch:
      summary: Update transaction status
      tags: [Transactions]
      security:
        - bearerAuth: []
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string }

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

tags:
  - name: Authentication
    description: User authentication endpoints
  - name: Categories
    description: Product category management
  - name: Products
    description: Product management
  - name: Banks
    description: Bank account management
  - name: Transactions
    description: Transaction and order management
```

---

## Error Reference

| HTTP Code | Error Type            | Message                                           |
| --------- | --------------------- | ------------------------------------------------- |
| 400       | Bad Request           | Invalid request format or missing required fields |
| 401       | Unauthorized          | Authentication Required!                          |
| 401       | Unauthorized          | Invalid Token!                                    |
| 404       | Not Found             | Resource does not exist                           |
| 500       | Internal Server Error | Server-side error                                 |

---

_Last updated: February 2024_
_API Version: 1.0.0_
