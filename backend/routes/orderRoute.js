const express = require('express');
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  currentUserOrder,
  allOrders,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
// guard route
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// this is normal login part
router.route('/order/neworder').post(isAuthenticatedUser, newOrder);
router.route('/singleorder/:id').get(isAuthenticatedUser, getSingleOrder);
router.route('/order/currentuser').get(isAuthenticatedUser, currentUserOrder);

// only "admin" can access
router
  .route('/admin/orders')
  .get(isAuthenticatedUser, authorizeRoles('admin'), allOrders);
router
  .route('/admin/order/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateOrderStatus);
router
  .route('/admin/delorder/:id')
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteOrder);

module.exports = router;
