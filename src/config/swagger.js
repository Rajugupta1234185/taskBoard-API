const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskBoard API',
      version: '1.0.0',
      description:
        'Task Management REST API built with Node.js, Express, MongoDB, and Redis. ' +
        'Authentication uses httpOnly cookies — call **POST /login** first, then the browser/client will automatically send the session cookie on subsequent requests.',
    },
    servers: [{ url: 'http://localhost:3000', description: 'Local development server' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'sessionId',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['fullName', 'email', 'password'],
          properties: {
            fullName: { type: 'string', example: 'John Doe', minLength: 2 },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', minLength: 6, example: 'secret123' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            password: { type: 'string', format: 'password', example: 'secret123' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
          },
        },
        SessionInfo: {
          type: 'object',
          properties: {
            userId: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            fullName: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            loginTime: { type: 'string', format: 'date-time', example: '2024-06-01T10:00:00.000Z' },
          },
        },
        // ── Task ──────────────────────────────────────────────────────────────
        TaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Buy groceries', maxLength: 200 },
            description: { type: 'string', example: 'Milk, eggs, bread', maxLength: 2000 },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'Medium' },
          },
        },
        TaskUpdateRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Updated title', maxLength: 200 },
            description: { type: 'string', example: 'Updated description' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'High' },
          },
        },
        Task: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            title: { type: 'string', example: 'Buy groceries' },
            description: { type: 'string', example: 'Milk, eggs, bread' },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High'], example: 'Medium' },
            userId: { type: 'string', example: '665f1a2b3c4d5e6f7a8b9c0d' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        // ── Analytics ─────────────────────────────────────────────────────────
        Analytics: {
          type: 'object',
          properties: {
            totalLogins: { type: 'integer', example: 42 },
            tasksCreated: { type: 'integer', example: 100 },
            tasksUpdated: { type: 'integer', example: 35 },
            tasksDeleted: { type: 'integer', example: 10 },
          },
        },
        // ── Common ────────────────────────────────────────────────────────────
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong.' },
          },
        },
      },
      responses: {
        Unauthorized: {
          description: 'Authentication required',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Authentication required. Please login.' },
            },
          },
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Task not found.' },
            },
          },
        },
        RateLimitExceeded: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Rate limit exceeded. Max 20 requests per minute.' },
            },
          },
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
              example: { success: false, message: 'Full name must be at least 2 characters.' },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Registration, login, logout, and session management' },
      { name: 'Tasks', description: 'Task CRUD operations (requires authentication)' },
      { name: 'Analytics', description: 'Activity counters stored in Redis' },
      { name: 'Health', description: 'Server health check' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
