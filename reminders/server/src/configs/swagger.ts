import swaggerJsdoc from 'swagger-jsdoc';

const API_VERSION = process.env.API_VERSION || 'v1';
const PORT = process.env.PORT || 8080;
const isProduction = process.env.NODE_ENV === 'production';
const srcBase = isProduction ? './dist' : './src';
const srcExt = isProduction ? 'js' : 'ts';

const servers = isProduction && process.env.API_URL
  ? [{ url: `${process.env.API_URL}/api/${API_VERSION}`, description: 'Production server' }]
  : [{ url: `http://localhost:${PORT}/api/${API_VERSION}`, description: 'Development server' }];

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reminders API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Reminders application',
      contact: {
        name: 'API Support',
      },
    },
    servers,
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Clerk JWT token',
        },
      },
      responses: {
        InternalServerError: {
          description: 'Internal Server Error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: {
                    type: 'string',
                    enum: ['error'],
                    example: 'error',
                  },
                  message: {
                    type: 'string',
                    example: 'Internal server error occurred',
                  },
                },
              },
            },
          },
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['error'],
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['success'],
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        Reminder: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            title: {
              type: 'string',
              example: 'Team Meeting',
            },
            description: {
              type: 'string',
              example: 'Discuss project updates',
              nullable: true,
            },
            scheduled_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-28T10:00:00Z',
            },
            status: {
              type: 'string',
              enum: ['active', 'completed'],
              example: 'active',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-27T12:00:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-27T12:00:00Z',
            },
          },
        },
        CreateReminderRequest: {
          type: 'object',
          required: ['title', 'scheduled_at'],
          properties: {
            title: {
              type: 'string',
              example: 'Team Meeting',
            },
            description: {
              type: 'string',
              example: 'Discuss project updates',
            },
            scheduled_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-28T10:00:00Z',
            },
          },
        },
        UpdateReminderRequest: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              example: 'Updated Team Meeting',
            },
            description: {
              type: 'string',
              example: 'Updated description',
            },
            scheduled_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-28T11:00:00Z',
            },
          },
        },
        ReminderStats: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 10,
            },
            active: {
              type: 'integer',
              example: 7,
            },
            completed: {
              type: 'integer',
              example: 3,
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              example: 1,
            },
            limit: {
              type: 'integer',
              example: 10,
            },
            total: {
              type: 'integer',
              example: 50,
            },
            totalPages: {
              type: 'integer',
              example: 5,
            },
            hasNextPage: {
              type: 'boolean',
              example: true,
            },
            hasPreviousPage: {
              type: 'boolean',
              example: false,
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1,
            },
            clerk_user_id: {
              type: 'string',
              example: 'user_abc123xyz',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            email_notifications_enabled: {
              type: 'boolean',
              example: true,
            },
            slack_notifications_enabled: {
              type: 'boolean',
              example: false,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-01T00:00:00Z',
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-01-27T12:00:00Z',
            },
          },
        },
        NotificationSettings: {
          type: 'object',
          properties: {
            email_notifications_enabled: {
              type: 'boolean',
              example: true,
            },
            slack_notifications_enabled: {
              type: 'boolean',
              example: false,
            },
          },
        },
        UpdateNotificationSettings: {
          type: 'object',
          properties: {
            email_notifications_enabled: {
              type: 'boolean',
              example: true,
            },
            slack_notifications_enabled: {
              type: 'boolean',
              example: false,
            },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: [
    `${srcBase}/modules/**/*.routes.${srcExt}`,
    `${srcBase}/modules/**/*.controller.${srcExt}`,
    `${srcBase}/app.${srcExt}`,
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
