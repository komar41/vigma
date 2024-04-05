import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BoxTitle = ({ chartData, title }) => { // Accept title as a prop
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

    const adjustedWidth = dimensions.width;
    const adjustedHeight = dimensions.height;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Append rectangle
    svg.append("rect")
       .attr("width", adjustedWidth)
       .attr("height", adjustedHeight)
       .attr("fill", "white");

    // Append text
    svg.append("text")
       .attr("x", adjustedWidth / 2) // Center the text in the middle of the svg
       .attr("y", adjustedHeight / 2) // Vertically center
       .attr("text-anchor", "middle") // Ensure it's centered horizontally
       .style("fill", "Black") // Text color
       .style("font-size", `${Math.min(adjustedWidth / 10, 24)}px`) // Responsive font size
       .text(title); // Use the title passed as prop
}, [chartData, dimensions, title]); // Redraw when chartData, dimensions, or title change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default BoxTitle;
