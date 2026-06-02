# Expense Tracker

A full-stack mobile expense tracking application built with **React Native (Expo)**, **Node.js**, **Express**, and **PostgreSQL**.

Track daily expenses, analyze spending habits, view monthly summaries, and manage finances through a clean mobile interface.

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Protected API routes
* Persistent user sessions

### Expense Management

* Add expenses
* Edit expenses
* Delete expenses
* View expense details
* Categorize expenses

### Analytics & Insights

* Month-wise expense tracking
* Monthly spending summaries
* Category-wise breakdowns
* High-spending month detection
* Auto-generated spending insights

### User Experience

* Pull-to-refresh support
* Responsive mobile UI
* Secure user-specific data
* Fast and lightweight experience

---

## 📸 Screenshots


<table align="center">
<tr>
<td align="center">
<img src="./frontend/assets/login.jpeg" width="250"><br>
<b>Login</b>
</td>

<td align="center">
<img src="./frontend/assets/signup.jpeg" width="250"><br>
<b>Signup</b>
</td>
</tr>

<tr>
<td align="center">
<img src="./frontend/assets/home.jpeg" width="250"><br>
<b>Home</b>
</td>

<td align="center">
<img src="./frontend/assets/add_item.jpeg" width="250"><br>
<b>Add Expense</b>
</td>
</tr>
</table>

## Tech Stack

### Frontend

* React Native
* Expo SDK 54
* TypeScript
* React Navigation

### Backend

* Node.js
* Express.js
* PostgreSQL
* JWT Authentication

### Tools

* Docker
* Git
* GitHub

---

## Project Structure

```text
Expense-Tracker/
├── frontend/     # React Native (Expo) application
└── backend/      # Express + PostgreSQL REST API
```

---

## Prerequisites

Before running the project, ensure you have:

* Node.js 18+
* PostgreSQL 14+ (or Docker)
* Expo Go application or Android/iOS emulator

---

# Backend Setup

## Option A — Docker (Recommended)

```bash
cd backend
npm install
copy .env.example .env
npm run db:up
npm run dev
```

## Option B — Existing PostgreSQL Installation

Create a PostgreSQL database and set:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/expense_tracker
```

Then run:

```bash
cd backend
npm install
npm run dev
```

The API automatically creates required tables on startup.

Backend runs at:

```text
http://localhost:3000
```

---

## Backend Environment Variables

Copy:

```bash
backend/.env.example
```

to:

```bash
backend/.env
```

and configure:

| Variable       | Description                  |
| -------------- | ---------------------------- |
| PORT           | API port                     |
| HOST           | Bind address                 |
| NODE_ENV       | Environment mode             |
| DATABASE_URL   | PostgreSQL connection string |
| JWT_SECRET     | JWT signing secret           |
| JWT_EXPIRES_IN | Token expiration             |
| CORS_ORIGIN    | Allowed frontend origins     |

---

## API Documentation

### Authentication Routes

| Method | Endpoint           | Description      |
| ------ | ------------------ | ---------------- |
| POST   | `/api/auth/signup` | Register a user  |
| POST   | `/api/auth/login`  | Login user       |
| GET    | `/api/auth/me`     | Get current user |

### Expense Routes

Authentication required via Bearer Token.

| Method | Endpoint                         | Description      |
| ------ | -------------------------------- | ---------------- |
| GET    | `/health`                        | Health check     |
| GET    | `/api/expenses`                  | Fetch expenses   |
| GET    | `/api/expenses/summary`          | Monthly summary  |
| GET    | `/api/expenses/monthly-overview` | Monthly insights |
| GET    | `/api/expenses/categories`       | Categories list  |
| GET    | `/api/expenses/:id`              | Get expense      |
| POST   | `/api/expenses`                  | Create expense   |
| PUT    | `/api/expenses/:id`              | Update expense   |
| DELETE | `/api/expenses/:id`              | Delete expense   |

---

# Frontend Setup

```bash
cd frontend
npm install
npm start
```

Launch using:

* Expo Go (QR Code)
* Android Emulator
* iOS Simulator

---

## API Configuration

| Platform         | URL                    |
| ---------------- | ---------------------- |
| Android Emulator | http://10.0.2.2:3000   |
| iOS Simulator    | http://localhost:3000  |
| Web              | http://localhost:3000  |
| Physical Device  | http://YOUR_PC_IP:3000 |

For a physical device, create:

```env
frontend/.env
```

```env
EXPO_PUBLIC_API_URL=http://YOUR_PC_IP:3000
```

Replace `YOUR_PC_IP` with your computer's local IP address and restart Expo.

---

## Available Categories

* Food
* Transport
* Shopping
* Bills
* Entertainment
* Health
* Other

---

## Scripts

### Backend

```bash
npm run dev
```

Start development server with hot reload.

```bash
npm start
```

Run backend in production mode.

```bash
npm run build
```

Compile TypeScript.

```bash
npm run db:up
```

Start PostgreSQL Docker container.

```bash
npm run db:down
```

Stop PostgreSQL Docker container.

### Frontend

```bash
npm start
npm run android
npm run ios
npm run web
```

---

## Note

Expenses created before authentication support was added are not associated with a user account. Create new expenses after signing up or manually assign a `user_id` in PostgreSQL.

---

## Author

**Yaswant Soni**

GitHub: https://github.com/Yaswantsoni1128

Built with ❤️ using React Native, Expo, Node.js, Express, and PostgreSQL.
