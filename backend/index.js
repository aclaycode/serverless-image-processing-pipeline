const AWS = require('aws-sdk'); // AWS SDK for interacting with AWS services
const S3 = new AWS.S3(); // Creates an S3 client to upload/download files
const sharp = require('sharp'); // Image processing library. This will be used to convert the files

// Lambda funciton main handler. AWS automatically invokes this function when an event occurs.
// In this case an S3 file upload.
exports.handler = async (event) => {

};