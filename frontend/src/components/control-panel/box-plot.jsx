import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

export const BoxPlot = (props) => {
  const svgRef = useRef();
  const color = props.color;
  useEffect(() => {
    d3.select(svgRef.current).selectAll("*").remove();
    const data = [5, 10, 15, 15, 45, 33, 20, 25, 30, 35];

    // Set the dimensions and margins of the chart
    const margin = { top: 0, right: 5, bottom: 0, left: 5 };
    const width = 300 - margin.left - margin.right;
    const height = 50 - margin.top - margin.bottom;

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

    // Create the boxplot
    svg
      .selectAll(".box")
      .data([data])
      .join("g")
      .attr("class", "box")
      .call((g) => {
        g.append("line")
          .attr("stroke", "black")
          .attr("x1", (d) => xScale(d3.min(d)))
          .attr("x2", (d) => xScale(d3.max(d)))
          .attr("y1", height / 2)
          .attr("y2", height / 2);

        g.append("rect")
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("x", (d) => xScale(d3.quantile(d, 0.25)))
          .attr(
            "width",
            (d) => xScale(d3.quantile(d, 0.75)) - xScale(d3.quantile(d, 0.25))
          )
          .attr("y", height / 4)
          .attr("height", height / 2);

        g.append("line")
          .attr("stroke", "black")
          .attr("x1", (d) => xScale(d3.median(d)))
          .attr("x2", (d) => xScale(d3.median(d)))
          .attr("y1", height / 4)
          .attr("y2", (height * 3) / 4);

        g.selectAll(".outlier")
          .data((d) =>
            d.filter(
              (v) => v < d3.quantile(d, 0.05) || v > d3.quantile(d, 0.95)
            )
          )
          .join("circle")
          .attr("class", "outlier")
          .attr("cx", (d) => xScale(d))
          .attr("cy", height / 2)
          .attr("r", 3);
      });
  }, []);

  return <svg ref={svgRef}></svg>;
};
