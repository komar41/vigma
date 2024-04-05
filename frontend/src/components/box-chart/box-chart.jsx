import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

const sampleData = {
  "df1": [
    {
      "GaitSpeed": 1.115111111111111, 
      "LstepLength": 1.377823938937842, 
      "RstepLength": 1.3441967706912497, 
      "sid": "081517ap", 
      "timeLgait": 1.1149999999999998, 
      "timeLswing": 0.6932999999999998, 
      "timeRgait": 1.12, 
      "timeRswing": 0.7534000000000001, 
      "trial": 8
    }, 
    {
      "GaitSpeed": 1.1218153846153847, 
      "LstepLength": 1.2208914062603842, 
      "RstepLength": 1.5007110142427276, 
      "sid": "081517ap", 
      "timeLgait": 1.1150000000000002, 
      "timeLswing": 0.75, 
      "timeRgait": 1.0732999999999997, 
      "timeRswing": 0.7416999999999998, 
      "trial": 9
    }, 
    {
      "GaitSpeed": 1.1503880597014924, 
      "LstepLength": 1.3708086433917193, 
      "RstepLength": 1.2928251600195417, 
      "sid": "083117ji", 
      "timeLgait": 1.1649999999999998, 
      "timeLswing": 0.7183999999999997, 
      "timeRgait": 1.1117, 
      "timeRswing": 0.7782999999999998, 
      "trial": 49
    }, 
    {
      "GaitSpeed": 1.1882666666666666, 
      "LstepLength": 1.425799440164638, 
      "RstepLength": 1.4226670064093445, 
      "sid": "083117ji", 
      "timeLgait": 1.1517000000000002, 
      "timeLswing": 0.7049999999999998, 
      "timeRgait": 1.1150000000000002, 
      "timeRswing": 0.7267000000000001, 
      "trial": 50
    }
  ], 
  "df1_mnmx": null, 
  "df2": [
    {
      "GaitSpeed": 0.28706666666666675, 
      "LstepLength": 0.11080278125096713, 
      "RstepLength": 0.9576561174457618, 
      "sid": "100417la", 
      "timeLgait": 1.6393000000000004, 
      "timeLswing": 1.3437000000000001, 
      "timeRgait": 1.4933999999999994, 
      "timeRswing": 1.0999999999999996, 
      "trial": 21
    }, 
    {
      "GaitSpeed": 0.31193617021276593, 
      "LstepLength": 0.5489795787021097, 
      "RstepLength": 0.5517020310655063, 
      "sid": "100417la", 
      "timeLgait": 1.5629, 
      "timeLswing": 1.3238000000000003, 
      "timeRgait": 1.7267000000000001, 
      "timeRswing": 1.1983000000000006, 
      "trial": 22
    }, 
    {
      "GaitSpeed": 0.924447204968944, 
      "LstepLength": 1.1808749465515682, 
      "RstepLength": 1.152864804770647, 
      "sid": "102617mm", 
      "timeLgait": 1.3217, 
      "timeLswing": 0.8634000000000002, 
      "timeRgait": 1.3283, 
      "timeRswing": 0.8799999999999999, 
      "trial": 17
    }, 
    {
      "GaitSpeed": 0.8966369426751594, 
      "LstepLength": 1.2300000242773264, 
      "RstepLength": 1.0370071997526973, 
      "sid": "102617mm", 
      "timeLgait": 1.335, 
      "timeLswing": 0.9199999999999999, 
      "timeRgait": 1.2933000000000003, 
      "timeRswing": 0.8833000000000002, 
      "trial": 18
    }
  ], 
  "df2_mnmx": null
};

const BoxChart = ({ chartData , attribute }) => {
  const svgRef = useRef();
  const containerRef = useRef(); // Ref for the container
  if (chartData)
    chartData = chartData.response;

  const [dimensions, setDimensions] = useState({ width: 450, height: 400 }); // State for dimensions

  // Calculate basic statistics for box plot
  const calculateStatistics = (data) => {
    const values = data.map(d => d[attribute]).sort(d3.ascending);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const min = d3.min(values);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  useEffect(() => {
    const observeTarget = containerRef.current;
    const resizeObserver = new ResizeObserver(entries => {
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

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Data for df1 and df2
    const stats = {
      df1: calculateStatistics(chartData.df1),
      df2: calculateStatistics(chartData.df2)
    };

    const yScale = d3.scaleLinear()
                     .domain([0.9 * d3.min([stats.df1.min, stats.df2.min]), 1.1 * d3.max([stats.df1.max, stats.df2.max])])
                     .range([adjustedHeight, 0]);

    const xScale = d3.scaleBand()
                     .domain(["df1", "df2"])
                     .range([0, adjustedWidth])
                     .padding(0.1);

    // Y-axis
    g.append("g")
     .call(d3.axisLeft(yScale));

    // X-axis
    g.append("g")
     .attr("transform", `translate(0, ${adjustedHeight})`)
     .call(d3.axisBottom(xScale))
     // Add x-axis label
     .append("text")
     .attr("class", "axis-label")
     .attr("x", adjustedWidth / 2)
     .attr("y", margin.bottom / 2)
     .attr("text-anchor", "middle") // Ensure it's centered horizontally
     .style("fill", "Black") // Text color
     .style("font-size", `${Math.min(adjustedWidth / 20, 24)}px`) // Responsive font size
     .text(attribute);

    // Draw box plots for df1 and df2
    ["df1", "df2"].forEach((df, i) => {
      const { min, q1, median, q3, max } = stats[df];

      const color = i === 0 ? "#ffb4a2" : "#87A922";

      // Box
      g.append("rect")
       .attr("x", xScale(df))
       .attr("y", yScale(q3))
       .attr("width", xScale.bandwidth())
       .attr("height", yScale(q1) - yScale(q3))
       .attr("stroke", "black")
       .attr("fill", color);

      // Median line
      g.append("line")
       .attr("x1", xScale(df))
       .attr("x2", xScale(df) + xScale.bandwidth())
       .attr("y1", yScale(median))
       .attr("y2", yScale(median))
       .attr("stroke", "black");

      // Whiskers
      g.selectAll(".whisker")
       .data([[min, q1], [max, q3]])
       .enter().append("line")
       .attr("x1", xScale(df) + xScale.bandwidth() / 2)
       .attr("x2", xScale(df) + xScale.bandwidth() / 2)
       .attr("y1", d => yScale(d[0]))
       .attr("y2", d => yScale(d[1]))
       .attr("stroke", "black");

      // Horizontal lines at the min and max
      g.selectAll(".whisker-end")
       .data([min, max])
       .enter().append("line")
       .attr("x1", xScale(df))
       .attr("x2", xScale(df) + xScale.bandwidth())
       .attr("y1", d => yScale(d))
       .attr("y2", d => yScale(d))
       .attr("stroke", "black");
    });
  }, [chartData, dimensions, attribute]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  );
};

export default BoxChart;