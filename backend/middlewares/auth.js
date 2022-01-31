const JWT = require('jsonwebtoken');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const UserModel = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');

// Checks if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  // console.log('token->', token);
  if (!token) {
    return next(new ErrorHandler('Login first to access the resource', 401));
  }

  const decodedToken = JWT.verify(token, process.env.JWT_SECRET);
  // "id" coming from params route
  req.user = await UserModel.findById(decodedToken.id);
  next();
});

// Handling users roles
// if multiple roles "...roles"
// "403" forbidden error
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // "req.user.role" taken from mongoDB
    // console.log('role->', req.user.role);
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          `Role ${req.user.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
