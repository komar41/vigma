import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const LineChart = ({ group1Data, group2Data, group1Label, group2Label, group1Spread, group2Spread, group1Footing, group2Footing  }) => {
  const svgRef = useRef();
  const mfootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_m' : 'Lfoot_m';
  const lfootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_l' : 'Lfoot_l';
  const ufootKeyGroup1 = group1Footing === 'right' ? 'Rfoot_u' : 'Lfoot_u';

  const mfootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_m' : 'Lfoot_m';
  const lfootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_l' : 'Lfoot_l';
  const ufootKeyGroup2 = group2Footing === 'right' ? 'Rfoot_u' : 'Lfoot_u';


  useEffect(() => {
    if (!group1Data)
     return;

    d3.select(svgRef.current).selectAll("*").remove();
    // set the dimensions and margins of the graph
    const margin = { top: 40, right: 30, bottom: 70, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
      .domain([1, 100])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([-100,50])
      .range([height, 0]);

    svg.append("g")
      .call(d3.axisLeft(y));
    console.log("Line chart data",group1Data);

    if (group1Spread) {
    // Show confidence interval
    svg.append("path")
      .datum(group1Data)
      .attr("fill", "red")
      .attr("stroke", "#000000")
      .attr("opacity", 0.3)
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
    );


    // Add title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("Title of the Line Chart");

    // Add x-axis label
    svg.append("text")
      .attr("transform", `translate(${width / 4}, ${height + margin.bottom / 2})`)
      .style("text-anchor", "middle")
      .text("Gait Cycle (%)");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Angle (deg)");


    if (group2Data) {
      console.log("Entered group2Data", group2Data);
      svg.append("path")
        .datum(group2Data)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .x(function (d) { return x(d.time) })
          .y(function (d) { return y(d[mfootKeyGroup2]) })
        );



      if (group2Spread) {

      
      svg.append("path")
        .datum(group2Data)
        .attr("fill", "grey")
        .attr("stroke", "grey")
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
      { color: "red", text: group1Label, x : 0, y : 0, textX : 22, textY : 9},
      { color: "black", text: group2Label, x : 75, y : 0, textX : 97, textY : 9}
    ];

    const legendYPosition = height + margin.bottom - 20; // Adjust this based on your SVG dimensions and preferences

    const legend = svg.selectAll(".legend")
      .data(legendData)
      .enter().append("g")
      .attr("class", "legend")
      // Position each legend group horizontally based on its index and vertically using the calculated legendYPosition
      .attr("transform", (d, i) => `translate(${i * 120},${legendYPosition})`); // Adjust spacing by changing '120'
    
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

  }, [group1Data,group2Data, group1Label, group2Label, group1Spread, group2Spread]);

  return <svg ref={svgRef}></svg>;
};

export default LineChart;



