

// Function to dynamically import ESM modules and create CID
async function createCID(data) {
    // console.log(`creating cid from data: ${data}`);
    const { CID } = await import('multiformats/cid');
    const { sha256 } = await import('multiformats/hashes/sha2');
    const raw = await import('multiformats/codecs/raw');
    // console.log('imported CID, sha256, and raw codec');
  
    const hash = await sha256.digest(data);
    // console.log(`hash: ${hash}`);
  
    const cid = CID.create(1, raw.code, hash);
    // console.log(`cid: ${cid}`);
  
    return cid.toString();
  }


// Takes a single CID and all of the metadata
function getFilename(id, version, metadata) {

    // First filter the metadata to find the record for this version 
    const record = getMetadata(id, version, metadata);

    // If the record is not null, search for the filename
    if (record) {
        const foundElement = metadata.find(element => element.cid === record.cid && element.filename);
        // console.log(foundElement.filename)
        return foundElement ? foundElement.filename : null;
    }
          
}

// Function to take an id and version and return the metadata
// Takes all metadata as argument
function getMetadata(id, version, metadata) {
    // console.log(`metadata: ${JSON.stringify(metadata)}`)
    if(!metadata) {
        return null;
    }
    // Iterate through the metadata array to find a match
    for (let idx = 0; idx < metadata.length; idx++) {
        const element = metadata[idx].element;
        // Check if element exists and matches both id and version
        if (element && element.id === id && element.version) {
            const elVersion = element.version;
            if (elVersion.major === version.major &&
                elVersion.minor === version.minor &&
                elVersion.patch === version.patch &&
                elVersion.branch === version.branch) {
                // Check if metadata exists and retrieve it
                const toReturn = metadata[idx].metadata;
                if (toReturn) {
                    // Check if toReturn is an array and return the first element
                    if (Array.isArray(toReturn)) {
                        return toReturn[0];
                    }
                    // If toReturn is an object, return it
                    return toReturn;
                }
                break; // Exit loop since match is found and processed
            }
        }
    }
    // Return an empty array if no matches found or if toReturn does not exist
    return null;
}

export { createCID, getFilename, getMetadata };

