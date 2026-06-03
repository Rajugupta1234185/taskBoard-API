const express = require('express');
const router = express.Router();
const { register, login, logout, sessionInfo } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../middleware/validate');

/**
 * @openapi
 * /register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user account. Email must be unique. Password is hashed with bcrypt before storage.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Registration successful. }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { $ref: '#/components/schemas/User' }
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Email already registered.
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/register', validateRegister, register);

/**
 * @openapi
 * /login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and create a session
 *     description: |
 *       Validates credentials, creates a Redis session, and sets a `sessionId` httpOnly cookie.
 *
 *       **Login Throttling:** After 5 failed attempts within 15 minutes, the account is locked for 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful — returns Bearer token + sets sessionId cookie
 *         headers:
 *           Set-Cookie:
 *             description: sessionId (httpOnly cookie, auto-sent by browsers)
 *             schema:
 *               type: string
 *               example: sessionId=uuid-value; Path=/; HttpOnly; SameSite=Lax
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Login successful. }
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Invalid email or password. 4 attempt(s) remaining.
 *       423:
 *         description: Account temporarily locked due to too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Account temporarily locked. Try again in 15 minute(s).
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/login', validateLogin, login);

/**
 * @openapi
 * /logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and destroy session
 *     description: Deletes the session from Redis and clears the sessionId cookie.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: Logged out successfully.
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.post('/logout', authenticate, logout);

/**
 * @openapi
 * /session-info:
 *   get:
 *     tags: [Auth]
 *     summary: Get current session info
 *     description: Returns the session data stored in Redis for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     session: { $ref: '#/components/schemas/SessionInfo' }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimitExceeded'
 */
router.get('/session-info', authenticate, sessionInfo);

module.exports = router;
