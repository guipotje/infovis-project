function plot_histogram(dists){

    d3.select("#graph_svg").remove(); //clean old svg
      // set the dimensions and margins of the graph
    var margin = {top: 40, right: 30, bottom: 30, left: 50},
    width = document.getElementById("control_panel").offsetWidth*0.7 - margin.left - margin.right,
    height = width - margin.top - margin.bottom;
  
    // append the svg object to the body of the page
    var svg = d3.select("#graph")
    .append("svg")
    .attr("id","graph_svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
  
    // X axis: scale and draw:
    var x = d3.scaleLinear()
      .domain([data.dist_mat.min - 0.05*data.dist_mat.min , data.dist_mat.max + 0.05 * data.dist_mat.max])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
      //.domain([0,100])
      .range([0, width]);
    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).ticks(7));
  
      //Title
      svg.append("text")
      .attr("x", (width / 2))             
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")  
      .style("font-size", "14px")  
      .text("Histogram of NN distances");
  
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
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size", "12px")  
      .text("Frequency");  
  
    // Y axis: initialization
    var y = d3.scaleLinear()
      .range([height, 0]);
    var yAxis = svg.append("g")
  
  
  
    // A function that builds the graph for a specific value of bin
    function update(nBins) {
  
    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d) {
      Tooltip
        .style("opacity", 1);
  
        d3.select(this)
        .style("fill", "dimgray")
        .style("stroke", "black")
        .style("stroke-width", "2px")
    }
    var mousemove = function(d) {
      var x = d3.event.pageX //- document.getElementById("graph").getBoundingClientRect().x + 10
      var y = d3.event.pageY //-  document.getElementById("graph").getBoundingClientRect().y + 10
      Tooltip
        .html("Frequency: " + d.length + "<br> Click to filter")
        .style("left", (x-160) + "px")
        .style("top", (y-55) + "px")
        .style("z-index","4");
  
    }
    var mouseleave = function(d) {
      Tooltip
        .style("opacity", 0)
        .style("top","2px")
        .style("left", "2px")
        .style("z-index","-1");
        
        d3.select(this)
        .style("fill", "rgb(40, 0, 200)")
        .style("stroke", "none")
        .style("stroke-width", "0px")
  
    }
  
    var histogram_filter = function(d){
      var min_v = d3.min(d)
      var max_v = d3.max(d)

      //console.log(d, min_v, max_v)
      d3.selectAll("circle")
      .style("visibility", "visible");

      d3.selectAll(".c_scatter")
      .filter(function(c) {
        return c.nn < min_v || c.nn > max_v;
      })
      .style("visibility", "hidden");

    }
  
    // set the parameters for the histogram
    var histogram = d3.histogram()
        .value(function(d) { return d; })   // I need to give the vector of value
        .domain(x.domain())  // then the domain of the graphic
        .thresholds(x.ticks(nBins)); // then the numbers of bins
  
    // And apply this function to data to get the bins
    var bins = histogram(dists);
    //console.log(x.ticks(nBins))
    //console.log(nBins)
  
  
    // Y axis: update now that we know the domain
    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
    yAxis
        .transition()
        .duration(1000)
        .call(d3.axisLeft(y));
  
    // Join the rect with the bins data
    var u = svg.selectAll("rect")
        .data(bins)
  
    // Manage the existing bars and eventually the new ones:
    u
        .enter()
        .append("rect") // Add a new rect for each new elements
        .merge(u) // get the already existing elements as well
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", histogram_filter)
        .transition() // and apply changes to all of them
        .duration(1000)
          .attr("x", 1)
          .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
          .attr("width", function(d) { return x(d.x1) - x(d.x0) -2 ; })
          .attr("height", function(d) { return height - y(d.length); })
          .style("fill", "rgb(40, 0, 200)")
  
  
    // If less bar in the new histogram, I delete the ones not in use anymore
    u
        .exit()
        .remove()
  
    }
  
    var binMap = [3, 8, 16, 32, 64, 96];
    update(binMap[document.getElementById("nBin").value])
  
    // Listen to the button -> update if user change it
    d3.select("#nBin").on("input", function() {
    update(binMap[this.value]);
    });
  
  
  }