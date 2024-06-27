function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

function processString(input) {
  // Remove special characters, numbers, spaces, and vowels, then convert to lower case
  const cleanedString = input.replace(/[^a-zA-Z]/g, '') // Remove non-letter characters
                              .toLowerCase()            // Convert to lower case
                              .replace(/[aeiou]/g, ''); // Remove vowels

  // Return the first 5 characters
  return cleanedString.substring(0, 5);
};

function shortenString(str, totalLength = 15) {
  if (str.length <= totalLength) {
    return str;
  } else {
    return str.slice(0, (totalLength-6)) + '...' + str.slice(-3);
  }
};

// Utility function to compare arrays
const arraysEqual = (a, b) => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

function getGraphVariableArray(jsonArray) {
  return jsonArray
      .filter(item => item.element && typeof item.element === 'object') // Check if 'element' exists and is an object
      .map(item => item.element)  // Extract just the 'element' object
      .filter(element => 'varName' in element); // Further filter to only include objects with 'varName' 
}

function getGraphFunctionArray(jsonArray) {
  return jsonArray
      .filter(item => item.element && typeof item.element === 'object') // Check if 'element' exists and is an object
      .map(item => item.element)  // Extract just the 'element' object
      .filter(element => 'funcName' in element); // Further filter to only include objects with 'varName'
}

function getMetadataArray(jsonArray) {
  return jsonArray
      .filter(item => item.metadata && typeof item.metadata === 'object') // Check if 'metadata' exists and is an object
      .map(item => item.metadata);  // Extract just the 'metadata' object
}

function capitalizeIfLowercase(str) {
  if (str && typeof str === 'string' && str.charAt(0) === str.charAt(0).toLowerCase() && /[a-z]/.test(str.charAt(0))) {
      return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return str;
}

function findFolderWithoutDir(inputString) {
  // Split the input string by '/'
  const parts = inputString.split('/');

  // If there's only one part or the last part ends with a '.', return the original string
  if (parts.length === 1 || parts[parts.length - 1].endsWith('.')) {
      return inputString;
  }

  // Otherwise, construct the result by joining all parts except the last one
  const result = parts.slice(0, -1).join('/');

  // Remove trailing '/' if present
  return result.endsWith('/') ? result.slice(0, -1) : result;
}


  
export {generateRandomString, 
  processString, 
  shortenString, 
  arraysEqual,
  getGraphVariableArray,
  getGraphFunctionArray,
  getMetadataArray,
  capitalizeIfLowercase,
  findFolderWithoutDir};