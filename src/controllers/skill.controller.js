const Skill = require('../models/Skill.model');
const { sendSuccess, sendError } = require('../utils/response');

// @desc    Get all skills
// @route   GET /api/skills
// @access  Public
exports.getSkills = async (req, res, next) => {
  try {
    const { category, active } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Filter by active status if provided
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const skills = await Skill.find(query).sort({ order: 1, category: 1 });
    
    sendSuccess(res, { 
      success: true,
      data: skills,
      message: 'Skills retrieved successfully',
      count: skills.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get skills by category
// @route   GET /api/skills/category/:category
// @access  Public
exports.getSkillsByCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const { active } = req.query;
    
    let query = { category };
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    const skills = await Skill.find(query).sort({ order: 1 });
    
    sendSuccess(res, { 
      success: true,
      data: skills,
      message: `Skills in ${category} category retrieved successfully`,
      count: skills.length
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single skill
// @route   GET /api/skills/:id
// @access  Private
exports.getSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return sendError(res, 'Skill not found', 404);
    }
    
    sendSuccess(res, { 
      success: true,
      data: skill,
      message: 'Skill retrieved successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new skill
// @route   POST /api/skills
// @access  Private/Admin
exports.createSkill = async (req, res, next) => {
  try {
    // التحقق من الحقول المطلوبة
    const { name, icon, level, category } = req.body;
    
    if (!name || !icon || level === undefined || !category) {
      return sendError(res, 'Missing required fields: name, icon, level, category', 400);
    }

    // التحقق من أن المستوى بين 0 و 100
    if (level < 0 || level > 100) {
      return sendError(res, 'Level must be between 0 and 100', 400);
    }

    // التحقق من أن التصنيف صحيح
    const validCategories = ['frontend', 'backend', 'database', 'language', 'tool'];
    if (!validCategories.includes(category)) {
      return sendError(res, 'Invalid category. Must be one of: frontend, backend, database, language, tool', 400);
    }

    // إنشاء المهارة
    const skill = await Skill.create(req.body);
    
    sendSuccess(res, { 
      success: true,
      data: skill,
      message: 'Skill created successfully'
    }, 201);
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Skill with this name already exists', 400);
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, messages.join(', '), 400);
    }
    next(error);
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
exports.updateSkill = async (req, res, next) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return sendError(res, 'Skill not found', 404);
    }

    // التحقق من البيانات إذا كانت موجودة في req.body
    if (req.body.level !== undefined && (req.body.level < 0 || req.body.level > 100)) {
      return sendError(res, 'Level must be between 0 and 100', 400);
    }

    if (req.body.category) {
      const validCategories = ['frontend', 'backend', 'database', 'language', 'tool'];
      if (!validCategories.includes(req.body.category)) {
        return sendError(res, 'Invalid category. Must be one of: frontend, backend, database, language, tool', 400);
      }
    }

    skill = await Skill.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    sendSuccess(res, { 
      success: true,
      data: skill,
      message: 'Skill updated successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      return sendError(res, 'Skill with this name already exists', 400);
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, messages.join(', '), 400);
    }
    next(error);
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
exports.deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return sendError(res, 'Skill not found', 404);
    }

    await Skill.findByIdAndDelete(req.params.id);
    
    sendSuccess(res, { 
      success: true,
      data: null,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};