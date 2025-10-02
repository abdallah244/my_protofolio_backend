const { sendSuccess, sendError } = require('../utils/response');
const Content = require('../models/Content');
const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');
const FeaturedProject = require('../models/FeaturedProject');
const Skill = require('../models/Skill.model');
const { getContent, getHomeContent, updateContent, updateHomeContent } = require('./content.controller');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res, next) => {
    try {
        const [
            totalUsers,
            totalProjects,
            totalMessages,
            unreadMessages,
            publishedProjects,
            adminUsers,
            featuredProjectsCount,
            totalSkills
        ] = await Promise.all([
            User.countDocuments(),
            Project.countDocuments(),
            Message.countDocuments(),
            Message.countDocuments({ isRead: false }),
            Project.countDocuments({ status: "published" }),
            User.countDocuments({ role: "admin" }),
            Project.countDocuments({ featured: true, status: 'published' }),
            Skill.countDocuments({ isActive: true })
        ]);

        sendSuccess(res, {
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    admins: adminUsers,
                    regular: totalUsers - adminUsers,
                },
                projects: {
                    total: totalProjects,
                    published: publishedProjects,
                    draft: totalProjects - publishedProjects,
                    featured: featuredProjectsCount
                },
                messages: {
                    total: totalMessages,
                    unread: unreadMessages,
                    read: totalMessages - unreadMessages,
                },
                skills: {
                    total: totalSkills
                },
                recentActivity: [
                    {
                        type: "user_registered",
                        message: "New user registered",
                        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                    },
                    {
                        type: "project_created",
                        message: "New project added",
                        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
                    },
                ],
            },
            message: "Dashboard statistics retrieved successfully"
        });
    } catch (error) {
        next(error);
    }
};

// ================= Content Routes =================

// @desc    Get content by page (Admin)
exports.getContent = getContent;

// @desc    Update content by page (Admin)
exports.updateContent = updateContent;

// @desc    Get home content (Admin)
exports.getAdminHomeContent = getHomeContent;

// @desc    Update home content (Admin)
exports.updateAdminHomeContent = updateHomeContent;

// ================= Projects =================

// @desc    Get all projects (Admin)
exports.getAdminProjects = async (req, res, next) => {
    try {
        const projects = await Project.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        sendSuccess(res, { 
            success: true,
            data: projects,
            message: 'Projects retrieved successfully',
            count: projects.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project (Admin)
exports.getAdminProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        sendSuccess(res, { 
            success: true,
            data: project,
            message: 'Project retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create project (Admin)
exports.createProject = async (req, res, next) => {
    try {
        req.body.createdBy = req.user._id;
        const project = await Project.create(req.body);
        await project.populate('createdBy', 'name email');

        sendSuccess(res, { 
            success: true,
            data: project,
            message: 'Project created successfully'
        }, 201);
    } catch (error) {
        next(error);
    }
};

// @desc    Update project (Admin)
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        project = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email');

        sendSuccess(res, { 
            success: true,
            data: project,
            message: 'Project updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete project (Admin)
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        await Project.findByIdAndDelete(req.params.id);

        sendSuccess(res, { 
            success: true,
            data: null,
            message: 'Project deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get featured projects (Admin)
exports.getFeaturedProjects = async (req, res, next) => {
    try {
        const featuredProjectsDoc = await FeaturedProject.findOne().populate('projectIds');
        
        let projectIds = [];
        if (featuredProjectsDoc) {
            projectIds = featuredProjectsDoc.projectIds.map(project => project._id.toString());
        }

        sendSuccess(res, { 
            success: true,
            data: {
                projectIds: projectIds,
                projects: featuredProjectsDoc ? featuredProjectsDoc.projectIds : []
            },
            message: 'Featured projects retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Save featured projects (Admin)
exports.saveFeaturedProjects = async (req, res, next) => {
    try {
        const { projectIds } = req.body;
        
        if (!Array.isArray(projectIds)) {
            return sendError(res, 'projectIds must be an array', 400);
        }

        // التحقق من صحة الـ project IDs
        const validProjects = await Project.find({
            _id: { $in: projectIds },
            status: 'published'
        });
        
        const validProjectIds = validProjects.map(project => project._id.toString());
        
        const featuredProject = await FeaturedProject.findOneAndUpdate(
            {},
            { 
                projectIds: validProjectIds,
                lastUpdatedBy: req.user._id 
            },
            { upsert: true, new: true }
        ).populate('projectIds');

        sendSuccess(res, { 
            success: true,
            data: {
                projectIds: validProjectIds,
                projects: featuredProject.projectIds
            },
            message: `تم حفظ ${validProjectIds.length} مشروع مميز بنجاح`
        });
    } catch (error) {
        next(error);
    }
};

// ================= Messages =================
exports.getMessages = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const query = status ? { status } : {};

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Message.countDocuments(query);

        sendSuccess(res, {
            success: true,
            data: {
                messages: messages,
                total: total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            },
            message: "Messages retrieved successfully"
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get all messages without pagination (for admin panel)
// @route   GET /api/admin/messages/all
// @access  Private/Admin
exports.getAllMessages = async (req, res, next) => {
    try {
        const messages = await Message.find()
            .sort({ createdAt: -1 });

        sendSuccess(res, {
            success: true,
            data: messages,
            message: "All messages retrieved successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.updateMessageStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, response } = req.body;

        // FIXED: تحديث الـ isRead بناءً على الـ status
        const updateData = {
            status,
            response,
            respondedAt: status === "responded" ? new Date() : null,
            respondedBy: req.user._id,
        };

        // إذا الـ status هو 'read'، نحدد الـ isRead لـ true
        if (status === 'read') {
            updateData.isRead = true;
        } else if (status === 'unread') {
            updateData.isRead = false;
        }

        const message = await Message.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!message) {
            return sendError(res, "Message not found", 404);
        }

        sendSuccess(res, { 
            success: true,
            data: message,
            message: "Message status updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return sendError(res, "Message not found", 404);
        }

        sendSuccess(res, { 
            success: true,
            data: null,
            message: "Message deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};

// ================= Users =================
exports.getAdminUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        
        sendSuccess(res, { 
            success: true,
            data: users,
            message: 'Users retrieved successfully',
            count: users.length
        });
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        sendSuccess(res, { 
            success: true,
            data: user,
            message: 'User role updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return sendError(res, 'User not found', 404);
        }

        sendSuccess(res, { 
            success: true,
            data: null,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};