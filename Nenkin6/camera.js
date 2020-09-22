let video    = document.getElementById('video');
let canvas   = document.getElementById('canvas');
let canvasB  = document.getElementById('canvasB');
let labe     = document.getElementById('labe');
let shaba    = document.getElementById('shaba');
let timg     = document.getElementById('tst');
let ww       = 0;
let hh       = 0;
let context  = canvas.getContext('2d');
let contextB = canvasB.getContext('2d');
let videoasp = 1.6;
video.hidden = true;
let w,h,leftPos;

function openCamera() {
	let constraints = { audio: false, video: { facingMode: 'environment', width: { ideal: 3840 }, height: { ideal: 2160 } } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play();
                hh = video.videoHeight;
			    ww = Math.round(hh * videoasp); //video.videoWidth;
			    //videoasp = ww / hh;
			    resiz();
			    snap();
            };
        })
        .catch(function(err) {
            console.log(err);
        });
}

function snap() {
    video.play();
    context.drawImage(video,0,0,w,h,0,0,ww,hh);
    contextB.drawImage(video,0,0);

    let imageData = contextB.getImageData(0, 0, ww, hh);
    let data      = imageData.data;
    let sred      = 0;
 
    for (let i = 0; i < data.length; i += 4) {
        sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
        data[i]     = sred;
        data[i + 1] = sred;
        data[i + 2] = sred;
    }
    contextB.putImageData(imageData, 0, 0);

    setTimeout(snap, 50);
}

function resiz() {
    let aspect = window.innerWidth / window.innerHeight;
    if (aspect < videoasp){
       w = Math.round(window.innerWidth);
       h = Math.round(window.innerWidth / videoasp);
       leftPos = 0;
    } else {
       w = Math.round(window.innerHeight * videoasp);
       h = Math.round(window.innerHeight);
       leftPos = Math.round((window.innerWidth - w) / 2.0)
    }

	labe.innerText     = w + " xx " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh;
    canvas.width       = w;
    canvas.height      = h;
    canvas.style.left  = leftPos + "px";  
    shaba.width        = w;
    shaba.style.left   = leftPos + "px";  
    canvasB.width      = ww;
    canvasB.height     = hh;
    canvasB.style.left = 0 + "px";  
    canvasB.style.top  = h + "px";  

}