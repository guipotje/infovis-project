 
 var brush;

 function correlation_graph(points){
 
 d3.select("#graph_correlation").remove(); //clean old svg
    // set the dimensions and margins of the graph
  var margin = {top: 40, right: 30, bottom: 30, left: 70},
  width = document.getElementById("control_panel").offsetWidth*0.7 - margin.left - margin.right,
  height = (width+50) - margin.top - margin.bottom;

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
 
  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
      

      d3.select(this).transition()
      .duration('100')
      .attr("r", 5)
  }
  var mousemove = function(d) {
    var nn = d.nn;
    var nn2 = d.nn2;
    var ratio = d.ratio;
    var x = d3.event.pageX 
    var y = d3.event.pageY
    if(nn == null) nn = 0, nn2 = 0, ratio=0;
    Tooltip
      .html(
            "NN: " + nn.toFixed(2).toString() + "&nbsp; 2nd-NN: " + nn2.toFixed(2).toString()  +
            "<br> NN-ratio: " + ratio.toFixed(2).toString() + "<br> Click & Drag to select" )
      .style("left", (x-250) + "px")
      .style("top", (y-80) + "px")
      .style("z-index","4");

  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
      .style("top","2px")
      .style("left", "2px")
      .style("z-index","-1");

      d3.select(this).transition()
      .duration('200')
      .attr("r", 2)
  }

    // Add brushing
     brush = d3.brush()                     // Add the brush feature using the d3.brush function
    .extent( [ [0,0], [width,height+3] ] )
    .on("start brush", brushed)       // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
    //.on("brushend", () => {d3.selectAll(".c_scatter").style("visibility","visible")});

  
  
    svg.append("g")
    .attr("class", "brush")
    .call(brush)
    //.call(g => g.select(".overlay"))
    //.datum({type: "selection"})
    

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(points)
    .enter()
    .append("circle")
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .attr("cx", function (d) { return x(d.nn); } )
    .attr("cy", function (d) { return y(d.ratio); } )
    .attr("r", 2)
    .attr("fill", "rgb(185, 0, 0)")

  // new X axis
  x.domain([x_min, x_max])
  svg.select(".myXaxis")
    .transition()
    .duration(800)
    .attr("opacity", "1")
    .call(d3.axisBottom(x).ticks(7))


  circle = svg.selectAll("circle")
    .attr("class", "c_correlation")
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



  function brushed() 
  {
    selection = d3.event.selection;

    if(selection == null)
    {
      d3.selectAll(".c_scatter")
      .style("visibility", "visible")
      return;
    }


    const [[x0, y0], [x1, y1]] = selection;
    //console.log(x0, y0)

    function filter_brush(d){
      return x(d.nn) > x0  && x(d.nn) < x1 &&
              y(d.ratio) > y0 && y(d.ratio) < y1;
    }

    d3.selectAll(".hist_rect")
        .style("fill", "rgb(40, 0, 200)")
        .style("stroke", "none")
        .style("stroke-width", "0px")
        .attr("clicked", "false")

    if(x0===x1)
    {
      d3.selectAll(".c_scatter")
      .style("visibility", "visible")

      d3.selectAll(".c_correlation")
      .style("fill", "rgb(185, 0, 0)")
    }

    else{
        d3.selectAll(".c_scatter")
        .style("visibility", "hidden")

        d3.selectAll(".c_scatter")
        .filter(filter_brush)
        .style("visibility","visible")

        d3.selectAll(".c_correlation")
          .style("fill", "rgb(185, 0, 0)")

        d3.selectAll(".c_correlation")
          .filter(filter_brush)
          .style("fill","orange")
    }


       
  }


 }