const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Blog API Documentation',
      version: '1.0.0',
      description: 'A comprehensive blog API with user authentication, posts, and comments',
      contact: {
        name: 'Huyen Pham',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token (without "Bearer" prefix)',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/AuthError',
              },
              example: {
                error: 'Unauthorized - Invalid or missing token',
              },
            },
          },
        },
        NotFoundError: {
          description: 'The specified resource was not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/NotFoundError',
              },
              example: {
                error: 'Resource not found',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Access to the resource is forbidden',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ForbiddenError',
              },
              example: {
                error: 'You do not have permission to perform this action',
              },
            },
          },
        },
        ValidationError: {
          description: 'Validation error in request data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError',
              },
              example: {
                error: 'Validation failed',
                details: [
                  {
                    field: 'email',
                    message: 'Invalid email format',
                  },
                ],
              },
            },
          },
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ServerError',
              },
              example: {
                error: 'An unexpected error occurred. Please try again later.',
              },
            },
          },
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Post ID',
            },
            title: {
              type: 'string',
              description: 'Post title',
            },
            content: {
              type: 'string',
              description: 'Post content',
            },
            userId: {
              type: 'integer',
              description: 'Author user ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Comment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Comment ID',
            },
            content: {
              type: 'string',
              description: 'Comment content',
            },
            postId: {
              type: 'integer',
              description: 'Post ID',
            },
            userId: {
              type: 'integer',
              description: 'Comment author user ID',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'An error occurred',
            },
          },
        },
        ValidationError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Validation error message',
              example: 'Validation failed',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Invalid email format',
                  },
                },
              },
            },
          },
        },
        AuthError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Authentication error message',
              example: 'Invalid credentials',
            },
          },
        },
        NotFoundError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Resource not found error',
              example: 'Resource not found',
            },
          },
        },
        ForbiddenError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Forbidden access error',
              example: 'You do not have permission to access this resource',
            },
          },
        },
        ServerError: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Internal server error message',
              example: 'An unexpected error occurred',
            },
          },
        },
      },
    },
    security: [],
  },
  apis: [
    './src/modules/auth/routes.ts',
    './src/modules/users/routes.ts',
    './src/modules/posts/routes.ts',
    './src/modules/comments/routes.ts',
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
