const OrderModel = require('../models/orderModel');
const ProductModel = require('../models/productModel');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');

// Create New Order => /api/v1/order/neworder

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  // distructure taken from orderModel
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const createOrder = await OrderModel.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    // additional added
    paidAt: Date.now(),
    // taken from joined with "User" model
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    message: 'New order created',
    createOrder,
  });
});

// Get Single Order => /api/v1/singleorder/:id
exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  // "populate" function used to interact one collection with another collection schema object
  // .populate('user', 'name email') "user" db with data "name & email"
  const singleOrder = await OrderModel.findById(req.params.id).populate(
    'user',
    'name email'
  );
  if (!singleOrder) {
    return next(new ErrorHandler('No order found with this ID', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Single order displayed successfully',
    singleOrder,
  });
});

// Get loggedin User Order => /api/v1/order/currentuser
exports.currentUserOrder = catchAsyncErrors(async (req, res, next) => {
  // "populate" function used to interact one collection with another collection schema object
  // .populate('user', 'name email') "user" db with data "name & email"
  const currentUserOrder = await OrderModel.find({ user: req.user.id });
  if (!currentUserOrder) {
    return next(new ErrorHandler('No order found with this ID', 404));
  }
  res.status(200).json({
    success: true,
    message: 'Current user order displayed',
    currentUserOrder,
  });
});

// Get All Orders For -Admin- => /api/v1/admin/orders
exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const allAdminOrders = await OrderModel.find();

  let totalAmount = 0;
  allAdminOrders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    message: 'All orders displayed',
    totalAmount,
    allAdminOrders,
  });
});

// Update/ Process Orders For -Admin- => /api/v1/admin/order/:id
exports.updateOrderStatus = catchAsyncErrors(async (req, res, next) => {
  // "Processing" -> "Delivered"
  // Change status from "Processing" to "Delivered"
  // After delivered the Product will be decreased
  const adminOrder = await OrderModel.findById(req.params.id);

  //  Order is deliver or not
  if (adminOrder.orderStatus === 'Delivered') {
    return next(new ErrorHandler('You have already delivered this order', 400));
  }

  adminOrder.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  (adminOrder.orderStatus = req.body.status),
    (adminOrder.deliveredAt = Date.now());

  await adminOrder.save();

  res.status(200).json({
    success: true,
    message: 'Order status changed. Product is delivered',
    adminOrder,
  });
});

async function updateStock(id, quantity) {
  const product = ProductModel.findById(id);
  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

// Delete Order Admin => /api/v1/admin/delorder/:id
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const delOrder = await OrderModel.findById(req.params.id);

  if (!delOrder) {
    return next(new ErrorHandler('No order found with this ID', 404));
  }

  await delOrder.remove();

  res.status(200).json({
    success: true,
    message: 'Order successfully deleted',
    delOrder,
  });
});
