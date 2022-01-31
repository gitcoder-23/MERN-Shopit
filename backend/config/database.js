const mongoose = require('mongoose');

const connectDatabase = () => {
  mongoose
    .connect(process.env.MONGODB_CLOUD_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then((connect) => {
      console.log(
        `MongoDB Database Connected With HOST: ${connect.connection.host}`
      );
    });
};

module.exports = connectDatabase;
