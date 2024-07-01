import React, { useEffect, useRef, useState } from 'react';
import { getMetadata, getFilename } from '../storage.js';
import {MetadataPreview} from './MetadataPreview';
import { shortenString, findFolderWithoutDir } from '../helpers.js';
import {DataPreview} from './DataPreview';

const HoverPreview = ({ show, content, position, metadata, metadataPath }) => {
    

    const [elementMetadata, setElementMetadata] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileWithPath, setFileWithPath] = useState(null);

    useEffect (() => {
        const elemMeta = getMetadata(content.id, content.version, metadata);
        // console.log(elemMeta);
        setElementMetadata(elemMeta);

        const newFileName = getFilename(content.id, content.version, metadata);
        // console.log(newFileName);
        // setFileName(newFileName);

        if (newFileName) {
            const reconstructedFileWithPath = findFolderWithoutDir(metadataPath)+'/'+newFileName;
            // console.log(`reconstructedFileWithPath: ${reconstructedFileWithPath}`)
            setFileWithPath(reconstructedFileWithPath);
        } else {
            setFileWithPath(null);
        }   
    }, [content, metadata]);

    // useEffect(() => {
    //     console.log(`metadatapath: ${findFolderWithoutDir(metadataPath)}`);
    //     const reconstructedFileWithPath = findFolderWithoutDir(metadataPath)+'/'+fileName;
    //     console.log(`reconstructedFileWithPath: ${reconstructedFileWithPath}`)
    //     setFileWithPath(reconstructedFileWithPath);
    // }, [metadataPath]);

    if (!show) return null;

    const style = {
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        backgroundColor: 'white',
        border: '1px solid black',
        borderRadius: '5px',
        padding: '10px',
        pointerEvents: 'none',
        display: 'block',
        width: '350px',
        fontSize: '12px', // Default text size
        fontFamily: 'Arial, sans-serif', // Ensures text is clearly readable
        color: '#333', // Dark grey for text for readability
        textAlign: 'left' // Aligns text to the left
    };

    const titleStyle = {
        fontWeight: 'bold', // Makes the font bold
        fontSize: '15px', // Slightly larger font size for the title
        marginBottom: '5px' // Adds space between the title and the body text
    };

    const bodyStyle = {
        fontWeight: 'normal' // Normal weight for the body text
    };

    

    return (
        (content !== undefined && content !== null && content.label !== undefined && content.label !== null) ? (
            <div style={style}>
                <div style={titleStyle}>{shortenString(content.label, 42)}</div>
                {content.version !== null && (
                    <p style={{ fontWeight: 'bold', fontSize: '11px' }}>
                        Version {content.version.major}.{content.version.minor}.{content.version.patch} {content.version.branch} branch
                    </p>
                )}
                {elementMetadata !== null && elementMetadata !== undefined && elementMetadata.metadata !== undefined && elementMetadata.metadata !== null && (
                <MetadataPreview metadata={elementMetadata.metadata} />
                )}
                {fileWithPath !== null && (
                    <center><DataPreview fileName={fileWithPath} width={200} /></center>
                    
                )}
                {/* <DataPreview fileName={fileWithPath} width={300} /> */}
                {/* <p>Lorem ipsum</p> */}
            </div>
        ) : (
            <div style={style}></div>
        )
    );
    
};

export {HoverPreview};
