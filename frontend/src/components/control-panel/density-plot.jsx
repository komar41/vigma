import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export const DensityPlot = (props) => {
  const svgRef = useRef();
  const color = props.color;

  function kde(kernel, thresholds, data) {
    return thresholds.map((t) => [t, d3.mean(data, (d) => kernel(t - d))]);
  }

  function epanechnikov(bandwidth) {
    return (x) =>
      Math.abs((x /= bandwidth)) <= 1 ? (0.75 * (1 - x * x)) / bandwidth : 0;
  }

  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    const data = [5, 10, 15, 15, 45, 33, 20, 25, 30, 35];

    // Set the dimensions and margins of the chart
    const margin = { top: 0, right: 5, bottom: 5, left: 5 };
    const width = 300 - margin.left - margin.right;
    const height = 80 - margin.top - margin.bottom;

    var svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create the scales for x and y axes
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .range([0, width]);

    const yScale = d3.scaleLinear().domain([0, 0.0319]).range([height, 0]);

    var line = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    // console.log(data.length);
    var density = kde(epanechnikov(7), xScale.ticks(data.length * 4), data);
    // console.log(d3.max(density, (d) => d[1]));

    // plot the area
    svg
      .append("path")
      .datum(density)
      .attr("fill", "none")
      .attr("opacity", 0.4)
      .attr("stroke", "black")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }, []);

  return <svg ref={svgRef}></svg>;
};
