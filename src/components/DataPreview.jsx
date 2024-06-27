import React, { useState, useEffect } from 'react';

const DataPreview = ({ fileName, width }) => {
  const [fileType, setFileType] = useState(null);
  const [fileContent, setFileContent] = useState(null);

//   console.log(`Preview from: ${fileName}`);

    // useEffect(() => {
    //     console.log(`fileName: ${fileName}`);  
    // }, [fileName]);

  useEffect(() => {
    // console.log('using an effect')
    // Function to determine the file type based on extension
    const getFileType = (fileName) => {
      const extension = fileName.split('.').pop().toLowerCase();
      if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'].includes(extension)) {
        return 'image';
      } else if (extension === 'json') {
        return 'json';
      } else {
        return 'text';
      }
    };

    // Load file content based on its type
    const loadFileContent = async () => {
      try {
        const response = await fetch(fileName); // Adjust path as per your application
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fileName}`);
        }
        const data = await response.text(); // Assuming text response
        setFileContent(data);
        setFileType(getFileType(fileName));
        // console.log(`File content: ${data}`);
        // console.log(`File type: ${getFileType(fileName)}`);
      } catch (error) {
        console.error('Error fetching file:', error);
      }
    };

    loadFileContent();
  }, [fileName]);

  if (!fileName) { return null; }

  // Render based on file type
  const renderContent = () => {
    switch (fileType) {
      case 'image':
        return <img src={fileName} style={{ maxWidth: width, height: 'auto' }} alt={fileName} />;
      case 'json':
        return <pre style={{ textAlign: 'left' }}>{JSON.stringify(JSON.parse(fileContent), null, 2)}</pre>;
      case 'text':
        return <pre style={{ maxWidth: width, overflow: 'auto', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{fileContent}</pre>;
      default:
        return <p>Unsupported file type or file not found.</p>;
    }
  };

  return (
    <div>
      {/* <h2>{fileName}</h2> */}
      {fileContent ? renderContent() : <p>Loading...</p>}
    </div>
  );
};

export default DataPreview;
