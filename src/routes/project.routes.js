const express = require('express');
const {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    getMyProjects,
    getFeaturedProjects // إضافة endpoint جديد
} = require('../controllers/project.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const router = express.Router();

// Public routes - يمكن للجميع الوصول إليها
// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public
router.get('/', getProjects);

// @desc    Get featured projects (جديد)
// @route   GET /api/projects/featured
// @access  Public
router.get('/featured', getFeaturedProjects);

// @desc    Get single published project
// @route   GET /api/projects/:id
// @access  Public
router.get('/:id', getProject);

// Protected routes - تحتاج مصادقة
// جميع Routes التالية تحتاج token صالح
router.use(protect);

// @desc    Get logged in user's projects
// @route   GET /api/projects/my/projects
// @access  Private
router.get('/my/projects', getMyProjects);

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (يمكن لأي user مسجل إنشاء مشروع)
router.post('/', createProject);

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (يمكن للمالك أو الأدمن التعديل)
router.put('/:id', updateProject);

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (يمكن للمالك أو الأدمن الحذف)
router.delete('/:id', deleteProject);

module.exports = router;