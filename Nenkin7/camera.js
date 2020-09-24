// 株式会社MILIZE 2020
// 年金定期便OCRデモ
// コード: Alexander Belov
"use strict";

let video    = document.getElementById('video');
let mainimg  = document.getElementById('mainimg');
let canvas   = document.getElementById('canvas');
let label    = document.getElementById('label');
let label2   = document.getElementById('label2');
let label3   = document.getElementById('label3');
let shaba    = document.getElementById('shaba');
let timg     = document.getElementById('tst');
let ww       = 0;
let hh       = 0;
let context  = canvas.getContext('2d');
let videoasp = 1.6;
let vasp     = 0;
video.hidden = true;
let w,h,leftPos;

// OCR用↓↓↓ ===========================================================================================

const TestSquareSmall  = 20;
const KanjiCount       = 35;
const FontCount        = 3;
const MaxError         = 22000;

let  working           = false;
let  BuffBlack         = [];
let  BuffBlue          = [];
let  BuffW, BuffH      = 0;
let  MaxLetterW        = 0;
let  MaxLetterH        = 0;
let  MinLetterW        = 0;
let  MinLetterH        = 0;
let  LettersCount      = 0;
let  isUseCamera       = false;
let  takePicture       = false;
let  SmallBuffMax      = new Uint32Array(1000, 1000);
let  SmallBuffMin      = new Uint32Array(1000, 1000);
  // 比較データ関連
let  NowSquareSmall    = new Uint32Array(TestSquareSmall * TestSquareSmall);

let  KanjiSmall        = new Uint32Array(FontCount,TestSquareSmall * TestSquareSmall * KanjiCount);
let  KanjiZure         = new Uint32Array(KanjiCount);
let  KanjiFont         = new Uint32Array(KanjiCount);
  // SHOW
let  isShowBW          = Boolean;
let  isShowBlue        = Boolean;
let  isShow            = Boolean;
  // TST
let  testNum           = 0;
let  keyok             = false;

document.getElementById('KanjiList').value = 'KANJI';
let KanjiList = 'KLIST';
KanjiList = loadText('KanjiList.str');
let textHtml = 'THTML';
let textHtml = loadText('Teikibin.htm');

// OCR用↑↑↑ ===========================================================================================

function openCamera() {
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
    context.drawImage(video,0,0,ww,hh,0,0,ww,hh);

    mainimg.src = canvas.toDataURL();

    let imageData = context.getImageData(0, 0, ww, hh);
    let data      = imageData.data;
    let sred      = 0;
 
    for (let i = 0; i < data.length; i += 4) {
        sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
        data[i]     = sred;
        data[i + 1] = sred;
        data[i + 2] = sred;
    }
    context.putImageData(imageData, 0, 0);

    setTimeout(snap, 50);
}

function resiz() {
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
    label.innerText    = w + " xxx " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh + "  VASP:" + vasp;
    label2.innerText   = KanjiList;
    label2.style.left  = "10px";  
    label2.style.top   = Math.round(h/2.0) + "px";  
    label3.innerText   = textHtml;
    label3.style.left  = "10px";  
    label3.style.top   = Math.round(h + 40) + "px";  
    mainimg.width      = w;
    mainimg.height     = h;
    mainimg.style.left = leftPos + "px";  
    shaba.style.left   = leftPos + "px";  
    canvas.width       = ww;
    canvas.height      = hh;
    canvas.style.left  = 0 + "px";  
    canvas.style.top   = h + "px";  
}

function loadText(filename) {
    let xhttp = new XMLHttpRequest();
    //xhttp.responseType       = "text";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //document.getElementById(elementID).value = this.responseText;
            //elementID = this.responseText;
            
            return this.responseText;
        } 
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}

function loadData(filename, outdata) {
    let xhttp = new XMLHttpRequest();
    xhttp.responseType       = "arraybuffer";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let arrayBuffer  = xhttp.response; 
            if (arrayBuffer) {
               outdata       = new Uint8Array(arrayBuffer);
            } 
        }
    }
    xhttp.open("GET", filename, true);
    xhttp.send(null);
}


