import React, { useState, useEffect, useRef } from "react";
// Dropdown checkbox
import {
  OutlinedInput,
  InputLabel,
  MenuItem,
  FormControl,
  ListItemText,
  Select,
  Checkbox,
  Grid,
} from "@mui/material";
import * as d3 from "d3";

const ITEM_HEIGHT = 30;
const ITEM_PADDING_TOP = 3;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "RstepLength",
  "LstepLength",
  "timeRswing",
  "timeLswing",
  "timeRgait",
  "timeLgait",
  "GaitSpeed",
];

const BoxTitle = ({ chartData, labels, title }) => {
  // Accept title as a prop
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container

  const [personName, setPersonName] = useState([]); // State for selected names

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(typeof value === "string" ? value.split(",") : value);
  };

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

    console.log(labels["label1"], "**");
    const legendData = [
      { color: "#fc8d62", text: labels["label1"] },
      { color: "#66c2a5", text: labels["label2"] },
    ];

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
          `translate(${adjustedWidth / 2 - 150}, ${legendYPosition})`
        ); // Center the legend below the title

      legend
        .selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", (d) => d.color)
        .attr("x", (d, i) => i * 200) // Set x position based on index to space items horizontally
        .attr("y", 0); // Keep y position constant as all items are on the same horizontal line

      legend
        .selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => i * 200 + 25) // Set x position so text appears right after the rectangle
        .attr("y", 15) // Align text vertically to be centered with the box
        .text((d) => d.text)
        .style("font-size", "15px")
        .style("font-family", "Roboto, sans-serif");
    }
  }, [chartData, dimensions, title]); // Redraw when chartData, dimensions, or title change

  return (
    <div style={{ width: "100%", height: "100%", display: "block" }}>
      <Grid container spacing={0}>
        <Grid item xs={4} lg={7} ref={containerRef}>
          <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
        </Grid>
        <Grid item xs={8} lg={2}>
          {title === "Spatiotemporal Distributions" && (
            <FormControl
              style={{ minWidth: 250, maxWidth: 200, maxHeight: 50 }}
            >
              <InputLabel id="demo-mutiple-checkbox-label">Select</InputLabel>
              <Select
                labelId="demo-mutiple-checkbox-label"
                id="demo-mutiple-checkbox"
                multiple
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput label="Names" />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem key={name} value={name}>
                    <Checkbox checked={personName.indexOf(name) > -1} />
                    <ListItemText primary={name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default BoxTitle;
