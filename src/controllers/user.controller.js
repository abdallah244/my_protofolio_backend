const User = require("../models/User");
const Project = require("../models/Project");
const { sendSuccess, sendError } = require("../utils/response");

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    // req.user تم تعبئته من middleware المصادقة
    const user = await User.findById(req.user._id).select("-password");

    sendSuccess(res, user, "Profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    // لا تسمح بتحديث role من هنا
    const { name, email } = req.body;
    const updateData = { name, email };

    // إذا تم إدخال password، نضيفه للبيانات المراد تحديثها
    // وسيتم تشفيره تلقائياً في middleware الـ User model
    if (req.body.password) {
      updateData.password = req.body.password;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true } // إرجاع المستند المحدث والتأكد من صحة البيانات
    ).select("-password");

    sendSuccess(res, user, "Profile updated successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteProfile = async (req, res, next) => {
  try {
    // حذف جميع مشاريع المستخدم أولاً
    await Project.deleteMany({ createdBy: req.user._id });

    // ثم حذف حساب المستخدم
    await User.findByIdAndDelete(req.user._id);

    sendSuccess(res, null, "Your account has been deleted successfully");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};
