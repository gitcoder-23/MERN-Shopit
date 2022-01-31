const express = require('express');
const router = express.Router();

const {
  getProducts,
  getAllProducts,
  newProduct,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getProductReviews,
  deleteProductReivews,
} = require('../controllers/productController');
// guard route
const { isAuthenticatedUser, authorizeRoles } = require('../middlewares/auth');

// this is user part
router.route('/allproducts').get(getAllProducts);
router.route('/products').get(getProducts);
router.route('/product/:id').get(getSingleProduct);

// this is admin part
router
  .route('/admin/product/new')
  .post(isAuthenticatedUser, authorizeRoles('admin'), newProduct);
router
  .route('/admin/product/:id')
  .put(isAuthenticatedUser, authorizeRoles('admin'), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteProduct);
// router.route('/admin/product/:id').delete(deleteProduct);

// only authenticated user
router.route('/review').put(isAuthenticatedUser, createProductReview);
router.route('/reviews').get(isAuthenticatedUser, getProductReviews);
router
  .route('/deletereviews')
  .delete(isAuthenticatedUser, deleteProductReivews);

module.exports = router;
