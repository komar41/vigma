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


function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


const RadarChart = ({ chartData }) => {




  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  // Add this inside your RadarChart component, before the useEffect hooks
const tooltip = d3.select("body").append("div")
.attr("class", "radar-chart-tooltip")
.style("position", "absolute")
.style("background-color", "white")
.style("border", "1px solid #ddd")
.style("border-radius", "5px")
.style("padding", "10px")
.style("display", "none")
.style("pointer-events", "none"); // to avoid interference with mouse events



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
    .text(rValue.toFixed(2))
    
    
    
    ; // Show the value, formatted to 2 decimal places
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


;
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
    .style("fill-opacity", 0.1)
    

});

// Adjust the arc generator setup
const arcWidth = angleSlice * 0.99; // Determines the "thickness" of the arc segment
const arcGenerator = d3.arc()
  .innerRadius(0) // Start at the center
  .outerRadius(rScale(maxDataValue)) // Extend to the outer edge of the chart
  .startAngle(i => -angleSlice / 2 - arcWidth / 2 + i * angleSlice + Math.PI / 2) // Subtract π/2 to rotate correctly
  .endAngle(i => -angleSlice / 2 + arcWidth / 2 + i * angleSlice + Math.PI / 2); // Subtract π/2 to rotate correctly

// Draw invisible arcs for each axis
parameters.forEach((param, i) => {
  radarGroup.append("path")
    .attr("d", arcGenerator(i))
    .style("fill", "none")
    .style("pointer-events", "all") // Make sure the arc can trigger mouse events
    .on("mouseover", function(event) {
      tooltip
        .style("display", "inline")
        .html(`Parameter:  ${param} <br> Healthy patients: ${meansDf1[param].toFixed(2)}<br>Stroke Patients: ${meansDf2[param].toFixed(2)}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY + 10) + "px");
    })
    .on("mouseout", function() {
      tooltip.style("display", "none");
    });
});

 }, [chartData, dimensions]); // Redraw when chartData or dimensions change

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', display: 'block' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>

    </div>
  );
};

export default RadarChart;