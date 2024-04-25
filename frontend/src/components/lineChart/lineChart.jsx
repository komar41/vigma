import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import "./lineChart.css";

const LineChart = ({ chartData }) => {
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container
  const tooltipRef = useRef(); // Ref for the tooltip

  const [active, setActive] = useState(chartData.active);
  const selectedColumn = chartData.parameter;
  const group1Data = chartData.group1Data;
  const group2Data = chartData.group2Data;
  const group1Label = chartData.group1Label;
  const group2Label = chartData.group2Label;
  const group1Spread = chartData.group1Spread;
  const group2Spread = chartData.group2Spread;
  const selectedFooting1 = chartData.group1Footing;
  const selectedFooting2 = chartData.group2Footing;
  const group1Cycle = chartData.group1GaitCycle;
  const group2Cycle = chartData.group2GaitCycle;

  const [dimensions, setDimensions] = useState({ width: 450, height: 300 }); // State for dimensions

  // New Tooltip states
  const [tooltipContent, setTooltipContent] = useState("");
  const [tooltipVisibility, setTooltipVisibility] = useState("hidden");
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });

  // Map selectedColumn from ['Foot', 'Shank', 'Thigh', 'Trunk', 'Hip', 'Asterior-Posterior', 'MedioLateral', 'Vertical', 'Spatiotemporal'] -> ['foot', 'shank', 'thigh', 'trunk', 'hipx', 'AP', 'ML', 'VT', 'STP']
  const dict = {
    foot: "Foot",
    shank: "Shank",
    thigh: "Thigh",
    trunk: "Trunk",
    hipx: "Hip",
    AP: "Asterior-Posterior",
    ML: "MedioLateral",
    VT: "Vertical",
    STP: "Spatiotemporal",
  };

  useEffect(() => {
    // Synchronize active state with chartData.active
    setActive(chartData.active);
  }, [chartData.active]); // Only re-run the effect if chartData.active changes

  useEffect(() => {
    // Resize observer for the container
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver((entries) => {
      let { width, height } = entries[0].contentRect;
      if (width > 10 && height > 10) {
        // Use whatever minimum you deem appropriate
        setDimensions({ width: width, height: height });
      }
    });

    if (observeTarget) {
      resizeObserver.observe(observeTarget);
    }

    // Cleanup for the observer
    return () => {
      if (observeTarget) {
        resizeObserver.unobserve(observeTarget);
      }
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    d3.select(svgRef.current).selectAll("*").remove();
    // set the dimensions and margins of the graph
    const dynamicMargin = {
      top: dimensions.height * 0.1,
      right: dimensions.width * 0.05,
      bottom: dimensions.height * 0.15,
      left: dimensions.width * 0.1,
    };
    const dynamicWidth =
      dimensions.width - dynamicMargin.left - dynamicMargin.right;
    const dynamicHeight =
      dimensions.height - dynamicMargin.top - dynamicMargin.bottom;

    // append the svg object to the body of the page
    const svg = d3
      .select(svgRef.current)
      .attr("width", dynamicWidth + dynamicMargin.left + dynamicMargin.right)
      .attr("height", dynamicHeight + dynamicMargin.top + dynamicMargin.bottom)
      .append("g")
      .attr(
        "transform",
        `translate(${dynamicMargin.left},${dynamicMargin.top})`
      );

    // Add X axis --> it is a date format
    var x = d3.scaleLinear().domain([0, 100]).range([0, dynamicWidth]);
    svg
      .append("g")
      .attr("transform", "translate(0," + dynamicHeight + ")")
      .style("font-family", "Roboto, sans-serif")
      .style("font-size", "12px")
      .call(d3.axisBottom(x));

    // Find min and max values
    const group1Min = d3.min(group1Data, (d) => d.l);
    const group1Max = d3.max(group1Data, (d) => d.u);

    const group2Min = d3.min(group2Data, (d) => d.l);
    const group2Max = d3.max(group2Data, (d) => d.u);

    // Calculate overall min and max
    const overallMin = Math.min(group1Min, group2Min);
    const overallMax = Math.max(group1Max, group2Max);

    // Add Y axis
    var y = d3
      .scaleLinear()
      .domain([overallMin, overallMax])
      .range([dimensions.height - dynamicMargin.top - dynamicMargin.bottom, 0]);

    // Add X grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .attr(
        "transform",
        "translate(0," +
          dimensions.height -
          dynamicMargin.top -
          dynamicMargin.bottom +
          ")"
      )
      .call(
        d3
          .axisBottom(x)
          .tickSize(
            dimensions.height - dynamicMargin.top - dynamicMargin.bottom
          )
          .tickFormat("")
        // .tickValues(x.ticks().filter(function(d) { return d < 50; }))
      );

    // Add Y grid lines
    svg
      .append("g")
      .attr("class", "grid")
      .call(
        d3
          .axisLeft(y)
          .tickSize(
            -dimensions.width + dynamicMargin.right + dynamicMargin.left
          )
          .tickFormat("")
          .ticks(7)
        // .tickValues(y.ticks().filter(function(d) { return d <10; }))
      );

    const isNarrowScreen = dynamicWidth < 405;
    // Adjusting the y-axis ticks based on SVG width
    let yAxis = d3.axisLeft(y).ticks(7);
    if (isNarrowScreen) {
      // console.log(y.ticks(7), "**", selectedColumn);
      const yDomain = y.domain();
      const customTickValues = [
        y.ticks(7)[0],
        y.ticks(7)[1],
        y.ticks(7)[2],
        y.ticks(7)[y.ticks(7).length - 3],
        y.ticks(7)[y.ticks(7).length - 2],
        y.ticks(7)[y.ticks(7).length - 1],
      ];
      yAxis.tickValues(customTickValues);
    }

    // console.log(y.domain())

    // Apply the y-axis to the SVG
    svg
      .append("g")
      .style("font-family", "Roboto, sans-serif")
      .style("font-size", "12px")
      .call(yAxis);
    if (group1Spread) {
      // Show confidence interval
      svg
        .append("path")
        .datum(group1Data)
        .attr("fill", "#fc8d62")
        .attr("stroke", "#fc8d62")
        .attr("opacity", 0.5)
        .attr(
          "d",
          d3
            .area()
            .x(function (d) {
              return x(d.time);
            })
            .y0(function (d) {
              return y(d.l);
            })
            .y1(function (d) {
              return y(d.u);
            })
        );
    }

    // Add the line
    // #fc8d62, #66c2a5
    svg
      .append("path")
      .datum(group1Data)
      .attr("fill", "none")
      .attr("stroke", "#fc8d62")
      .attr(
        "d",
        d3
          .line()
          .x(function (d) {
            return x(d.time);
          })
          .y(function (d) {
            return y(d.m);
          })
      );

    // Add title
    svg
      .append("text")
      .attr("x", dynamicWidth / 2)
      .attr("y", -dynamicMargin.top / 3)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-family", "Roboto, sans-serif")
      .style("font-weight", "bold")
      // .style("text-decoration", "underline")
      .text(dict[`${selectedColumn}`]);

    // Add x-axis label
    svg
      .append("text")
      .attr(
        "transform",
        `translate(${dynamicWidth / 2}, ${
          dimensions.height - dynamicMargin.bottom / 1.25
        })`
      )
      .style("text-anchor", "middle")
      .style("font-family", "Roboto, sans-serif")
      .text("Gait Cycle (%)");

    // Add y-axis label
    let txt = svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -dynamicMargin.left / 1.1)
      .attr("x", -dimensions.height / 2.5)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-family", "Roboto, sans-serif");
    if (
      selectedColumn === "AP" ||
      selectedColumn === "ML" ||
      selectedColumn === "VT"
    ) {
      txt.text("Force (N)");
    } else {
      txt.text("Angle (°)");
    }

    if (group2Data) {
      svg
        .append("path")
        .datum(group2Data)
        .attr("fill", "none")
        .attr("stroke", "#66c2a5") //green line
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.time);
            })
            .y(function (d) {
              return y(d.m);
            })
        );

      if (group2Spread) {
        svg
          .append("path")
          .datum(group2Data)
          .attr("fill", "#66c2a5") //green spread
          .attr("stroke", "#66c2a5")
          .attr("opacity", 0.3)
          .attr(
            "d",
            d3
              .area()
              .x(function (d) {
                return x(d.time);
              })
              .y0(function (d) {
                return y(d.l);
              })
              .y1(function (d) {
                return y(d.u);
              })
          );
      }

      // Circles for highlighting points
      const circle1 = svg
        .append("circle")
        .attr("r", 3)
        .attr("fill", "#fc8d62")
        .style("opacity", 0);

      const circle2 = svg
        .append("circle")
        .attr("r", 3)
        .attr("fill", "#66c2a5") // Change to match your line color
        .style("opacity", 0);

      // Initialize text for highlighting points, keep them hidden initially
      const text1 = svg
        .append("text")
        .attr("fill", "#d95f02") // Match the first line color or choose a visible color
        .style("opacity", 0)
        .attr("text-anchor", "middle"); // Center the text on its x position

      const text2 = svg
        .append("text")
        .attr("fill", "#1b9e77") // Match the second line color or choose a visible color
        .style("opacity", 0)
        .attr("text-anchor", "middle"); // Center the text on its x position

      // Tooltip and mouse tracking logic
      const mouseG = svg.append("g").attr("class", "mouse-over-effects");

      mouseG
        .append("rect")
        .attr("width", dynamicWidth)
        .attr("height", dynamicHeight)
        .attr("fill", "none")
        // .attr("stroke", "none")
        .attr("pointer-events", "all")
        .on("mousemove", (event) => {
          const mouseX = d3.pointer(event)[0];
          const x0 = x.invert(mouseX);
          const bisectDate = d3.bisector((d) => d.time).left;
          const i1 = bisectDate(group1Data, x0, 1);
          const i2 = bisectDate(group2Data, x0, 1);
          const d1 = group1Data[Math.max(0, i1 - 1)];
          const d2 = group2Data[Math.max(0, i2 - 1)];

          if (d1 && d2) {
            const y1 = y(d1.m);
            const y2 = y(d2.m);

            // Set circle positions
            circle1.attr("cx", x(d1.time)).attr("cy", y1).style("opacity", 1);
            circle2.attr("cx", x(d2.time)).attr("cy", y2).style("opacity", 1);

            // Define offsets and height adjustments
            const lineSpacing = 15; // Space between lines of text
            const textHeight = 3 * lineSpacing; // Adjust based on number of lines
            const offset = 12; // Adjust based on spacing from circle

            // Define text content for each data point
            let textY1 = y1 < y2 ? y1 - offset - textHeight : y1 + offset;
            let textY2 = y1 < y2 ? y2 + offset : y2 - offset - textHeight;

            //mouseX already declared.
            const mouseY = d3.pointer(event)[1];
            // Your existing mousemove logic...

            // Check for tooltip and legends overlap
            legendData.forEach((_, i) => {
              const legend = svg.select(`#legend-${i}`);
              const legendBox = legend.node().getBBox(); // Get the bounding box of the legend

              const tooltipWidth = tooltipRef.current.offsetWidth; // Assume you have the tooltip ref correctly set
              const tooltipHeight = tooltipRef.current.offsetHeight;

              // Calculate tooltip position (you might need to adjust this based on how you set the position)
              const tooltipX = x(d1.time); // Assuming this is how you calculate tooltip X position
              const tooltipY = mouseY; // Directly from mouse Y position

              // Check if there is an overlap
              const overlap = !(
                (
                  tooltipX > legendBox.x + legendBox.width ||
                  tooltipX + tooltipWidth < legendBox.x
                )
                // ||
                // tooltipY > legendBox.y + legendBox.height
                //||
                // tooltipY + tooltipHeight < legendBox.y
              );

              // Set legend opacity based on overlap
              legend.style("opacity", overlap ? 0 : 1);
            });

            // Update text elements for d1
            text1.selectAll("*").remove(); // Clear previous text
            const tspan1_1 = text1
              .append("tspan")
              .attr("x", x(d1.time))
              .attr("y", textY1);
            const tspan1_2 = text1
              .append("tspan")
              .attr("x", x(d1.time))
              .attr("y", textY1 + lineSpacing);
            const tspan1_3 = text1
              .append("tspan")
              .attr("x", x(d1.time))
              .attr("y", textY1 + 2 * lineSpacing);
            tspan1_2.text(`M: ${Number(d1.m).toFixed(2)}`);
            tspan1_3.text(`L: ${Number(d1.l).toFixed(2)}`);
            tspan1_1.text(`U: ${Number(d1.u).toFixed(2)}`);
            text1.style("opacity", 1);
            // text1 font roboto
            text1.style("font-family", "Roboto, sans-serif");

            // Update text elements for d2
            text2.selectAll("*").remove(); // Clear previous text
            const tspan2_1 = text2
              .append("tspan")
              .attr("x", x(d2.time))
              .attr("y", textY2);
            const tspan2_2 = text2
              .append("tspan")
              .attr("x", x(d2.time))
              .attr("y", textY2 + lineSpacing);
            const tspan2_3 = text2
              .append("tspan")
              .attr("x", x(d2.time))
              .attr("y", textY2 + 2 * lineSpacing);
            tspan2_2.text(`M: ${Number(d2.m).toFixed(2)}`);
            tspan2_3.text(`L: ${Number(d2.l).toFixed(2)}`);
            tspan2_1.text(`U: ${Number(d2.u).toFixed(2)}`);
            text2.style("opacity", 1);
            text2.style("font-family", "Roboto, sans-serif");
          }
        })
        .on("mouseout", () => {
          circle1.style("opacity", 0);
          circle2.style("opacity", 0);
          text1.style("opacity", 0);
          text2.style("opacity", 0);
          d3.selectAll(".legend").style("opacity", 1);
        });

      // Legends setup
      const legendX = dynamicMargin.left; // Adjust this value as needed, to position legends from the right side
      const legendYStart = dynamicMargin.top / 6; // Start position for the first legend, adjust as needed
      const legendSpacing = 20; // Space between each legend item

      // `${group1Label} ${selectedFooting1} ${group1Cycle !== "NA" ? "Limb " + group1Cycle + " Cycle" : ""}`

      const legendData = [
        {
          color: "#fc8d62",
          text: `${group1Label} [${
            selectedFooting1 !== "NA" ? " Limb: " + selectedFooting1 + "," : ""
          } Cycle: ${group1Cycle} ]`,
          x: legendX,
          y: legendYStart,
        },
        {
          color: "#66c2a5",
          text: `${group2Label} [${
            selectedFooting2 !== "NA" ? " Limb: " + selectedFooting2 + "," : ""
          } Cycle: ${group2Cycle} ]`,
          x: legendX,
          y: legendYStart + legendSpacing,
        },
      ];

      // Legends drawing code (remains the same)
      const legend = svg
        .selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .style("font-family", "Roboto, sans-serif")
        .attr("id", (_, i) => `legend-${i}`);

      legend
        .append("rect")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", (d) => d.color);

      legend
        .append("text")
        .attr("x", (d) => d.x + 22) // Position text slightly right of the rectangle
        .attr("y", (d) => d.y + 15) // Center text vertically with the rectangle
        .style("text-anchor", "start")
        .text((d) => d.text);
    } else {
      console.log("No group2Data");
    }
  }, [chartData, dimensions, active]);

  return { active } ? (
    // If active, display the SVG container and its content
    <div
      ref={containerRef}
      style={{ width: "100%", height: "95%", display: "block" }}
    >
      <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      <div
        ref={tooltipRef}
        className="tooltip"
        style={{
          opacity: tooltipVisibility === "visible" ? 1 : 0,
          position: "absolute",
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`,
          pointerEvents: "none",
          backgroundColor: "white",
          padding: "5px",
          border: "1px solid black",
          // roboto font
        }}
      >
        {tooltipContent}
      </div>
    </div>
  ) : (
    // If not active, display an inactive message
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p>{`Plot ${chartData.plotNumber} is ${active}`}</p>
    </div>
  );
};

export default LineChart;
