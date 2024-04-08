import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';



// Function to calculate mean values for each measurement across a dataset
function calculateMeans(dataset) {
  const totals = {};
  console.log("dataset",dataset);
  let count = dataset.length;

  // Initialize totals
  dataset.forEach(entry => {
    for (let key in entry) {
      if (typeof entry[key] === 'number') { // Ensure we're only processing numeric values
        totals[key] = totals[key] ? totals[key] + entry[key] : entry[key];
      }
    }
  });

  // Calculate means
  for (let key in totals) {
    totals[key] = totals[key] / count;
  }

  return totals;
}





const RadarChart = ({ chartData }) => {




  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  const tooltip = d3.select(containerRef.current)
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip") // Add this class for styling
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "2px")
  .style("border-radius", "5px")
  .style("padding", "5px")
  .style("position", "absolute")
  .style("z-index", "10")
  .style("display", "none");

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


    // Calculate means for each dataset
    chartData = chartData.response;
    
    if (!chartData) return ;
    console.log("radar chartData",chartData);
  const meansDf1 = calculateMeans(chartData.df1);
  const meansDf2 = calculateMeans(chartData.df2);
  
  
  // Map the means back into a structure similar to sampleData
  const updatedSampleData = [
    {
      label: "Healthy patients",
      values: meansDf1
    },
    {
      label: "Stroke Patients",
      values: meansDf2
    }
  ];
  

  
  
  console.log("updated Log",updatedSampleData);



    const parameters = ['timeLswing', 'timeRswing', 'LstepLength', 'RstepLength', 'GaitSpeed', 'timeLgait', 'timeRgait'];
    const numAxes = parameters.length;
    const angleSlice = (Math.PI * 2) / numAxes;

    const radius = Math.min(dimensions.width / 2, dimensions.height / 2);
    const radarChartCenter = { x: dimensions.width / 2, y: dimensions.height / 2 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const radarGroup = svg.append("g")
      .attr("transform", `translate(${radarChartCenter.x}, ${radarChartCenter.y})`);

// Convert the sample data to a format suitable for the radarLine function
const radarChartData = updatedSampleData.map(dataSet => ({
  label: dataSet.label,
  values: parameters.map(param => ({ axis: param, value: dataSet.values[param] }))
}));

// Flatten all the 'value' entries across all datasets and parameters
const allValues = radarChartData.flatMap(dataSet => 
  dataSet.values.map(valueObject => valueObject.value)
);

// Find the maximum value
const maxDataValue = Math.max(...allValues);


    // Scale for the radius
    const rScale = d3.scaleLinear()
      .range([0, radius])
      .domain([0, maxDataValue]); // Assuming your data is normalized

    // Draw axes
    parameters.forEach((param, i) => {
      const angle = angleSlice * i;
      radarGroup.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", rScale(maxDataValue) * Math.cos(angle))
        .attr("y2", rScale(maxDataValue) * Math.sin(angle))
        .attr("stroke", "grey")
        .attr("stroke-width", "1px");
    });

    // Function to draw radar chart area
    const radarLine = d3.lineRadial()
      .radius(d => rScale(d.value))
      .angle((d, i) => i * angleSlice)
      .curve(d3.curveLinearClosed);



    // Draw concentric circles
const levels = 5; // Number of concentric circles
const levelFactor = radius / levels;
for (let i = 0; i <= levels; i++) {
  const rValue = (maxDataValue * i) / levels; // Calculate the value for each level

  radarGroup.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", rScale(rValue))
    .style("fill", "none")
    .style("stroke", "grey")
    .style("stroke-opacity", "0.5")
    .style("stroke-width", "0.5px");

  // Add text for scale values
  radarGroup.append("text")
    .attr("x", 0) // Adjust this value to position the text correctly
    .attr("y", -rScale(rValue*0.88)) // Position text next to the circle it represents
    .attr("text-anchor", "end") // Right-align text to keep it from overlapping the chart
    .style("font-size", "10px")
    .text(rValue.toFixed(2)); // Show the value, formatted to 2 decimal places
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



      radarGroup.append("rect")
    .attr("x", 0)
    .attr("y", -rScale(maxDataValue))
    .attr("width", 2) // Thin rectangle; adjust width as necessary
    .attr("height", rScale(maxDataValue))
    .attr("transform", `rotate(${angle * 180 / Math.PI})`)
    .style("opacity", 0) // Make it invisible
    .on("mouseover", function(event, d) {
      // Show tooltip on hover
      tooltip.html(`Value for ${param}: <br> Healthy: ${meansDf1[param]}<br> Stroke: ${meansDf2[param]}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px")
        .style("display", "block")
        .style("opacity", 1);
    })
    .on("mouseout", function() {
      // Hide tooltip when not hovering
      tooltip.style("display", "none").style("opacity", 0);
    });
  });
  
console.log("updatedSampleData",updatedSampleData);


console.log("maxDataValue", maxDataValue);
console.log("radarChartData");
console.log(radarChartData);


// Ensure consistent use of angle when plotting radar chart data
radarChartData.forEach((data, i) => {
  radarGroup.append("path")
    .datum(data.values.map((v, index) => {
      return {
        // Convert each value to the correct position on the chart
        x: rScale(v.value) * Math.cos(angleSlice * index ), // Adjust for starting angle
        y:  rScale(v.value) * Math.sin(angleSlice * index),
      };
    }))
    // Convert the calculated points to a path string
    .attr("d", d3.line().x(d => d.x).y(d => d.y).curve(d3.curveLinearClosed))
    .style("stroke-width", "2px")
    .style("stroke", i === 0 ? "#ffb4a2" : "#87A922")
    .style("fill", i === 0 ? "#ffb4a2" : "#87A922")
    .style("fill-opacity", 0.1);
});

// // Plot the radar chart data
// radarChartData.forEach((data, i) => {
//     radarGroup.append("path")
//       .datum(data.values.map(v => ({ value: v.value })))
//       .attr("d", radarLine)
//       .style("stroke-width", "2px")
//       .style("stroke", i === 0 ? "#ffb4a2" : "#87A922")
//       .style("fill", i === 0 ? "#ffb4a2" : "#87A922")
//       .style("fill-opacity", 0.1);
  
//     // Add legend
//     svg.append("text")
//       .attr("x", dimensions.width / 8 - 10)
//       .attr("y", dimensions.height /4 + 30  + (i * 20))
//       .text(data.label)
//       .style("font-family", "sans-serif")
//       .style("font-size", "12px")
//       .attr("alignment-baseline", "middle")
//       .style("fill", i === 0 ?  "red" : "green");
//   });



  }, [chartData, dimensions]); // Redraw when chartData or dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
      <div id="radar-tooltip" style={{ display: 'none', position: 'absolute', backgroundColor: 'white', padding: '5px', border: '1px solid #000' }}>Tooltip</div>

    </div>
  );
};

export default RadarChart;