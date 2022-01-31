const express = require('express');
const cors = require('cors');
const app = express();

// cookie parser
const cookieParser = require('cookie-parser');

// Error Middleware
const errorMiddleware = require('./middlewares/errors');

// to pass data through "body"
app.use(express.json());
// to set token into cookie
app.use(cookieParser());

// Cors Added
app.use(
  cors({
    // origin: "http://localhost:4000",
    // origin: 'http://127.0.0.1:4000',
    origin: '*',
    // "credentials" in frontend "include"
    credentials: true,
    // methods: [],
  })
);

// import routes
const productRoute = require('./routes/productRoute');
const authRoute = require('./routes/authRoute');
const orderRoute = require('./routes/orderRoute');

// main route
app.use('/api/v1', productRoute);
app.use('/api/v1', authRoute);
app.use('/api/v1', orderRoute);

// Middleware to handle errors
app.use(errorMiddleware);

// api written type here
// http://localhost:4000/api/v1/products

// normal url message
app.get('/', (req, res) => {
  res.send('Welcome to the backend api.');
});

module.exports = app;
