// 株式会社MILIZE 2020
// 年金定期便OCRデモ
// コード: Alexander Belov
"use strict";

let version   = 1.02;
let video     = document.getElementById('video');
let mainimg   = document.getElementById('mainimg');
let canvas    = document.getElementById('canvas');
let label     = document.getElementById('label');
let label2    = document.getElementById('label2');
let label3    = document.getElementById('label3');
let shaba     = document.getElementById('shaba');
let timg      = document.getElementById('tst');
//let focus     = document.getElementById('focus');
//let paper     = document.getElementById('paper');
let ww        = 0;
let hh        = 0;
let context   = canvas.getContext('2d');
let context2  = mainimg.getContext('2d');
let videoasp  = 0.69;
//let videoasp  = 2.9;
let vasp      = 0;
let camx      = 0;
let camy      = 0;
let camzoom   = 1.0;
//let camzoom   = 1.0;
let nzoom     = 400.0;

let ttt       = '';
let nowtext   = [''];

let videostop = false;
let w,h,leftPos;

video.hidden  = true;
canvas.hidden = true;
shaba.hidden  = true;
label.hidden  = true;
label2.hidden = true;
label3.hidden = true;
//focus.hidden  = false;
//paper.hidden  = false;

// OCR用↓↓↓ ===========================================================================================

const TestSquareSmall  = 20;
const KanjiNumsLen     = 4;
const FontCount        = 1;
const MaxError         = 22000;
const HDRsquare        = 30.0;

const KanjiCountD      = 35;
const KanjiCount       = 3127;

let  KanjiSmallLen     = TestSquareSmall * TestSquareSmall * KanjiCount;
let  KanjiSmall        = new Uint32Array(FontCount * KanjiSmallLen);
let  KanjiZure         = new Uint32Array(KanjiCount);
let  KanjiFont         = new Uint32Array(KanjiCount);
let  KanjiNums         = new Uint32Array(KanjiNumsLen);

let  KanjiSmallLenD    = TestSquareSmall * TestSquareSmall * KanjiCountD;
let  KanjiSmallD       = new Uint32Array(FontCount * KanjiSmallLenD);
let  KanjiZureD        = new Uint32Array(KanjiCountD);
let  KanjiFontD        = new Uint32Array(KanjiCountD);
let  KanjiNumsD        = new Uint32Array(KanjiNumsLen);

let  lettersType       = 0; // 0 - All Kanji, 1 - Digits + Keys, 2 - Japanese Date


let  working           = false;
let  BuffBlack         = new Uint32Array;
let  BuffBlue          = new Uint32Array;
let  BuffW, BuffH      = 10;
let  MaxLetterW        = 10;
let  MaxLetterH        = 10;
let  MinLetterW        = 10;
let  MinLetterH        = 10;
let  MinProbeSquare    = 10;
let  averageWidth      = 10;
let  LettersCount      = 0;
let  paperNum          = 2;
let  tableNum          = 1;
let  isUseCamera       = false;
let  takePicture       = false;
let  SmallBuffMax      = new Uint32Array(1000 * 1000);
let  SmallBuffMin      = new Uint32Array(1000 * 1000);
  // 比較データ関連
let  NowSquareSmall    = new Uint32Array(TestSquareSmall * TestSquareSmall);


  // SHOW
let  isShowBW          = false;
let  isShowBlue        = false;
let  isShow            = false;
let  isShowLetterRect  = false;
let  autofocus         = false;
  // TST
let  testNum           = 0;
let  keyok             = false;
let  manX, manY        = 0;

let  KanjiList         = ''; 
let  KanjiListD        = ''; 
let  text              = '';
let  Kanji             = '';

//KanjiList = '※〒0123456789生命保険証券医療カン死亡円年月号金民合歳特別■';
loadText('https://afg-inc.github.io/PWA/Hoken2/KanjiList.str', 'Kanji');
loadText('https://afg-inc.github.io/PWA/Hoken2/dKanjiList.str','KanjiD');
loadText('https://afg-inc.github.io/PWA/Hoken2/Hoken1.htm', 'text');
//loadText('Hoken1.htm', 'text');

for (let i=0; i<FontCount; i++){
    //loadData(i+'.dat', i);
    loadData('https://afg-inc.github.io/PWA/Hoken2/' + i + '.dat', i);
    loadDataD('https://afg-inc.github.io/PWA/Hoken2/d' + i + '.dat', i);
}

// OCR用↑↑↑ ===========================================================================================

function reload() {
    location.reload();
    //document.getElementById("outbody").innerHTML = '';
    //openCamera();
    //shaba.hidden     = false;
    //mainimg.hidden   = false;
    //videostop        = false;
}

function setFocus() {
    //autofocus = focus.checked;
    //openCamera();
}

function setPaper() {
    // paperNum++;
    // if (paperNum > 3) {
    //     paperNum = 1;
    // }
    // if (paperNum == 1) {
    //     loadText('https://afg-inc.github.io/PWA/Hoken2/Teikibin1.htm', 'text');
    //     paper.value = "用紙 1";
    //     shaba.src = "shablon1.png";
    // } else if (paperNum == 2) {
    //     loadText('https://afg-inc.github.io/PWA/Hoken2/Teikibin2.htm', 'text');
    //     paper.value = "用紙 2";
    //     shaba.src = "shablon2.png";
    // } else {
    //     loadText('https://afg-inc.github.io/PWA/Hoken2/Teikibin3.htm', 'text');
    //     paper.value = "用紙 3";
    //     shaba.src = "shablon3.png";
    // }
}

function openCamera() {
    let constraints; 
    constraints = { audio: false, photo: false, video: { facingMode: 'environment', width: 2160, height: 3840 } };
    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'continuous' };
    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'continuous', focusDistance: 30 };

    navigator.mediaDevices.getUserMedia(constraints)
        .then(function(stream) {
            video.srcObject = stream;
            video.onloadedmetadata = function(e) {

                if (text.length > 0){
                    nowtext = text.split('\n');
                } 

                tableNum  = 1;
                shaba.src = "shablonT1.png";

                //const track = stream.getVideoTracks()[0];
                //const capabilities = track.getCapabilities();
                //const settings = track.getSettings();
            
                //const input = document.querySelector('input[type="range"]');
            
                // Check whether zoom is supported or not.
                //if (!('zoom' in capabilities)) {
                //    label3.innerText   = 'Z:' + settings.zoom;
                //} else {
                //    label3.innerText   = 'ZOOM xxx';
                //}

                //track.applyConstraints({
                //    advanced: [{ pan: 0, tilt: 0, zoom: 2 }],
                //});

                video.play();
                hh   = video.videoHeight * camzoom;
                ww   = video.videoWidth  * camzoom;
                vasp = ww / hh;
                if (vasp < videoasp){
                    hh   = Math.round(ww / videoasp);
                    camy = Math.round((video.videoHeight - hh) / 2.0);
                } else {
                    ww   = Math.round(hh * videoasp);
                    camx = Math.round((video.videoWidth  - ww) / 2.0);
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
    context.drawImage(video,camx,camy,ww,hh,0,0,ww,hh);
    //context.drawImage(video,camx,camy,ww,hh);
    context2.drawImage(canvas,0,0,w,h);
    if (working == false){
        working = true;
        OCRWork();
    }
    if (videostop == false){
        setTimeout(snap, 50);
    }
}

function RectF(left, top, right, bottom) {
    let outRect = new Uint32Array(4); 
    outRect[0]  = left;
    outRect[1]  = top;
    outRect[2]  = right;
    outRect[3]  = bottom;
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

    for ( yy = 0; yy < aBuffH; yy++ ){
        for ( xx = 0; xx < aBuffW; xx++) {
            smb     = (yy + ay)*BuffW + (xx + ax);
            BuffBlack[smb] = 255;
            BuffBlue [smb] = 255;
            sm      = (yy * aBuffW + xx) * 4;
            sms     = Math.trunc((xx+ax)/lightmappt) + Math.trunc((yy+ay)/lightmappt) * smallWidth;
            nowsred = Math.trunc((data[sm]+data[sm+1]+data[sm+2])/3.0);
            
            maxx    = SmallBuffMax[sms];
            minn    = SmallBuffMin[sms];

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
                if ( mmsred > 140 ) {
                    if (isShowBW == true) { 
                        data[sm]   = 255;
                        data[sm+1] = 255;
                        data[sm+2] = 255;
                    }
                    BuffBlack[smb] = 255;
                } else {
                    if ( isShowBW == true ) { 
                        data[sm]   = 0;
                        data[sm+1] = 0;
                        data[sm+2] = 0;
                    }
                    BuffBlack[smb] = 0;
                }
                if ( mmsred > 200 ) {
                    mmsred = 255;
                }
                BuffBlue[smb] = mmsred;
            }
            
        }
    }
    if ((isShowBlue == true) || (isShowBW == true)){
        context.putImageData(imageData, ax, ay); 
    }
}


function GetKanjiRect(buff,
    StartX, StartY, StartW, StartH,
    width, height,
    minWidth, minHeight, maxWidth, maxHeight){
    let LetterRect;
    let i           = 0;
    let x0,y0       = 0;
    let x,y         = 0;
    let ku,km,ks,kh = 0;
    let Errorr      = 0;
    // Верхний левый угол
    x0 = Math.trunc(StartX - StartW / 2.0);
    y0 = Math.trunc(StartY - StartH / 2.0);
    // Нижний правый угол
    x  = Math.trunc(StartX + StartW / 2.0);
    y  = Math.trunc(StartY + StartH / 2.0);
    ku = 1;
    km = 1;
    ks = 1;
    kh = 1;
    Errorr = 0;
    //Uvelichenie kvadrata
    while (((ku!=0) || (km!=0) || (ks!=0) || (kh!=0)) && (Errorr == 0)) {
        if (ku > 0 ) { y0-- }
        if (ks > 0 ) { y++  }
        if (km > 0 ) { x++  }
        if (kh > 0 ) { x0-- }
        if ((x - x0 < minWidth)  ||
            (y - y0 < minHeight) ||
            (x - x0 > maxWidth)  ||
            (y - y0 > maxHeight) ||
            (x0 < 2) || (y0 < 2) ||
            (x > width - 2) || (y > height - 2)) {
            Errorr = 4;
            ku = 0;
            km = 0;
            ks = 0;
            kh = 0;
        } else {
            ku = 0;
            km = 0;
            ks = 0;
            kh = 0;
            //ue
            i = x0;
            while ((ku == 0) && (i < x)) {
                if (buff[y0 * width + i] < 127) {
                    ku = 1;
                }
                i++;
            }
            //shita
            i = x0;
            while ((ks == 0) && (i < x)) {
                if (buff[ y * width + i ] < 127) {
                    ks = 1;
                }
                i++;
            }
            //migi
            i = y0;
            while ((km == 0) && (i < y)) {
                if (buff[i*width+x] < 127) {
                    km = 1;
                }
                i++;
            }
            //hidari
            i = y0;
            while ((kh == 0) && (i < y)) {
                if (buff[i*width+x0] < 127) {
                    kh = 1;
                }
                i++;
            }
        }
    }

    //Umensheniye kvadrata
    while (((ku!=1) || (km!=1) || (ks!=1) || (kh!=1)) && (Errorr == 0)) {
        if (ku < 1 ) { y0++ }
        if (ks < 1 ) { y--  }
        if (km < 1 ) { x--  }
        if (kh < 1 ) { x0++ }
        if ((x - x0 < minWidth)   ||
            (y - y0 < minHeight)  ||
            (x - x0 > maxWidth)   ||
            (y - y0 > maxHeight)) {
            Errorr = 5;
            ku = 1;
            km = 1;
            ks = 1;
            kh = 1;
        } else {
            ku = 0;
            km = 0;
            ks = 0;
            kh = 0;
            //ue
            i = x0;
            while ((ku == 0) && (i < x)) {
                if (buff[ y0 * width + i ] < 127) {
                    ku = 1;
                }
                i++;
            }
            //shita
            i = x0;
            while ((ks == 0) && (i < x)) {
                if (buff[ y * width + i ] < 127) {
                    ks = 1;
                }
                i++;
            }
            //migi
            i = y0;
            while ((km == 0) && (i < y)) {
                if (buff[ i * width + x ] < 127) {
                    km = 1;
                }
                i++;
            }
            //hidari
            i = y0;
            while ((kh == 0) && (i < y)) {
                if (buff[ i * width + x0 ] < 127) {
                    kh = 1;
                }
                i++;
            }
        }
    }
    //Конец выделения
    if (Errorr == 0) {
        LetterRect = RectF(x0,y0,x,y);
    } else {
        LetterRect = RectF(100000,0,0,0);
    }
    //Letter
    return LetterRect;
}

function getBoxesFromBufferArea(buff,
    width, 
    height,
    area,
    StepX,
    StepY,
    KeyWords){
    let i          = 0;
    let x, y       = 0;
    let wr, hr     = 0;
    let wc, hc     = 0;
    let StartX     = 0; 
    let StartY     = 0;
    let NowRect    = RectF(0,0,0,0);
    let count      = 0;
    let collection = new Array();
    let addRect    = true;
    let aWidth     = 0;

    function probeRect(){
        if (NowRect[0] < 100000) { // No error
            addRect = true;
            wr = NowRect[2] - NowRect[0];
            hr = NowRect[3] - NowRect[1];
            for ( i = 0;  i < collection.length; i++ ) {
                if (( collection[i][0] == NowRect[0] ) &&
                    ( collection[i][1] == NowRect[1] ) &&
                    ( collection[i][2] == NowRect[2] ) &&
                    ( collection[i][3] == NowRect[3] )) {
                    addRect = false;
                    break;
                } else {
                    if (( collection[i][0] == NowRect[0] ) &&
                        ( collection[i][1] == NowRect[1] )) {
                        wc = collection[2] - collection[0];
                        hc = collection[3] - collection[1];
                        if (Math.abs(wc-hc) > Math.abs(wr-hr)){
                            collection[i] = NowRect;
                        }
                        addRect = false;
                        break;
                    }
                }
            }
            //if ((wr > hr * 1.3) || (hr > wr * 1.3)) { addRect = false }
            //if (wr > hr * stepX) { addRect = false }
            if ( addRect == true ) {
                aWidth = aWidth + wr;
                collection.push( NowRect );
                count++;
                if ( isShowLetterRect == true ) {
                    context.strokeRect( NowRect[0], NowRect[1], wr, hr );
                }
            }           
        }

    }

    if ( isShowLetterRect == true ) {
        context.strokeStyle = "rgb(0,128,0)";
    }
    //for ( y = 1; y < Math.trunc( (area[3]-area[1]) / MinLetterH ); y++ ) {
    for ( y = 1; y < Math.trunc( (area[3]-area[1]) / MinProbeSquare ); y++ ) {
        //for ( x = 1; x < Math.trunc( (area[2]-area[0]) / MinLetterW); x++ ) {
        for ( x = 1; x < Math.trunc( (area[2]-area[0]) / MinProbeSquare ); x++ ) {
            //StartX  = x * MinLetterW + Math.trunc(area[0]);
            //StartY  = y * MinLetterH + Math.trunc(area[0]);
            StartX  = x * MinProbeSquare + Math.trunc(area[0]);
            StartY  = y * MinProbeSquare + Math.trunc(area[1]);
            //NowRect = GetKanjiRect( buff, StartX, StartY, MinLetterW, MinLetterH, width, height,
            //MinLetterW, MinLetterH, MaxLetterW, MaxLetterH);
            NowRect = GetKanjiRect( buff, StartX, StartY, MinProbeSquare, MinProbeSquare, width, height,
                MinProbeSquare, MinProbeSquare, MaxLetterW, MaxLetterH);
            probeRect();

            //StartX  = x * MinProbeSquare + Math.trunc(area[0] + MinProbeSquare/2.0);
            //StartY  = y * MinProbeSquare + Math.trunc(area[1] + MinProbeSquare/2.0);

            //NowRect = GetKanjiRect( buff, StartX, StartY, MinProbeSquare, MinProbeSquare, width, height,
            //    MinProbeSquare, MinProbeSquare, MaxLetterW, MaxLetterH);
            //probeRect();
            

        }
    }

    if ( count > 0 ) { 
        averageWidth = aWidth / count 
    }

    return GetClustersFromLettersCollection(collection, StepX, StepY, KeyWords);

}

function ManDistance(x1,y1,x2,y2) {
    manX = Math.abs(x2-x1);
    manY = Math.abs(y2-y1);
    return manX + manY;
}

function KanjiAnalize() {
    let  i;              
    let  j;             
    let  k;             
    let  lena        = KanjiNumsLen-1;
    let  NowZure     = 0;
    let  MinZure     = Number.MAX_VALUE;
    let  MaxZure     = 0;
    let  Smes        = 0;
    let  SquareSmall = TestSquareSmall * TestSquareSmall;
    let  BKanjiZure  = Number.MAX_VALUE;
    let  KanjiNumm   = Number.MAX_VALUE;

    KanjiNums.fill(0);

    for (j=0; j<KanjiCount; j++) { 
        KanjiZure[j] = Number.MAX_VALUE; 
    }
  
    for (i=0; i<FontCount; i++) {
        Smes = 0;
        for (j=0; j<KanjiCount; j++) {
            NowZure = 0;
            for (k=0; k<SquareSmall; k++) {
              NowZure = NowZure + Math.abs( KanjiSmall[KanjiSmallLen*i + Smes + k] - NowSquareSmall[k] );
            }
            if (NowZure < KanjiZure[j]) { KanjiZure[j] = NowZure }
            if (NowZure > MaxZure)      { MaxZure      = NowZure }
            if (NowZure < MinZure)      { MinZure      = NowZure }
            if ( NowZure < BKanjiZure ) {
                BKanjiZure   = NowZure;
                KanjiZure[j] = BKanjiZure;
                KanjiFontD[j] = i;
                if (KanjiNumm != j) {
                    KanjiNumm = j;
                    for (k=0; k<=lena; k++) {
                        KanjiNums[lena-k] = KanjiNums[lena-k-1];
                    }
                    KanjiNums[0] = j;
			    }
		    }
            Smes = Smes + SquareSmall;
        }
    }
    return KanjiNumm;
}

function KanjiAnalizeD() {
    let  i;              
    let  j;             
    let  k;             
    let  lena        = KanjiNumsLen-1;
    let  NowZure     = 0;
    let  MinZure     = Number.MAX_VALUE;
    let  MaxZure     = 0;
    let  Smes        = 0;
    let  SquareSmall = TestSquareSmall * TestSquareSmall;
    let  BKanjiZure  = Number.MAX_VALUE;
    let  KanjiNumm   = Number.MAX_VALUE;

    KanjiNumsD.fill(0);

    for (j=0; j<KanjiCountD; j++) { 
        KanjiZureD[j] = Number.MAX_VALUE; 
    }

    for (i=0; i<FontCount; i++) {
        Smes = 0;
        for (j=0; j<KanjiCountD; j++) {
            NowZure = 0;
            for (k=0; k<SquareSmall; k++) {
              NowZure = NowZure + Math.abs( KanjiSmallD[KanjiSmallLenD*i + Smes + k] - NowSquareSmall[k] );
            }
            if (NowZure < KanjiZureD[j]) { KanjiZureD[j] = NowZure }
            if (NowZure > MaxZure)      { MaxZure      = NowZure }
            if (NowZure < MinZure)      { MinZure      = NowZure }
            if ( NowZure < BKanjiZure ) {
                BKanjiZure   = NowZure;
                KanjiZureD[j] = BKanjiZure;
                KanjiFontD[j] = i;
                if (KanjiNumm != j) {
                    KanjiNumm = j;
                    for (k=0; k<=lena; k++) {
                        KanjiNumsD[lena-k] = KanjiNumsD[lena-k-1];
                    }
                    KanjiNumsD[0] = j;
			    }
		    }
            Smes = Smes + SquareSmall;
        }
    }
    return KanjiNumm;
}


function MakeTestSquare(Buff,
    width,
    height,
    rect,
    SquareSize) {

    let i,j     = 0;
    let x,y     = 0;
    let sum     = 0;
    let colsum  = 0;
    let sStartX = 0.0;
    let sStartY = 0.0;
    let NowX    = 0;
    let NowY    = 0;
    let color   = 0;
    let kake    = 0;
    let koefx   = ((rect[2] - rect[0]) + 1) / SquareSize;
    let koefy   = ((rect[3] - rect[1]) + 1) / SquareSize;
    let StopX   = 0;
    let StopY   = koefy;

    let smes    = 0;
    let StepX   = 0.5;
    let StepY   = 0.5;
    let maxx    = 0;
    let minn    = 255;
    let razn    = 1;

    while (j < SquareSize) {
        sStartX = 0.0;
        StopX   = koefx;
        i       = 0;
        while (i < SquareSize) {
            sum     = 0;
            colsum  = 0;
            NowY    = sStartY;
            while (NowY < StopY) {
                NowX = sStartX;
                while (NowX < StopX) {
                    x = Math.trunc( rect[0] + NowX );
                    y = Math.trunc( rect[1] + NowY );
                    colsum = colsum + Buff[ y * width + x ];
                    sum++;
                    NowX   = NowX + StepX;
                }
                NowY = NowY + StepY;
            }
            if (sum > 0) {
                color = Math.trunc(colsum / sum);
                if (color > maxx) { maxx = color }
                if (color < minn) { minn = color }
                NowSquareSmall[smes] = color;
            }
            smes++;
            sStartX = StopX;
            StopX   = sStartX + koefx;
            i++;
        }
        sStartY     = StopY;
        StopY       = sStartY + koefy;
        j++;
    }

    razn = maxx - minn;
    if ( razn > 0 ) {
        kake = 255.0 / razn;
        for ( x = 0; x < NowSquareSmall.length; x++ ) {
            NowSquareSmall[x] = Math.trunc((NowSquareSmall[x] - minn) * kake);
        }
    }
}

function GetClustersFromLettersCollection(LetterRecs,
    stepX,
    stepY,
    KeyWords){
    
    let i,j,lena  = 0;
    let x,y       = 0;
    let kw, kh    = 0;
    let clarray   = new Array();
    let isNewCl   = false;
    let filterOk  = false;
    let sss       = '';
    let keylen    = 0;
    let OutText   = '';
    let kWords    = KeyWords.split('|');
    let nowLetter = '';

    // Clusterization
    for (i = 0; i < LetterRecs.length; i++) {
        isNewCl = true;
        for ( y = 0; y < clarray.length; y++ ) {
            for ( x = 0; x < clarray[y].length; x++ ){
                ManDistance(LetterRecs[clarray[y][x]][0], LetterRecs[clarray[y][x]][1], LetterRecs[i][0], LetterRecs[i][1]);
                if ((manX  < (LetterRecs[i][2] - LetterRecs[i][0]) * stepX) &&
                    (manY  < (LetterRecs[i][3] - LetterRecs[i][1]) * stepY)) {
                    clarray[y].push(i);
                    isNewCl = false;
                    break;
                }
            }
            if ( isNewCl == false ) {
                break;
            }
        }
        if ( isNewCl == true ) {
            let clline = new Array();
            clline.push(i);
            clarray.push(clline);
        } 
    }
  
    //SORT
    if ( clarray.length > 0 ){
        for ( y = 0; y < clarray.length; y++ ) {
            for( i = 0; i < clarray[y].length; i++ ){
                for ( x = 1; x < clarray[y].length; x++ ){
                    if ( LetterRecs[clarray[y][x]][0] < LetterRecs[clarray[y][x-1]][0] ) {
                        j = clarray[y][x];
                        clarray[y][x]   = clarray[y][x-1];
                        clarray[y][x-1] = j;
                    }
                }
            }
        }
    }
    //TST
    testNum   = 0;
    keylen    = kWords.length;
    for ( y = 0; y < clarray.length; y++ ) {
        sss   = '';
        for ( x = 0; x < clarray[y].length; x++ ){
            j = clarray[y][x];
            filterOk = true;
            if ( x > 0 ){
                kw = (LetterRecs[j][2]-LetterRecs[j][0]);
                kh = (LetterRecs[j][3]-LetterRecs[j][1]);
                if ((LetterRecs[j][0]-LetterRecs[clarray[y][x-1]][0]) < (LetterRecs[j][2] - LetterRecs[j][0])/2.0 ) { filterOk = false }
                if (kw/kh < 0.75) { filterOk = false }
                if (kh/kw < 0.75) { filterOk = false }
            }
            if ( clarray[y].length >= keylen ) {
                MakeTestSquare(BuffBlue, BuffW, BuffH, LetterRecs[j], TestSquareSmall);
                if ( lettersType == 0 ) {
                    // All Kanji
                    KanjiAnalize();
                } else if ( lettersType == 1 ) {
                    // Digits + Keys
                    KanjiAnalizeD();
                } else {
                    // Japanese Date
                    KanjiAnalizeD();
                }
                for ( i = 0; i < KanjiNumsLen; i++ ) {
                    if (lettersType == 0){
                        if (filterOk == true) {
                            sss = sss + KanjiList.charAt(KanjiNums[i]);
                            break;
                        }
                    } else if (lettersType == 2){ 
                        //日付
                        nowLetter = KanjiListD.charAt(KanjiNumsD[i]);
                        lena      = sss.length;
                        if ((KanjiNumsD[i]<=12) || ((nowLetter=='年') && (lena==4)) || ((nowLetter=='月') && (lena==7)) || ((nowLetter=='日') && (lena==10))){
                            sss = sss + nowLetter;
                            break;
                        }
                    } else {
                        sss = sss + KanjiListD.charAt(KanjiNumsD[i]);
                        break;
                    }
                }
                testNum++;
            }
        }
        j   = clarray[y][0];
        sss = sss + '[' + Math.trunc(LetterRecs[j][0]) + ',' + Math.trunc(LetterRecs[j][1]) + ']';
        //for ( k = 0; k < kWords.length; k++ ) {
        //    if ( sss.length >= kWords[k].length ) {
        //        if ( kWords[k].indexOf(sss) >= 0 ) {
                    OutText = OutText + '|' + sss;
        //        }
        //    }
        //}
    }
    return OutText;
}

function getStrArray(str, key) {
    let numStr = '';
    let xStr = '';
    let yStr = '';
    let gnumbers = true;
    let gX = false;
    let gY = false;
    let tmpStr = '';
    let nowChar = '';
    let poss1 = 0;
    let poss2 = 0;
    let number = 0;
    let outarray = new Array();

    for (let i = 0; i <= str.length; i++) {
        nowChar = str.charAt(i);
        if (gX == true) {
            if (nowChar != ',') {
                xStr = xStr + nowChar;
            }
        }
        if (gY == true) {
            if (nowChar != ']') {
                yStr = yStr + nowChar;
            }
        }
        if (nowChar == '[') {
            gnumbers = false;
            gX = true;
        }
        if (nowChar == ',') {
            gY = true;
            gX = false;
        }

        if (nowChar == ']') {
            gnumbers = false;
            gY = false;
        }
        if (gnumbers == true) {
            number = str.charCodeAt(i);
            if (number < 100) {
                numStr = numStr + nowChar;
            }
        }
        if ((nowChar == '|') || (i == str.length)) {
            poss1 = tmpStr.indexOf('[');
            poss2 = tmpStr.indexOf(key);
            if (poss2 == poss1 - 1) {

                let ara = new Array();
                ara.push(parseInt(xStr));
                ara.push(parseInt(yStr));
                ara.push(parseInt(numStr));
                outarray.push(ara);
            }
            tmpStr = '';
            numStr = '';
            xStr = '';
            yStr = '';
            gnumbers = true;
            gX = false;
            gY = false;
        } else {
            tmpStr = tmpStr + nowChar;
        }
    }
    return outarray;
}

function textreplace( strarray, tstart, tend, pref, str ){
    for (let i=tstart; i<=tend; i++){
        strarray[i] = strarray[i].replace( pref, str );
    }
}

function OCRWork() {
    let i, j        = 0;
    let tmpRect     = new Uint32Array(4);   // OCR area Rect
    let tsukiarray  = new Array();
    let saiarray    = new Array();
    let sarray      = new Array();
    let enarray     = new Array();
    //let nowtext     = [''];
    let keyword     = '';
    let tmpStr      = '';
    let prefix      = '';
    let res         = '';
    let tsukicount  = 0;
    let saicount    = 0;
    let encount     = 0;
    let txtstart    = 0;
    let txtend      = 0;
    let pos1        = 0;
    let pos2        = 0;
    
    //if (text.length > 0){
    //    nowtext     = text.split('\n');
    //} 

    if (paperNum == 2) { // 用紙２対応 ========================================================================
        // Sign 1
        tmpRect = RectF(Math.trunc(BuffW * 0.25), Math.trunc(BuffH * 0.06), Math.trunc(BuffW * 0.75), Math.trunc(BuffH * 0.12)); // 0 ~ 1.0 percent
        TakeBWPicture(tmpRect);
        keyword = '保険';
        lettersType = 1;
        res     = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 3.5, 0.5, keyword );
        if (res.indexOf(keyword) >= 0) { 
            keyok  = true; 

        } else {
            keyok  = false; 
        }

        // 号
        if ((keyok == true) && (tableNum == 1)) {
            tmpRect    = RectF(Math.trunc(BuffW * 0.05), Math.trunc(BuffH * 0.17), Math.trunc(BuffW * 0.25), Math.trunc(BuffH * 0.22));
            TakeBWPicture(tmpRect);
            keyword    = '号';
            lettersType= 1;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.5, keyword);
            tsukiarray = getStrArray(res, keyword);
            tsukicount = tsukiarray.length;
            if (tsukicount == 1) {
                tmpStr      = tsukiarray[0][2];
                if (tmpStr == 'NaN') {
                    keyok   = false; 
                } else {
                    txtstart    = 2;
                    txtend      = 5;
                    prefix  = '●';
                    textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                    shaba.src = "shablonT2.png";
                    tableNum = 2;
                }
            } else {
                keyok   = false; 
            }

        } else if ((keyok == true) && (tableNum == 2)) {
            // 保険
            tmpRect    = RectF(Math.trunc(BuffW * 0.48), Math.trunc(BuffH * 0.17), Math.trunc(BuffW * 0.70), Math.trunc(BuffH * 0.22));
            TakeBWPicture(tmpRect);
            keyword    = '保険';
            lettersType= 0;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.5, keyword);
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 6;
                txtend     = 8;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT3.png";
                tableNum   = 3;
            } else {
                keyok  = false; 
            }
        } else if ((keyok == true) && (tableNum == 3)) {
            // 日付
            tmpRect    = RectF(Math.trunc(BuffW * 0.62), Math.trunc(BuffH * 0.24), Math.trunc(BuffW * 0.95), Math.trunc(BuffH * 0.28));
            TakeBWPicture(tmpRect);
            keyword    = '日';
            lettersType= 2;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.5, keyword);
            if ((res.indexOf('年') >= 0) && (res.indexOf('月') >= 0) && (res.indexOf('日') >= 0)) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 9;
                txtend     = 11;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT4.png";
                tableNum   = 4;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok == true) && (tableNum == 4)) {
            // 保険契約者
            tmpRect    = RectF(Math.trunc(BuffW * 0.10), Math.trunc(BuffH * 0.30), Math.trunc(BuffW * 0.47), Math.trunc(BuffH * 0.34));
            TakeBWPicture(tmpRect);
            keyword    = '様';
            lettersType= 0;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 12;
                txtend     = 14;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT5.png";
                tableNum   = 5;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok == true) && (tableNum == 5)) {
            // 被保険者
            tmpRect    = RectF(Math.trunc(BuffW * 0.10), Math.trunc(BuffH * 0.36), Math.trunc(BuffW * 0.47), Math.trunc(BuffH * 0.41));
            TakeBWPicture(tmpRect);
            keyword    = '様';
            lettersType= 0;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 15;
                txtend     = 17;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT6.png";
                tableNum   = 6;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok == true) && (tableNum == 6)) {
            // 受取人等
            tmpRect    = RectF(Math.trunc(BuffW * 0.05), Math.trunc(BuffH * 0.43), Math.trunc(BuffW * 0.35), Math.trunc(BuffH * 0.47));
            TakeBWPicture(tmpRect);
            keyword    = '様';
            lettersType= 0;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 18;
                txtend     = 20;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT7.png";
                tableNum   = 7;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok   == true) && (tableNum == 7)){
            // 円1
            let ekeycount = new Uint32Array([3]);
            tmpRect  = RectF(Math.trunc(BuffW * 0.79), Math.trunc(BuffH * 0.31), BuffW, Math.trunc(BuffH * 0.41));
            TakeBWPicture(tmpRect);
            keyword  = '円';
            lettersType= 1;
            res = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.5, keyword);
            enarray  = getStrArray(res, keyword);
            encount  = enarray.length;
            //label3.innerText   = `円1: ${i}  c: ${encount}`;
            if (encount == ekeycount[0]) {
                // Output to web page
                let arr  = enarray.sort(function (a, b) { return a[1] - b[1] });
                txtstart    = 21;
                txtend      = 25;
                for ( j = 1; j <= encount; j++) {
                    prefix      = '■' + String(j);
                    tmpStr      = arr[j-1][2].toLocaleString();
                    if (tmpStr == 'NaN') {
                        tmpStr  = '*********';
                    }
                    textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                }
                shaba.src = "shablonT8.png";
                tableNum = 8;
            } else {
                keyok = false; 
            }
        } else if ((keyok == true) && (tableNum == 8)) {
            // 支払期間
            tmpRect    = RectF(Math.trunc(BuffW * 0.5), Math.trunc(BuffH * 0.43), Math.trunc(BuffW * 0.60), Math.trunc(BuffH * 0.47));
            TakeBWPicture(tmpRect);
            keyword    = '年';
            lettersType= 1;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 25;
                txtend     = 27;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT9.png";
                tableNum   = 9;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok == true) && (tableNum == 9)) {
            // 保険料支払方法
            tmpRect    = RectF(Math.trunc(BuffW * 0.62), Math.trunc(BuffH * 0.43), Math.trunc(BuffW * 0.78), Math.trunc(BuffH * 0.47));
            TakeBWPicture(tmpRect);
            keyword    = '払';
            lettersType= 1;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 28;
                txtend     = 30;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT10.png";
                tableNum   = 10;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok == true) && (tableNum == 10)) {
            // 配当金支払方法
            tmpRect    = RectF(Math.trunc(BuffW * 0.82), Math.trunc(BuffH * 0.43), Math.trunc(BuffW * 0.95), Math.trunc(BuffH * 0.47));
            TakeBWPicture(tmpRect);
            keyword    = '立';
            lettersType= 0;
            res        = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.2, keyword);
            //label3.innerText   = 'res: ' + res;
            if (res.indexOf(keyword) >= 0) { 
                pos1       = res.indexOf('|') + 1;
                pos2       = res.indexOf('[');
                tmpStr     = res.substring(pos1, pos2)
                txtstart   = 31;
                txtend     = 33;
                prefix     = '●';
                textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                shaba.src  = "shablonT11.png";
                tableNum   = 11;
            } else {
                keyok  = false; 
            }            
        } else if ((keyok   == true) && (tableNum == 11)){
            // 円2
            let ekeycount = new Uint32Array([4]);
            tmpRect  = RectF(Math.trunc(BuffW * 0.42), Math.trunc(BuffH * 0.52), Math.trunc(BuffW * 0.60), Math.trunc(BuffH * 0.70));
            TakeBWPicture(tmpRect);
            keyword  = '円';
            lettersType= 1;
            res = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 5.5, 0.5, keyword);
            enarray  = getStrArray(res, keyword);
            encount  = enarray.length;
            //label3.innerText   = `円2: ${i}  c: ${encount}`;
            if (encount == ekeycount[0]) {
                // Output to web page
                let arr  = enarray.sort(function (a, b) { return a[1] - b[1] });
                txtstart    = 34;
                txtend      = 39;
                for ( j = 1; j <= encount; j++) {
                    prefix      = 'X' + String(j);
                    tmpStr      = arr[j-1][2].toLocaleString();
                    if (tmpStr == 'NaN') {
                        tmpStr  = '*********';
                    }
                    textreplace(nowtext, txtstart, txtend, prefix, tmpStr);
                }
                tableNum = 12;
            } else {
                keyok = false; 
            }
        }   
    } 
    // Stop camera
    if ((keyok   == true) && (tableNum == 12)){
        textreplace(nowtext, 0, 2, '■', String(version));
        
        //label3.innerText = nowtext[0];

        document.getElementById("outbody").innerHTML = nowtext.join('\n');
        videostop        = true;

        let vstream      = video.srcObject;
        let tracks       = vstream.getTracks();
        tracks.forEach(function(track) {
        track.stop();
        });
        video.srcObject  = null;
        document.body.style.backgroundColor = 'white';

        if (isShowBlue==true) {
            let elem = document.createElement("img");
            elem.setAttribute("src", canvas.toDataURL());
            document.getElementById("outbody").appendChild(elem);
        }
        shaba.hidden     = true;
        mainimg.hidden   = true;        
    }

    working = false;
}

function dataclick(elementid){
    let text = document.getElementById(elementid).innerText;
    alert(text);
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
    if (videostop == false){
        shaba.hidden   = false;
    }


    label.hidden       = true;
    label2.style.left  = "10px";  
    //label2.style.top   = Math.round(h/2.0) + "px";  
    label2.style.top   = Math.round(h - 70) + "px";  
    label2.hidden      = true;
    label3.style.left  = "10px";  
    label3.style.top   = Math.round(h - 40) + "px";  
    label2.hidden      = true;
    mainimg.width      = w;
    mainimg.height     = h;
    mainimg.style.left = leftPos + "px";  
    shaba.style.left   = leftPos + "px";  
    canvas.width       = ww;
    canvas.height      = hh;
    canvas.style.left  = 0 + "px";  
    canvas.style.top   = h + "px";  

    //label3.innerText   = 'w:'+w+' h:'+h+' ww:'+ww+' hh:'+hh;

    //camx = Math.round((video.videoWidth  - video.videoWidth  * camzoom) / 2.0);
    //camy = Math.round((video.videoHeight - video.videoHeight * camzoom) / 2.0);

    BuffW              = ww;
    BuffH              = hh;

    MaxLetterW         = Math.round(ww / 20.0);
    MaxLetterH         = MaxLetterW;
    MinLetterW         = 1.0; // Math.round(ww / 18.0);
    MinLetterH         = Math.round(hh / 100.0);

    MinProbeSquare     = Math.round(MinLetterH * 0.25);

    BuffBlack          = new Uint32Array(BuffW * BuffH);
    BuffBlue           = new Uint32Array(BuffW * BuffH); 
}

function loadText(filename, elementID) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if (elementID == 'text'){
                text      = this.responseText;
            } else {
                if (elementID == 'Kanji'){
                    KanjiList = this.responseText;
                } else {
                    KanjiListD = this.responseText;
                }
            }
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
                for (let i=0; i<outdata.length; i++){
                    KanjiSmall[KanjiSmallLen*fontNum + i] = outdata[i];
                }
            } 
        }
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}

function loadDataD(filename, fontNum) {
    let xhttp = new XMLHttpRequest();
    xhttp.responseType       = "arraybuffer";
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let arrayBuffer  = xhttp.response; 
            if (arrayBuffer) {
                let outdata   = new Uint8Array(arrayBuffer);
                for (let i=0; i<outdata.length; i++){
                    KanjiSmallD[KanjiSmallLenD*fontNum + i] = outdata[i];
                }
            } 
        }
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}


