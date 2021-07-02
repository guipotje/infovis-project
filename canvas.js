// https://github.com/lemerodrigo/canvas-tutorial
// https://www.youtube.com/watch?v=3GqUM4mEYKA

// D3js nice kd-tree example
// http://bl.ocks.org/ludwigschubert/0a300d8a41d9e6b49144fff8b62637f8

// scale canvas
// https://jsfiddle.net/u5ogmh9a/
// https://stackoverflow.com/questions/3420975/html5-canvas-zooming

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
var scale, s1, s2;
var path_kps_ref, path_kps_tgt, path_dist_mat;

class myLogger{
    constructor() {
        this.txtbox = document.getElementById('logger');
        this.txtbox.style.height = "90px";
      }

    autoscroll(){
       this.txtbox.scrollTop = this.txtbox.scrollHeight; 
    }

     log(txt){
         this.txtbox.value+= txt + "\n";
         this.autoscroll();
     }

     reset(){
         this.txtbox.value="Welcome to Match Viz! Please load your data. \n";
     }
     
}

var logger = new myLogger();

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

function getScale(elem) {
    var off_w = elem.offsetHeight === 0 ? 0 : (elem.height / elem.offsetHeight);
    var off_h = elem.offsetWidth === 0 ? 0 : (elem.width / elem.offsetWidth);
    return  {x:off_w, y:off_h};
}

function draw(e){
    var color = document.getElementById("linec").value;
    color = hexToRGB(color, 0.5);
    var s = {x:1,y:1}; //getScale(canvas);
    var p = {x: e.clientX *s.x, y: e.clientY*s.y};
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(p.x -2 , p.y -2, 5, 0, Math.PI * 2);
    ctx.fill();
}

function updatecoords(e){   
    document.getElementById("mouse_coords").innerHTML = e.clientX.toString() + " " + e.clientY.toString();
}

function resize_canvas(){
    var max_width = document.body.clientWidth * 2/3.0;
    canvas.width = max_width;
    if(img_ref.width > 0 && img_tgt.width > 0)
    {
        s1 = (img_ref.width) / max_width * 2;
        s2 = (img_tgt.width) / max_width * 2;
        var nh_ref = img_ref.height / s1;
        var nh_tgt = img_tgt.height / s2;
        new_h = Math.max(nh_ref, nh_tgt);

        //Resize canvas
        canvas.height = new_h;
        ctx.drawImage(img_ref, 0, 0, max_width*0.5-1, nh_ref);
        ctx.drawImage(img_tgt, max_width*0.5, 0, max_width*0.5+1, nh_tgt);
    }
}

function parseCSV(csv, isLocal){
    var csv;

    if(isLocal)
    {
        Papa.parse(path_kps_ref, {
            complete: function(results) {
                console.log(results);
            }
        });
    }
    else{
        Papa.parse(path_kps_ref, {
            download: true,
            complete: function(results) {
                csv = results;
            }
        });   
    }

    return csv;
}

function load_data(){
    logger.log("Loading data...");

    try{

        const isLocal = document.getElementById('local_rd').checked;
        
        if(isLocal)
        {
            img_ref.src = document.getElementById("f1l").files[0];
            img_tgt.src = document.getElementById("f2l").files[0];
            path_kps_ref = document.getElementById("f3l").files[0];
            path_kps_tgt = document.getElementById("f4l").files[0];
            path_dist_mat = document.getElementById("f5l").files[0];
        }
        else
        {
            img_ref.src = document.getElementById("f1").value;
            img_tgt.src = document.getElementById("f2").value;
            path_kps_ref = document.getElementById("f3").value;
            path_kps_tgt = document.getElementById("f4").value;
            path_dist_mat = document.getElementById("f5").value;       
        }

        resize_canvas();
    }
    catch(err) {
        logger.log( "Error: " + err.message);
    }
    logger.log("Done!");
}

function check_radiobuttons(b){
    if(b.id == "local_rd")
    {
        document.getElementById('table_url').style.visibility='hidden';
        document.getElementById('table_local').style.visibility='visible';
    }
    else if(b.id=="url_rd")
    {
        document.getElementById('table_url').style.visibility='visible';
        document.getElementById('table_local').style.visibility='hidden';
    }
}


function show_csv_info()
{
    logger.txtbox.style.height = "420px";
    logger.log("");
    logger.log("KeyPoints CSV specification:");
    logger.log("Each line contains a keypoint in the form");
    logger.log("x ; y ; size ; angle");
    logger.log("Example of a valid CSV with 2 keypoints:");
    logger.log("x ; y ; size ; angle");
    logger.log("100.3 ; 127.2 ; 1.7 ; 128");
    logger.log("50.7 ; 17.3 ; 1.1 ; 82");

    logger.log("");
    logger.log("Distance matrix specification:");
    logger.log("Each line contains a keypoint in the form");
    logger.log("x ; y ; size ; angle");
    logger.log("Example of a valid CSV with 2 keypoints:");
    logger.log("x ; y ; size ; angle");
    logger.log("100.3 ; 127.2 ; 1.7 ; 128");
    logger.log("50.7 ; 17.3 ; 1.1 ; 82");
}

var img_ref = new Image();
var img_tgt = new Image();

img_ref.onload = function() {resize_canvas(); };
img_tgt.onload = function() {resize_canvas(); };

//document.getElementById('text1').style.visibility='hidden';

// Main code
window.addEventListener("load", () => {

    canvas.height = '40';
    canvas.width = window.innerWidth * 0.666666;
    canvas.addEventListener("mousedown", draw);
    window.addEventListener('resize', resize_canvas);
    document.getElementById('local_rd').click();
    logger.reset();
    logger.log("To load sample data, just click the load button.");
    logger.log("To view the CSV specification so you can load your own matches, click the \"CSV Specs.\" button.");
    logger.log("You can load from remote URL, e.g, a link from github or load from local files.");
    

    //document.getElementById("f1").addEventListener('change', (e) => { console.log( e.target.files[0] )}, false);
     
    //img.src = 'https://raw.githubusercontent.com/verlab/GeobitNonrigidDescriptor_ICCV_2019/master/images/geobit_match_example.png';
    canvas.addEventListener("mousemove", updatecoords);

});
