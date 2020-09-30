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
const KanjiNumsLen     = 4;
const FontCount        = 3;
const MaxError         = 22000;
const HDRsquare        = 30.0;

let  working           = false;
let  BuffBlack         = new Uint32Array;
let  BuffBlue          = new Uint32Array;
let  BuffW, BuffH      = 10;
let  MaxLetterW        = 10;
let  MaxLetterH        = 10;
let  MinLetterW        = 10;
let  MinLetterH        = 10;
let  averageWidth      = 10;
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
let  KanjiNums         = new Uint32Array(KanjiNumsLen);
  // SHOW
let  isShowBW          = false;
let  isShowBlue        = true;
let  isShow            = false;
let  isShowLetterRect  = true;
  // TST
let  testNum           = 0;
let  keyok             = false;
let  manX, manY        = 0;

let  KanjiList         = document.getElementById('KanjiList');
let  textHtml          = document.getElementById('textHtml');

//KanjiList.value = '※〒0123456789*()～これまでのと月円年金加入国民合歳特別■';
loadText('KanjiList.str', 'KanjiList');
loadText('Teikibin.htm', 'textHtml');

// Random setup
// for (let i=0; i<FontCount; i++){
//     for (let j=0; j<KanjiSmallLen; j++){
//         KanjiSmall[KanjiSmallLen*i + j] = Math.random() * 255;
//     }
// }

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
    let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'continuous' };
    //let constraints = { audio: false, video: { facingMode: 'environment', width: 3840, height: 2160 }, focusMode: 'continuous', focusDistance: 20000 };
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
                BuffBlue[smb] = mmsred;
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

    if ( isShowLetterRect == true ) {
        context.strokeStyle = "rgb(0,128,0)";
    }
    for ( y = 1; y < Math.trunc( (area[3]-area[1]) / MinLetterH ); y++ ) {
        for ( x = 1; x < Math.trunc( (area[2]-area[0]) / MinLetterW); x++ ) {
            StartX  = x * MinLetterW - 4 + Math.trunc(area[0]);
            StartY  = y * MinLetterH - 4 + Math.trunc(area[1]);
            NowRect = GetKanjiRect( buff, StartX, StartY, MinLetterW, MinLetterH, width, height,
            MinLetterW, MinLetterH, MaxLetterW, MaxLetterH);
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
                KanjiFont[j] = i;
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
    
    let i,j,k     = 0;
    let x,y       = 0;
    let clarray   = new Array();
    let isNewCl   = false;
    let filterOk  = false;
    let sss       = '';
    let keylen    = 0;
    let OutText   = '';
    let kWords    = KeyWords.split('|');

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
                if ((LetterRecs[j][0]-LetterRecs[clarray[y][x-1]][0]) < (LetterRecs[j][2] - LetterRecs[j][0])/2.0 ) { filterOk = false }
            }
            if ( clarray[y].length >= keylen ) {
                MakeTestSquare(BuffBlue, BuffW, BuffH, LetterRecs[j], TestSquareSmall);
                KanjiAnalize();
                for ( i = 0; i < KanjiNumsLen; i++ ) {
                    if ((KanjiNums[i]>1) && (KanjiNums[i]<38) && (filterOk == true)) {
                        sss = sss + KanjiList.value.charAt(KanjiNums[i]);
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
    //label3.innerText   = sss;
    return OutText;
}

function OCRWork() {
    let LetterRecrs = new Uint32Array(400); // Letter sqares
    let tmpRect     = new Uint32Array(4);   // OCR area Rect
    let nowtext     = textHtml.value;
    let keyword     = '';
    let aveWidth    = 0.0;
    let res;

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
    keyok   = false;
    tmpRect = RectF(0, 0, Math.trunc(BuffW/3.5), Math.trunc(BuffH/12.0));
    TakeBWPicture(tmpRect);
    //keyword = 'これまでの年金加入';
    keyword = 'これまでの';
    res     = getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 1.3, 0.4, keyword );
    label2.innerText   = res;
    if (res.indexOf(keyword) >= 0) { 
        keyok   = true; 
        label3.innerText   = '●';
    } else {
        label3.innerText   = '〇';
    }

    

    // if (keyok == true){
    //     tmpRect = RectF(0, Math.trunc(BuffH/2.9), Math.trunc(BuffW/4.0), Math.trunc(BuffH/11.0)+Math.trunc(BuffH/2.9));
    //     TakeBWPicture(tmpRect);
    //     //keyword:= '老齢年金';
    //     keyword = '年金の';
    //     //res := getBoxesFromBufferArea( BuffBlack, BuffW, BuffH, tmpRect, 1.4, 0.4, keyword, LetterRecrs, aveWidth);
    //     //if pos(keyword, res)<=0 then
    //     //begin
    //     //keyok:= False;
    //     //end;
    //     //outStr:=outStr + ' ' + res;
    // }

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
    label.innerText    = w + " XYZ " + h + "  ASP:" + videoasp + " Video: " + ww + " x " + hh + "  VASP:" + vasp;

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
    //label2.style.top   = Math.round(h/2.0) + "px";  
    label2.style.top   = Math.round(h - 60) + "px";  
    //label3.innerText   = tmpStr2;
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
    MinLetterH         = Math.round(hh / 50.0);

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
                for (let i=0; i<outdata.length; i++){
                    KanjiSmall[KanjiSmallLen*fontNum + i] = outdata[i];
                }
            } 
        }
    }
    xhttp.open("GET", filename, true);
    xhttp.send();
}


