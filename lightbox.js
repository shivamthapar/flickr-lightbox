function Flickr(key) {
  this.apiKey = key;
};

Flickr.prototype.getUrlForQuery = function getUrlForQuery(user, photoset) {
  return 'https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key='
          + this.apiKey
          + '&user_id=' + user
          + '&photoset_id=' + photoset
          + '&format=json&nojsoncallback=?';
}

Flickr.prototype.getImageUrl = function getImageUrl(farm, server, id, secret, thumb){
  var url = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret;
  if(thumb) url += '_s';
  url += '.jpg';
  return url;
}

Flickr.prototype.getImages = function getImages(user, photoset, callback) {
  var _this = this;
  var url = this.getUrlForQuery(user,photoset);
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function() {

    // request was a success
    if (request.status >= 200 && request.status < 400) {
      var data = JSON.parse(request.responseText);
      var photos = [];
      data.photoset.photo.forEach(function(photo){
        var p = {};
        p.title = photo.title;
        p.thumb = _this.getImageUrl(photo.farm,photo.server,photo.id, photo.secret,true);
        p.url = _this.getImageUrl(photo.farm,photo.server,photo.id, photo.secret,false);
        photos.push(p);
      });
      callback(true, {photos: photos});
    }

  };

  // error in requesting URL
  request.onerror = function() {
    callback(false, {msg: 'Could not fetch images from Flickr.'});
  };

  request.send();
}

function Lightbox(photos, parentElem) {

  /* Data Members */
  var _this = this;
  this.photos = photos;
  this.parentElem = parentElem;
  this.visible = false;
  this.currIndex = 0;
  this.isLoading = true;
  this.photoElem = null;
  this.titleElem = null;
  this.spinnerElem = null;
  this.leftElem = null;
  this.rightElem = null;
  this.imgWrapper = null;

  /* Event Handlers */
  this.onPhotoLoadHandler = function onPhotoLoadHandler() {
    _this._removeClass(_this.contentElem, "preload");
    _this.contentElem.style.marginTop = "-" + this.height/2 + "px";
    _this.contentElem.style.marginLeft = "-" + this.width/2 + "px";
    _this.leftElem.style.top = this.height/2+"px";
    _this.rightElem.style.top = this.height/2+"px";
  };

  this.onClickHandler = function onClickHandler(e) {
    switch(e.target.id){
      case "lightbox-left-arrow":
        _this.setCurrIndex(_this.currIndex-1);
        _this.displayCurrPhoto();
        break;
      case "lightbox-right-arrow":
        _this.setCurrIndex(_this.currIndex+1);
        _this.displayCurrPhoto();
        break;
      case "lightbox-photo":
        break;
      case "lightbox-title":
        break;
      case "lightbox-content":
        break;
      default:
        // outside lightbox-content (i.e. click in the dark area)
        _this._addClass(_this.elem,"hide");
        break;
    }
  }

  this._createLightboxElem();
}

/* Public Functions */
Lightbox.prototype.setCurrIndex = function setCurrIndex(idx){
  console.log("called: ", idx);
  if(idx < 0 || idx >= this.photos.length) return;
  this.currIndex = idx;
}

Lightbox.prototype.displayCurrPhoto = function displayCurrPhoto() {
  this._setPhotoElem(this.photos[this.currIndex].url);
  this._setTitleElem(this.photos[this.currIndex].title);
  this._createImgWrapper();

  this._addClass(this.contentElem, "preload");

  if(this.currIndex === 0)
    this._addClass(this.leftElem, "hide");
  else
    this._removeClass(this.leftElem,"hide");

  if(this.currIndex === this.photos.length-1)
    this._addClass(this.rightElem, "hide");
  else
    this._removeClass(this.rightElem,"hide");

  this._removeClass(this.elem,"hide");
}

/* DOM Element Functions */
Lightbox.prototype._createLightboxElem = function _createLightboxElem() {
  this.elem = document.createElement("div");
  this.elem.setAttribute("id", "lightbox");
  this.elem.addEventListener("click", this.onClickHandler);
  this._addClass(this.elem,"hide");
  this.parentElem.appendChild(this.elem);
  this._createContentElem();
}

Lightbox.prototype._createContentElem = function _createContentElem() {
  this.contentElem = document.createElement("div");
  this.contentElem.setAttribute("id", "lightbox-content");
  
  this.leftElem = document.createElement("div");
  this.leftElem.setAttribute("id", "lightbox-left-arrow");
  this.contentElem.appendChild(this.leftElem);
  this.rightElem = document.createElement("div");
  this.rightElem.setAttribute("id", "lightbox-right-arrow");
  this.contentElem.appendChild(this.rightElem);

  this.spinnerElem = document.createElement("div");
  this.spinnerElem.setAttribute("id", "lightbox-spinner");
  this.contentElem.appendChild(this.spinnerElem);

  this.elem.appendChild(this.contentElem);
}

Lightbox.prototype._createImgWrapper = function createImgWrapper() {
  if(!this.imgWrapper){
    this.imgWrapper = document.createElement("div");
    this.imgWrapper.setAttribute("id", "lightbox-img-wrapper");
    this.imgWrapper.appendChild(this.photoElem);
    this.imgWrapper.appendChild(this.titleElem);
    this.contentElem.appendChild(this.imgWrapper);
  }
}

Lightbox.prototype._setPhotoElem = function _setPhotoElem(url) {
  if(!this.photoElem){
    this.photoElem = document.createElement("img");
    this.photoElem.setAttribute("id", "lightbox-photo");
  }
  this.photoElem.setAttribute("src", url);
  this.photoElem.onload = this.onPhotoLoadHandler;
}

Lightbox.prototype._setTitleElem = function _setTitleElem(text) {
  if(!this.titleElem){
    this.titleElem = document.createElement("p");
    this.titleElem.setAttribute("id", "lightbox-title");
  }
  this.titleElem.textContent = text;
}

/* CSS Helper Functions */
Lightbox.prototype._hasClass = function _hasClass(elem, cls) {
  var regex = new RegExp("\\b" + cls + "\\b");
  return !!(elem.className.match(regex, ""));
}

Lightbox.prototype._addClass = function _addClass(elem, cls) {
  if(this._hasClass(elem, cls)) return;
  elem.className += " " + cls;
}
Lightbox.prototype._removeClass = function _removeClass(elem, cls) {
  var regex = new RegExp("\\b" + cls + "\\b");
  elem.className = elem.className.replace(regex, "")
}

function Gallery(divId, flickrApiKey) {
  var _this = this;
  this.div = document.getElementById(divId);
  this.flickrUser = this.div.getAttribute('data-flickr-user');
  this.flickrPhotoset = this.div.getAttribute('data-flickr-photoset');
  this.photos = [];
  this.flickr = new Flickr(flickrApiKey);
  this.lightbox = null;

  this.onThumbClickHandler = function(){
    _this.lightbox.setCurrIndex(parseInt(this.getAttribute("id")));
    _this.lightbox.displayCurrPhoto();
  };

  this._fetchImages(this.flickrUser,this.flickrPhotoset);
}

Gallery.prototype._fetchImages = function _fetchImages(user, photoset) {
  var _this = this;
  this.flickr.getImages(user, photoset, function(success, data){
    if(success){
      _this.photos = data.photos;
      _this._createGrid();
      _this.lightbox = new Lightbox(_this.photos, _this.div);
    }
    else{
      console.log("error: ", data.msg);
    }
  });
}

Gallery.prototype._createGrid = function _createGrid() {
  var _this = this;
  var grid = document.createElement("div");
  grid.setAttribute("id", "lightbox-grid");
  this.photos.forEach(function(photo, i){
    var p = document.createElement("img");
    p.setAttribute("class", "lightbox-thumb");
    p.setAttribute("id", i);
    p.setAttribute("src", photo.thumb);
    p.setAttribute("data-large", photo.url);
    p.addEventListener("click", _this.onThumbClickHandler, false);
    grid.appendChild(p);
  });
  this.div.appendChild(grid);
};
