
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

// create a tooltip
var Tooltip = d3.select("#div_label")
  .append("div")
  .attr("class", "tooltip")

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
    var max_width = document.getElementById("div_loader").offsetWidth;
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
        if (data.kps_ref != null && data.kps_tgt != null && data.dist_mat != null)
        {
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
}

function parse_dist_matrix()
{
    dist_mat = data.dist_mat.data[1];
    M = data.dist_mat.data[0][0];
    N =  data.dist_mat.data[0][1];
    mat_array = new Array(M);
    mat_array2 = new Array(M);

    for(let i = 0; i < M; i++)
    {
        let row = new Array(N);
        let row2 = new Array(N);
        for(let j = 0 ; j < N; j++)
        {
            row[j] = dist_mat[i * N + j];
            row2[j] = dist_mat[i * N + j];
        }

        mat_array[i] = row;
        mat_array2[i] = row2;
    }

    data.dist_mat.mat = mat_array;
    data.dist_mat.mins = mat_array.map(x => Math.min(... x));
    data.dist_mat.arg_mins = mat_array.map(x => x.indexOf(Math.min(... x)));
    data.dist_mat.min = Math.min(... data.dist_mat.mins);
    data.dist_mat.max = Math.max(... data.dist_mat.mins);

    for(let i=0; i < data.dist_mat.mins.length; i++)
        mat_array2[i][data.dist_mat.arg_mins[i]] = 99999;
    data.dist_mat.mins2 = mat_array2.map(x => Math.min(... x));    

    //fill keypoint attributes
    for(let i=0; i < data.dist_mat.mins.length; i++){
        data.kps_ref.data[i].nn = data.dist_mat.mins[i];
        data.kps_ref.data[i].nn2 = data.dist_mat.mins2[i];
        data.kps_ref.data[i].ratio = data.kps_ref.data[i].nn / data.kps_ref.data[i].nn2 ;
        data.kps_tgt.data[data.dist_mat.arg_mins[i]].nn = data.dist_mat.mins[i];
        data.kps_tgt.data[data.dist_mat.arg_mins[i]].nn2 = data.dist_mat.mins2[i];
        data.kps_tgt.data[data.dist_mat.arg_mins[i]].ratio = data.kps_tgt.data[data.dist_mat.arg_mins[i]].nn /  data.kps_tgt.data[data.dist_mat.arg_mins[i]].nn2;


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
    resize_canvas();
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
            kps_tgt = parseCSV(path_dist_mat, "remote", "dist_mat");        
        }

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
    resize_canvas();
}

function draw() //function that manages all plots
{
    resize_canvas();
    document.getElementById('hideKps').checked = false;

    if (data.kps_ref != null && data.kps_tgt != null && data.dist_mat != null)
    {
      draw_keypoints();
      plot_histogram(data.dist_mat.mins);
      correlation_graph(data.kps_ref.data);
    }
}

function show_hide_kps(e){

    if(e.checked){
        d3.selectAll("circle[cr_cx]")
   	        .style("visibility", "hidden");
    }
    else{
        d3.selectAll("circle[cr_cx]")
            .style("visibility", "visible");       
    } 
}

function attention_check(e){

    if(e.checked){
        document.getElementById('attRange').disabled = false;
    }
    else{
        document.getElementById('attRange').disabled = true;     
    } 
}

function update_sample(v)
{
    var dist_mat_dict = 
        {
            1: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master__cloud_4__GEOBIT.dist",
            2: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master__cloud_4__DEAL.dist",
            3: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master__cloud_4__TFEAT.dist",
            4: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master__cloud_4__SIFT.dist",
            5: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master__cloud_12__GEOBIT.dist",
            6: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master__cloud_12__DEAL.dist",
            7: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master__cloud_12__TFEAT.dist",
            8: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master__cloud_12__SIFT.dist"
        }

    var ref_data_dict =
        {
            1: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master",
            2: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master",
            3: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master",
            4: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_master",
            5: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master",
            6: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master",
            7: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master",
            8: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_master"
        }
    var tgt_data_dict =
        {
            1: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_4",
            2: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_4",
            3: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_4",
            4: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/bag/cloud_4",
            5: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_12",
            6: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_12",
            7: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_12",
            8: "https://raw.githubusercontent.com/guipotje/infovis-project/main/sample/blanket/cloud_12"
        }



        document.getElementById("f5").value = dist_mat_dict[v] 
        document.getElementById("f1").value = ref_data_dict[v] + "-rgb.png"
        document.getElementById("f2").value = tgt_data_dict[v] + "-rgb.png"
        document.getElementById("f3").value = ref_data_dict[v] + ".sift"
        document.getElementById("f4").value = tgt_data_dict[v] + ".sift"
    

    document.getElementById('btnLoad').click();
}

function toolbox_attention(){
    var x = d3.event.pageX //- document.getElementById("graph").getBoundingClientRect().x + 10
    var y = d3.event.pageY //-  document.getElementById("graph").getBoundingClientRect().y + 10
    Tooltip
      .html(" <h3> Keypoint Attention: </h3>"
            + " <br> " + "If you enable attention, keypoints will "
            + " <br> " + "match all others in the other image, how- "
            + " <br> " + "ever, similarity will be encoded by alpha "
            + " <br> " + "values, i.e., most similar keypoints will "
            + " <br> " + "have stronger edges, and less similar ones"
            + " <br> " + "will fade away. The user can control the "
            + " <br> " + "alpha decay by sliding the controller on the"
            + " <br> " + "right. The decay is implemented by increas- "
            + " <br> " + "ing the exponent of the decay function.")
      .style("left", (x+15) + "px")
      .style("top", (y+15) + "px")
      .style("z-index","4");
}

function attention_mouseover(){
    Tooltip
    .style("opacity", 1);
}

function attention_mouseleave(){
    Tooltip
    .style("opacity", 0)
    .style("top","2px")
    .style("left", "2px")
    .style("z-index","-1")
}

//document.getElementById('text1').style.visibility='hidden';

// Main code
window.addEventListener("load", () => {

    canvas.height = '1';
    canvas.width = window.innerWidth * 0.6661;
    svg_canvas.width = canvas.width = window.innerWidth * 0.6661; 
    svg_canvas.height=1;

    //canvas.addEventListener("mousedown", draw_click);
    window.addEventListener('resize', draw);
    document.getElementById('url_rd').click();
    document.getElementById('btnLoad').click();
    document.getElementById('hideKps').checked = false;
    document.getElementById('attMap').checked = false;
    document.getElementById('attRange').disabled = true;

    d3.select("#attRange").on("input", function() {
        update_alpha();
    });

    d3.select("#attMap")
        .on("mousemove", toolbox_attention)
        .on("mouseover", attention_mouseover)
        .on("mouseleave", attention_mouseleave)

    logger.reset();
    logger.log("To load sample data, just click the load button.");
    logger.log("To view the CSV specification so you can load your own matches, click the \"CSV Specs.\" button.");
    logger.log("You can load from remote URL, e.g, a link from github or load from local files.");

    //var sensor = new ResizeObserver(function(){resize_canvas();}).observe(document.getElementById('div_loader'));
    

    //document.getElementById("f1").addEventListener('change', (e) => { console.log( e.target.files[0] )}, false);
     
    //img.src = 'https://raw.githubusercontent.com/verlab/GeobitNonrigidDescriptor_ICCV_2019/master/images/geobit_match_example.png';
    //canvas.addEventListener("mousemove", updatecoords);

});
