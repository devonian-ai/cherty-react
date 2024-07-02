import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
// import * as dagre from 'dagre';
import * as dagre from '../dagre-esm/dist/dagre-esm.js';
import {shortenString, getGraphVariableArray, getGraphFunctionArray} from '../helpers.js';
import {newGraphVariable, isGraphVariableForm, processGraph} from './graphElements';
import ChertyDevonianImg from './Cherty_Devonian.png';
import {HoverPreview} from './HoverPreview'; 

const nodeHeight = 100;

const ChertyGraph = ({ 
    graphMetadataPath,
    width = 800,
    xOffset = width/8,
    yOffset = -width/8,
    height = 6/8*width
 }) => {

    const [graphMetadata, setGraphMetadata] = useState(null);
    const [loadingError, setLoadingError] = useState(null);
    const [graphVariableArray, setGraphVariableArray] = useState([]);
    const [graphFunctionArray, setGraphFunctionArray] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);
    const [hoverPreviewState, setHoverPreviewState] = useState({ show: false, content: '', position: { x: 0, y: 0 } });

    const handleMouseOver = (event, content) => {
        setHoverPreviewState({
          show: true,
          content: content,
          position: { x: event.pageX + 10, y: event.pageY - 20 },
          metadata: graphMetadata
        });
      };
    
      const handleMouseMove = (event) => {
        setHoverPreviewState(prev => ({
          ...prev,
          position: { x: event.pageX + 10, y: event.pageY - 20 }
        }));
      };
    
      const handleMouseOut = () => {
        setHoverPreviewState(prev => ({ ...prev, show: false, content: '' }));
      };

    const svgRef = useRef();


    // Load the metadata
    useEffect(() => {
        // Fetch the JSON data from a path accessible to the browser
        // console.log(`Fetching graph metadata from ${graphMetadataPath}`)
        fetch(graphMetadataPath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parse JSON data from the response
        })
        .then(data => {
            setGraphMetadata(data); // Set the state with the fetched data
            const graphVariableArrayExtracted = getGraphVariableArray(data);
            setGraphVariableArray(graphVariableArrayExtracted);
            const graphFunctionArrayExtracted = getGraphFunctionArray(data);
            setGraphFunctionArray(graphFunctionArrayExtracted);

            const { nodes, links } = processGraph(graphVariableArrayExtracted, graphFunctionArrayExtracted);
            setNodes(nodes);
            setLinks(links);
        })
        .catch(error => {
            setLoadingError('Failed to load graph metadata: ' + error.message);
        });
    }, [graphMetadataPath]); // Dependency on graphMetadataPath, reloads data if path changes


    // useEffect(() => {
    //     console.log(`Graph metadata loaded:`, graphMetadata);
    // }, [graphMetadata]);

    // if (loadingError) {
    //     return <div>Error: {loadingError}</div>;
    // }

    // if (!graphMetadata) {
    //     return <div>Loading graph data...</div>;
    // }

  useEffect(() => {
    // const width = 800;
    // const height = 600;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black')
      .on('click', function (event) {
        if (event.target === svg.node()) {
        //   setpreviewVarID(null);
          // console.log('clicked on background');
        }
      });

    // Clear previous elements
    svg.selectAll('*').remove();

    // Add a white background rectangle
    svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'white');

    // Add a small image icon in the bottom right corner
    const iconSize = width/8; // Set the size of the icon

    svg.append('image')
    .attr('xlink:href', ChertyDevonianImg)
    .attr('width', iconSize)
    .attr('height', iconSize)
    .attr('x', 10) // Position the icon 10px from the right edge
    .attr('y', height - iconSize - 10) // Position the icon 10px from the bottom edge
    .attr('opacity', 0.8); // Optional: Set the opacity of the icon

    // Define marker for arrowheads
    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5) // Marker offset along the path
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#000')
      .style('stroke', 'none');

    // Skip calculations if there are no nodes or links
    if (nodes.length === 0) {
      return;
    }

    

    // Create a new directed graph
    const g = new dagre.graphlib.Graph();
    g.setGraph({ 
      rankdir: 'LR',
      nodesep: 50, // Node separation
      edgesep: 10, // Edge separation
      ranksep: 120 // Distance between ranks (layers)
    });
    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes to the graph
    nodes.forEach(node => {
      g.setNode(node.id, { width: 40, height: nodeHeight });
      console.log('Set Node:', node.id);
    });

    // Add links to the graph
    links.forEach(link => {
      g.setEdge(link.source, link.target);
    });

    // Calculate the layout
    dagre.layout(g);

    // Update the nodes with the new layout positions
    g.nodes().forEach(v => {
      const node = g.node(v);
      console.log('Node:', v);
      const foundNode = nodes.find(n => n.id === v);
      if (foundNode) {
        foundNode.x = node.x;
        foundNode.y = node.y;
      } else {
        console.error(`Node with id ${v} not found in nodes array.`);
      }
    });

    // Update the links with the new layout points
    g.edges().forEach(e => {
      const edge = g.edge(e);
      const link = links.find(l => l.source === e.v && l.target === e.w);
      if (link) {
        link.points = edge.points;
      }
    });

    // Calculate graph bounding box
    const minX = Math.min(...nodes.map(node => node.x - 20));
    const maxX = Math.max(...nodes.map(node => node.x + 20));
    const minY = Math.min(...nodes.map(node => node.y - 10));
    const maxY = Math.max(...nodes.map(node => node.y + 10));

    const graphWidth = maxX - minX;
    const graphHeight = maxY - minY;

    // Ensure the offsets are finite numbers
    const offsetX = isFinite(graphWidth) ? (width - graphWidth) / 2 + xOffset: 0;
    const offsetY = isFinite(graphHeight) ? (height - graphHeight) / 2 + yOffset: 0;

    // Calculate initial scale to fit the graph
    const initialScale = Math.min(width / graphWidth, height / graphHeight);

    // Create a group to apply the transform for centering and scaling
    const initialTransform = d3.zoomIdentity.translate(offsetX, offsetY).scale(initialScale);


    // // Create a group to apply the transform for centering
    // const initialTransform = d3.zoomIdentity.translate(offsetX, offsetY);

    // Define the zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2]) // Set the zoom scale range
      .on('zoom', (event) => {
        gElement.attr('transform', event.transform);
      });

    const gElement = svg.append('g');

    // Apply the initial transform to gElement
    gElement.attr('transform', initialTransform);
    svg.call(zoom.transform, initialTransform);
    svg.call(zoom); // User click and drag canvas

    // Create nodes (inputs, functions, outputs)
    const node = gElement.selectAll('g')
      .data(nodes)
      .join('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .each(function(d) {
        if (d.style === 'globalInput') {
          // Append a circle for globalInput
          d3.select(this).append('circle')
            .attr('r', 2) // Radius of the circle
            .attr('fill', 'black');
        } else if (d.style === 'globalOutput') {
            // Append a circle for globalInput
            d3.select(this).append('circle')
            .attr('r', 0) // Radius of the circle
            .attr('fill', 'black');
        } else {
          // Append a rect for other nodes
          d3.select(this).append('rect')
            .attr('width', 40)
            .attr('height', nodeHeight)
            .attr('rx', 10) // Rounded corners
            .attr('ry', 10) // Rounded corners
            .attr('fill', 'lightblue')
            .attr('x', -20) // Adjust x position to center the rect
            .attr('y', -nodeHeight / 2); // Adjust y position to center the rect
        }
      })
      // .on('click', (event, d) => {
      //   console.log(d)
      //   setpreviewVarID(d.id);
      // })
      // .on('contextmenu', (event, d) => {
      //   setrightClickedVarID(d.id);
      // })
      .on('mouseover', function(event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          const [x, y] = d3.pointer(event);

          // Show label on hover
          d3.select(this).append('rect')
            .attr('class', 'hover-label-background')
            .attr('x', x + 10) // Position next to cursor
            .attr('y', y - 20) // Position above cursor
            .attr('width', d.label.length * 9) // Adjust width based on label length
            .attr('height', 20) // Fixed height
            .attr('fill', 'white')
            .attr('fill-opacity', 0.7);

          d3.select(this).append('text')
            .attr('class', 'hover-label')
            .attr('x', x + 15) // Position next to cursor
            .attr('y', y - 5) // Position above cursor
            .attr('text-anchor', 'start')
            .text(d.label);
        }
      })
      .on('mousemove', function(event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          const [x, y] = d3.pointer(event);

          // Update position on mouse move
          d3.select(this).select('.hover-label-background')
            .attr('x', x + 10)
            .attr('y', y - 20);

          d3.select(this).select('.hover-label')
            .attr('x', x + 15)
            .attr('y', y - 5);
        }
      })
      .on('mouseout', function(event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          // Remove label and background when not hovering
          d3.select(this).select('.hover-label').remove();
          d3.select(this).select('.hover-label-background').remove();
        }
      });

    // Function to get a shortened end point
    const getShortenedEndPoint = (source, target, offset, isSourceGlobalInput, isTargetGlobalOutput) => {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const length = Math.sqrt(dx * dx + dy * dy);

      // Adjust offset based on node type
      const sourceOffset = isSourceGlobalInput ? -15 : offset;
      const targetOffset = isTargetGlobalOutput ? -15 : offset;

      const ratioSource = sourceOffset / length;
      const ratioTarget = (length - targetOffset) / length;

      return {
        source: {
          x: source.x + dx * ratioSource,
          y: source.y + dy * ratioSource
        },
        target: {
          x: source.x + dx * ratioTarget,
          y: source.y + dy * ratioTarget
        }
      };
    };

    // Create links (wires)
    const link = gElement.selectAll('path')
      .data(links)
      .join('path')
      .attr('stroke', 'black')
      .attr('stroke-width', 2) // Adjust this value to make the line thicker
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)') // Add arrowhead marker
      .attr('d', d => {
        if (!d.points) return ''; // Skip if points are undefined
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        const isSourceGlobalInput = sourceNode.style === 'globalInput';
        const isTargetGlobalOutput = targetNode.style === 'globalOutput';
        const shortenedPoints = d.points.map((point, i, points) => {
          if (i === 0) {
            // First point - adjust source
            return getShortenedEndPoint(point, points[i + 1], 7, isSourceGlobalInput, false).source;
          } else if (i === points.length - 1) {
            // Last point - adjust target
            return getShortenedEndPoint(points[i - 1], point, 7, false, isTargetGlobalOutput).target;
          }
          return point;
        });

        const pathData = shortenedPoints.map((point, i) => {
          return i === 0 ? `M${point.x},${point.y}` : `L${point.x},${point.y}`;
        }).join(' ');

        return pathData;
      });
    //   .on('click', (event, d) => {
    //     console.log(d)
    //     setpreviewVarID(d.id);
    //   })
    //   .on('contextmenu', (event, d) => {
    //     setrightClickedVarID(d.id);
    //   });

    // Add labels to links
    const linkLabels = gElement.selectAll('text.link-label')
      .data(links)
      .join('text')
      .attr('class', 'link-label')
      .attr('dy', -10)
      .attr('dx', -12)
      .attr('text-anchor', 'middle')
      .attr('x', d => {
        if (d.points && d.points.length > 0) {
          const midpointIndex = Math.floor(d.points.length / 2);
          return d.points[midpointIndex].x;
        }
        return null;
      })
      .attr('y', d => {
        if (d.points && d.points.length > 0) {
          const midpointIndex = Math.floor(d.points.length / 2);
          return d.points[midpointIndex].y;
        }
        return null;
      })
      .text(d => shortenString(d.label, 15))
      .style('font-size', '12px')
      .on('mouseover', function(event, d) { 
        // console.log(`Mouse over link: ${JSON.stringify(d)}`)
        handleMouseOver(event, d); 
    })
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

    }, [nodes, links]);

  return (
    <div>
         <svg ref={svgRef}></svg>
         <HoverPreview 
            show={hoverPreviewState.show} 
            content={hoverPreviewState.content} 
            position={hoverPreviewState.position} 
            metadata={graphMetadata}
            metadataPath={graphMetadataPath}
        />
    </div>
    );
};

export default ChertyGraph;
