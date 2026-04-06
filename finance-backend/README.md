# Finance Dashboard Backend

Express + MongoDB backend for a finance dashboard with **JWT auth**, **roles**, **access control**, **transactions CRUD**, and **dashboard analytics**.

## Tech

- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Zod validation

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
```

3. Run:

```bash
npm run dev
```

Health check: `GET /health`

## Auth Notes

- Send token using either:
  - `Authorization: <token>` (legacy / supported)
  - `Authorization: Bearer <token>` (supported)
- Inactive users are blocked (`403`).

## Roles

- **viewer**: can view dashboard + transactions list
- **analyst**: same as viewer (can be extended with more insights)
- **admin**: can create/update/delete transactions and manage users

## API

### Auth

- `POST /api/auth/register`
  - body: `{ name, email, password, role? }`
  - returns user (without password)
- `POST /api/auth/login`
  - body: `{ email, password }`
  - returns `{ token, user }`

### Users

- `GET /api/users/me` (auth)
- `GET /api/users` (auth + admin)
  - query: `page, limit, q, role, status`
  - returns `{ items, page, limit, total }`
- `PUT /api/users/:id` (auth + admin)
  - body: `{ role?, status?, name? }`

### Transactions

- `GET /api/transactions` (auth)
  - query filters: `type, category, startDate, endDate, page, limit, sort`
  - returns an array (backwards compatible). Also sets `X-Total-Count`.
- `POST /api/transactions` (auth + admin)
  - body: `{ amount, type, category?, note?, date? }`
- `PUT /api/transactions/:id` (auth + admin)
  - body: any subset of create fields
- `DELETE /api/transactions/:id` (auth + admin)

### Dashboard

- `GET /api/dashboard` (auth)
  - returns:
    - `totalIncome`, `totalExpense`, `balance`
    - `categoryTotals` (net per category)
    - `recentActivity` (last 10)
    - `monthlyTrends` (income/expense/balance by `YYYY-MM`)

## Error format

Errors return:

```json
{ "msg": "Something went wrong", "details": [] }
```

