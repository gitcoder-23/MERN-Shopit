const ProductModel = require('../models/productModel');

// Create New Product => /api/v1/admin/product/new
exports.newProduct = async (req, res, next) => {
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    success: true,
    message: 'New product have been added successfully',
    product,
  });
};

// get all products => /api/v1/products
exports.getProducts = async (req, res, next) => {
  const products = await ProductModel.find();

  res.status(200).json({
    success: true,
    count: products.length,
    message: 'All products have been dislayed successfully',
    products,
  });
};

// get single product details => /api/v1/product/:id
exports.getSingleProduct = async (req, res, next) => {
  // "id" is same as route id
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  } else {
    res.status(200).json({
      success: true,
      message: 'Product has been displayed',
      product,
    });
  }
};

// Update product => /api/v1/admin/product/:id
exports.updateProduct = async (req, res, next) => {
  // "id" is same as route id

  let product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  product = await ProductModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // header problem solved
  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
};

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = async (req, res, next) => {
  // "id" is same as route id

  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found',
    });
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product has been deleted successfully',
    product,
  });
};
