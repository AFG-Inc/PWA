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
let vasp     = 0;
video.hidden = true;
let w,h,leftPos;
let cameraOK = false;

function openCamera() {
    let winw = window.innerWidth;
    let winh = window.innerWidth;
    if (winh > winw){
        alert("端末の向きを横にしてください");
    } else {
        let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 } };
        navigator.mediaDevices.getUserMedia(constraints)
            .then(function(stream) {
                video.srcObject = stream;
                video.onloadedmetadata = function(e) {
                    video.play();
                    hh   = video.videoHeight;
                    ww   = video.videoWidth;
                    vasp = ww / hh;
                    if (vasp < videoasp){
                        hh = Math.round(ww/videoasp);
                    } else {
                        ww = Math.round(hh * videoasp);
                    }          
                    cameraOK = true;      
                    resiz();
                    snap();
                };
            })
            .catch(function(err) {
                console.log(err);
            });
    }
}

function snap() {
    video.play();
    context.drawImage(video,0,0,ww,hh,0,0,w,h);
    contextB.drawImage(video,0,0,ww,hh,0,0,ww,hh);

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
    if (cameraOK == false){
        openCamera();
    }
    let aspect = window.innerWidth / window.innerHeight;
    if (aspect < videoasp){
       w = Math.round(window.innerWidth);
       h = Math.round(window.innerWidth / videoasp);
       leftPos         = 0;
    } else {
       w = Math.round(window.innerHeight * videoasp);
       h = Math.round(window.innerHeight);
       leftPos         = Math.round((window.innerWidth - w) / 2.0)
    }
    shaba.width        = w;
    shaba.height       = h;
	labe.innerText     = w + " x1 " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh + "  VASP:" + vasp;
    canvas.width       = w;
    canvas.height      = h;
    canvas.style.left  = leftPos + "px";  
    shaba.style.left   = leftPos + "px";  
    canvasB.width      = ww;
    canvasB.height     = hh;
    canvasB.style.left = 0 + "px";  
    canvasB.style.top  = h + "px";  

}