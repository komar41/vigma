import React, { useState, useEffect, useRef, useContext } from "react";
import * as d3 from "d3";
import { GlobalContext } from "../globalHighlight/GlobalContext";

const dictStpParam = {
  RstepLength: "Step Length (R)",
  LstepLength: "Step Length (L)",
  timeRswing: "Swing Time (R)",
  timeLswing: "Swing Time (L)",
  timeRgait: "Gait Time (R)",
  timeLgait: "Gait Time (L)",
  GaitSpeed: "Gait Speed",
};

const BoxChart = ({
  chartData,
  attribute,
  labels,
  activeGroups,
  groupExploration,
}) => {
  const { globalArray, setGlobalArray } = useContext(GlobalContext);
  const selectedKeysRefG1 = useRef(globalArray);
  const { globalArray2, setGlobalArray2 } = useContext(GlobalContext);
  const selectedKeysRefG2 = useRef(globalArray2);

  useEffect(() => {
    selectedKeysRefG1.current = globalArray;
  }, [globalArray]);

  useEffect(() => {
    selectedKeysRefG2.current = globalArray2;
  }, [globalArray2]);

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

    const highlightData = chartData.df1.filter((item) => {
      return selectedKeysRefG1.current.includes(item.sid + "_" + item.trial);
    });

    let highlightData2;
    if (groupExploration) {
      highlightData2 = chartData.df2.filter((item) => {
        return selectedKeysRefG2.current.includes(item.sid + "_" + item.trial);
      });
    }

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Data for df1 and df2
    const stats = {
      df1: calculateStatistics(chartData.df1),
    };
    if (groupExploration) {
      stats.df2 = calculateStatistics(chartData.df2);
    }

    const minHighlight1 = d3.min(highlightData, (d) => d[attribute]);
    const maxHighlight1 = d3.max(highlightData, (d) => d[attribute]);

    let minHighlight2, maxHighlight2;
    if (groupExploration) {
      minHighlight2 = d3.min(highlightData2, (d) => d[attribute]);
      maxHighlight2 = d3.max(highlightData2, (d) => d[attribute]);
    }

    console.log(stats.df1, "stats.df1", stats.df2, "stats.df2");
    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        1.1 * d3.max([stats.df1.max, groupExploration ? stats.df2.max : 0]),
      ])
      .range([adjustedHeight, 0]);

    const xScale = d3
      .scaleBand()
      .domain(groupExploration ? ["df1", "df2"] : ["df1"])
      .range([0, adjustedWidth])
      .padding(0.1);

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
    const yAxisLeft = g
      .append("g")
      .style("font-size", "12px")
      .style("font-family", "Roboto, sans-serif")
      .call(d3.axisLeft(yScale).ticks(3));

    let yAxisRight;
    if (groupExploration && activeGroups[1]) {
      yAxisRight = g
        .append("g")
        .style("font-size", "0px")
        .style("font-family", "Roboto, sans-serif")
        .attr("transform", `translate(${adjustedWidth}, 0)`)
        .call(d3.axisRight(yScale).ticks(3));
    }

    // Calculate half-width for symmetrical brush
    const brushHalfWidth = 5; // Adjust this value based on desired brush width

    // Brush setup
    const brushLeft = d3
      .brushY()
      .extent([
        [-brushHalfWidth, 0],
        [brushHalfWidth, adjustedHeight],
      ])
      .on("end", brushedLeft);

    let brushRight;
    if (groupExploration && activeGroups[1]) {
      brushRight = d3
        .brushY()
        .extent([
          [-brushHalfWidth, 0],
          [brushHalfWidth, adjustedHeight],
        ])
        .on("end", brushedRight);
    }

    const minBrushHeight = 1; // Minimum height for the brush

    const adjustBrushRange = (minHighlight, maxHighlight, yScale) => {
      let minY = yScale(maxHighlight);
      let maxY = yScale(minHighlight);

      // If the min and max highlights are the same, add the minimum height
      if (minHighlight === maxHighlight) {
        minY = minY - minBrushHeight / 2;
        maxY = maxY + minBrushHeight / 2;
      }

      return [minY, maxY];
    };

    // Apply brushes and set styles
    if (activeGroups[0]) {
      yAxisLeft
        .call(brushLeft)
        .selectAll(".selection")
        .style("fill", "#fc8d62") // Change the color of the selection area
        .style("stroke", "#fc8d62"); // Change the color of the border
    }

    if (groupExploration && activeGroups[1]) {
      yAxisRight
        .call(brushRight)
        .selectAll(".selection")
        .style("fill", "#66c2a5") // Change the color of the selection area
        .style("stroke", "#66c2a5"); // Change the color of the border
    }

    let brushRangeLeft;
    if (activeGroups[0]) {
      brushRangeLeft = adjustBrushRange(minHighlight1, maxHighlight1, yScale);
    }

    let brushRangeRight;
    if (groupExploration && activeGroups[1]) {
      brushRangeRight = adjustBrushRange(minHighlight2, maxHighlight2, yScale);
    }

    let isProgrammaticBrushMove = false;

    function brushedLeft(event) {
      if (isProgrammaticBrushMove) {
        // If the move is programmatic, do nothing
        return;
      }

      if (!event.selection) {
        return;
      }

      let [y1, y0] = event.selection.map((d) => yScale.invert(d));

      const filteredData = chartData.df1.filter((item) => {
        return item[attribute] >= y0 && item[attribute] <= y1;
      });

      // update globalArray by item.sid + "_" + item.trial for each item in filteredData using setGlobalArray
      const tempArray = [];
      filteredData.forEach((item) => {
        tempArray.push(item.sid + "_" + item.trial);
      });

      setGlobalArray(tempArray);
    }

    function brushedRight(event) {
      if (isProgrammaticBrushMove) {
        // If the move is programmatic, do nothing
        return;
      }

      if (!event.selection) {
        return;
      }
      let [y1, y0] = event.selection.map((d) => yScale.invert(d));

      const filteredData = chartData.df2.filter((item) => {
        return item[attribute] >= y0 && item[attribute] <= y1;
      });

      // update globalArray2 by item.sid + "_" + item.trial for each item in filteredData using setGlobalArray2
      const tempArray = [];
      filteredData.forEach((item) => {
        tempArray.push(item.sid + "_" + item.trial);
      });

      setGlobalArray2(tempArray);
    }

    function disableBrushEvent(brush, yAxis, eventType, handler, brushRange) {
      // Set the flag to true to indicate a programmatic move
      isProgrammaticBrushMove = true;

      // Perform the brush move operation
      brush.move(yAxis, brushRange);

      // Set the flag back to false after the move is complete
      isProgrammaticBrushMove = false;
    }

    // Temporarily disable the brush event, move the brush, and then re-enable the event
    if (groupExploration && activeGroups[1]) {
      disableBrushEvent(
        brushRight,
        yAxisRight,
        "brush",
        brushedRight,
        brushRangeRight
      );
    }

    if (activeGroups[0]) {
      disableBrushEvent(
        brushLeft,
        yAxisLeft,
        "brush",
        brushedLeft,
        brushRangeLeft
      );
    }

    // X-axis
    g.append("g")
      .attr("transform", `translate(0, ${adjustedHeight})`)
      .call(
        d3.axisBottom(xScale).tickFormat((d) => {
          if (d === "df1") return labels["label1"];
          if (groupExploration && d === "df2") return labels["label2"];
          return null;
        })
      )
      .style("font-size", "12px")
      .attr("opacity", 0.7)
      .style("font-family", "Roboto, sans-serif")
      .append("text")
      .attr("class", "axis-label")
      .attr("x", adjustedWidth / 2)
      .attr("y", margin.bottom / 1.25)
      .attr("text-anchor", "middle")
      .style("fill", "Black")
      .style("font-size", "15px")
      .style("font-family", "Roboto, sans-serif")
      // .style("font-weight", "bold")
      .text(dictStpParam[attribute]);

    ["df1", groupExploration ? "df2" : null].forEach((df, i) => {
      if (!df) return;

      const activeCount = activeGroups.filter(Boolean).length;
      let boxWidth = xScale.bandwidth() / 1.4; // Increase the width of the boxplot
      let xPos = xScale(df) + (xScale.bandwidth() - boxWidth) / 2; // Center the box within the tick

      if (!activeGroups[i]) return;

      const { min, q1, median, q3, max } = stats[df];

      const color = i === 0 ? "#fc8d62" : "#66c2a5";

      g.append("rect")
        .attr("x", xPos)
        .attr("y", yScale(q3))
        .attr("width", boxWidth)
        .attr("height", yScale(q1) - yScale(q3))
        .attr("stroke", "black")
        .attr("fill", color)
        .attr("rx", 2)
        .attr("ry", 2)
        .on("mouseover", (event) => {
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

      g.append("line")
        .attr("x1", xPos)
        .attr("x2", xPos + boxWidth)
        .attr("y1", yScale(median))
        .attr("y2", yScale(median))
        .attr("stroke", "black");

      g.selectAll(".whisker")
        .data([
          [min, q1],
          [max, q3],
        ])
        .enter()
        .append("line")
        .attr("x1", xPos + boxWidth / 2)
        .attr("x2", xPos + boxWidth / 2)
        .attr("y1", (d) => yScale(d[0]))
        .attr("y2", (d) => yScale(d[1]))
        .attr("stroke", "black");

      g.selectAll(".whisker-end")
        .data([min, max])
        .enter()
        .append("line")
        .attr("x1", xPos)
        .attr("x2", xPos + boxWidth)
        .attr("y1", (d) => yScale(d))
        .attr("y2", (d) => yScale(d))
        .attr("stroke", "black");
    });
  }, [
    chartData,
    dimensions,
    attribute,
    activeGroups,
    selectedKeysRefG2.current,
    selectedKeysRefG1.current,
    globalArray,
    globalArray2,
  ]);

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {attribute ? (
        <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
      ) : (
        /*<img
          src="/placeholder.png"
          alt="Placeholder"
          style={{ width: "80%", height: "80%", marginTop: "10px" }}
        />*/
        <div className="no-data"></div>
      )}
    </div>
  );
};

export default BoxChart;
