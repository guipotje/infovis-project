 
 
 function correlation_graph(){
 
 d3.select("#graph_correlation").remove(); //clean old svg
    // set the dimensions and margins of the graph
  var margin = {top: 40, right: 30, bottom: 30, left: 70},
  width = document.getElementById("control_panel").offsetWidth*0.7 - margin.left - margin.right,
  height = width - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#correlation")
      .append("svg")
        .attr("id","graph_correlation")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")")

//Read the data
d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

  // Add X axis
  var x = d3.scaleLinear()
    .domain([0, 0])
    .range([ 0, width ]);
  svg.append("g")
    .attr("class", "myXaxis")   // Note that here we give a class to the X axis, to be able to call it later and modify it
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .attr("opacity", "0")

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 500000])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.GrLivArea); } )
      .attr("cy", function (d) { return y(d.SalePrice); } )
      .attr("r", 1.5)
      .style("fill", "rgb(40, 0, 200)")

  // new X axis
  x.domain([0, 4000])
  svg.select(".myXaxis")
    .transition()
    .duration(800)
    .attr("opacity", "1")
    .call(d3.axisBottom(x));

  svg.selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*0.6)})
    .duration(800)
    .attr("cx", function (d) { return x(d.GrLivArea); } )
    .attr("cy", function (d) { return y(d.SalePrice); } )
})


 }