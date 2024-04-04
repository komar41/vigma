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



const RadarChart = ({ chartData }) => {
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

    dimensions.width = dimensions.width - 0.1 * dimensions.width;

    const parameters = ['timeLSwing', 'timeRSwing', 'LstepLength', 'RstepLength', 'GaitSpeed', 'timeLgait', 'timeRgait'];
    const numAxes = parameters.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const radius = Math.min(dimensions.width / 2, dimensions.height / 2);
    const radarChartCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radarGroup = svg.append("g")
      .attr("transform", `translate(${radarChartCenter.x}, ${radarChartCenter.y})`);

    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, 1]); // Assuming your data is normalized

    // Draw axes
    parameters.forEach((param, i) => {
      const angle = angleSlice * i;
      radarGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", rScale(1) * Math.cos(angle))
        .attr("y2", rScale(1) * Math.sin(angle))
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");
    });

    // Function to draw radar chart area
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);

    // Data normalization and plotting function here...
    // You would normalize your data and call the radarLine function for each dataset




    // Draw concentric circles
const levels = 5; // Number of concentric circles
const levelFactor = radius / levels;
for (let i = 0; i <= levels; i++) {
  radarGroup.selectAll(".levels")
    .data([1]) // Dummy data for circle
    .enter()
    .append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", levelFactor * i)
    .style("fill", "none")
    .style("stroke", "grey")
    .style("stroke-opacity", "0.5")
    .style("stroke-width", "0.5px");
}

parameters.forEach((param, i) => {
    const sliceAngle = Math.PI * 2 / parameters.length;
    const angle = sliceAngle * i;
    const lineLength = radius; // Assuming 'radius' is the length of your axis lines
    const textOffset = -5; // Adjust this value as needed
  
    const textPosition = {
      x: Math.cos(angle) * (lineLength ),
      y: Math.sin(angle) * (lineLength + textOffset)
    };
  
    // Adjust text anchor based on the angle to improve readability
    let textAnchor = "middle";
    if (textPosition.x > 0) {
      textAnchor = "start";
    } else if (textPosition.x < 0) {
      textAnchor = "end";
    }
  
    // Append the text for the parameter name to radarGroup instead of svg
    radarGroup.append("text")
      .attr("x", textPosition.x)
      .attr("y", textPosition.y)
      .attr("dy", "0.35em") // Vertically center text
      .style("text-anchor", textAnchor)
      .text(param)
      .attr("fill", "Grey")
      .style("font-size", "12px");
  });
  


// Convert the sample data to a format suitable for the radarLine function
const radarChartData = sampleData.map(dataSet => ({
    label: dataSet.label,
    values: parameters.map(param => ({ axis: param, value: dataSet.values[param] }))
  }));

console.log("radarChartData");
console.log(radarChartData);

// Plot the radar chart data
radarChartData.forEach((data, i) => {
    radarGroup.append("path")
      .datum(data.values.map(v => ({ value: v.value })))
      .attr("d", radarLine)
      .style("stroke-width", "2px")
      .style("stroke", i === 0 ? "#ffb4a2" : "#87A922")
      .style("fill", i === 0 ? "#ffb4a2" : "#87A922")
      .style("fill-opacity", 0.1);
  
    // Add legend
    svg.append("text")
      .attr("x", dimensions.width / 8 - 10)
      .attr("y", dimensions.height /4 + 30  + (i * 20))
      .text(data.label)
      .style("font-family", "sans-serif")
      .style("font-size", "12px")
      .attr("alignment-baseline", "middle")
      .style("fill", i === 0 ?  "red" : "green");
  });



  }, [chartData, dimensions]); // Redraw when chartData or dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default RadarChart;
