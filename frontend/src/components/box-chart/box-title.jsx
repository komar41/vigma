import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const sampleData = [
    { // Dataset 1
      label: "Healthy patients",
      values: {
        timeLSwing: 0.8,
        timeRSwing: 0.7,
        LstepLength: 0.9,
        RstepLength: 0.85,
        GaitSpeed: 0.9,
        timeLgait: 0.75,
        timeRgait: 0.8
      }
    },
    { // Dataset 2
      label: "Stroke Patients",
      values: {
        timeLSwing: 0.7,
        timeRSwing: 0.65,
        LstepLength: 0.8,
        RstepLength: 0.75,
        GaitSpeed: 0.85,
        timeLgait: 0.7,
        timeRgait: 0.75
      }
    }
  ];



const BoxTitle = ({ chartData }) => {
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) {
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    // Adjust the width to account for margins if needed
    const adjustedWidth = dimensions.width;
    const adjustedHeight = dimensions.height ; // Similar adjustment for height if needed

    // Select the SVG using D3 and clear any existing content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // This ensures you're starting fresh on each render

    // Append a 'rect' element to your SVG
    svg.append("rect")
       .attr("width", adjustedWidth) // Use the adjusted width
       .attr("height", adjustedHeight) // Use the adjusted height
       .attr("fill", "steelblue"); // Fill color of the rectangle, change as needed
}, [chartData, dimensions]); // Redraw when chartData or dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default BoxTitle;
