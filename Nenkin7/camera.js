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
let context2 = mainimg.getContext('2d');
let videoasp = 1.6;
let vasp     = 0;

video.hidden = true;
//canvas.hidden = true;
let w,h,leftPos;

// OCR用↓↓↓ ===========================================================================================

const TestSquareSmall  = 20;
const KanjiCount       = 35;
const FontCount        = 3;
const MaxError         = 22000;
const HDRsquare        = 30.0;

let  working           = false;
let  BuffBlack         = new Uint32Array;
let  BuffBlue          = new Uint32Array;
let  BuffW, BuffH      = 0;
let  MaxLetterW        = 0;
let  MaxLetterH        = 0;
let  MinLetterW        = 0;
let  MinLetterH        = 0;
let  LettersCount      = 0;
let  isUseCamera       = false;
let  takePicture       = false;
let  SmallBuffMax      = new Uint32Array(1000 * 1000);
let  SmallBuffMin      = new Uint32Array(1000 * 1000);
  // 比較データ関連
let  NowSquareSmall    = new Uint32Array(TestSquareSmall * TestSquareSmall);

let  KanjiSmallLen     = TestSquareSmall * TestSquareSmall * KanjiCount;
let  KanjiSmall        = new Uint32Array(FontCount * KanjiSmallLen);
let  KanjiZure         = new Uint32Array(KanjiCount);
let  KanjiFont         = new Uint32Array(KanjiCount);
  // SHOW
let  isShowBW          = false;
let  isShowBlue        = true;
let  isShow            = false;
  // TST
let  testNum           = 0;
let  keyok             = false;

let  KanjiList         = document.getElementById('KanjiList');
let  textHtml          = document.getElementById('textHtml');

//KanjiList.value = 'KANJI';
loadText('KanjiList.str', 'KanjiList');
loadText('Teikibin.htm', 'textHtml');

for (let i=0; i<FontCount; i++){
    loadData(i+'.dat', i);
}

// OCR用↑↑↑ ===========================================================================================

function openCamera() {

    // let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();

    // for (let constraint in supportedConstraints) {
    //   if (supportedConstraints.hasOwnProperty(constraint)) {
    //     let elem = document.createElement("li");
        
    //     elem.innerHTML = "<code>" + constraint + "</code>";
    //     constraintList.appendChild(elem);
    //   }
    // }

    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'auto', focusDistance: 0.01 };
    let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'continuous', focusDistance: 20000 };
    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'manual', focusDistance: 20000 };
    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'none', focusDistance: 20000 };
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
    context.drawImage(video,0,0,ww,hh,0,0,ww,hh);
    context2.drawImage(canvas,0,0,w,h);

    // let imageData = context.getImageData(0, 0, ww, hh);
    // let data      = imageData.data;
    // let sred      = 0;
 
    // for (let i = 0; i < data.length; i += 4) {
    //     sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
    //     data[i]     = sred;
    //     data[i + 1] = sred;
    //     data[i + 2] = sred;
    // }
    // context.putImageData(imageData, 0, 0);


    if (working == false){
        working = true;
        OCRWork();
    }

    setTimeout(snap, 50);
}

function RectF(left, top, right, bottom) {
    let outRect = new Uint32Array(4); 
    outRect[0] = left;
    outRect[1] = top;
    outRect[2] = right;
    outRect[3] = bottom;
    return outRect;
}

function TakeBWPicture(Area) {
    let  xx,yy         = 0;
    let  sm, sms, smb  = 0;
    let  nowsred       = 0;
    let  minn          = 255;
    let  maxx          = 0;
    let  mmsred        = 0;
    let  lightmappt    = 0.0;

    //CLEAR
    lightmappt  = BuffH / HDRsquare;

    let ax          = Math.trunc(Area[0]);
    let ay          = Math.trunc(Area[1]);
    let aBuffW      = Math.trunc(Area[2]-Area[0]);
    let aBuffH      = Math.trunc(Area[3]-Area[1]);
    let smallWidth  = Math.trunc(BuffW / lightmappt);
    let smallHeight = Math.trunc(BuffH / lightmappt);

    let imageData = context.getImageData(ax, ay, aBuffW, aBuffH);
    let data      = imageData.data;
 
    // for (let i = 0; i < data.length; i += 4) {
    //     sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3.0);
    //     data[i]     = sred;
    //     data[i + 1] = sred;
    //     data[i + 2] = sred;
    // }
    // context.putImageData(imageData, 0, 0);    

    for (yy = 0; yy < smallHeight; yy++){
        for (xx = 0; xx < smallWidth; xx++){
            sm = yy * smallWidth + xx;
            SmallBuffMax[sm] = 0;
            SmallBuffMin[sm] = 255;
        }
    }

    for (yy = 0; yy < aBuffH; yy++) {
        for (xx = 0; xx < aBuffW; xx++) {
            sm      = yy * aBuffW * 4 + xx * 4;
            sms     = Math.trunc((xx+ax)/lightmappt) + Math.trunc((yy+ay)/lightmappt) * smallWidth;
            nowsred = Math.trunc((data[sm]+data[sm+1]+data[sm+2])/3.0);
            if ( nowsred > SmallBuffMax[sms]) {
                SmallBuffMax[sms] = nowsred;
            }
            if ( nowsred < SmallBuffMin[sms] ) {
                SmallBuffMin[sms] = nowsred;
            }
        }
    }

    for ( yy = 0; yy < aBuffH; yy++){
        for ( xx = 0; xx < aBuffW; xx++) {
            smb     = (yy + ay)*BuffW + (xx + ax);
            BuffBlack[smb] = 255;
            BuffBlue [smb] = 255;
            sm      = (yy * aBuffW + xx) * 4;
            sms     = Math.trunc((xx+ax)/lightmappt) + Math.trunc((yy+ay)/lightmappt) * smallWidth;
            nowsred = Math.trunc((data[sm]+data[sm+1]+data[sm+2])/3.0);
            
            maxx   = SmallBuffMax[sms];
            minn   = SmallBuffMin[sms];

            if ( maxx - minn < 30 ) {
                if ( (isShowBW == true) || (isShowBlue == true) ){ 
                    data[sm]   = 255;
                    data[sm+1] = 255;
                    data[sm+2] = 255;
                }
                BuffBlue [smb] = 255;
                BuffBlack[smb] = 255;
            } else {
                mmsred = Math.trunc((nowsred-minn)*(255.0/(maxx-minn)));
                if ( isShowBlue == true) { 
                    data[sm]   = mmsred;
                    data[sm+1] = mmsred;
                    data[sm+2] = mmsred;
                }
                BuffBlue[smb] = mmsred;
                if ( mmsred > 140 ) {
                    if (isShowBW == true) { 
                        data[sm]   = 255;
                        data[sm+1] = 255;
                        data[sm+2] = 255;
                    }
                    BuffBlack[smb] = 255;
                } else {
                    if (isShowBW == true) { 
                        data[sm]   = 0;
                        data[sm+1] = 0;
                        data[sm+2] = 0;
                    }
                    BuffBlack[smb] = 0;
                }
            }
            
        }
    }

    if ((isShowBlue == true) || (isShowBW == true)){
        context.putImageData(imageData, ax, ay); 
    }
}

async function OCRWork() {
    let LetterRecrs = new Uint32Array(400); // Letter sqares
    let tmpRect     = new Uint32Array(4);   // OCR aree Rect
    let nowtext     = textHtml.value;
    let keyword     = '';
    let aveWidth    = 0.0;

    // let imageData = context2.getImageData(10, 10, 80, 80);
    // let data      = imageData.data;
    // let sred      = 0;
 
    // for (let i = 0; i < data.length; i += 4) {
    //     sred = Math.round((data[i] + data[i + 1] + data[i + 2]) / 6.0);
    //     data[i]     = sred;
    //     data[i + 1] = sred;
    //     data[i + 2] = sred;
    // }
    // context2.putImageData(imageData, 10, 10);

    //label2.innerText   = "OKK1";
    keyok   = true;
    tmpRect = RectF(0, 0, Math.trunc(BuffW/3.5), Math.trunc(BuffH/12.0));
    TakeBWPicture(tmpRect);
    keyword = 'これまでの年金加入';
    //res     = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 1.3, 0.4, keyword, LetterRecrs, aveWidth);

    if (keyok == true){
        tmpRect = RectF(0, Math.trunc(BuffH/2.9), Math.trunc(BuffW/4.0), Math.trunc(BuffH/11.0)+Math.trunc(BuffH/2.9));
        TakeBWPicture(tmpRect);
        //keyword:= '老齢年金';
        keyword = '年金の';
        //res := getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 1.4, 0.4, keyword, LetterRecrs, aveWidth);
        //if pos(keyword, res)<=0 then
        //begin
        //keyok:= False;
        //end;
        //outStr:=outStr + ' ' + res;
    }

    working = false;
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
    label.innerText    = w + " xOx " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh + "  VASP:" + vasp;

    //let tmpStr = '';
    //for (let i=0; i<TestSquareSmall; i++){
    //    tmpStr = tmpStr + KanjiSmall[KanjiSmallLen * 0 + i] + ',';
    //}
    let tmpStr2 = '';
    for (let i=0; i<TestSquareSmall; i++){
        tmpStr2 = tmpStr2 + KanjiSmall[KanjiSmallLen * 1 + i] + ',';
    }

    //label2.innerText   = tmpStr;
    label2.style.left  = "10px";  
    label2.style.top   = Math.round(h/2.0) + "px";  
    label3.innerText   = tmpStr2;
    label3.style.left  = "10px";  
    label3.style.top   = Math.round(h - 40) + "px";  
    mainimg.width      = w;
    mainimg.height     = h;
    mainimg.style.left = leftPos + "px";  
    shaba.style.left   = leftPos + "px";  
    canvas.width       = ww;
    canvas.height      = hh;
    canvas.style.left  = 0 + "px";  
    canvas.style.top   = h + "px";  

    BuffW              = ww;
    BuffH              = hh;

    MaxLetterW         = Math.round(ww / 50.0);
    MaxLetterH         = MaxLetterW;
    MinLetterW         = Math.round(MaxLetterW / 10.0);
    MinLetterH         = Math.round(MaxLetterH /  5.0);

    BuffBlack          = new Uint32Array(BuffW * BuffH);
    BuffBlue           = new Uint32Array(BuffW * BuffH); 
}

function loadText(filename, elementID) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById(elementID).value = this.responseText;
        } 
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}

function loadData(filename, fontNum) {
    let xhttp = new XMLHttpRequest();
    xhttp.responseType       = "arraybuffer";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let arrayBuffer  = xhttp.response; 
            if (arrayBuffer) {
                let outdata   = new Uint8Array(arrayBuffer);
                //alert(outdata.length);
                for (let i=0; i<outdata.length; i++){
                    KanjiSmall[KanjiSmallLen*fontNum + i] = outdata[i];
                }
            } 
        }
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}


