const express = require('express');
const {
  getDashboardStats,
  updateContent,
  getMessages,
  getAllMessages,
  updateMessageStatus,
  deleteMessage,
  createProject,
  updateProject,
  deleteProject,
  getFeaturedProjects,
  saveFeaturedProjects,
  getAdminProjects,
  getAdminProject,
  getAdminHomeContent,
  updateAdminHomeContent,
  getAdminUsers,
  updateUserRole,
  deleteUser,
  getContent 
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// كل الراوتات دي محتاجة أدمن
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);

// Content Routes - FIXED
router.get('/content/:page', getContent);
router.put('/content/:page', updateContent);
router.get('/content/home', getAdminHomeContent);
router.put('/content/home', updateAdminHomeContent);

// Messages Routes - FIXED
router.get('/messages', getMessages);
router.get('/messages/all', getAllMessages); // إضافة جديدة
router.put('/messages/:id/status', updateMessageStatus);
router.delete('/messages/:id', deleteMessage);

router.get('/projects', getAdminProjects);
router.get('/projects/:id', getAdminProject);
router.post('/projects', createProject);
router.put('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

router.get('/featured-projects', getFeaturedProjects);
router.post('/featured-projects', saveFeaturedProjects);

router.get('/users', getAdminUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;