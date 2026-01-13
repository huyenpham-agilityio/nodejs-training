# Reminders API Server

A RESTful API server built with Node.js, TypeScript, and Express.js.

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Security headers
- **dotenv** - Environment variable management

## Project Structure

```
server/
├── src/
│   ├── controllers/      # Request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── types/            # TypeScript type definitions
│   ├── app.ts            # Express app configuration
│   └── index.ts          # Server entry point
├── dist/                 # Compiled JavaScript (generated)
├── .env                  # Environment variables
├── .env.example          # Example environment variables
├── tsconfig.json         # TypeScript configuration
└── package.json          # Project dependencies

```

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and adjust the values:

```bash
cp .env.example .env
```

### 3. Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

#### Health Check

- `GET /health` - Check server health

#### Reminders

- `GET /api/v1/reminders` - Get all reminders
- `GET /api/v1/reminders/:id` - Get reminder by ID
- `POST /api/v1/reminders` - Create a new reminder
- `PUT /api/v1/reminders/:id` - Update a reminder
- `DELETE /api/v1/reminders/:id` - Delete a reminder

### Example Request

```bash
# Create a reminder
curl -X POST http://localhost:3000/api/v1/reminders \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-01-15"
  }'
```

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Environment Variables

| Variable    | Description         | Default               |
| ----------- | ------------------- | --------------------- |
| PORT        | Server port         | 3000                  |
| NODE_ENV    | Environment mode    | development           |
| API_VERSION | API version         | v1                    |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:5173 |

## Next Steps

- Add database integration (PostgreSQL, MongoDB, etc.)
- Add authentication & authorization
- Add input validation (e.g., with Joi or Zod)
- Add request logging (e.g., with Morgan)
- Add unit and integration tests
- Add API documentation (e.g., with Swagger)
