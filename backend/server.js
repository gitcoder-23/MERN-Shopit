const app = require('./app');
const connectDatabase = require('./config/database');
const dotenv = require('dotenv');
// Handle Uncaught Exceptions Errors
process.on('uncaughtException', (err) => {
  // console.log(`ERROR: ${err.message}`);
  console.log(`ERROR: ${err.stack}`);
  console.log('Shutting down the operation due to Uncaught Exceptions!');
  process.exit(1);
});

// Setting up config file
dotenv.config({
  path: 'backend/config/config.env',
});

// "a" is not defined
// Handle Uncaught Exception
// console.log(a);

// connection with database
connectDatabase();

const serverPort = process.env.PORT;

// to handle " UnhandledPromiseRejectionWarning: MongoParseError: "

const serverCall = app.listen(serverPort, () => {
  console.log(
    `Server Started On Port: ${serverPort} in ${process.env.NODE_ENV} mode`
  );
});

// Handle "unhandled Promise Rejection error"
// "unhandledRejection" => event

process.on('unhandledRejection', (err) => {
  console.log(`ERROR: ${err.stack}`);
  // console.log(`ERROR: ${err.message}`);
  console.log('Shutting down the server due to Unhandled Promise Rejection!');
  serverCall.close(() => {
    process.exit(1);
  });
});

// const nodePortDev = process.env.NODE_ENV_DEV;
// const nodePortProd = process.env.NODE_ENV_PROD;

// if (nodePortDev === 'DEVELOPMENT') {
//   app.listen(serverPort, () => {
//     console.log(`Server Started On Port: ${serverPort} in ${nodePortDev} mode`);
//   });
// }

// if (nodePortProd === 'PRODUCTION') {
//   app.listen(serverPort, () => {
//     console.log(
//       `Server Started On Port: ${serverPort} in ${nodePortProd} mode`
//     );
//   });
// }
