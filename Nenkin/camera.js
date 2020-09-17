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
videoasp = 1.6;
ww = 0;
hh = 0;
snap();


function openCamera() {
    var constraints = { audio: false, video: { facingMode: 'environment', width: { ideal: 10000 }, height: { ideal: 6250 } } };
    //var constraints = { audio: false, video: { facingMode: 'environment' } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play();
            };
			const track = video.srcObject.getVideoTracks()[0];
			const imageCapture = new ImageCapture(track);
			return imageCapture.getPhotoSettings();
        })
		.then(function(photoSettings) {
            ww = photoSettings.imageWidth;
			hh = photoSettings.imageHeight;
			videoasp = ww / hh;
		})
        .catch(function(err) {
            console.log(err);
        });
}

function snap() {
	resiz();		
    context.drawImage(video,0,0,w,h,0,0,w,h);
    //context.drawImage(video,0,0,w,h);
    //var x = Math.round(canvas.width / 4.0);
    //var y = Math.round(x * 2.0);

    //var imageData = context.getImageData(x, x, y, y);
    //var data = imageData.data;
    //var sred;
 
    //for (var i = 0; i < data.length; i += 4) {
    //  sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
    //  data[i]     = sred;
    //  data[i + 1] = sred;
    //  data[i + 2] = sred;
    // }
    //context.putImageData(imageData, x, x);

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

	labe.innerText = w + " x " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh;
    canvas.width   = w;
    canvas.height  = h;
    //canvas.style.position = "absolute";
    canvas.style.left = leftPos + "px";  
    shaba.width   = w;
    //shaba.style.position = "absolute";
    shaba.style.left = leftPos + "px";  
}