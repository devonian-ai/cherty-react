import React from 'react';
// import * as PropTypes from 'prop-types';
import { capitalizeIfLowercase } from '../helpers.js';

const MetadataPreview = ({ metadata }) => {
  const containerStyle = {
    padding: '0px',
    borderRadius: '4px',
    maxWidth: '100%',
    overflowWrap: 'break-word',
  };

  const itemStyle = {
    marginBottom: '5px',
    fontSize: '11px', // Set all text to font size 11
  };

  const keyStyle = {
    fontWeight: 'bold',
    marginRight: '5px',
    fontSize: '11px',
  };

  const valueStyle = {
    whiteSpace: 'pre-wrap',
    fontSize: '11px',
  };

  return (
    <div style={containerStyle}>
      {Object.entries(metadata).map(([key, value]) => (
        <div key={key} style={itemStyle}>
          <span style={keyStyle}>{capitalizeIfLowercase(key)}:</span>
          <span style={valueStyle}>
            {typeof value === 'string' ? value : JSON.stringify(value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// MetadataPreview.propTypes = {
//   metadata: PropTypes.object.isRequired,
// };

export {MetadataPreview};
