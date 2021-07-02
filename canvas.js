// https://github.com/lemerodrigo/canvas-tutorial
// https://www.youtube.com/watch?v=3GqUM4mEYKA

// http://bl.ocks.org/ludwigschubert/0a300d8a41d9e6b49144fff8b62637f8

// scale canvas
// https://jsfiddle.net/u5ogmh9a/

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
var scale, s1, s2;

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
    var max_width = window.innerWidth * 2/3 -1;
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

function load_data(){
    img_ref.src = document.getElementById("f1").value;
    img_tgt.src = document.getElementById("f2").value;
    var path_kps_ref = document.getElementById("f3").value;
    var path_kps_tgt = document.getElementById("f3").value;

    Papa.parse(path_kps_ref, {
        download: true,
        complete: function(results) {
            console.log(results);
        }
    });

    resize_canvas();
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

var img_ref = new Image();
var img_tgt = new Image();

img_ref.onload = function() {resize_canvas(); };
img_tgt.onload = function() {resize_canvas(); };

//document.getElementById('text1').style.visibility='hidden';

// Main code
window.addEventListener("load", () => {

    canvas.height = '40';
    canvas.width = window.innerWidth * 0.666666 -1;
    canvas.addEventListener("mousedown", draw);
    window.addEventListener('resize', resize_canvas);
    document.getElementById('local_rd').click();

    //document.getElementById("f1").addEventListener('change', (e) => { console.log( e.target.files[0] )}, false);
     
    //img.src = 'https://raw.githubusercontent.com/verlab/GeobitNonrigidDescriptor_ICCV_2019/master/images/geobit_match_example.png';
    canvas.addEventListener("mousemove", updatecoords);

});


