var video    = document.getElementById('video');
video.hidden = true;
var canvas   = document.getElementById('canvas');
var labe     = document.getElementById('labe');
var shaba    = document.getElementById('shaba');
var timg     = document.getElementById('tst');
var w,h,leftPos;
var vw, vh;
var context=canvas.getContext('2d');
var videoasp = 0.75;
vw = 0;
vh = 0;
//snap();


function openCamera() {
    //var constraints = { audio: false, video: { facingMode: 'environment' } };
    //var constraints = { audio: false, video: { facingMode: 'environment', width: 10000, height: 6250 } };
    var constraints = { audio: false, video: { facingMode: 'environment', width: { ideal: 10000 }, height: { ideal: 6250 } } };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
			labe.innerText = "A";
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {
                video.play();
				labe.innerText = "C";
            };
			labe.innerText = "B";
        })
        .catch(function(err) {
            console.log(err);
			labe.innerText = "E";
        });
}

function snap() {
	//resiz();		
    context.drawImage(video,0,0,w,h);
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

function loadedmeta(){
	labe.innerText = "AAA";
	vw = video.videoWidth;
	labe.innerText = "BBB";
	vh = video.videoHeight;
	labe.innerText = "CCC";
	if ((vw!=undefined) && (vh!=undefined) && (vh!=0)) {
		videoasp = vw / vh;
	}	
	labe.innerText = "DDD";
	resiz();
	snap();
}

function resiz() {
	labe.innerText = "A1";
    var aspect = window.innerWidth / window.innerHeight;
	labe.innerText = "A2";
    if (aspect < videoasp){
       w = Math.round(window.innerWidth);
       h = Math.round(window.innerWidth / videoasp);
       leftPos = 0;
    } else {
       w = Math.round(window.innerHeight * videoasp);
       h = Math.round(window.innerHeight);
       leftPos = Math.round((window.innerWidth - w) / 2.0)
    }

    labe.innerText = "A3";
	//labe.innerText = w + " / " + h + "  ASP:" + videoasp + " Video: " + vw + " x " + vh;
    canvas.width   = w;
    canvas.height  = h;
    //canvas.style.position = "absolute";
    canvas.style.left = leftPos + "px";  
    shaba.width   = w;
    //shaba.style.position = "absolute";
    shaba.style.left = leftPos + "px";  
	labe.innerText = "A4";
}