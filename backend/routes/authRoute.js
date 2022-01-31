const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  getAllUsers,
  getSpecificUserDetails,
  updateAdminUserProfile,
  deleteSpecificUser,
  logoutUser,
} = require('../controllers/authController');
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);

router.route('/currentuser').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword);
router.route('/currentuser/update').put(isAuthenticatedUser, updateProfile);

router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);

router.route('/logout').get(logoutUser);

// admin route
router
  .route('/admin/allusers')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getAllUsers);
router
  .route('/admin/user/:id')
  .get(isAuthenticatedUser, authorizeRoles('admin'), getSpecificUserDetails);

router
  .route('/admin/user/update/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateAdminUserProfile);

router
  .route('/admin/user/delete/:id')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteSpecificUser);

module.exports = router;
