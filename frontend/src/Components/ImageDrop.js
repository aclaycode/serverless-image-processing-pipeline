import React, { useState } from 'react';
import './ImageDrop.css';

function ImageDrop() {
  // Store user image files from user
  const [files, setFiles] = useState([]);

  // store error messages for unsupported files
  const [error, setError] = useState('');

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
    setError( // If any were rejected, show them
      rejected.length > 0
        ? `Unsupported file type(s): ${rejected.join(', ')}`
        : ''
    );
  };

  // Required to allow dropping files—otherwise the browser just blocks it
  const handleDragOver = (e) => {
    e.preventDefault();
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
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ImageDrop;