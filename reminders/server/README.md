# Reminders API Server

A full-featured RESTful API server for managing reminders with authentication, notifications, and background job processing.

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web framework
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Relational database
- **Clerk** - Authentication and user management
- **BullMQ** - Job queue and worker processing
- **Redis (IORedis)** - Message broker and caching
- **Nodemailer** - Email notifications
- **Slack Web API** - Slack notifications
- **Morgan** - HTTP request logging
- **Winston** - Application logging
- **Swagger UI** - API documentation
- **Commitlint** - Commit message linting
- **Prettier** - Code formatting
- **ESLint** - Code linting
- **Helmet** - Security headers
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Environment variable management
- **Day.js** - Date manipulation

## Project Structure

```
server/
├── src/
│   ├── configs/          # Configuration files (database, logger, queue, redis, swagger)
│   ├── constants/        # Constants (HTTP status codes, messages, statuses)
│   ├── interfaces/       # TypeScript interfaces
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication middleware
│   │   ├── notifications/ # Notification services & workers
│   │   │   ├── providers/ # Email, Slack, Console notification providers
│   │   │   └── workers/   # Background job workers
│   │   ├── reminders/    # Reminder CRUD operations
│   │   │   └── entities/  # TypeORM entities
│   │   └── users/        # User management
│   │       └── entities/  # TypeORM entities
│   ├── scripts/          # Utility scripts (seed, clear data)
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   ├── app.ts            # Express app configuration
│   └── server.ts         # Server entry point
├── logs/                 # Application logs
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

Copy `.env.example` to `.env` and configure the following:

```bash
cp .env.example .env
```

Required environment variables:

- Database connection (PostgreSQL)
- Redis connection
- Clerk authentication keys
- SMTP settings (for email notifications)
- Slack webhook (optional, for Slack notifications)

### 3. Database Setup

Ensure PostgreSQL is running and create a database:

```bash
createdb reminders_db
```

TypeORM will automatically run migrations on startup.

### 4. Redis Setup

Ensure Redis is running locally or configure a remote Redis instance.

### 5. Development Mode

Start the development server with hot-reload:

```bash
npm run dev
```

The server will run on `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
```

### 7. Start Production Server

```bash
npm start
```

## API Endpoints

### Base URL

```
http://localhost:8080/api/v1
```

### API Documentation

Interactive API documentation is available via Swagger UI:

```
http://localhost:8080/api-docs
```

### Endpoints

#### Health Check

- `GET /health` - Check server health (no authentication required)

#### Users

All user endpoints require authentication via Clerk JWT token.

- `GET /api/v1/users/profile` - Get current user profile
- `GET /api/v1/users/notifications` - Get user notifications setting
- `PUT /api/v1/users/notifications` - Update user notifications setting

#### Reminders

All reminder endpoints require authentication via Clerk JWT token.

- `GET /api/v1/reminders` - Get all reminders (with pagination and filtering)
- `GET /api/v1/reminders/stats` - Get reminder statistics
- `GET /api/v1/reminders/:id` - Get reminder by ID
- `POST /api/v1/reminders` - Create a new reminder
- `PUT /api/v1/reminders/:id` - Update a reminder
- `DELETE /api/v1/reminders/:id` - Delete a reminder

### Example Requests

#### Authentication

All authenticated requests require a Bearer token from Clerk:

```bash
curl -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  http://localhost:3000/api/v1/users/profile
```

#### Create a Reminder

```bash
curl -X POST http://localhost:3000/api/v1/reminders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "dueDate": "2026-02-15",
    "notifyAt": "2026-02-15T09:00:00Z"
  }'
```

#### Get Reminders with Filtering

```bash
curl -X GET "http://localhost:3000/api/v1/reminders?status=active&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

## Scripts

- `npm run dev` - Start development server with hot-reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run seed:reminders CLERK_USER_ID` - Seed database with sample reminders for specific user
- `npm run clear:reminders` - Clear all reminders from database

## Architecture

### Modular Design

The application follows a modular architecture with clear separation of concerns:

- **Controllers** - Handle HTTP requests and responses
- **Services** - Contain business logic
- **Repositories** - Handle data access layer
- **Entities** - Define database models (TypeORM)
- **Routes** - Define API endpoints
- **Middleware** - Handle authentication and validation

### Notification System

The notification system uses a factory pattern with multiple providers:

1. **Email Provider** - Sends notifications via SMTP
2. **Slack Provider** - Sends notifications to Slack channels
3. **Console Provider** - Logs notifications to console (development)

### Background Jobs

BullMQ workers handle asynchronous notification delivery:

- Jobs are queued when reminders are created/updated
- Workers process jobs independently
- Automatic retry on failure
- Redis ensures job persistence

## License

ISC

## Support

For issues and questions, please open an issue in the repository.
