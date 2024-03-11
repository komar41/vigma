import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './lineChart.css';

const LineChart = 
({ chartData }) => {
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container
  // console.log("Line chart data inside the plot component",chartData);
  const active = chartData.active;
  const plotNumber = chartData.plotNumber;
  const group1Data = chartData.group1Data;
  const group2Data = chartData.group2Data;
  const group1Label = chartData.group1Label;
  const group2Label  = chartData.group2Label;
  const group1Spread  = chartData.group1Spread;
  const group2Spread  = chartData.group2Spread;
  const group1Footing  = chartData.group1Footing;
  const group2Footing = chartData.group2Footing;
  const group1Cycle = chartData.group1GaitCycle;
  const group2Cycle = chartData.group2GaitCycle;
  
  const [dimensions, setDimensions] = useState({ width: 450, height: 450 }); // State for dimensions
  const [dimensionsInitialized, setDimensionsInitialized] = useState(false);

  const mfootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_m' : 'Lfoot_m';
  const lfootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_l' : 'Lfoot_l';
  const ufootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_u' : 'Lfoot_u';

  const mfootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_m' : 'Lfoot_m';
  const lfootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_l' : 'Lfoot_l';
  const ufootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_u' : 'Lfoot_u';

  const Tooltip = ({ text, x, y }) => (
    <div
      style={{
        position: 'absolute',
        textAlign: 'center',
        width: 'auto',
        padding: '8px',
        fontSize: '12px',
        background: 'lightsteelblue',
        border: '0px',
        borderRadius: '8px',
        left: `${x}px`,
        top: `${y}px`,
        pointerEvents: 'none', // Ensure the tooltip doesn't interfere with mouse events.
      }}
    >
      {text}
    </div>
  );
  

  const [tooltip, setTooltip] = useState({
    visible: false,
    text: '',
    x: 0,
    y: 0,
  });
  


  useEffect(() => {
    // Resize observer for the container
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver(entries => {

      let { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) { // Use whatever minimum you deem appropriate
        console.log("Width and height",width,height);
        console.log("Dimensions",dimensions);
        setDimensions({ width : width, height : height });
        console.log("Dimensions",dimensions);
        setDimensionsInitialized(true);
    }
    });

    if (observeTarget) {
      resizeObserver.observe(observeTarget);
    }

    // Cleanup for the observer
    // return () => {
    //   if (observeTarget) {
    //     resizeObserver.unobserve(observeTarget);
    //   }
    //   setDimensionsInitialized(false); // Reset on cleanup
    // };
  }, []); 

  useEffect(() => {
    // console.log("Line chart data inside the plot component",chartData);
    if (!group1Data  || dimensions.width === 0 || dimensions.height === 0)
    {
      console.log("group1 Data",group1Data);
      console.log("dimensions.width",dimensions.width);
      console.log("dimensions.height",    dimensions.height)
      console.log("No data or dimensions");
     return;
    }
    // console.log("Line chart data inside the plot component",group1Data);
    d3.select(svgRef.current).selectAll("*").remove();
    // set the dimensions and margins of the graph
   const dynamicMargin = { top: dimensions.height * 0.05, right: dimensions.width * 0.05, bottom: dimensions.height * 0.10, left: dimensions.width * 0.10 };
   const dynamicWidth = dimensions.width - dynamicMargin.left - dynamicMargin.right;
   const dynamicHeight = dimensions.height - dynamicMargin.top - dynamicMargin.bottom;
  

    // append the svg object to the body of the page
    const svg = d3.select(svgRef.current)
      .attr("width", dynamicWidth  + dynamicMargin.left + dynamicMargin.right)
      .attr("height", dynamicHeight + dynamicMargin.top + dynamicMargin.bottom)
      .append("g")
      .attr("transform", `translate(${dynamicMargin.left},${dynamicMargin.top})`);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([1, 100])
      .range([0,  dynamicWidth]);
    svg.append("g")
      .attr("transform", "translate(0," +  dynamicHeight + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-100,50])
      .range([ dimensions.height  - dynamicMargin.top - dynamicMargin.bottom, 0]);


      // Add X grid lines
    svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(0," +  dimensions.height  - dynamicMargin.top - dynamicMargin.bottom + ")")
    .call(d3.axisBottom(x)
        .tickSize( dimensions.height - dynamicMargin.top - dynamicMargin.bottom)
        .tickFormat("")
    );

    // Add Y grid lines
    svg.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(y)
        .tickSize(- dimensions.width + dynamicMargin.right + dynamicMargin.left)
        .tickFormat("")
    );

    svg.append("g")
      .call(d3.axisLeft(y));
    // console.log("Line chart data",group1Data);

    if (group1Spread) {
    // Show confidence interval
    svg.append("path")
      .datum(group1Data)
      .attr("fill", "#ffb4a2")
      .attr("stroke", "none")
      .attr("opacity", 0.5)
      .attr("d", d3.area()
        .x(function (d) { return x(d.time) })
        .y0(function (d) { return y(d[lfootKeyGroup1]) })
        .y1(function (d) { return y(d[ufootKeyGroup1]) })
      );


    }

          // Add the line
    svg
    .append("path")
    .datum(group1Data)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("d", d3.line()
      .x(function (d) { return x(d.time) })
      .y(function (d) { return y(d[mfootKeyGroup1]) })
    ) ; // Adapt this as well

    // Add title
    svg.append("text")
      .attr("x",  dynamicWidth / 2)
      .attr("y", -dynamicMargin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text(`Group 1: ${group1Footing} ${group1Cycle} and Group2 ${group2Footing} ${group2Cycle}  `);

    // Add x-axis label
    svg.append("text")
      .attr("transform", `translate(${dynamicWidth /2 }, ${dimensions.height - dynamicMargin.bottom / 1.5 })`)
      .style("text-anchor", "middle")
      .text("Gait Cycle (%)");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -dynamicMargin.left / 1.1)
      .attr("x", -dimensions.height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Angle (deg)");


    if (group2Data) {
      // console.log("Entered group2Data", group2Data);
      svg.append("path")
        .datum(group2Data)
        .attr("fill", "none")
        .attr("stroke", "#114232")       //green line
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function (d) { return x(d.time) })
          .y(function (d) { return y(d[mfootKeyGroup2]) })
        );

      if (group2Spread) {

      
      svg.append("path")
        .datum(group2Data)
        .attr("fill", "#87A922")        //green spread
        .attr("stroke", "#87A922")
        .attr("opacity", 0.3 )
        .attr("d", d3.area()
          .x(function (d) { return x(d.time) })
          .y0(function (d) { return y(d[lfootKeyGroup2]) })
          .y1(function (d) { return y(d[ufootKeyGroup2]) })
        );
      }
    //const legendYPosition = height + margin.bottom - 20;
            // Add legends
    const legendData = [
      { color: "red", text: group1Label, x : dynamicMargin.left, y : 10, textX : 1.5*dynamicMargin.left, textY : 0 + 19},
      { color: "#114232", text: group2Label, x : dynamicMargin.left, y : 10 + dynamicMargin.bottom/2, textX : 1.5*dynamicMargin.left , textY : dynamicMargin.bottom/2 + 19}
    ];

    const legend = svg.selectAll(".legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend")
      // Position each legend group horizontally based on its index and vertically using the calculated legendYPosition
      // .attr("transform", (d, i) => `translate(${i * 120},${legendYPosition})`); // Adjust spacing by changing '120'
    
    legend.append("rect")
      .attr("x", d => d.x) // Rectangles start at the new origin of each legend item
      .attr("y", d => d.y) // Adjust y position based on your layout
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", d => d.color);
    
    legend.append("text")
      .attr("x", d => d.textX) // Position text to the right of the rectangle
      .attr("y", d => d.textY) // Align text vertically with the rectangle
      .attr("dy", ".35em")
      .style("text-anchor", "start") // Align text starting from its beginning
      .text(d => d.text);
    }

    else {
      console.log("No group2Data");
    }

  }, [chartData, group2Data, group2Label, group1Spread, group2Spread, group1Footing, group2Footing, mfootKeyGroup1, lfootKeyGroup1, ufootKeyGroup1, mfootKeyGroup2, lfootKeyGroup2, ufootKeyGroup2]);

  return (

    


    chartData.active ? (
      // If active, display the SVG container and its content
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '450px' }}>
        <svg ref={svgRef}></svg>
      </div>
    ) : (
      // If not active, display an inactive message
      <div style={{ width: '100%', height: '100%', minHeight: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>{`Plot ${chartData.plotNumber} is ${chartData.active}`}</p>
      </div>
    )
  );
};

export default LineChart;



