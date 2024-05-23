import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

const BoxTitle = ({
  chartData,
  labels,
  title,
  activeGroups,
  setActiveGroups,
  groupExploration,
}) => {
  // Accept title as a prop
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
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
    svg
      .append("rect")
      .attr("width", adjustedWidth)
      .attr("height", adjustedHeight)
      .attr("fill", "white");

    const legendData = [{ color: "#fc8d62", text: labels["label1"] }];

    if (groupExploration) {
      legendData.push({ color: "#66c2a5", text: labels["label2"] });
    }

    if (chartData && Object.keys(chartData).length > 0) {
      svg
        .append("text")
        .attr("x", adjustedWidth / 2) // Center the text in the middle of the svg
        .attr("y", adjustedHeight / 4) // Vertically center
        .attr("text-anchor", "middle") // Ensure it's centered horizontally
        .style("fill", "Black") // Text color
        .style("font-size", `${Math.min(adjustedWidth / 10, 24)}px`) // Responsive font size
        .text(title) // Use the title passed as prop
        .style("font-weight", "bold") // Make the text bold roboto
        .style("font-family", "Roboto, sans-serif")
        .style("font-size", "18px");

      const legendYPosition = adjustedHeight / 4 + 10;

      const legend = svg
        .append("g")
        .attr(
          "transform",
          `translate(${
            adjustedWidth / 2 - (legendData.length === 1 ? 75 : 150)
          }, ${legendYPosition})`
        ); // Center the legend below the title, adjust based on number of items

      legend
        .selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", (d) => d.color)
        .attr("x", (d, i) => i * (legendData.length === 1 ? 0 : 200)) // Center if only one item
        .attr("y", 0) // Keep y position constant as all items are on the same horizontal line
        .style("opacity", (d) => {
          // Determine initial opacity based on active groups
          const groupClass = d.text.includes(labels["label1"])
            ? "group1"
            : "group2";
          return groupClass === "group1"
            ? activeGroups[0]
              ? 1
              : 0.5
            : activeGroups[1]
            ? 1
            : 0.5;
        })
        .on("click", function (event, d) {
          if (d.text === labels["label1"]) {
            setActiveGroups([!activeGroups[0], activeGroups[1]]);
          } else if (d.text === labels["label2"]) {
            setActiveGroups([activeGroups[0], !activeGroups[1]]);
          }
        });

      legend
        .selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * (legendData.length === 1 ? 0 : 200) + 25) // Center if only one item
        .attr("y", 15) // Align text vertically to be centered with the box
        .text((d) => d.text)
        .style("font-size", "15px")
        .style("font-family", "Roboto, sans-serif");
    }
  }, [chartData, dimensions, title, activeGroups, labels, setActiveGroups]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
      ></svg>
    </div>
  );
};

export default BoxTitle;
