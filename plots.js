

function scatter(data)
{
    console.log(s1);
    d3.select("svg").remove();

    var x = d3.scaleLinear()
    .domain([0, img_ref.width])
    .range([ 0, canvas.width/2.0 ]);
    
    var y = d3.scaleLinear()
    .domain([0, img_ref.height])
    .range([ 0, canvas.height ]);

    var svg = d3.select("#svg_canvas")
    .append("svg")
      .attr("width", canvas.width)
      .attr("height",canvas.height)
    .append("g")
      .attr("transform",
            "translate(" + 1 + "," + 1 + ")");


    // create a tooltip
    var Tooltip = d3.select("#div_label")
      .append("div")
      .attr("class", "tooltip")

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1)
      }
      var mousemove = function(d) {
        Tooltip
          .html("x: " + d.x.toString() + " y: " + d.y.toString() + " size: "+ d.size.toString() + " angle: "+ d.angle.toString())
          .style("left", (d3.mouse(this)[0]+5) + "px")
          .style("top", (d3.mouse(this)[1]-35) + "px")
      }
      var mouseleave = function(d) {
        Tooltip
          .style("opacity", 0)
          .style("top","0px")
          .style("left", "0px")
      }

    // Add the points
    svg
      .append("g")
      .selectAll("dot")
      .data(data)
      .enter()
      .append("circle")
        .attr("class", "myCircle")
        .attr("cx", function(d) { return x(d.x)} )
        .attr("cy", function(d) { return y(d.y)} )
        .attr("r", 4)
        .attr("stroke", "rgb(175, 0, 0)")
        .attr("stroke-width", 1.5)
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

}


function draw()
{
    resize_canvas();
    scatter(data.kps_ref.data);

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