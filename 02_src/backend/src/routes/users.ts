import { Router } from 'express';
import { UserController } from '../controllers/users.js';
import {
  validateUserId,
  validateSwipeRequest,
  validatePreferencesUpdate,
  validateGetSwipes,
} from '../middleware/validation.js';

const router = Router();
const controller = new UserController();

/**
 * Create a new user
 * POST /api/users
 */
router.post('/', controller.createUser.bind(controller));

/**
 * Get user profile
 * GET /api/users/:userId
 */
router.get('/:userId', validateUserId, controller.getUser.bind(controller));

/**
 * Update user preferences
 * PUT /api/users/:userId/preferences
 */
router.put(
  '/:userId/preferences',
  validatePreferencesUpdate,
  controller.updatePreferences.bind(controller)
);

/**
 * Record a swipe action
 * POST /api/users/:userId/swipes
 */
router.post('/:userId/swipes', validateSwipeRequest, controller.recordSwipe.bind(controller));

/**
 * Get user's swipe history
 * GET /api/users/:userId/swipes
 */
router.get('/:userId/swipes', validateGetSwipes, controller.getSwipes.bind(controller));

export default router;
