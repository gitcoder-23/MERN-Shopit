const ProductModel = require('../models/productModel');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
// for search
const APIFeatures = require('../utils/apiFeatures');

// Create New Product => /api/v1/admin/product/new
// to handle errors
// "catchAsyncErrors" by this the errors coming from mongoDB models
exports.newProduct = catchAsyncErrors(async (req, res, next) => {
  // after adding "user" in Product model
  req.body.user = req.user.id;
  // next
  const product = await ProductModel.create(req.body);
  res.status(201).json({
    success: true,
    message: 'New product have been added successfully',
    product,
  });
});

// get all products => /api/v1/products
exports.getAllProducts = async (req, res, next) => {
  const products = await ProductModel.find();

  res.status(200).json({
    success: true,
    count: products.length,
    message: 'All products have been dislayed successfully',
    products,
  });
};

// get all products => /api/v1/products
// for search
// add query parameter => /api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req, res, next) => {
  // http://localhost:4000/api/v1/products?page=2
  // Pagination
  // at initial only 4 products are displayed
  const productPerPage = 4;
  // implement total no. of products in dB
  const productCount = await ProductModel.countDocuments();
  // for search
  // atfirst pass "query" then "queryStr"
  const apiFeatures = new APIFeatures(ProductModel.find(), req.query)
    .search()
    .filter()
    .pagination(productPerPage);

  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    count: products.length,
    message: 'All products have been dislayed',
    // after pagination
    productCount,
    products,
  });
});

// get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  // "id" is same as route id
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    // error handled by Errorhandler middleware
    return next(new ErrorHandler('Product not found', 404));
  } else {
    res.status(200).json({
      success: true,
      message: 'Product has been displayed',
      product,
    });
  }
});

// Update product => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  // "id" is same as route id

  let product = await ProductModel.findById(req.params.id);
  if (!product) {
    // error handled by Errorhandler middleware
    return next(new ErrorHandler('Product not found', 404));
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
});

// Delete Product => /api/v1/admin/product/:id
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  // "id" is same as route id

  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    // error handled by Errorhandler middleware
    return next(new ErrorHandler('Product not found', 404));
  }

  await product.remove();

  res.status(200).json({
    success: true,
    message: 'Product has been deleted successfully',
    product,
  });
});

// Create new review => /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };
  const obj = await ProductModel.findById(productId);
  const json = JSON.stringify(obj);
  const product = JSON.parse(json);
  const isReviwed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (isReviwed) {
    product.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;
        review.rating = rating;
      }
    });
  } else {
    product.reviews.push(review);
    product.numofReviews = product.reviews.length;
  }
  product.rating =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;

  const json1 = JSON.stringify(product);
  const json2 = JSON.parse(json1);

  console.log(json2);

  await ProductModel.findByIdAndUpdate(productId, json2, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  // await obj.save({validateBeforeSave:false})
  res.status(200).json({
    success: true,
  });
});
// exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
//   const { rating, comment, productId } = req.body;

//   const review = {
//     user: req.user._id,
//     name: req.user.name,
//     rating: Number(rating),
//     comment,
//   };

//   const product = await ProductModel.findById(productId);
//   // console.log('review->', product);

//   const isReviewd = product.reviews.find((reviewValue) => {
//     // console.log('reviewValue->', reviewValue.user);

//     reviewValue.user.toString() === req.user._id.toString();
//   });

//   if (isReviewd) {
//     product.reviews.forEach((reviewArg) => {
//       if (reviewArg.user.toString() === req.user._id.toString()) {
//         reviewArg.comment = comment;
//         reviewArg.rating = rating;
//       }
//     });
//   } else {
//     product.reviews.push(review);
//     product.numOfReviews = product.reviews.length;
//   }

//   // Calculate overall ratings
//   // "item" is current value
//   product.ratings =
//     product.reviews.reduce(
//       (accumulator, item) => item.rating + accumulator,
//       0
//     ) / product.reviews.length;
//   await product.save({ validateBeforeSave: false });
//   res.status(200).json({
//     success: true,
//     message: 'Rating/ Review created',
//     product,
//   });
// });

// Get Product Reviews =>  /api/v1/reviews?id=productId

exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.id);

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//  Delete Product Review => /api/v1/deletereviews?productId=productid&id=reviewid
exports.deleteProductReivews = catchAsyncErrors(async (req, res, next) => {
  const product = await ProductModel.findById(req.query.productId);
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );
  const numofReviews = reviews.length;
  const ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) /
    product.reviews.length;
  await ProductModel.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numofReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
