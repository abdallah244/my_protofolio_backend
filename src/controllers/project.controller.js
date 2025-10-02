const { sendSuccess, sendError } = require('../utils/response');
const Project = require('../models/Project');
const FeaturedProject = require('../models/FeaturedProject');

// @desc    Get all published projects
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res, next) => {
    try {
        // Filter only published projects
        const projects = await Project.find({ status: 'published' })
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

// @desc    Get featured projects
// @route   GET /api/projects/featured
// @access  Public
exports.getFeaturedProjects = async (req, res, next) => {
    try {
        // محاولة جلب المشاريع المميزة من قاعدة البيانات
        const featuredProjectsDoc = await FeaturedProject.findOne().populate('projectIds');
        
        let featuredProjects = [];
        
        if (featuredProjectsDoc && featuredProjectsDoc.projectIds.length > 0) {
            // تصفية المشاريع المنشورة فقط
            featuredProjects = featuredProjectsDoc.projectIds.filter(project => 
                project.status === 'published'
            );
        }

        // إذا مفيش مشاريع مميزة محفوظة، نرجع المشاريع المميزة المنشورة
        if (featuredProjects.length === 0) {
            featuredProjects = await Project.find({
                featured: true,
                status: 'published'
            }).populate('createdBy', 'name email')
            .sort({ createdAt: -1 })
            .limit(6);
        }

        sendSuccess(res, { 
            success: true,
            data: featuredProjects,
            message: 'Featured projects retrieved successfully',
            count: featuredProjects.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
exports.getProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email');

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        // Check if project is published or user is owner/admin
        if (project.status !== 'published' && 
            (!req.user || (req.user._id.toString() !== project.createdBy._id.toString() && req.user.role !== 'admin'))) {
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

// @desc    Get logged in user's projects
// @route   GET /api/projects/my/projects
// @access  Private
exports.getMyProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 });

        sendSuccess(res, { 
            success: true,
            data: projects,
            message: 'Your projects retrieved successfully',
            count: projects.length
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
exports.createProject = async (req, res, next) => {
    try {
        // Add logged in user to the project data
        req.body.createdBy = req.user._id;

        const project = await Project.create(req.body);

        // Populate creator info before sending response
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

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
exports.updateProject = async (req, res, next) => {
    try {
        let project = await Project.findById(req.params.id);

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        // Check if user is project owner or admin
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 'Not authorized to update this project', 403);
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

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
exports.deleteProject = async (req, res, next) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return sendError(res, 'Project not found', 404);
        }

        // Check if user is project owner or admin
        if (project.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendError(res, 'Not authorized to delete this project', 403);
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