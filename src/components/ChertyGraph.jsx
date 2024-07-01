import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { shortenString, getGraphVariableArray, getGraphFunctionArray } from '../helpers.js';
import { processGraph } from './graphElements';
import ChertyDevonianImg from './Cherty_Devonian.png';
import { HoverPreview } from './HoverPreview';

const nodeHeight = 100;

const ChertyGraph = ({ 
  graphMetadataPath,
  width = 800,
  xOffset = width / 8,
  yOffset = -width / 8,
  height = (6 / 8) * width
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
    fetch(graphMetadataPath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setGraphMetadata(data);
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
  }, [graphMetadataPath]);

  useEffect(() => {
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('border', '1px solid black')
      .on('click', function (event) {
        if (event.target === svg.node()) {
          console.log('clicked on background');
        }
      });

    svg.selectAll('*').remove();

    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'white');

    const iconSize = width / 8;

    svg.append('image')
      .attr('xlink:href', ChertyDevonianImg)
      .attr('width', iconSize)
      .attr('height', iconSize)
      .attr('x', 10)
      .attr('y', height - iconSize - 10)
      .attr('opacity', 0.8);

    svg.append('defs').append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 5)
      .attr('refY', 0)
      .attr('orient', 'auto')
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10,0 L 0,5')
      .attr('fill', '#000')
      .style('stroke', 'none');

    if (nodes.length === 0) {
      return;
    }

    // Create the simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide(50))
      .on('tick', ticked);

    const gElement = svg.append('g')
      .attr('transform', `translate(${xOffset}, ${yOffset})`);

    const link = gElement.selectAll('.link')
      .data(links)
      .enter().append('path')
      .attr('class', 'link')
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrowhead)');

    const node = gElement.selectAll('.node')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .each(function (d) {
        if (d.style === 'globalInput') {
          d3.select(this).append('circle')
            .attr('r', 2)
            .attr('fill', 'black');
        } else if (d.style === 'globalOutput') {
          d3.select(this).append('circle')
            .attr('r', 0)
            .attr('fill', 'black');
        } else {
          d3.select(this).append('rect')
            .attr('width', 40)
            .attr('height', nodeHeight)
            .attr('rx', 10)
            .attr('ry', 10)
            .attr('fill', 'lightblue')
            .attr('x', -20)
            .attr('y', -nodeHeight / 2);
        }
      })
      .on('click', (event, d) => {
        console.log(d)
        setpreviewVarID(d.id);
      })
      .on('contextmenu', (event, d) => {
        setrightClickedVarID(d.id);
      })
      .on('mouseover', function (event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          const [x, y] = d3.pointer(event);

          d3.select(this).append('rect')
            .attr('class', 'hover-label-background')
            .attr('x', x + 10)
            .attr('y', y - 20)
            .attr('width', d.label.length * 9)
            .attr('height', 20)
            .attr('fill', 'white')
            .attr('fill-opacity', 0.7);

          d3.select(this).append('text')
            .attr('class', 'hover-label')
            .attr('x', x + 15)
            .attr('y', y - 5)
            .attr('text-anchor', 'start')
            .text(d.label);
        }
      })
      .on('mousemove', function (event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          const [x, y] = d3.pointer(event);

          d3.select(this).select('.hover-label-background')
            .attr('x', x + 10)
            .attr('y', y - 20);

          d3.select(this).select('.hover-label')
            .attr('x', x + 15)
            .attr('y', y - 5);
        }
      })
      .on('mouseout', function (event, d) {
        if (d.style !== 'globalInput' && d.style !== 'globalOutput') {
          d3.select(this).select('.hover-label').remove();
          d3.select(this).select('.hover-label-background').remove();
        }
      });

    function ticked() {
      link.attr('d', d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x));

      node.attr('transform', d => `translate(${d.y},${d.x})`);
    }

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
      .on('mouseover', function (event, d) {
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
