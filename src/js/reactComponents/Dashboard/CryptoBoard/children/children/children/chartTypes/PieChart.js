import React from "react";
import * as d3 from "d3";

import Legend from "../Legend.js";
import WordLengthTester from "./children/WordLengthTester.js";

import { twoArraysAreEqual } from "../../../../../../../helperFunctions.js";

export default class PieChart extends React.Component {
  constructor() {
    super();
    this.state = { duration: 300 };
  }
  componentDidMount() {
    this.renderSVG();
  }
  componentWillReceiveProps(newProps) {
    if(newProps.type !== this.props.type) {
      d3.select(this.svg).remove();
      if(
        newProps.type.indexOf(this.props.type) !== -1 ||
        this.props.type.indexOf(newProps.type) !== -1
      ) {
        this.renderSVG();
      } else {
        d3.select(this.svg.parentElement).remove();
      }
    }
  }
  shouldComponentUpdate(nextProps) {
    return !(
      twoArraysAreEqual(nextProps.dataset, this.props.dataset) &&
      nextProps.comparisionField === this.props.comparisionField &&
      nextProps.type === this.props.type &&
      nextProps.width === this.props.width  // width can not change without changing height
    );
  }
  componentDidUpdate() {
    this.updateSVG();
  }
  renderSVG() {
    let radius;
    if(this.props.width > 800) radius = 150;
    else if(this.props.width > 500) radius = 100;
    else radius = Math.round(this.props.height / 2); // ? 50

    const holeRadius = Math.round(radius * 0.6); // for donut chart
    const labelr = radius + 20; // label radius
    const svg = d3.select(this.svg);
    svg.attr("width", this.props.width);
    svg.attr("height", this.props.height);

    this.setState({
      g: svg.append("g")
        .attrs({
          "transform": `translate(${this.props.width / 2}, ${this.props.height / 2})`,
          "class": "pie"
        }),
      labelr
    }, () => {
      this.path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(this.props.chartIsDonut ? holeRadius : 0);

      this.label = d3.arc()
        .outerRadius(this.state.labelr)
        .innerRadius(this.state.labelr);

      this.updateSVG();
    });
  }
  updateSVG() {
    this.pie = d3.pie()
      .value(d => this.pieValueCallback()(d))
      .sort(null);

    const dataset = this.pie(this.props.dataset);
    const updateChildData = (d, el) => {
      const new_d = dataset.find(item => item.data.id === d.data.id);
      el[0]._current = new_d;
    }
    const arcs = this.state.g.selectAll(".arc")
      .data(dataset, d => d.data.id);
    // delete obsolete arcs
    arcs.exit().remove();
    
    // add missing arcs
    const enterArcs = arcs.enter()
      .append("g")
      .attr("class", "arc")
      .attr("data-currency-id", d => d.data.id);
    
    // insert nested elements into each new arc
    enterArcs.append("path");
    enterArcs.append("text");
    enterArcs.append("polyline");
    enterArcs.merge(arcs);
  
    // update paths
    const newPaths = enterArcs.selectAll("path");        

    arcs.selectAll("path")
      .each((d, _i, el) => updateChildData(d, el))
      .attr("fill", (_d, _i, el) => this.props.color(el[0]._current.data[this.props.comparisionField]))
      .transition()
      .duration(this.state.duration)
      .attrTween("d", (d, _i, el) => this.arcTween(el[0]._current));

    newPaths
      .each((d, _i, el) => updateChildData(d, el))
      .on("mouseover", () => this.togglePie(d3.event.target.parentElement.getAttribute("data-currency-id"), 1))
      .on("mouseout", () => this.togglePie(d3.event.target.parentElement.getAttribute("data-currency-id"), 0))
      .attr("fill", (_d, _i, el) => this.props.color(el[0]._current.data[this.props.comparisionField]))
      .attr("stroke", "#fff")
      .transition()
      .duration(this.state.duration)
      .attrTween("d", (_d, _i, el) => this.arcTween(el[0]._current));
        
    newPaths.merge(arcs.selectAll("path"));
    
    // UPDATE TEXT
    const setTransform = (_d, _i, el) => {
      const d = el[0]._current;
      const pos = this.label.centroid(d);
      const direction = this.midAngle(d) < Math.PI ? 1 : -1;
      // determine polyline width and padd it
      pos[0] = this.state.labelr * direction;
      // determine the amount of space needed for word and padd it
      if(direction <  1) {
        const nameLength = this.WordLengthTester.getLengthOf(d.data.name);
        const valueLength = this.WordLengthTester.getLengthOf(d.data[this.props.comparisionField]);
        pos[0] -= nameLength < valueLength ? valueLength : nameLength;
      }
      return `translate(${pos})`;
    };

    arcs.selectAll("text")
      .each((d, _i, el) => updateChildData(d, el))
      .attr("transform", setTransform)

    arcs.selectAll("tspan:last-child")
      .text((_d, _i, el) => el[0].parentElement._current.data[this.props.comparisionField]);
    
    
    const text = enterArcs.selectAll("text")
      .each((d, _i, el) => updateChildData(d, el))
      .style("font-size", "16px")
      .style("opacity", 0);    

    text
      .append("tspan")
        .attrs({
          x: "0",
          dy: "-0.35em",
        })
        .style("font-style", "italic")
      .merge(arcs.selectAll("tspan:first-child"))
        .text(d => d.data.name);

    text
      .append("tspan")
        .attrs({
          x: "0",
          dy: "1.1em",
        })
        .style("font-size", ".75em")
      .merge(arcs.selectAll("tspan:last-child"))
        .text((_d, _i, el) => el[0].parentElement._current.data[this.props.comparisionField]);

    text
      .merge(arcs.selectAll("text"))
      .attrs({
        "transform": setTransform,
        "text-anchor": (_d, _i, el) => this.midAngle(el[0]._current) / 2 > Math.PI ? "end" : "start",
        stroke: (_d, _i, el) => this.props.color(el[0]._current.data[this.props.comparisionField]),
      });

    // update polyline
    const setPoints = (_d, _i, el) => {
      const d = el[0]._current;          
      const pos = this.label.centroid(d);
      const direction = this.midAngle(d) < Math.PI ? 1 : -1;
      pos[0] = this.state.labelr * direction;
      return [ this.path.centroid(d), this.label.centroid(d), pos ];
    };

    arcs.selectAll("polyline")
      .each((d, _i, el) => updateChildData(d, el))
      .attr("points", setPoints);

    const enterPolyline = enterArcs.selectAll("polyline");

    enterPolyline
      .each((d, _i, el) => updateChildData(d, el))
      .style("pointer-events", "none")
      .style("opacity", 0)   
      .merge(arcs.selectAll("polyline"))
      .attrs({
        stroke: (_d, _i, el) => this.props.color(el[0]._current.data[this.props.comparisionField]),
        "stroke-width": 2,
        fill: "none",
        points: setPoints
      });

    setTimeout(() => {
      enterPolyline.style("transition", `opacity ${this.state.duration / 1000}s ease-in`)
      text.style("transition", `opacity ${this.state.duration / 1000}s ease-in`);
    }, this.state.duration);
      
    this.legend.build();
  }
  midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }
  arcTween(d) {
    var i = d3.interpolate(this._current, d);
    this._current = i(0);
    return t => this.path(i(t));    
  }
  pieValueCallback() {
    const [ min, max ] = d3.extent(this.props.dataset, d => +d[this.props.comparisionField]);
    if(max < 0) { // only negatives
      return d => (1 / Math.abs(+d[this.props.comparisionField]));
    } else if(min > 0) { // only positives
      return d => +d[this.props.comparisionField];
    } else { // mixed
      return d => +d[this.props.comparisionField] < 0 ? 0 : +d[this.props.comparisionField];
    }      
  }
  handleHoverEvtHandler(opacityVal, color) {
    let item = d3.event.target;
    if(item.tagName !== "DIV") {
      item = item.parentElement;
    }
    item.getElementsByTagName("span")[1].style.color = color;

    const id = item.getAttribute("data-currency-id");

    this.togglePie(id, opacityVal);
  }
  togglePie(id, opacityVal) {
      const arcs = Array.from(this.state.g.selectAll(".arc").nodes());
      const arc = arcs.find(d => d.getAttribute("data-currency-id") === id);
      try {
        arc.getElementsByTagName("text")[0].style.opacity = opacityVal;
        arc.getElementsByTagName("polyline")[0].style.opacity = opacityVal;
      }
      catch(error) {
        throw {
          type: "ElementNotFound",
          msg: "Arc is not defined"
        };
      }

      const show = item => { if(item !== arc) { item.style.opacity = 0.25; } };
      const hide = item => { item.style.opacity = 1; };

      const callback = opacityVal === 1 ? show : hide;
  
      arcs.forEach(callback);
  }
  render() {
      return (
          <div>
            <WordLengthTester ref={div => this.WordLengthTester = div} />
            <svg ref={svg => this.svg = svg}></svg>
            <Legend  ref={legend => this.legend = legend}
                      onHoverHandler={this.handleHoverEvtHandler.bind(this)}
                      color={this.props.color}
                      comparisionField={this.props.comparisionField}
                      dataset={this.props.dataset}
            />
          </div>
      );
  }
}