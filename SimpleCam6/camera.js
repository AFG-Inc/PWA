var video = document.getElementById('video');
video.hidden = true;
var canvas=document.getElementById('canvas');
var labe =document.getElementById('labe');
var shaba =document.getElementById('shaba');
var timg =document.getElementById('tst');
var w,h,leftPos;
var ww, hh;
var context=canvas.getContext('2d');
var videoasp;
videoasp = 0.75;
ww = 0;
hh = 0;

function openCamera() {
	var constraints = { audio: false, photo: false, video: { facingMode: 'environment', width: { ideal: 9600 }, height: { ideal: 12800 }, aspectRatio: 4/3 } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.loop = true;
                video.play();
			    ww = video.videoWidth;
			    hh = video.videoHeight;
			    videoasp = ww / hh;
			    resiz();
			    snap();
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
    if (aspect < videoasp){
       w = Math.round(window.innerWidth);
       h = Math.round(window.innerWidth / videoasp);
       leftPos = 0;
    } else {
       w = Math.round(window.innerHeight * videoasp);
       h = Math.round(window.innerHeight);
       leftPos = Math.round((window.innerWidth - w) / 2.0)
    }

	labe.innerText = w + " x " + h + "  ASPu:" + videoasp + " Video: " + ww + " x " + hh;
    canvas.width   = w;
    canvas.height  = h;
    canvas.style.left = leftPos + "px";  
    shaba.width   = w;
    shaba.style.left = leftPos + "px";  
}