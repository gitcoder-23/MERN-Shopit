// normal products from products.json by seeder
const ProductModel = require('../models/productModel');
const dotenv = require('dotenv');
const connectDatabase = require('../config/database');

const products = require('../data/products.json');

// Setting dotenv file
dotenv.config({
  path: 'backend/config/config.env',
});

connectDatabase();

const seedProducts = async () => {
  try {
    // old products deleted autometically & new products are added
    await ProductModel.deleteMany();
    console.log('Products are deleted');

    await ProductModel.insertMany(products);
    console.log('All products are added');

    process.exit();
  } catch (error) {
    console.log(error.message);
    process.exit();
  }
};

seedProducts();
