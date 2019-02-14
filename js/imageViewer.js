 function ImageViewer(ImageViewerID){
    var _this = this;
    var containerDiv = [
        '<div class="imageContainer">',
            '<div class="kPainterBox">',
                '<div class="kPainterImgsDiv">',
                    '<canvas class="kPainterCanvas" style="display:none;left:0;top:0;"></canvas>',
                '</div',
                '><div class="kPainterCroper" style="width:50px;height:50px;display:none;">',
                    '<div class="kPainterCells">',
                        '<div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>',
                    '</div',
                    '><div class="kPainterBigMover" data-orient="0,0" style="display:none"></div',
                    '><div class="kPainterEdges">',
                        '<div data-orient="-1,0"></div',
                        '><div data-orient="0,-1"></div',
                        '><div data-orient="1,0"></div',
                        '><div data-orient="0,1"></div>',
                    '</div',
                    '><div class="kPainterCorners">',
                        '<div data-orient="-1,-1"><i></i></div',
                        '><div data-orient="1,-1"><i></i></div',
                        '><div data-orient="1,1"><i></i></div',
                        '><div data-orient="-1,1"><i></i></div>',
                    '</div',
                    '><div class="kPainterMover" data-orient="0,0">',
                        '<div></div>',
                        '<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg"><path d="M1792 896q0 26-19 45l-256 256q-19 19-45 19t-45-19-19-45v-128h-384v384h128q26 0 45 19t19 45-19 45l-256 256q-19 19-45 19t-45-19l-256-256q-19-19-19-45t19-45 45-19h128v-384h-384v128q0 26-19 45t-45 19-45-19l-256-256q-19-19-19-45t19-45l256-256q19-19 45-19t45 19 19 45v128h384v-384h-128q-26 0-45-19t-19-45 19-45l256-256q19-19 45-19t45 19l256 256q19 19 19 45t-19 45-45 19h-128v384h384v-128q0-26 19-45t45-19 45 19l256 256q19 19 19 45z" fill="#fff"/></svg>',
                    '</div>',
                '</div',
                '><div class="kPainterPerspect" style="display:none;">',
                    '<canvas class="kPainterPerspectCvs"></canvas',
                    '><div class="kPainterPerspectCorner" data-index="0">lt</div',
                    '><div class="kPainterPerspectCorner" data-index="1">rt</div',
                    '><div class="kPainterPerspectCorner" data-index="2">rb</div',
                    '><div class="kPainterPerspectCorner" data-index="3">lb</div>',
                '</div',
                '><div class="kPainterGesturePanel"></div>',
            '</div>',
        '</div>',
        '<div class="thumbnailContainer"></div>'
    ].join('');
    this._imageViewer = document.getElementById(ImageViewerID);
    this._imageViewer.innerHTML = containerDiv;
    this._Canvas = this._imageViewer.querySelector('canvas.kPainterCanvas');
    this._imgContainer = this._imageViewer.querySelector('div.imageContainer');
    this._imgsDiv = this._imageViewer.querySelector('div.kPainterImgsDiv');
    this._thumbnailContainer = this._imageViewer.querySelector('div.thumbnailContainer');

    this._defaultFileInput = document.createElement("input");
    this._defaultFileInput.setAttribute("type","file");
    this._defaultFileInput.setAttribute("accept","image/bmp,image/gif,image/jpeg,image/png,image/webp");
    this._defaultFileInput.setAttribute("multiple","true");

    this._imgContainerW = lib.getElDimensions(this._imgContainer).clientWidth;
    this._imgContainerH = lib.getElDimensions(this._imgContainer).clientHeight;

    this._imgsDivW = lib.getElDimensions(this._imgsDiv).clientWidth;
    this._imgsDivH = lib.getElDimensions(this._imgsDiv).clientHeight;

    this._thumbnailContainerW = lib.getElDimensions(this._thumbnailContainer).clientWidth;
    this._thumbnailContainerH = lib.getElDimensions(this._thumbnailContainer).clientHeight;

    this.curIndex = -1;
    this.imgArray = [];
    this.thumbnailArray = [];

    this._defaultFileInput.addEventListener("change", function(event){
        _this._addFilesFromLocal(event.target.files);
    });

    this._imageViewer.addEventListener("dragover", function(event) {
        event.stopPropagation();
        event.preventDefault();
    });

    this._imageViewer.addEventListener("drop", function(event) {
        event.stopPropagation();
        event.preventDefault();
        _this._addFilesFromLocal(event.dataTransfer.files);
    });

    this._startPos = {};
    //https://developer.mozilla.org/zh-CN/docs/Web/Events
    this._imgContainer.addEventListener("touchstart", ontouchstart, false);
    this._imgContainer.addEventListener("touchmove", ontouchmove, false);
    this._imgContainer.addEventListener("touchend", ontouchend, false);

    function ontouchstart(event){
        //event.preventDefault();
        var touches = event.changedTouches;
        //Multi-contact is prohibited
        if(touches.length!=1){return false;}

        _this._startPos = {
            startX: touches[0].pageX,
            startY: touches[0].pageY
        }
    }

    function ontouchmove(event){
        event.preventDefault();
        if(_this.getCount()<1){return false;}

        var touches = event.changedTouches;
        var _curOffsetX = touches[0].pageX - _this._startPos.startX,
            _curOffsetY = touches[0].pageY - _this._startPos.startY;

        var _imgArray =  _this.imgArray,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1)<0?(_imgArray.length-1):(_curIndex - 1),
            _nIndex = (_curIndex + 1)>(_imgArray.length-1)?0:(_curIndex + 1);

        _imgArray[_curIndex].style.left = (_this._imgsDivW - _imgArray[_curIndex].width)/2 + _curOffsetX + "px";
        _imgArray[_pIndex].style.right = _this._imgContainerW - _curOffsetX + "px";
        _imgArray[_nIndex].style.left = _this._imgContainerW + _curOffsetX + "px";

        //console.log('pageX: '+touches[0].pageX+" pageY: "+touches[0].pageY);   
    }

    function ontouchend(event){
        event.preventDefault();
        if(_this.getCount()<1){return false;}

        var touches = event.changedTouches;
        var _curOffsetX = touches[0].pageX - _this._startPos.startX,
            _curOffsetY = touches[0].pageY - _this._startPos.startY;

        var _imgArray =  _this.imgArray,
            _curIndex = _this.curIndex,
            _pIndex = (_curIndex - 1)<0?(_imgArray.length-1):(_curIndex - 1),
            _nIndex = (_curIndex + 1)>(_imgArray.length-1)?0:(_curIndex + 1);

        if(_curOffsetX>_this._imgsDivW/3){
            _this.changePage('p');
        }else if(_curOffsetX<-_this._imgsDivW/3){
            _this.changePage('n');
        }else{
            _imgArray[_curIndex].style.left = (_this._imgsDivW - _imgArray[_curIndex].width)/2 + 'px';
            _imgArray[_pIndex].style.right = _this._imgContainerW + 'px';
            _imgArray[_nIndex].style.left = _this._imgContainerW + 'px';
        }
    }

}

ImageViewer.prototype.adaptiveLayout = function () {
    var _this = this;
    this._imgsDivW = lib.getElDimensions(this._imgsDiv).clientWidth;
    this._imgsDivH = lib.getElDimensions(this._imgsDiv).clientHeight;

    this._thumbnailContainerW = lib.getElDimensions(this._thumbnailContainer).clientWidth;
    this._thumbnailContainerH = lib.getElDimensions(this._thumbnailContainer).clientHeight;

    this._fitImage(_this.imgArray[_this.curIndex]);
}

ImageViewer.prototype.captureImage = function (url) {
    var _this = this;
    var img = new Image();
    img.className = 'imgArray-item';
	img.setAttribute('alt', 'image');
    img.onload = function(){
        img.oriWidth = img.naturalWidth || img.width;
        img.oriHeight = img.naturalHeight || img.height;
        img.curWidth = img.naturalWidth || img.width;
        img.curHeight = img.naturalHeight || img.height;
        
        _this.imgArray.push(img);
        _this._addImgToContainer(img);
        _this._addImgToThumbnail(img.cloneNode(true));

        _this.curIndex ++;
        _this.showImage(_this.curIndex);        
    }
    img.onerror = function(){
        console.log("Failed to create image node.");
    }

    if(url instanceof Blob){
        img.src = URL.createObjectURL(url);
        img.oriBlob = url;
    }else{
        img.src = url;
    }    

    return true;
}

ImageViewer.prototype.captureImageWithBlob = function (url) {
    var _this = this;
    lib.getBlobFromAnyImgData(url, function(blob){
        _this.captureImage(blob);
    });

    return true;
}

ImageViewer.prototype.showImage = function (index) {
    if(index<0 || index>this.imgArray.length-1){ return false; }
      
    //update thumbnail
    var _thumArr = this.thumbnailArray;

    for(var i = 0;i<_thumArr.length;i++){
        if(i==index){
            lib.addClass(_thumArr[i],'on');
        }
        else{
           lib.removeClass(_thumArr[i],'on');
        }
    }

    this.curIndex = index;

    //update image container
    this._updateImagePosition();

    this._updateNumUI();
    return true;
}

ImageViewer.prototype.changePage = function(cmd){
    var _index;
    switch(cmd){
        case "f": _index = 0; break;
        case "p": _index = this.curIndex - 1; break;
        case "n": _index = this.curIndex + 1; break;
        case "l": _index = this.imgArray.length - 1; break;
        default: 
            if(arguments.length < 1 || isNaN(cmd)){
                return false;
            }else{
                _index = Math.round(cmd);
            }
    }
    /*eslint-enable indent*/
    if(_index<0){
        _index = this.imgArray.length -1;
    }else if(_index>this.imgArray.length-1){
        _index = 0;
    }

    this.showImage(_index);
    return true;
};

ImageViewer.prototype.getCurentIndex = function () {
    return this.curIndex;
}

ImageViewer.prototype.getCount = function () {
    return this.imgArray.length;
}

ImageViewer.prototype.getImage = function (index,isOri) {
    var _curIndex = index || this.curIndex;
    if(isOri){
        return this.imgArray[_curIndex];
    }else{
        return this.imgArray[_curIndex].cloneNode(true);
    }
    
}

ImageViewer.prototype.deleteImage = function (index) {
    var _curIndex = index || this.curIndex;
    if(index < 0 || index >= this.imgArray.length){ return false; }
    
    //update image container
    this._imgsDiv.removeChild(this.imgArray[index]);
    this.imgArray.splice(index, 1);

    //update thumbnail container
    this._thumbnailContainer.removeChild(this.thumbnailArray[index]);
    this.thumbnailArray.splice(index, 1);

    if(index < this.curIndex){
        this.curIndex--;
        this._updateNumUI();
    }else if(index > this.curIndex){
        this._updateNumUI();
    }else{
        this.curIndex--;
        this.showImage(this.curIndex<0?0:this.curIndex);
    }

    return true;
}

ImageViewer.prototype.download = function(filename, index){
    if(arguments.length < 2){
        index = this.curIndex;
    }
    if(isNaN(index)){ return false; }
    index = Math.round(index);
    if(index < 0 || index >= this.imgArray.length){ return false; }
    var a = document.createElement('a');
    a.target='_blank';
    var img = this.imgArray[index];
    var blob = img.oriBlob || img.src;
    if(!filename){
        var suffix = "";
        if(blob.type){
            suffix = blob.type.substring(blob.type.indexOf('/')+1);
        }else if(-1 != suffix.indexOf(".png")){
            suffix = "png";
        }else if(-1 != suffix.indexOf(".gif")){
            suffix = "gif";
        }else if(-1 != suffix.indexOf(".jpg") || -1 != suffix.indexOf(".jpeg")){
            suffix = "jpg";
        }else{
            suffix = "png";
        }
        filename = (new Date()).getTime() + '.' + suffix;
    }
    a.download = filename;
    var objUrl = img.oriBlob ? URL.createObjectURL(blob) : img.src;
    //var objUrl = img.src;
    a.href = objUrl;
    var ev = new MouseEvent('click',{
        "view": window,
        "bubbles": true,
        "cancelable": false
    });
    a.dispatchEvent(ev);
    //a.click();
    setTimeout(function(){
        img.oriBlob ? URL.revokeObjectURL(objUrl) : null;
    }, 10000);
    return filename;
};

ImageViewer.prototype.showFileChooseWindow = function(){
    this._defaultFileInput.click();
    return true;
};

ImageViewer.prototype._updateImagePosition = function(){
    var _imgArray = this.imgArray,
        _curIndex = this.curIndex,
        _pIndex = (_curIndex - 1)<0?(_imgArray.length-1):(_curIndex - 1),
        _nIndex = (_curIndex + 1)>(_imgArray.length-1)?0:(_curIndex + 1);

    for(var i=0;i<_imgArray.length;i++){
        if(i!=_curIndex && i!=_pIndex && i!= _nIndex){
            _imgArray[i].style.display = 'none';
        }else{
            _imgArray[i].style.display = 'block';
        }
        _imgArray[i].style.right = '';
        _imgArray[i].style.left = '';
    } 

    _imgArray[_curIndex].style.left = (this._imgsDivW - _imgArray[_curIndex].width)/2 + 'px';
    //_imgArray[_curIndex].style.right = '0';

    if(_pIndex!=_curIndex){
        _imgArray[_pIndex].style.left = '';
        _imgArray[_pIndex].style.right = this._imgContainerW + 'px';
    }

    if(_nIndex!=_curIndex && _nIndex!=_pIndex){
        _imgArray[_nIndex].style.right = '';
        _imgArray[_nIndex].style.left = this._imgContainerW + 'px';
    }

    return true;
};

ImageViewer.prototype._addFilesFromLocal = function (files) {
    var _this = this;
    if(files instanceof Array || files instanceof FileList){
        for(var i = 0; i < files.length; i++){
            _this._addFilesFromLocal(files[i]);
        }
    }else{
        var reader = new FileReader();
        reader.onload = function(){
            _this.captureImageWithBlob(reader.result);
        };
        reader.readAsDataURL(files);
    }
}

ImageViewer.prototype._fitImage = function (img) {
    var containerAspectRatio = this._imgsDivW / this._imgsDivH;
    var imgAspectRatio = img.naturalWidth / img.naturalHeight;

    if(imgAspectRatio>containerAspectRatio){
        img.width = this._imgsDivW;
        img.height = img.width/imgAspectRatio;
    }else {
        img.height = this._imgsDivH;
        img.width = img.height*imgAspectRatio;
    }
}

ImageViewer.prototype._addImgToContainer = function (img) {
    this._fitImage(img);
    this._imgsDiv.appendChild(img);
}

ImageViewer.prototype._addImgToThumbnail = function (img) {
    var _this = this;
    var cvs = document.createElement("canvas");
    cvs.width = this._thumbnailContainerW/3;
    cvs.height = this._thumbnailContainerH;
    var ctx = cvs.getContext('2d');
    ctx.drawImage(img,0,0,cvs.width,cvs.height);

    var newDiv = document.createElement("div");
    newDiv.className = 'thumbnail-item on';
    newDiv.addEventListener("click",function(){
        _this.showImage(_this.thumbnailArray.indexOf(this));
    });
    newDiv.appendChild(cvs);
    this.thumbnailArray.push(newDiv);
    this._thumbnailContainer.appendChild(newDiv);
}

ImageViewer.prototype.onNumChange = null;
ImageViewer.prototype._updateNumUI = function(){
    lib.doCallbackNoBreak(this.onNumChange,[this.curIndex, this.imgArray.length]);
};

