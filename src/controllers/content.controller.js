const Content = require('../models/Content');
const { sendSuccess, sendError } = require('../utils/response');

// إنشاء محتوى افتراضي
const createDefaultContent = async () => {
    try {
        // Check if content already exists
        const existingContent = await Content.findOne({ page: 'home' });
        
        if (existingContent) {
            console.log('✅ Home content already exists');
            return existingContent;
        }

        // Create default content
        const defaultContent = {
            page: 'home',
            content: {
                sections: {
                    hero: {
                        title: 'Crafting Digital Experiences That Matter',
                        subtitle: 'Full Stack Developer',
                        description: 'Transforming ideas into innovative web solutions. Specialized in modern technologies and user-centered design with 3+ years of experience.',
                        badgeText: 'Full Stack Developer'
                    },
                    stats: {
                        projects: 25,
                        clients: 15,
                        technologies: 50,
                        experience: 3
                    },
                    about: {
                        title: 'About Me',
                        description: 'Passionate full-stack developer with 3+ years of experience in modern web technologies. I create digital experiences that are not only functional but also delightful to use. Specialized in Angular, React, Node.js, and cloud technologies.'
                    },
                    contact: {
                        title: 'Let\'s Work Together',
                        description: 'Ready to start your next project?',
                        email: 'contact@quantumdev.com',
                        phone: '+1 (555) 123-4567',
                        location: 'Cairo, Egypt'
                    }
                }
            },
            lastUpdatedBy: null
        };

        const content = await Content.create(defaultContent);
        console.log('✅ Default home content created successfully');
        return content;
        
    } catch (error) {
        console.error('❌ Error creating default content:', error.message);
        throw error;
    }
};

// @desc    Get home page content (Public)
// @route   GET /api/content/home
// @access  Public
const getPublicHomeContent = async (req, res, next) => {
    try {
        let content = await Content.findOne({ page: 'home' });

        if (!content) {
            // إذا مفيش محتوى، ننشئ محتوى افتراضي
            content = await createDefaultContent();
        }

        sendSuccess(res, { 
            success: true,
            data: content,
            message: 'Home content retrieved successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Get content by page (Admin)
// @route   GET /api/admin/content/:page
// @access  Private/Admin
const getContent = async (req, res, next) => {
    try {
        const { page } = req.params;
        
        let content = await Content.findOne({ page });

        if (!content) {
            if (page === 'home') {
                content = await createDefaultContent();
            } else {
                return sendError(res, 'Content not found', 404);
            }
        }

        sendSuccess(res, { 
            success: true,
            data: content,
            message: 'Content retrieved successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update content (Admin) - FIXED
// @route   PUT /api/admin/content/:page
// @access  Private/Admin
const updateContent = async (req, res, next) => {
    try {
        const { page } = req.params;
        const { content } = req.body;

        if (!content) {
            return sendError(res, 'Content data is required', 400);
        }

        console.log('📝 Updating content for page:', page);
        console.log('📦 Content data received:', JSON.stringify(content, null, 2));

        let existingContent = await Content.findOne({ page });

        if (existingContent) {
            existingContent.content = content;
            existingContent.lastUpdatedBy = req.user._id;
            await existingContent.save();
            
            console.log('✅ Content updated successfully');
        } else {
            existingContent = await Content.create({
                page,
                content,
                lastUpdatedBy: req.user._id
            });
            console.log('✅ New content created successfully');
        }

        sendSuccess(res, { 
            success: true,
            data: existingContent,
            message: 'Content updated successfully'
        });

    } catch (error) {
        console.error('❌ Error updating content:', error);
        next(error);
    }
};

// @desc    Get home page content (Admin) - FIXED
// @route   GET /api/admin/content/home
// @access  Private/Admin
const getHomeContent = async (req, res, next) => {
    try {
        let content = await Content.findOne({ page: 'home' });

        if (!content) {
            content = await createDefaultContent();
        }

        sendSuccess(res, { 
            success: true,
            data: content,
            message: 'Home content retrieved successfully'
        });

    } catch (error) {
        next(error);
    }
};

// @desc    Update home page content (Admin) - FIXED
// @route   PUT /api/admin/content/home
// @access  Private/Admin
const updateHomeContent = async (req, res, next) => {
    try {
        const { content } = req.body;

        if (!content) {
            return sendError(res, 'Content data is required', 400);
        }

        console.log('🏠 Updating home content...');
        console.log('📦 Home content received:', JSON.stringify(content, null, 2));

        // التحقق من البنية الأساسية
        if (!content.sections) {
            return sendError(res, 'Invalid data structure. Missing sections', 400);
        }

        const { sections } = content;
        
        // التحقق من الحقول المطلوبة مع مرونة أكثر
        if (!sections.hero) sections.hero = {};
        if (!sections.stats) sections.stats = {};
        if (!sections.about) sections.about = {};
        if (!sections.contact) sections.contact = {};

        let homeContent = await Content.findOne({ page: 'home' });

        if (homeContent) {
            homeContent.content = content;
            homeContent.lastUpdatedBy = req.user._id;
            await homeContent.save();
            console.log('✅ Home content updated successfully');
        } else {
            homeContent = await Content.create({
                page: 'home',
                content: content,
                lastUpdatedBy: req.user._id
            });
            console.log('✅ New home content created successfully');
        }

        sendSuccess(res, { 
            success: true,
            data: homeContent,
            message: 'Home content updated successfully'
        });

    } catch (error) {
        console.error('❌ Update home content error:', error);
        next(error);
    }
};

// @desc    Get all content pages (Admin)
// @route   GET /api/admin/content
// @access  Private/Admin
const getAllContent = async (req, res, next) => {
    try {
        const contents = await Content.find().populate('lastUpdatedBy', 'name email');
        
        sendSuccess(res, { 
            success: true,
            data: contents,
            message: 'All content retrieved successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createDefaultContent,
    getPublicHomeContent,
    getContent,
    updateContent,
    getHomeContent,
    updateHomeContent,
    getAllContent
};