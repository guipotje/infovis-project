
// https://github.com/lemerodrigo/canvas-tutorial
// https://www.youtube.com/watch?v=3GqUM4mEYKA

// D3js nice kd-tree example
// http://bl.ocks.org/ludwigschubert/0a300d8a41d9e6b49144fff8b62637f8

// scale canvas
// https://jsfiddle.net/u5ogmh9a/
// https://stackoverflow.com/questions/3420975/html5-canvas-zooming


////////////////////////////////// BEGIN GLOBAL DECLARATIONS //////////////////////////////////
const canvas = document.getElementById("canvas");
const svg_canvas = document.getElementById("svg_canvas");

const ctx = canvas.getContext("2d");
var scale, s1, s2;
var path_kps_ref, path_kps_tgt, path_dist_mat;
var data = {   
            kps_ref: null,
            kps_tgt: null,
            dist_mat: null
        };

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

var img_ref = new Image();
var img_tgt = new Image();

img_ref.onload = function() {resize_canvas(); };
img_tgt.onload = function() {resize_canvas(); };

var logger = new myLogger();
////////////////////////////////// END GLOBAL DECLARATIONS //////////////////////////////////


function getScale(elem) {
    var off_w = elem.offsetHeight === 0 ? 0 : (elem.height / elem.offsetHeight);
    var off_h = elem.offsetWidth === 0 ? 0 : (elem.width / elem.offsetWidth);
    return  {x:off_w, y:off_h};
}


function updatecoords(e){   
    document.getElementById("mouse_coords").innerHTML = e.clientX.toString() + " &nbsp; " + e.clientY.toString();
}

function resize_canvas(){
    var max_width = document.body.clientWidth * 2/3.0;
    canvas.width = max_width;
    svg_canvas.width = max_width;
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

        //update keypoint coordinates
        for(let i=0; i < data.kps_ref.data.length ; i++){
            data.kps_ref.data[i].sx = data.kps_ref.data[i].x / s1;
            data.kps_ref.data[i].sy = data.kps_ref.data[i].y / s1; 
        }
        for(let i=0; i < data.kps_tgt.data.length ; i++){
            data.kps_tgt.data[i].sx = data.kps_tgt.data[i].x / s2 + canvas.width / 2.0;
            data.kps_tgt.data[i].sy = data.kps_tgt.data[i].y / s2; 
        }      
    }
}

function parse_dist_matrix()
{
    dist_mat = data.dist_mat.data[1];
    M = data.dist_mat.data[0][0];
    N =  data.dist_mat.data[0][1];
    mat_array = new Array(M);

    for(let i = 0; i < M; i++)
    {
        let row = new Array(N);
        for(let j = 0 ; j < N; j++)
            row[j] = dist_mat[i * N + j];

        mat_array[i] = row;
    }

    data.dist_mat.mat = mat_array;
    data.dist_mat.mins = mat_array.map(x => Math.min(... x));
    data.dist_mat.arg_mins = mat_array.map(x => x.indexOf(Math.min(... x)));
    data.dist_mat.min = Math.min(... data.dist_mat.mins);
    data.dist_mat.max = Math.max(... data.dist_mat.mins);

    //keypoint match confidences
    for(let i=0; i < data.dist_mat.mins.length; i++){
        data.kps_ref.data[i].confidence = data.dist_mat.mins[i];
        data.kps_tgt.data[data.dist_mat.arg_mins[i]].confidence = data.dist_mat.mins[i];
    }
    
    var inv_argmins = new Array(data.dist_mat.arg_mins.length);
    for(let i=0 ; i < inv_argmins.length; i++){
        inv_argmins[data.dist_mat.arg_mins[i]] = i;
    }
    
    data.dist_mat.inv_argmins = inv_argmins;
    data.kps_ref.argmins = data.dist_mat.arg_mins;
    data.kps_tgt.argmins = data.dist_mat.inv_argmins;
}

function parseCSV(csv, mode, key)
{
    var download = true, delimiter = ', ', header = true;
    if(mode == "local")
        download = false;
    if(key=='dist_mat')
    {
        delimiter = ' ';
        header = false;
    }

    Papa.parse(csv, {
        skipEmptyLines: true,
        header: header,
        download: download,
        dynamicTyping: true,
        delimiter: delimiter,
        complete: function(results) {
            data[key] = results;
            if(data.dist_mat != null && data.kps_ref!=null && data.kps_tgt != null) // if completed loading all data
                onDataLoaded();
        }
    });   
}

function onDataLoaded(){

    parse_dist_matrix();
    draw();

}

function load_data(){
    logger.log("Loading data...");

    data = {   
        kps_ref: null,
        kps_tgt: null,
        dist_mat: null
    };

    try{

        const isLocal = document.getElementById('local_rd').checked;
        
        if(isLocal)
        {
            path_kps_ref = document.getElementById("f3l").files[0];
            path_kps_tgt = document.getElementById("f4l").files[0];
            path_dist_mat = document.getElementById("f5l").files[0];

            // load images
            var fr1 = new FileReader(), fr2 = new FileReader();
            fr1.onload = function () { img_ref.src = fr1.result; }
            fr2.onload = function () { img_tgt.src = fr2.result; }
            fr1.readAsDataURL(document.getElementById("f1l").files[0]);
            fr2.readAsDataURL(document.getElementById("f2l").files[0]);

            // load csv files
            kps_ref = parseCSV(path_kps_ref, "local", "kps_ref");
            kps_tgt = parseCSV(path_kps_tgt, "local", "kps_tgt");
            kps_tgt = parseCSV(path_dist_mat, "local", "dist_mat");

        }
        else // Remote files
        {
            //load images
            img_ref.src = document.getElementById("f1").value;
            img_tgt.src = document.getElementById("f2").value;

            path_kps_ref = document.getElementById("f3").value;
            path_kps_tgt = document.getElementById("f4").value;
            path_dist_mat = document.getElementById("f5").value;  
            
            //load csv files
            kps_ref = parseCSV(path_kps_ref, "remote", "kps_ref");
            kps_tgt = parseCSV(path_kps_tgt, "remote", "kps_tgt");           
        }

        resize_canvas();
        if (img_ref.src == null || img_tgt.src==null || path_kps_ref==null || path_kps_tgt == null || path_dist_mat == null)
        {
            throw "Invalid data! Please check the paths."
        }

        logger.log("Done!");
    }
    catch(err) {
        logger.log( "Error: " + err);
    }


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
    logger.log('---------example----------');
    logger.log("x ; y ; size ; angle");
    logger.log("100.3 ; 127.2 ; 1.7 ; 128");
    logger.log("50.7 ; 17.3 ; 1.1 ; 82");
    logger.log('--------------------------');

    logger.log("");
    logger.log("Distance matrix specification:");
    logger.log("The first line contains two numbers M and N, where");
    logger.log("  M = number of keypoints in reference image, and N = number of keypoints in target image.");
    logger.log("The following line contains the linearized distance matrix, where every N elements compose a row");
    logger.log("Example of a valid dist_mat: ");
    logger.log('--------example---------');
    logger.log("3 2");
    logger.log("1.0 1.2 0.7 0.3 0.5 1.0 ");
    logger.log('------------------------');
}


//document.getElementById('text1').style.visibility='hidden';

// Main code
window.addEventListener("load", () => {

    canvas.height = '1';
    canvas.width = window.innerWidth * 0.666666;
    svg_canvas.width = canvas.width = window.innerWidth * 0.666666; 
    svg_canvas.height=1;

    canvas.addEventListener("mousedown", draw_click);
    window.addEventListener('resize', draw);
    document.getElementById('url_rd').click();
    logger.reset();
    logger.log("To load sample data, just click the load button.");
    logger.log("To view the CSV specification so you can load your own matches, click the \"CSV Specs.\" button.");
    logger.log("You can load from remote URL, e.g, a link from github or load from local files.");
    

    //document.getElementById("f1").addEventListener('change', (e) => { console.log( e.target.files[0] )}, false);
     
    //img.src = 'https://raw.githubusercontent.com/verlab/GeobitNonrigidDescriptor_ICCV_2019/master/images/geobit_match_example.png';
    //canvas.addEventListener("mousemove", updatecoords);

});
