 
 
 function correlation_graph(points){
 
 d3.select("#graph_correlation").remove(); //clean old svg
    // set the dimensions and margins of the graph
  var margin = {top: 40, right: 30, bottom: 30, left: 70},
  width = document.getElementById("control_panel").offsetWidth*0.7 - margin.left - margin.right,
  height = width - margin.top - margin.bottom + margin.left;

    // append the svg object to the body of the page
    var svg = d3.select("#correlation")
      .append("svg")
        .attr("id","graph_correlation")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")")


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

  var x_min = d3.min(points, function(d) { return d.nn; })
    x_min = x_min - x_min*0.08;
  var x_max = d3.max(points, function(d) {return d.nn; })
    x_max = x_max + x_max*0.08;
  var y_min = d3.min(points, function(d) { return d.ratio; })
    y_min = y_min - y_min*0.03;
  var y_max = d3.max(points, function(d) {return d.ratio; })
    y_max = y_max + y_max*0.03;

  var y = d3.scaleLinear()
    .domain([y_min, y_max])
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(points)
    .enter()
    .append("circle")
      .attr("cx", function (d) { return x(d.nn); } )
      .attr("cy", function (d) { return y(d.ratio); } )
      .attr("r", 2)
      .style("fill", "rgb(185, 0, 0)")

  // new X axis
  x.domain([x_min, x_max])
  svg.select(".myXaxis")
    .transition()
    .duration(800)
    .attr("opacity", "1")
    .call(d3.axisBottom(x).ticks(7))

  svg.selectAll("circle")
    .transition()
    .delay(function(d,i){return(i*0.6)})
    .duration(800)
    .attr("cx", function (d) { return x(d.nn); } )
    .attr("cy", function (d) { return y(d.ratio); } )

      //Title
      svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2 - 14))
      .attr("text-anchor", "middle")  
      .style("font-size", "14px")  
      .text("Scatter plot of NN-ratio vs NN distances");
  
    // text label for the x axis
    svg.append("text")             
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.bottom) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "12px")  
        .text("Distances");
  
        // text label for the y axis
      svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 15)
      .attr("x",0 - (height / 2 ))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")  
      .text("NN-ratio");  

 }