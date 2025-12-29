# Blog API

A RESTful API server for a blog platform built with Node.js, Express, TypeScript, and Sequelize.

## Features

- 🔐 **Authentication & Authorization** - JWT-based authentication with Passport.js
- 👥 **User Management** - User registration, login, and profile management
- 📝 **Posts** - Create, read, update, and delete blog posts
- 💬 **Comments** - Comment system for blog posts

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **Language:** TypeScript
- **ORM:** Sequelize v6
- **Database:** SQLite3
- **Authentication:** Passport.js with JWT strategy
- **Password Hashing:** bcrypt
- **API Documentation:** Swagger/OpenAPI 3.0
- **Logging:** Winston & Morgan
- **Testing:** Jest
- **Code Quality:** ESLint & Prettier

## Project Structure

```
blog-api/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── configs/               # Configuration files
│   │   ├── appConfig.ts       # Application config
│   │   ├── associations.ts    # Database associations
│   │   ├── db.ts              # Database connection
│   │   └── swagger.ts         # Swagger/OpenAPI configuration
│   ├── constants/             # Application constants
│   │   ├── env.ts             # Environment variables
│   │   ├── http.ts            # HTTP status codes
│   │   └── messages.ts        # Response messages
│   ├── middlewares/           # Custom middlewares
│   │   ├── auth.ts            # Passport JWT strategy
│   │   └── authenticate.ts    # Authentication middleware
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── users/             # Users module
│   │   ├── posts/             # Posts module
│   │   └── comments/          # Comments module
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
├── tests/                     # Test files
├── blog.sqlite               # SQLite database file
├── jest.config.js            # Jest configuration
├── tsconfig.json             # TypeScript configuration
├── nodemon.json              # Nodemon configuration
└── package.json              # Project dependencies

```

## Getting Started

### Prerequisites

- Node.js (>20)
- npm

### Installation

1. Clone the repository:

```bash
git clone git@gitlab.asoft-python.com:huyen.pham/nodejs-training.git
cd blog-api
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (optional):
   Create a `.env` file in the root directory if you need to customize settings.

4. Initialize the database:
   The database will be automatically created when you start the server.

### Running the Application

#### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:8080` (or the port specified in your environment variables).

### Available Scripts

- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## API Documentation

The API includes interactive Swagger/OpenAPI documentation. Once the server is running, you can access it at:

```
http://localhost:8080/api-docs
```

### Features of the API Documentation:

- 📖 **Interactive Interface** - Test endpoints directly from your browser
- 🔐 **Authentication Support** - Built-in JWT token authorization
- 📝 **Detailed Schemas** - Complete request/response models
- 🚨 **Error Documentation** - Comprehensive error responses with examples
- ✅ **Request Validation** - Field requirements and constraints clearly documented

### Using the Swagger UI:

1. Open `http://localhost:8080/api-docs` in your browser
2. Browse available endpoints organized by tags (Authentication, Users, Posts, Comments)
3. Click "Try it out" on any endpoint to test it
4. For protected endpoints:
   - First, call `/auth/signup` or `/auth/signin` to get a JWT token
   - Click the "Authorize" button (lock icon) at the top right
   - Enter your token in the format: `Bearer <your-token>`
   - Click "Authorize" and "Close"
   - Now you can access all protected endpoints

## API Endpoints

### Health Check

- `GET /health` - Check API status

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user

### Users

- `GET /users` - Get all users (protected)
- `GET /users/:id` - Get user by ID (protected)
- `PUT /users/:id` - Update user (protected)
- `DELETE /users/:id` - Delete user (protected)

### Posts

- `GET /posts` - Get all posts (optionally filter by userId using `?userId=<id>`)
- `GET /posts/:id` - Get post by ID
- `POST /posts` - Create new post (protected)
- `PUT /posts/:id` - Update post (protected)
- `DELETE /posts/:id` - Delete post (protected)

### Comments

- `GET /comments` - Get all comments (optionally filter by postId using `?postId=<id>`)
- `GET /comments/:id` - Get comment by ID
- `POST /comments` - Create comment (protected, requires `postId` and `content` in body)
- `PUT /comments/:id` - Update comment (protected)
- `DELETE /comments/:id` - Delete comment (protected)
- `DELETE /comments` - Delete all comments by authenticated user for a specific post (protected, requires `postId` in body)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected endpoints:

1. Register or login to get a JWT token
2. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Database Schema

### Users

- id (Primary Key)
- username
- email
- password (hashed)
- createdAt
- updatedAt

### Posts

- id (Primary Key)
- title
- content
- userId (Foreign Key)
- createdAt
- updatedAt

### Comments

- id (Primary Key)
- content
- userId (Foreign Key)
- postId (Foreign Key)
- createdAt
- updatedAt

## License

ISC

## Author

Huyen Pham

---

Built with ❤️ using Node.js, Express, and TypeScript
