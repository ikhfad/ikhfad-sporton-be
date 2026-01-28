# ikhfad-sporton-be

**ikhfad-sporton-be** is a backend API for the Sporton application, built with Node.js, Express, and TypeScript. It provides authentication services using JWT tokens and integrates with MongoDB for data persistence. The API includes user sign-in functionality and admin user initialization, with middleware for protecting routes.

---

## 🚀 Development Environment

This project is developed and optimized using [DDEV](https://ddev.com/), a Docker-based local development tool. Using DDEV ensures a consistent environment across different machines and handles SSL, networking, and performance optimizations (like Mutagen) automatically.

### Features

- User authentication with JWT
- Password hashing using bcrypt
- MongoDB integration with Mongoose
- CORS support for cross-origin requests
- TypeScript for type safety
- Development server with hot reloading via nodemon

### Technical Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT)
- **Security:** bcrypt for password hashing
- **Package Manager:** pnpm
- **Development Tools:** nodemon, TypeScript compiler

---

## Installation Instructions

Before setting up the project, ensure you have the following prerequisites installed on your system:

- **Node.js** (version 16 or higher) - Download from [nodejs.org](https://nodejs.org/)
- **pnpm** (version 10.28.2 or compatible) - Install via `npm install -g pnpm` or follow [pnpm.io](https://pnpm.io/installation)
- **MongoDB** - Either a local installation or a cloud instance (e.g., MongoDB Atlas)
- **Git** - For cloning the repository
- **DDEV** - (OPTIONAL) For ensures a consistent environment across different machines and handles SSL, networking, and performance optimizations (like Mutagen) automatically.
- **Mise** - (OPTIONAL) For providing a single, unified tool to manage all your different programming languages and development tools (like Node.js, Python, and Go) with zero performance lag.

### Getting Started with DDEV

1.  **Start the environment:**
    ```powershell
    ddev start
    ```
2.  **Install dependencies:**
    ```powershell
    ddev pnpm install
    ```
3.  **Run the development server:**
    The server starts automatically via a background daemon. You can access it at:
    `https://ikhfad-sporton-fe.ddev.site`

4.  **View Logs:**
    To see the Next.js output, use:
    ```powershell
    ddev logs -f
    ```

---

## Windows Development Notes (Crucial)

To ensure a smooth experience on Windows, especially when using **Mutagen** and **pnpm**, please follow these guidelines:

### 1. Enable Developer Mode

Windows requires **Developer Mode** to be active so that pnpm can create symbolic links on your host drive. Without this, Mutagen sync will fail with a "required privilege is not held" error.

- Go to **Settings > System > For developers** and toggle **Developer Mode** to **On**.

### 2. Managing node_modules

To avoid sync conflicts, **always run package commands inside DDEV**.

- **DO NOT** delete `node_modules` manually from Windows File Explorer while DDEV is running.
- If you need a clean install, run this first:
  ```powershell
  ddev stop
  ```
- Then proceed to delete the `node_modules`

---

## Configuration Instructions

1. **Environment Variables**
   - Copy the `.env.example` file to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Open the `.env` file and configure the following variables:
     - `APP_PORT`: The port on which the server will run (default: 5000)
     - `APP_MONGO_URI`: The MongoDB connection string (e.g., `mongodb://db:db@mongo:27017/sportondb?authSource=admin` for local or cloud MongoDB)

   Ensure the MongoDB URI is correctly set to point to your database instance.

---

## 🛠 Manual Installation (Without DDEV)

If you prefer to run the project natively on your host machine, ensure you have **Node.js 24+** and **pnpm** installed.

1.  **Install dependencies:**
    ```bash
    pnpm install
    ```
2.  **Run development server:**
    ```bash
    pnpm dev
    ```
3.  **Open the app:**
    Navigate to `http://localhost:5000`.

---

## 📂 Project Structure

```bash
ikhfad-sporton-be/
├── .ddev/               # DDEV and MongoDB 8 service configuration
├── src/                 # Main source code directory
│   ├── config/          # Centralized configuration (DB connection, env loaders)
│   ├── controllers/     # Request handlers and business logic
│   ├── middleware/      # Global Express middleware (Auth, Error handling)
│   ├── models/          # Mongoose Schemas and Models (User, Product, etc.)
│   ├── routes/          # API endpoint definitions and versioning
│   ├── types/           # Global TypeScript interfaces and API response shapes
│   └── server.ts        # Entry point: Express setup and DB connection
├── .env                 # Local secrets (Ignored by Git)
├── .env.example         # Template for environment variables
├── mise.toml            # Tool version definitions (Node 24, pnpm 10)
└── package.json         # Project scripts and dependencies
```

---

## 📝 Commit Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

| Type       | Description                                                      |
| :--------- | :--------------------------------------------------------------- |
| `feat`     | New features (e.g., `feat: add bank interface`)                  |
| `fix`      | Bug fixes (e.g., `fix: fix missing properties in button`)        |
| `style`    | UI/CSS changes (e.g., `style: change main section min height`)   |
| `refactor` | Code cleanup (e.g., `refactor: simplify customer contact input`) |
| `chore`    | Tool/Config updates (e.g., `chore: bump node to v24.13.0`)       |
| `docs`     | Documentation updates                                            |
