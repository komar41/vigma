import React, { useState, useRef, useEffect } from "react";
import * as d3 from "d3";

import "./para-coord.css";

export const ParaCoord = (props) => {
  //   const [data] = useState([25, 30, 45, 60, 20, 125, 75]);
  //   console.log([data]);
  const svgRef = useRef();
  const [resetBrushing, setResetBrushing] = useState(false);

  useEffect(() => {
    // reset svg
    d3.select(svgRef.current).selectAll("*").remove();

    const data = [
      {
        "Step Time (L)": 1,
        "Step Time (R)": 4,
        "Stride Time (L)": 2,
        "Stride Time (R)": 3,
        "Swing Time (L)": 2,
        "Swing Time (R)": 5,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 2,
        "Step Time (R)": 2,
        "Stride Time (L)": 3,
        "Stride Time (R)": 4,
        "Swing Time (L)": 3,
        "Swing Time (R)": 4,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 3,
        "Step Time (R)": 1,
        "Stride Time (L)": 1,
        "Stride Time (R)": 2,
        "Swing Time (L)": 4,
        "Swing Time (R)": 3,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 4,
        "Step Time (R)": 3,
        "Stride Time (L)": 4,
        "Stride Time (R)": 1,
        "Swing Time (L)": 2,
        "Swing Time (R)": 2,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 5,
        "Step Time (R)": 2,
        "Stride Time (L)": 2,
        "Stride Time (R)": 5,
        "Swing Time (L)": 3,
        "Swing Time (R)": 1,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 3,
        "Step Time (R)": 5,
        "Stride Time (L)": 2,
        "Stride Time (R)": 1,
        "Swing Time (L)": 4,
        "Swing Time (R)": 3,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 4,
        "Step Time (R)": 3,
        "Stride Time (L)": 1,
        "Stride Time (R)": 2,
        "Swing Time (L)": 2,
        "Swing Time (R)": 4,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 2,
        "Step Time (R)": 4,
        "Stride Time (L)": 3,
        "Stride Time (R)": 1,
        "Swing Time (L)": 5,
        "Swing Time (R)": 2,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 5,
        "Step Time (R)": 2,
        "Stride Time (L)": 1,
        "Stride Time (R)": 4,
        "Swing Time (L)": 3,
        "Swing Time (R)": 2,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 1,
        "Step Time (R)": 2,
        "Stride Time (L)": 4,
        "Stride Time (R)": 3,
        "Swing Time (L)": 2,
        "Swing Time (R)": 4,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 3,
        "Step Time (R)": 4,
        "Stride Time (L)": 2,
        "Stride Time (R)": 1,
        "Swing Time (L)": 5,
        "Swing Time (R)": 2,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 2,
        "Step Time (R)": 1,
        "Stride Time (L)": 3,
        "Stride Time (R)": 5,
        "Swing Time (L)": 4,
        "Swing Time (R)": 1,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 1,
        "Step Time (R)": 3,
        "Stride Time (L)": 4,
        "Stride Time (R)": 2,
        "Swing Time (L)": 2,
        "Swing Time (R)": 4,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 4,
        "Step Time (R)": 2,
        "Stride Time (L)": 1,
        "Stride Time (R)": 3,
        "Swing Time (L)": 3,
        "Swing Time (R)": 2,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 2,
        "Step Time (R)": 4,
        "Stride Time (L)": 3,
        "Stride Time (R)": 2,
        "Swing Time (L)": 2,
        "Swing Time (R)": 4,
        patient_type: "stroke-survivor",
      },
      {
        "Step Time (L)": 5,
        "Step Time (R)": 1,
        "Stride Time (L)": 2,
        "Stride Time (R)": 4,
        "Swing Time (L)": 1,
        "Swing Time (R)": 5,
        patient_type: "older-healthy",
      },
      {
        "Step Time (L)": 3,
        "Step Time (R)": 2,
        "Stride Time (L)": 4,
        "Stride Time (R)": 1,
        "Swing Time (L)": 5,
        "Swing Time (R)": 1,
        patient_type: "older-healthy",
      },
    ];

    const margin = { top: 40, right: 50, bottom: 20, left: 50 };
    const width = 1600 - margin.left - margin.right;
    const height = 280 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Color scale: give me a specie name, I return a color
    const color = d3
      .scaleOrdinal()
      .domain(["stroke-survivor", "older-healthy"])
      .range(["#d95f02", "#7570b3"]);

    // Set the list of dimensions manually to control the order of axes
    const dimensions = [
      "Step Time (L)",
      "Step Time (R)",
      "Stride Time (L)",
      "Stride Time (R)",
      "Swing Time (L)",
      "Swing Time (R)",
    ];
    // For each dimension, build a linear scale and store it in the y object
    const y = {};
    dimensions.forEach((dim) => {
      y[dim] = d3.scaleLinear().domain([0, 8]).range([height, 0]);
    });

    // Build the X scale to find the best position for each Y axis
    const x = d3.scalePoint().range([0, width]).domain(dimensions);

    // Highlight the specie that is hovered
    const highlight = function (event, d) {
      const selectedSpecie = d.patient_type;

      // First, make every group turn grey
      d3.selectAll(".line")
        .transition()
        .duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
        .style("fill", "none");

      // Second, make the hovered specie take its color
      d3.selectAll("." + selectedSpecie)
        .transition()
        .duration(200)
        .style("stroke", color(selectedSpecie))
        .style("opacity", "1");
    };

    // Unhighlight
    const doNotHighlight = function () {
      d3.selectAll(".line")
        .transition()
        .duration(200)
        .delay(1000)
        .style("stroke", (d) => color(d.patient_type))
        .style("opacity", "1");
    };

    // Create a brush for each axis
    const brush = d3
      .brushY()
      .extent([
        [-10, 10],
        [10, height],
      ])
      .on("brush", brushed)
      .on("end", brushEnded);

    // Highlight the specie that is brushed
    function brushed(event, d) {}

    // Remove highlighting when brushing ends
    function brushEnded(event, d) {}

    // The path function takes a row of the data as input and returns x and y coordinates of the line to draw
    function path(d) {
      return d3.line()(dimensions.map((p) => [x(p), y[p](d[p])]));
    }

    // Draw the lines
    svg
      .selectAll(".line")
      .data(data)
      .join("path")
      .attr("class", (d) => "line " + d.patient_type)
      .attr("d", path)
      .style("fill", "none")
      .style("stroke", (d) => color(d.patient_type))
      .style("opacity", 0.5)
      .on("mouseover", highlight)
      .on("mouseleave", doNotHighlight);

    // Draw the axes
    svg
      .selectAll(".axis")
      .data(dimensions)
      .join("g")
      .attr("class", "axis")
      .attr("transform", (d) => `translate(${x(d)})`)
      .each(function (d) {
        d3.select(this)
          .call(d3.axisLeft().ticks(5).scale(y[d]))
          .style("font-size", "14")
          .call(brush);
      })
      .append("text")
      .style("text-anchor", "middle")
      .attr("y", -9)
      .text((d) => d)
      .style("fill", "black")
      .style("font-size", 14)
      .style("font-weight", "bold");
  }, [resetBrushing]);

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <button
            className="btn btn-success dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            style={{ marginTop: "10px" }}
          >
            Select Parameters
          </button>
          <ul className="dropdown-menu checkbox-menu allow-focus">
            <li>
              <label>
                <input type="checkbox" /> Step Time (L)
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Step Time (R)
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Stride Time (L)
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Stride Time (R)
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Swing Time (L)
              </label>
            </li>
            <li>
              <label>
                <input type="checkbox" /> Swing Time (R)
              </label>
            </li>
          </ul>

          <button
            className="btn btn-danger"
            style={{ marginTop: "10px", marginLeft: "5px" }}
            // on click call function to reset brushing
            onClick={() => {
              setResetBrushing(!resetBrushing);
              // remove all rect.selection
              d3.selectAll(".selection").remove();
            }}
          >
            Reset Brushing
          </button>
        </div>

        <div className="col-10">
          <svg ref={svgRef}></svg>
        </div>
      </div>
    </div>
  );
};
