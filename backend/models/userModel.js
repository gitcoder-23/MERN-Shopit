const bcrypt = require('bcryptjs');
// JWT
const JWT = require('jsonwebtoken');
const mongoose = require('mongoose');
// for mongooDB schema validation
const validator = require('validator');
// to manage forget password
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please enter your name'],
      maxlength: [30, 'Your name cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please enter your email'],
      unique: true,
      validate: [validator.isEmail, 'Please enter valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Please enter your password'],
      minlength: [6, 'Your password must be longer than 6 characters'],
      select: false,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    role: {
      type: String,
      default: 'user',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// Encrypting password before saving user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// Compare user Password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Return JWT Token
userSchema.methods.getJwtToken = function () {
  return JWT.sign(
    {
      // this is user id -> "_id" coming from mongoDB
      // as payload
      id: this._id,
    },
    // to make secret
    // go config.env file
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_TIME,
    }
  );
};

// Generate password to reset token (resetPassword)
// to token Encryption
userSchema.methods.getResetPasswordToken = function () {
  // Generate Token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash and set to resetPasswordToken
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hax');

  // Set token expire time (mm * ss * 1000)
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
