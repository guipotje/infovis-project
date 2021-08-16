function Turbo(t){ //turbo colormap
  {
    t = Math.max(0, Math.min(1, t));
    t = t*(0.97 - 0.03)+ 0.03;
    return "rgb("
        + Math.max(0, Math.min(255, Math.round(34.61 + t * (1172.33 - t * (10793.56 - t * (33300.12 - t * (38394.49 - t * 14825.05))))))) + ", "
        + Math.max(0, Math.min(255, Math.round(23.31 + t * (557.33 + t * (1225.33 - t * (3574.96 - t * (1073.77 + t * 707.56))))))) + ", "
        + Math.max(0, Math.min(255, Math.round(27.2 + t * (3211.1 - t * (15327.97 - t * (27814 - t * (22569.18 - t * 6838.66)))))))
        + ")";
  }
}

function colorbar(svg)
{
  var myColor = d3.scaleSequential()
  .interpolator(Turbo)
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
        .attr('y', 2)
        .attr('width', 330)
        .attr('height', 16)
        .style('fill', 'url(#grad)');

    // Add the blue line title

      svg.append("text")
      .attr("x", 10)             
      .attr("y", 14)
      .style("font-size", "14px")
      .style("font-family", "Courier New")
      .attr("class", "legend")
      .style("fill", "white")   
      .text("weak match");

      svg.append("text")
      .attr("x", 230)             
      .attr("y", 14)
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
      .interpolator(Turbo)
      .domain([data.dist_mat.max,data.dist_mat.min]);
    // var myColor = d3.scaleLinear()
    // .domain([data.dist_mat.max,data.dist_mat.min])
    // .range(["blue", "green"]); 
    var is_ref_img = (svg == null) ? true : false;

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


      colorbar(svg); //draw colorbar

      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        Tooltip
          .style("opacity", 1);

          d3.select(this).transition()
          .duration('100')
          .attr("r", 6)
          //.attr("fill", "white")
          //.style("stroke", "red")
          //.style("stroke-width", "2px")
      }
      var mousemove = function(d) {
        var nn = d.nn;
        var nn2 = d.nn2;
        var ratio = d.ratio;
        if(nn == null) nn = 0, nn2 = 0, ratio=0;
        Tooltip
          .html("x: " + d.x.toString() + "&nbsp; y: " + d.y.toString() +   //"<br>" + "size: "+ d.size.toString() + " angle: "+ d.angle.toString() + 
                                                                    "<br> 1st-NN: " + nn.toFixed(2).toString() + "&nbsp; 2nd-NN: " + nn2.toFixed(2).toString()  +
                                                                    "<br> NN-ratio: " + ratio.toFixed(2).toString() )
          .style("left", (d3.mouse(this)[0]+12) + "px")
          .style("top", (d3.mouse(this)[1]+20) + "px")
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

      function plot_line(x1,y1,x2,y2, color, alpha = 1, val=0){
          line = svg.append('line')
          .style("stroke-width", "4px")
          .style("stroke", 'rgba(0,0,0,' + alpha.toString() + ')') //document.getElementById("linec").value)
          .style("pointer-events", "none")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x1)
          .attr("y2", y1)
          .transition()
          .duration(1000)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr('val', val)
          .attr('rgba','rgba(0,0,0,')

          let rgba = color.replace(')', ", ").replace("rgb","rgba")
          color = color.replace(')', ", " + alpha.toString()+")").replace("rgb","rgba")
          //console.log(color)
          line = svg.append('line')
          .style("stroke-width", "2px")
          .style("stroke", color ) //document.getElementById("linec").value)
          .style("pointer-events", "none")
          .attr("x1", x1)
          .attr("y1", y1)
          .attr("x2", x1)
          .attr("y2", y1)
          .transition()
          .duration(1000)
          .attr("x2", x2)
          .attr("y2", y2)
          .attr("val", val)  
          .attr("rgba", rgba)
      }


      var keypoint_mouseclick = function(pt, d, idx, rightclick = false){
        d3.event.preventDefault();   
        let color = pt.attr("fill");

        if(document.getElementById('attMap').checked)
        {
          d3.selectAll("line").remove();
          //get distance matrix row
          let M = data.dist_mat.mat.length;
          let N = data.dist_mat.mat[0].length
          let w = document.getElementById('attRange').value

          if(pt.attr('is_ref_img')=== 'true')
          {
            let dists = new Array(N)
            for(let i=0; i < N; i++)
              dists[i] = data.dist_mat.mat[idx][i]; 
            let min = d3.min(dists);
            let max = d3.max(dists);
            let norm_dists = dists.map(x => 1. - (x-min)/(max - min));

            for(let i=0; i < N; i++)
            {
              let dist = norm_dists[i]
              let alpha = Math.exp(w * dist) / Math.exp(w);
              plot_line(pt.attr("cx"), pt.attr("cy"), data.kps_tgt.data[i].sx, data.kps_tgt.data[i].sy, color, alpha, dist)
            }
          }
          else
          { 
            let dists = new Array(M);
            for(let i=0; i < M; i++)
              dists[i] = data.dist_mat.mat[i][idx];    
            let min = d3.min(dists);
            let max = d3.max(dists);
            let norm_dists = dists.map(x => 1. - (x-min)/(max - min));
            for(let i=0; i < M; i++)
            {
              let dist = norm_dists[i]
              let alpha = Math.exp(w * dist) / Math.exp(w);
              plot_line(pt.attr("cx"), pt.attr("cy"), data.kps_ref.data[i].sx, data.kps_ref.data[i].sy, color, alpha, dist)

            }
          }

          d3.selectAll("circle").raise();
        }
        else
        {
          plot_line(pt.attr("cx"), pt.attr("cy"), pt.attr("cr_cx"), pt.attr("cr_cy"), color)
        }
              
      }

    // Add the points

 
    svg
      .append("g")
      .selectAll("dot")
      .data(points)
      .enter()
      .append("circle")
        .attr("class", "c_scatter")
        .attr("cx", function(d) { return d.sx} )
        .attr("cy", function(d) { return d.sy} )
        .attr("r", 3)
        .style("opacity", function(d){if(d.nn) return 1; else return 0.3;})
        .attr("cr_cx", function(d,i) { if(to.data[from.argmins[i]]) return to.data[from.argmins[i]].sx;  else return d.sx })
        .attr("cr_cy", function(d,i) { if(to.data[from.argmins[i]]) return to.data[from.argmins[i]].sy;  else return d.sy })
        .attr("fill", function(d) { if(d.nn) return myColor(d.nn); else return 'rgb(0,0,0)' })
        .attr("nn", function(d){return d.nn;})
        .attr("is_ref_img", is_ref_img)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
        .on("click", function(d,i){pt = d3.select(this); keypoint_mouseclick(pt, d, i)})
        .on("contextmenu",function(d,i){pt = d3.select(this); keypoint_mouseclick(pt, d, i, true)})


        return svg;
}


function draw_keypoints()
{
  svg = scatter(data.kps_ref.data); //left image
  scatter(data.kps_tgt.data, svg); // right image
}

function update_alpha()
{
  let w = document.getElementById('attRange').value

  d3.selectAll("line")
    .style("stroke", function(d){ 
                            pt = d3.select(this);
                            return pt.attr('rgba') + 
                            (Math.exp(pt.attr('val') * w) / Math.exp(w)).toString() 
                            + ")"
                          })
}
/*
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
*/
