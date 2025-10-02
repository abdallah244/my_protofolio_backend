const express = require('express');
const { protect, authorize } = require('../middlewares/auth.middleware');
const {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
  getSkillsByCategory
} = require('../controllers/skill.controller');

const router = express.Router();

// Public routes
router.get('/', getSkills);
router.get('/category/:category', getSkillsByCategory);

// Protected routes (require authentication)
router.use(protect);

// Admin only routes
router.get('/:id', getSkill);
router.post('/', authorize('admin'), createSkill);
router.put('/:id', authorize('admin'), updateSkill);
router.delete('/:id', authorize('admin'), deleteSkill);

module.exports = router;