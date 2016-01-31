/**
 * Flickr is a class to interact with the Flickr API. It can be used
 * to fetch photos from a Flickr photoset.
 *
 * @constructor
 * @param {string} key Flickr API key
 */
function Flickr(key) {
  this.apiKey = key;
};

/**
 * getUrlForQuery gets the URL of the Flickr API call to fetch a
 * user's photoset
 *
 * @param {string} user Flickr ID of user who owns the photoset
 * @param {string} photoset Flickr photoset id
 * @returns {string} URL of API call to fetch photoset
 */
Flickr.prototype.getUrlForQuery = function getUrlForQuery(user, photoset) {
  return 'https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key='
          + this.apiKey
          + '&user_id=' + user
          + '&photoset_id=' + photoset
          + '&format=json&nojsoncallback=?';
}

/**
 * getImageUrl gets the URL at which a Flickr photo can be found, given
 * its farm, server, id, and secret (which are returned by the Flickr API).
 * See https://www.flickr.com/services/api/misc.urls.html
 *
 * @param {string} farm Flickr farm id
 * @param {string} server Flickr server id
 * @param {string} id Flickr photo id
 * @param {string} secret Flickr photo secret
 * @param {bool} thumb is the image a thumbnail?
 * @returns {string} URL of photo
 */
Flickr.prototype.getImageUrl = function getImageUrl(farm, server, id, secret, thumb){
  var url = 'https://farm' + farm + '.staticflickr.com/' + server + '/' + id + '_' + secret;
  if(thumb) url += '_s';
  url += '.jpg';
  return url;
}

/**
 * getImages fetches all photos from a Flickr user's photoset
 *
 * @param {string} user Flickr user id
 * @param {string} photoset Flickr photoset id
 * @param {getImagesCallback} callback Called on success or failure of getImages
 */
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

/**
 * Lightbox represents the lightbox component. It displays a picture, has left and rightElem
 * arrows to navigate between pictures and shows a preloader while an image is loading.
 *
 * @constructor
 * @param {Photo[]} photos Array of Photos for lightbox
 * @param {DOMElement} parentElem Lightbox will be created as a child element of this DOM Element
 */
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

  /**
   * onPhotoLoadHandler centers the Lightbox content when a picture is fully loaded.
   * Also, the 'preload' CSS class is removed from the Lightbox content, hiding the spinner and
   * revealing the picture.
   *
   */
  this.onPhotoLoadHandler = function onPhotoLoadHandler() {
    _this._removeClass(_this.contentElem, 'preload');
    _this.contentElem.style.marginTop = '-' + this.height/2 + 'px';
    _this.contentElem.style.marginLeft = '-' + this.width/2 + 'px';
    _this.leftElem.style.top = this.height/2+'px';
    _this.rightElem.style.top = this.height/2+'px';
  };

  /**
   * onClickHandler handles what happens when the Lightbox is clicked. If the arrows
   * are clicked, the next or previous picture is displayed. If the dark area (outside
   * the Lightbox content) is clicked, the Lightbox is hidden.
   *
   * @param {Event} e Click event
   */
  this.onClickHandler = function onClickHandler(e) {
    switch(e.target.id){
      case 'lightbox-left-arrow':
        _this.setCurrIndex(_this.currIndex-1);
        _this.displayCurrPhoto();
        break;
      case 'lightbox-right-arrow':
        _this.setCurrIndex(_this.currIndex+1);
        _this.displayCurrPhoto();
        break;
      case 'lightbox-photo':
        break;
      case 'lightbox-title':
        break;
      case 'lightbox-content':
        break;
      default:
        // outside lightbox-content (i.e. click in the dark area)
        _this.visible = false;
        _this._addClass(_this.elem,'hide');
        break;
    };
  }

  /**
   * onKeydownHandler handles what happens when keys are pressed. If left arrow key is pressed,
   * the previous picture is displayed, and if the right arrow key is pressed the next picture is displayed.
   *
   * @param {Event} e Keydown event
   */
  this.onKeydownHandler = function onKeydownHandler(e){
    if(!_this.visible) return;

    e = e || window.event;

    // left arrow key
    if (e.keyCode == '37') {
      _this.setCurrIndex(_this.currIndex-1);
      _this.displayCurrPhoto();
    }
    // right arrow key
    else if (e.keyCode == '39') {
      _this.setCurrIndex(_this.currIndex+1);
      _this.displayCurrPhoto();
    }
  }

  this._createLightboxElem();
}

/**
 * setCurrIndex sets the index of the picture to be displayed.
 *
 * @param {number} idx Index of photo to display
 */
Lightbox.prototype.setCurrIndex = function setCurrIndex(idx){
  if(idx < 0 || idx >= this.photos.length) return;
  this.currIndex = idx;
}

/**
 * displayCurrPhoto displays current photo and title in the Lightbox
 * and makes the Lightbox visible. When called, it gives the Lightbox
 * content the CSS class 'preload', which causes the spinner to be
 * shown. Then, when the picture is done loading, the onPhotoLoadHandler
 * removes this class, hiding the spinner and showing the picture.
 *
 */
Lightbox.prototype.displayCurrPhoto = function displayCurrPhoto() {
  this._setPhotoElem(this.photos[this.currIndex].url);
  this._setTitleElem(this.photos[this.currIndex].title);
  this._createImgWrapper();

  this._addClass(this.contentElem, 'preload');
  this.contentElem.setAttribute('style','');

  if(this.currIndex === 0)
    this._addClass(this.leftElem, 'hide');
  else
    this._removeClass(this.leftElem,'hide');

  if(this.currIndex === this.photos.length-1)
    this._addClass(this.rightElem, 'hide');
  else
    this._removeClass(this.rightElem,'hide');

  this.visible = true;
  this._removeClass(this.elem,'hide');
}

/* DOM Element Functions */
Lightbox.prototype._createLightboxElem = function _createLightboxElem() {
  this.elem = document.createElement('div');
  this.elem.setAttribute('id', 'lightbox');
  this.elem.addEventListener('click', this.onClickHandler);
  window.addEventListener('keydown', this.onKeydownHandler);
  this._addClass(this.elem,'hide');
  this.parentElem.appendChild(this.elem);
  this._createContentElem();
}

Lightbox.prototype._createContentElem = function _createContentElem() {
  this.contentElem = document.createElement('div');
  this.contentElem.setAttribute('id', 'lightbox-content');

  this.leftElem = document.createElement('div');
  this.leftElem.setAttribute('id', 'lightbox-left-arrow');
  this.contentElem.appendChild(this.leftElem);
  this.rightElem = document.createElement('div');
  this.rightElem.setAttribute('id', 'lightbox-right-arrow');
  this.contentElem.appendChild(this.rightElem);

  this.spinnerElem = document.createElement('div');
  this.spinnerElem.setAttribute('id', 'lightbox-spinner');
  this.contentElem.appendChild(this.spinnerElem);

  this.elem.appendChild(this.contentElem);
}

Lightbox.prototype._createImgWrapper = function createImgWrapper() {
  if(!this.imgWrapper){
    this.imgWrapper = document.createElement('div');
    this.imgWrapper.setAttribute('id', 'lightbox-img-wrapper');
    this.imgWrapper.appendChild(this.photoElem);
    this.imgWrapper.appendChild(this.titleElem);
    this.contentElem.appendChild(this.imgWrapper);
  }
}

Lightbox.prototype._setPhotoElem = function _setPhotoElem(url) {
  if(!this.photoElem){
    this.photoElem = document.createElement('img');
    this.photoElem.setAttribute('id', 'lightbox-photo');
  }
  this.photoElem.setAttribute('src', url);
  this.photoElem.onload = this.onPhotoLoadHandler;
}

Lightbox.prototype._setTitleElem = function _setTitleElem(text) {
  if(!this.titleElem){
    this.titleElem = document.createElement('p');
    this.titleElem.setAttribute('id', 'lightbox-title');
  }
  this.titleElem.textContent = text;
}

/* CSS Helper Functions */
Lightbox.prototype._hasClass = function _hasClass(elem, cls) {
  var regex = new RegExp('\\b' + cls + '\\b');
  return !!(elem.className.match(regex, ''));
}

Lightbox.prototype._addClass = function _addClass(elem, cls) {
  if(this._hasClass(elem, cls)) return;
  elem.className += ' ' + cls;
}
Lightbox.prototype._removeClass = function _removeClass(elem, cls) {
  var regex = new RegExp('\\b' + cls + '\\b');
  elem.className = elem.className.replace(regex, '')
}

/**
 * Gallery creates a gallery in the div withthe specified ID. It displays
 * all the photos from the Flickr photoset of a user, which are specified
 * as attributes 'data-flickr-user' and 'data-flickr-photoset' on the div.
 *
 * @constructor
 * @param {string} divId ID of DOM element to render Gallery in
 */
function Gallery(divId) {
  var FLICKR_API_KEY = '828ec158da9636c329c8478741095b24';

  var _this = this;
  this.div = document.getElementById(divId);
  this.flickrUser = this.div.getAttribute('data-flickr-user');
  this.flickrPhotoset = this.div.getAttribute('data-flickr-photoset');
  this.photos = [];
  this.flickr = new Flickr(FLICKR_API_KEY);
  this.lightbox = null;

  /**
   * onThumbClickHandler handles when a thumbnail is clicked. It sets the
   * lightbox to display the fullsize photo for the clicked thumbnail.
   *
   */
  this.onThumbClickHandler = function(){
    _this.lightbox.setCurrIndex(parseInt(this.getAttribute('id')));
    _this.lightbox.displayCurrPhoto();
  };

  this.fetchImages();
}

/**
 * fetchImages fetches photos from the Gallery's photoset. If the API call is
 * successful, it creates a grid of thumbnails of the photos. Otherwise, it logs
 * an error message.
 *
 */
Gallery.prototype.fetchImages = function fetchImages() {
  var _this = this;
  this.flickr.getImages(this.flickrUser, this.flickrPhotoset, function(success, data){
    if(success){
      _this.photos = data.photos;
      _this.createGrid();
      _this.lightbox = new Lightbox(_this.photos, _this.div);
    }
    else{
      console.log('error: ', data.msg);
    }
  });
}

/**
 * createGrid creates a grid of thumbnails of all the gallery's photos, and attaches
 * it to the DOM. Each thumbnail also has a reference to the url of its fullsize
 * photo under the attribute 'data-large'.
 *
 */
Gallery.prototype.createGrid = function createGrid() {
  var _this = this;
  var grid = document.createElement('div');
  grid.setAttribute('id', 'lightbox-grid');
  this.photos.forEach(function(photo, i){
    var p = document.createElement('img');
    p.setAttribute('class', 'lightbox-thumb');
    p.setAttribute('id', i);
    p.setAttribute('src', photo.thumb);
    p.setAttribute('data-large', photo.url);
    p.addEventListener('click', _this.onThumbClickHandler, false);
    grid.appendChild(p);
  });
  this.div.appendChild(grid);
};

/*** Documentation Section ***/

/**
 * Represents a photo from Flickr
 *
 * @typedef {Object} Photo
 * @property {string} title Title or caption of the photos
 * @property {string} url URL of the fullsize picture
 * @property {string} thumb URL of the thumbnail
 */

/**
 * Callback for getImages
 *
 * @callback getImagesCallback
 * @param {boolean} success True if photos were successfully fetched, false otherwise
 * @param {Object} data Holds data from API call
 * @param {Photo[]} data.photos Array of photos of the photoset, if call succeeded
 * @param {string} data.msg Description of error if API call failed
 */
