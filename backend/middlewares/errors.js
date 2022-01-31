const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  // seperate Development & Production mode Error
  if (process.env.NODE_ENV === 'DEVELOPMENT') {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      errMessage: err.message,
      stack: err.stack,
    });
  }

  if (process.env.NODE_ENV === 'PRODUCTION') {
    let error = { ...err };
    error.message = err.message;

    // Wrong Mongoose Object ID Error
    // "castError" chacking from postman
    // "path" taken from postman
    // "400" Bad Request
    if (err.name === 'CastError') {
      const message = `Resource not found. Invalid: ${err.path}`;
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose Validation Error
    // before make the errors check first "DEVELOPMENT" mode
    // if (err.name === 'ValidatorError') {
    if (err.name === 'ValidationError') {
      const message = Object.values(err.errors).map((value) => value.message);
      error = new ErrorHandler(message, 400);
    }

    // Handling Mongoose duplicate key/email errors
    // "code" taking from postman same email registration
    // always follow postman
    if (err.code === 11000) {
      const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
      console.log('duplicatekeyError->', message);
      error = new ErrorHandler(message, 400);
    }

    // Handling wrong JWT errors
    if (err.name === 'JsonWebTokenError') {
      const message = 'JSON Web Token is invalid. Try Again!!!';
      error = new ErrorHandler(message, 400);
    }

    // Handling Expired JWT errors
    if (err.name === 'TokenExpiredError') {
      const message = 'JSON Web Token is expired. Try Again!!!';
      error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
      success: false,
      message: error.message || 'Internal Server Error',
    });
  }

  // res.status(err.statusCode).json({
  //   success: false,
  //   error: err.stack,
  //   // error: err,
  // });
};
