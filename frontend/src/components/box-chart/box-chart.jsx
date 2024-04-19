import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const BoxChart = ({ chartData, attribute, labels }) => {
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container
  if (chartData) chartData = chartData.response;

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  // Calculate basic statistics for box plot
  const calculateStatistics = (data) => {
    const values = data.map((d) => d[attribute]).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const min = d3.min(values);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.unobserve(observeTarget);
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear SVG

    if (!chartData) return;

    const margin = { top: 20, right: 20, bottom: 60, left: 40 }; // Adjusted for x-axis label
    const adjustedWidth = dimensions.width - margin.left - margin.right;
    const adjustedHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Data for df1 and df2
    const stats = {
      df1: calculateStatistics(chartData.df1),
      df2: calculateStatistics(chartData.df2),
    };

    const yScale = d3
      .scaleLinear()
      .domain([
        0.9 * d3.min([stats.df1.min, stats.df2.min]),
        1.1 * d3.max([stats.df1.max, stats.df2.max]),
      ])
      .range([adjustedHeight, 0]);

    const xScale = d3
      .scaleBand()
      .domain(["df1", "df2"])
      .range([0, adjustedWidth])
      .padding(0.1);

    // change x labels to labels[0] and labels[1]
    console.log(labels["label1"], labels["label2"]);

    // Create a tooltip
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("position", "absolute")
      .style("z-index", "10");

    // Y-axis
    g.append("g")
      .style("font-size", "12px")
      .style("font-family", "Roboto, sans-serif")
      .call(d3.axisLeft(yScale).ticks(5));

    // X-axis
    g.append("g")
      .attr("transform", `translate(0, ${adjustedHeight})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) =>
            d === "df1" ? labels["label1"] : labels["label2"]
          )
      )

      .style("font-size", "12px")
      .style("font-family", "Roboto, sans-serif")
      // Add x-axis label
      .append("text")
      .attr("class", "axis-label")
      .attr("x", adjustedWidth / 2)
      .attr("y", margin.bottom / 2)
      .attr("text-anchor", "middle") // Ensure it's centered horizontally
      .style("fill", "Black") // Text color
      .style("font-size", "14px")
      .style("font-family", "Roboto, sans-serif")
      .text(attribute);

    // Draw box plots for df1 and df2
    ["df1", "df2"].forEach((df, i) => {
      const { min, q1, median, q3, max } = stats[df];

      const color = i === 0 ? "#66c2a5" : "#fc8d62";

      // Box
      g.append("rect")
        .attr("x", xScale(df))
        .attr("y", yScale(q3))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale(q1) - yScale(q3))
        .attr("stroke", "black")
        .attr("fill", color)
        .on("mouseover", (event, d) => {
          tooltip
            .style("opacity", 1)
            .html(
              `Min: ${min.toFixed(2)}<br>Q1: ${q1.toFixed(
                2
              )}<br>Median: ${median.toFixed(2)}<br>Q3: ${q3.toFixed(
                2
              )}<br>Max: ${max.toFixed(2)}`
            )
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px");
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

      // Median line
      g.append("line")
        .attr("x1", xScale(df))
        .attr("x2", xScale(df) + xScale.bandwidth())
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black");

      // Whiskers
      g.selectAll(".whisker")
        .data([
          [min, q1],
          [max, q3],
        ])
        .enter()
        .append("line")
        .attr("x1", xScale(df) + xScale.bandwidth() / 2)
        .attr("x2", xScale(df) + xScale.bandwidth() / 2)
        .attr("y1", (d) => yScale(d[0]))
        .attr("y2", (d) => yScale(d[1]))
        .attr("stroke", "black");

      // Horizontal lines at the min and max
      g.selectAll(".whisker-end")
        .data([min, max])
        .enter()
        .append("line")
        .attr("x1", xScale(df))
        .attr("x2", xScale(df) + xScale.bandwidth())
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", "black");
    });
  }, [chartData, dimensions, attribute]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
    </div>
  );
};

export default BoxChart;
