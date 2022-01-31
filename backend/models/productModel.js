const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter product name'],
      // to remove blank spaces
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please enter product price'],
      maxlength: [5, 'Product price cannot exceed 5 characters'],
      default: 0.0,
    },
    description: {
      type: String,
      required: [true, 'Please enter product description'],
    },
    ratings: {
      type: Number,
      default: 0,
    },
    // multiple image of a product so Array of Object

    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    category: {
      type: String,
      required: [true, 'Please select category for this product'],
      enum: {
        values: [
          'Electronics',
          'Cameras',
          'Laptops',
          'Tablets',
          'Accessories',
          'Headphones',
          'Foods',
          'Books',
          'Clothes/Shoes',
          'Beauty/Health',
          'Sports',
          'Outdoor',
          'Home',
        ],
        message: 'Please select correct category for product',
      },
    },
    seller: {
      type: String,
      required: [true, 'Please enter product seller'],
    },
    stock: {
      type: Number,
      required: [true, 'Please enter product stock'],
      maxlength: [5, 'Please name connot exceed 5 characters'],
      default: 0,
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    // Adding user in product for reference
    // added table/collection (Product with User)
    user: {
      type: mongoose.Schema.ObjectId,
      // Collection name
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
