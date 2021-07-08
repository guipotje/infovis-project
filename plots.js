

function colorbar(svg)
{
  var myColor = d3.scaleSequential()
  .interpolator(d3.interpolatePlasma)
  .domain([0,1]);

      var grad = svg.append('defs')
        .append('linearGradient')
        .attr('id', 'grad')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');
      
    //Append multiple color stops by using D3's data/enter step

    var color_array = [];
    for(let i=0; i < 11 ; i++){
      
      let obj = {};
      obj["offset"] = i*10+"%";
      obj["color"] = myColor(i/10.);
      color_array.push(obj);
    }
  
    grad.selectAll("stop")
        .data(color_array)
        .enter().append("stop")
        .attr("offset", function(d) { return d.offset; })
        .attr("stop-color", function(d) { return d.color; });
      
      svg.append('rect')
        .attr('x', 5)
        .attr('y', 5)
        .attr('width', 330)
        .attr('height', 16)
        .style('fill', 'url(#grad)');

    // Add the blue line title

      svg.append("text")
      .attr("x", 10)             
      .attr("y", 18)
      .style("font-size", "14px")
      .style("font-family", "Courier New")
      .attr("class", "legend")
      .style("fill", "white")   
      .text("weak match");

      svg.append("text")
      .attr("x", 230)             
      .attr("y", 18)
      .style("font-size", "14px")
      .style("font-family", "Courier New")
      .attr("class", "legend")
      .style("fill", "black")   
      .text("strong match");
      

}

function scatter(points, svg = null)
{
  var offset = 0;
  var from, to;

    if(svg == null){
      d3.select("svg").remove(); //clean old svg
      width = img_ref.width;
      height = img_ref.height;
      from = data.kps_ref;
      to = data.kps_tgt;
    }
    else{
      offset = canvas.width/2.0;
      width = img_tgt.width;
      height = img_tgt.height; 
      from = data.kps_tgt;
      to = data.kps_ref;
    }
     

    var x = d3.scaleLinear()
    .domain([0, width])
    .range([ offset, offset + canvas.width/2.0 ]);
    
    var y = d3.scaleLinear()
    .domain([0, height])
    .range([ 0, canvas.height ]);


  // Build color scale
    var myColor = d3.scaleSequential()
      .interpolator(d3.interpolatePlasma)
      .domain([data.dist_mat.max,data.dist_mat.min]);



    if(svg == null) 
    { 
      var svg = d3.select("#svg_canvas")
      .append("svg")
        .attr("width", canvas.width)
        .attr("height",canvas.height)
      .append("g")
        .attr("transform",
              "translate(" + 1 + "," + 1 + ")");
    }

    colorbar(svg, myColor); //draw colorbar

    // create a tooltip
    var Tooltip = d3.select("#div_label")
      .append("div")
      .attr("class", "tooltip")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1);

          d3.select(this).transition()
          .duration('100')
          .attr("r", 6);
      }
      var mousemove = function(d) {
        Tooltip
          .html("x: " + d.x.toString() + " y: " + d.y.toString() + " size: "+ d.size.toString() + " angle: "+ d.angle.toString())
          .style("left", (d3.mouse(this)[0]+5) + "px")
          .style("top", (d3.mouse(this)[1]-35) + "px")
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
          .attr("r", 3);
      }

      var keypoint_mouseclick = function(d){
        pt = d3.select(this);

        line = svg.append('line')
        .style("stroke", "red")
        .style("stroke-width", 2)
        .attr("x1", pt.attr("cx"))
        .attr("y1", pt.attr("cy"))
        .attr("x2", pt.attr("cx"))
        .attr("y2", pt.attr("cy"))
        .transition()
        .duration(1000)
        .attr("x2", pt.attr("cr_cx"))
        .attr("y2", pt.attr("cr_cy"));
              
      }

    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(points)
      .enter()
      .append("circle")
        .attr("class", "myCircle")
        .attr("cx", function(d) { return d.sx} )
        .attr("cy", function(d) { return d.sy} )
        .attr("r", 3)
        //.attr("stroke", "rgb(127, 127, 127)")
        //.attr("stroke-width", 1.5)
        .attr("cr_cx", function(d,i) { if(to.data[from.argmins[i]]) return to.data[from.argmins[i]].sx;  else return d.sx })
        .attr("cr_cy", function(d,i) { if(to.data[from.argmins[i]]) return to.data[from.argmins[i]].sy;  else return d.sy })
        .attr("fill", function(d) { return myColor(d.confidence)} )
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", keypoint_mouseclick);

    return svg;
}


function draw_keypoints()
{
  svg = scatter(data.kps_ref.data);
  scatter(data.kps_tgt.data, svg);
}

function draw()
{
    resize_canvas();
    draw_keypoints();
}


function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}

function draw_click(e){
    var color = document.getElementById("linec").value;
    color = hexToRGB(color, 0.5);
    var s = {x:1,y:1}; //getScale(canvas);
    var p = {x: e.clientX *s.x, y: e.clientY*s.y};
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p.x -2 , p.y -2, 5, 0, Math.PI * 2);
    ctx.fill();
}

