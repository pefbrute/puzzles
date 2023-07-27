// ImageUpload.js
import React from 'react';

function ImageUpload({ onUpload }) {
  const handleImageChange = event => {
    if (event.target.files && event.target.files[0]) {
      onUpload(event.target.files[0]);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleImageChange} />
    </div>
  );
}

export default ImageUpload;
