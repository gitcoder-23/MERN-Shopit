const UserModel = require('../models/userModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const { send } = require('process');

// Register User => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const userData = await UserModel.create({
    name,
    email,
    password,
    // to add hardcoded to cloudinary
    avatar: {
      // "public_id" taken from "cloudinary" rest url part
      public_id: 'avatars/subash_mzsn73',
      url: 'https://res.cloudinary.com/drcloud21/image/upload/v1642924463/avatars/subash_mzsn73.jpg',
    },
  });
  // console.log('userData->', userData);

  // after storing token to cookie
  sendToken(userData, 200, res);

  // after adding userModel "JWT"
  // const token = userData.getJwtToken();

  // res.status(201).json({
  //   success: true,
  //   message: 'User registered successfully',
  //   token,
  //   // for security
  //   // userData,
  // });
});

// Login User => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // checks if email & password is entered by user
  if (!email || !password) {
    return next(new ErrorHandler('Please enter email & password', 400));
  }
  // Finding the user in database
  // "select('+password')" because in UserModel password select: false
  const userData = await UserModel.findOne({ email }).select('+password');

  if (!userData) {
    // "401" unauthenticated user
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  // Checks if password is correct or not
  // compare from UserModel
  const isPasswordMatched = await userData.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler('Invalid Email or Password', 401));
  }

  // after storing token to cookie
  sendToken(userData, 200, res);

  // after adding userModel "JWT"

  // const token = user.getJwtToken();
  // res.status(200).json({
  //   success: true,
  //   message: 'Login successfully',
  //   token,
  // });
});

// Logout user => /api/v1/logout
exports.logoutUser = catchAsyncErrors(async (req, res, next) => {
  // "token" key name added to /utils/jwtToken.js
  res.cookie('token', null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

// Forgot Password => /api/v1/password/forgot
// using mail
exports.forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const userEmail = await UserModel.findOne({
    email: req.body.email,
  });

  if (!userEmail) {
    return next(
      new ErrorHandler('User not found with this email/invalid', 404)
    );
  }
  // Get reset token
  const resetToken = userEmail.getResetPasswordToken();
  await userEmail.save({
    validateBeforeSave: false,
  });

  // Create Reset Password URL
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/password/reset/${resetToken}`;
  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\n If you have not requested this email then ignore it.`;

  try {
    await sendEmail({
      email: userEmail.email,
      subject: 'ShopIT Password Recovery',
      message,
    });
    res.status(200).json({
      success: true,
      message: `Email sent to: ${userEmail.email}`,
    });
  } catch (error) {
    userEmail.resetPasswordToken = undefined;
    userEmail.resetPasswordExpire = undefined;
    await userEmail.save({
      validateBeforeSave: false,
    });
    return next(new ErrorHandler(error.message, 500));
  }
});

// testing from mail
// Your password reset token is as follow:

// http://localhost:4000/api/v1/password/reset/ee83444bab55dce353c0db2ed26f7795387a8b91

//  If you have not requested this email then ignore it.

// Reset Password => /api/v1/password/reset/:token
// using mail
exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Catch token from mail
  // Hash URL token
  const resetPasswordNewToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const userResetPass = await UserModel.findOne({
    resetPasswordNewToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!userResetPass) {
    return next(
      new ErrorHandler(
        'Password reset token is invalid or has been expired',
        400
      )
    );
  }
  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler('Password does not match', 400));
  }

  // Setup new password
  userResetPass.password = req.body.password;
  userResetPass.resetPasswordToken = undefined;
  userResetPass.resetPasswordExpire = undefined;

  await userResetPass.save();

  sendToken(userResetPass, 200, res);
});

// Get Currently loggedin user details => /api/v1/currentuser
exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const userDetails = await UserModel.findById(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Current user details',
    userDetails,
  });
});

// Update/ Change Password  => api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const userUpdatePassword = await UserModel.findById(req.user.id).select(
    '+password'
  );
  // Check previous user password
  // "comparePassword" method taken from UserModel
  const isMatched = await userUpdatePassword.comparePassword(
    req.body.oldPassword
  );
  if (!isMatched) {
    return next(new ErrorHandler('Old password is incorrect', 400));
  }
  userUpdatePassword.password = req.body.password;
  await userUpdatePassword.save();
  sendToken(userUpdatePassword, 200, res);
});

// Update User Profile name/ email => /api/v1/currentuser/update
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  // "user" is model collection name
  // console.log('req.user', req.user.id);
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  // Update avatar: TODO korbo by cloudinary

  // userUpdate
  const userUpdate = await UserModel.findByIdAndUpdate(
    req.user.id,
    newUserData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    userUpdate,
  });
});

/* Admin Routes Only *****/

// Get All Users => /api/v1/admin/allusers
exports.getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const usersAll = await UserModel.find();

  res.status(200).json({
    success: true,
    message: 'All users displayed',
    usersAll,
  });
});

//Get Specific User Details => /api/v1/admin/user/:id
exports.getSpecificUserDetails = catchAsyncErrors(async (req, res, next) => {
  // "params" => ":id"
  const userSpecific = await UserModel.findById(req.params.id);
  // console.log('userSpecific', userSpecific);
  if (!userSpecific) {
    return next(
      new ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    message: 'Specific user details has been displayed',
    userSpecific,
  });
});

// Update Admin User Profile by name/ email/ role => /api/v1/admin/user/update/:id
exports.updateAdminUserProfile = catchAsyncErrors(async (req, res, next) => {
  // "user" is model collection name
  // console.log('req.user', req.user.id);
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // userUpdate "params" ":id"
  const userUpdate = await UserModel.findByIdAndUpdate(
    req.params.id,
    newUserData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    message: 'User admin profile updated successfully',
    userUpdate,
  });
});

// Delete Admin User Detail => /api/v1/admin/user/delete/:id
exports.deleteSpecificUser = catchAsyncErrors(async (req, res, next) => {
  // "params" => ":id"
  const userSpecific = await UserModel.findById(req.params.id);
  // console.log('userSpecific', userSpecific);
  if (!userSpecific) {
    return next(
      new ErrorHandler(`User does not found with this id: ${req.params.id}`)
    );
  }
  // Remove avatar from cloudinary - TODO--korte hobey

  await userSpecific.remove();

  res.status(200).json({
    success: true,
    message: 'Specific user has been deleted',
    userSpecific,
  });
});
