// AWS SDK for interacting with AWS services. Don't need to install aws-sdk into directory by using this
const AWS = require('aws-sdk');

// Initialize S3 client instance. Match region to bucket
const s3 = new AWS.S3({ region: 'us-east-1' }); // ← Update as needed

// Lambda funciton main handler. AWS automatically invokes this function when an event occurs.
// In this case an S3 file upload.
exports.handler = async (event) => {
  try {
    const query = event.queryStringParameters || {}; // Get string parameters from request
    const fileName = query.fileName || 'upload.jpg'; // Get file name from query string

    // Use an environment variable for input S3 bucket. Need to define in terraform later
    const bucket = process.env.UPLOAD_BUCKET;

    // Tells S3 file types to expect. S3 associates MIME type
    const contentType = 'image/jpeg';

    // Creates parameter object for generating the presigned S3 URL. Tells AWS the kind of upload to prepare for
    const params = {
      Bucket: bucket,
      Key: fileName,
      ContentType: contentType,
      Expires: 60 // URL valid for 60 sec
    };

    // Generate presigned URL
    const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

    // Return URL in JSON response so client can upload file
    return {
      statusCode: 200, // HTTP status code. 200 means OK. This is in the HTTP response but not shown to frontend
      headers: { 'Content-Type': 'application/json' }, // Tells clint data type: JSON data. This is in the HTTP response but not shown to frontend
      body: JSON.stringify({ uploadUrl }) // Return Javascript object as JSON string. This is the actual content of the JSON response that is shown to frontend
    };
  } catch (err) {
    console.error('Failed to generate pre-signed URL:', err); // Logs error to AWS CloudWatch logs
    return {
      statusCode: 500, // Internal service error HTTP code
      body: JSON.stringify({ error: 'Could not generate upload URL' }) // Error message sent over HTTP
    };
  }
};