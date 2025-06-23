import React, { useState } from 'react';
import './ImageDrop.css';

function ImageDrop() {
  // Store user image files from user
  const [files, setFiles] = useState([]);

  // store error messages for unsupported files
  const [error, setError] = useState('');

  // Track upload results (success/failure messages) for each file
  const [uploadStatus, setUploadStatus] = useState('');

  // Store URLs for the converted PNGs
  const [convertedUrls, setConvertedUrls] = useState([]);

  // triggered when user drops files onto the dropzone
  const handleDrop = (e) => {
    e.preventDefault(); // prevent the browser from opening the file

    const droppedFiles = Array.from(e.dataTransfer.files); // Convert FileList into a real array
    const allowedExtensions = ['.jpg', '.jpeg']; // Only allow these extensions

    const accepted = [];
    const rejected = [];

    // Check each file’s name to see if it ends with .jpg or .jpeg
    droppedFiles.forEach(file => {
      const name = file.name.toLowerCase();
      if (allowedExtensions.some(ext => name.endsWith(ext))) {
        accepted.push(file);
      } else {
        rejected.push(file.name);
      }
    });

    setFiles(accepted); // Update state with accepted files
    setError(rejected.length > 0 ? `Unsupported file type(s): ${rejected.join(', ')}` : '');
    setUploadStatus('');
    setConvertedUrls([]); // Clear previous converted image links
  };

  // Required to allow dropping files—otherwise the browser just blocks it
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Call your backend to get the presigned URL
  const getPresignedUrl = async (fileName) => {

    // HTTP response object. NOT the actual data. fetch sends a GET request.
    // API endpoint is injected via environment variable (REACT_APP_UPLOAD_API_URL)
    // In production, this will be dynamically populated by Terraform/GitHub Actions
    const res = await fetch(`${process.env.REACT_APP_UPLOAD_API_URL}?fileName=${encodeURIComponent(fileName)}`);

    // Throw error response is not OK
    if (!res.ok) {
      throw new Error('Failed to fetch presigned URL');
    }

    // Store response object JSON data
    const data = await res.json();

    // Function returns upload URL
    return data.uploadUrl;
  };

  // Upload the file using the presigned URL
  const uploadFile = async (file) => {
    try {
      const uploadUrl = await getPresignedUrl(file.name);

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/jpeg'
        },
        body: file
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // State setter function to show upload status of files. Created with useState() in React
      setUploadStatus(prev => prev + `Uploaded: ${file.name}\n`);

      // Construct the expected .png URL
      const outputUrl = `https://aclay-output-image-bucket.s3.amazonaws.com/${file.name.replace(/\.[^.]+$/, '.png')}`;

      // Delay to give Lambda time to process
      setTimeout(() => {
        setConvertedUrls(prev => [...prev, outputUrl]);
      }, 4000);

    } catch (err) {
      console.error(err);
      setUploadStatus(prev => prev + `Failed: ${file.name}\n`);
    }
  };

  // Trigger upload for all accepted files
  const handleUpload = () => {
    files.forEach(file => uploadFile(file));
  };

  return (
    <div
      className="dropzone"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <p>Drag and drop JPEG image files here</p>

      {/* Show an error message if needed */}
      {error && <p style={{ color: 'salmon' }}>{error}</p>}

      {/* Display list of accepted file names */}
      {files.length > 0 && (
        <>
          <ul>
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
          <button onClick={handleUpload}>Upload Files</button>
        </>
      )}

      {uploadStatus && (
        <pre style={{ whiteSpace: 'pre-wrap', color: 'green', marginTop: '1em' }}>
          {uploadStatus}
        </pre>
      )}

      {/* Display links to converted PNGs */}
      {convertedUrls.length > 0 && (
        <div style={{ marginTop: '1em' }}>
          <h4>Converted PNG Files:</h4>
          <ul>
            {convertedUrls.map((url, index) => (
              <li key={index}>
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ImageDrop;
