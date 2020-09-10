var video = document.getElementById('video');
video.hidden = true;
var canvas=document.getElementById('canvas');
var labe =document.getElementById('labe');
var shaba =document.getElementById('shaba');
var w,h,leftPos;
var context=canvas.getContext('2d');
snap();

function openCamera() {
	resiz();
    var constraints = { audio: false, video: { facingMode: 'environment' } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play();
            };
        })
        .catch(function(err) {
            console.log(err);
        });
   
}

function snap() {
    context.drawImage(video,0,0,w,h);

    var x = Math.round(canvas.width / 4.0);
    var y = Math.round(x * 2.0);

    var imageData = context.getImageData(x, x, y, y);
    var data = imageData.data;
    var sred;
 
    for (var i = 0; i < data.length; i += 4) {
      sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
      data[i]     = sred;
      data[i + 1] = sred;
      data[i + 2] = sred;
     }
    context.putImageData(imageData, x, x);

    setTimeout(snap, 10);
}

function resiz() {
    var aspect = window.innerWidth / window.innerHeight;
    if (aspect < 0.75){
       w = Math.round(window.innerWidth);
       h = Math.round(window.innerWidth / 0.75);
       leftPos = 0;
    } else {
       w = Math.round(window.innerHeight * 0.75);
       h = Math.round(window.innerHeight);
       leftPos = Math.round((window.innerWidth - w) / 2.0)
    }
    labe.innerText = w + " " + h;
	//labe.innerText = navigator.userAgent;
    canvas.width   = w;
    canvas.height  = h;
    canvas.style.position = "absolute";
    canvas.style.left = leftPos + "px";  
    shaba.width   = w;
    shaba.height  = h;
    shaba.style.position = "absolute";
    shaba.style.left = leftPos + "px";  
}