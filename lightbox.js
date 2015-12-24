var Flickr = function(key){
  this.apiKey = key;
  this.getUrlForQuery = function(user,photoset){
    var url = "https://api.flickr.com/services/rest/?&method=flickr.photosets.getPhotos&api_key=";
    url+=this.apiKey;
    url+="&user_id="+user+"&photoset_id="+photoset+"&format=json&nojsoncallback=?";
    return url;
  }
}
Flickr.prototype = (function(){
  return {
    getImages: function(user, photoset, callback){
      var self = this;
      var url = this.getUrlForQuery(user,photoset);
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var data = JSON.parse(request.responseText);
          var photos = [];
          data.photoset.photo.forEach(function(photo){
            var p = {};
            p.title = photo.title;
            p.thumb = self.getImageUrl(photo.farm,photo.server,photo.id, photo.secret,true);
            p.url = self.getImageUrl(photo.farm,photo.server,photo.id, photo.secret,false);
            photos.push(p);
          });
          callback(true, {photos: photos});
        }
      };

      request.onerror = function() {
        // There was a connection error of some sort
        callback(false, {});
      };
      request.send();
    },
    getImageUrl: function(farm,server,id,secret,thumb){
      var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret;
      if(thumb)
        url+= "_s";
      url += ".jpg";
      return url;
    }
  };
}());

var Lightbox = function(photos, parentElem){
  // private members
  this.photos = photos;
  this.parentElem = parentElem;
  this.visible = false;
  this.currIndex = 0;

  this.displayCurrPhoto = function(){
    var photo;
    if(!this.elem.firstChild){
      photo = document.createElement("img");
      photo.setAttribute("id", "lightbox-photo");
      this.elem.appendChild(photo);
    }
    else{
      photo = this.elem.firstChild;
    }
    photo.setAttribute("src", this.photos[this.currIndex].url);
    this.setVisible(true);
    photo.onload = this.onPhotoLoadHandler;
    console.log(photo);
  }

  this.setVisible = function(b){
    this.visible = b;
    if(!this.visible){
      if(this.elem.getAttribute("class") !== "hide")
        this.elem.setAttribute("class", "hide");
    }
    else{
      this.elem.setAttribute("class","");
    }
  }

  this.createLightboxElem = function(){
    this.elem = document.createElement("div");
    this.elem.setAttribute("id", "lightbox");
    this.setVisible(this.visible);
    parentElem.appendChild(this.elem);
  }

  this.onPhotoLoadHandler = function(){
    // center picture
    this.style.width = this.width;
    this.style.height = this.height;
    this.style.marginTop = "-" + this.height/2 + "px";
    this.style.marginLeft = "-" + this.width/2 + "px";
  }

  this.createLightboxElem();
}
Lightbox.prototype = (function(){
  return {
    setCurrIndex: function(idx){
      this.currIndex = idx;
      this.displayCurrPhoto();
    },
    setVisible: this.setVisible
  };
}());

var Gallery = (function(window) {

  function Gallery(divId, flickrApiKey) {
    var self = this;

    var thumbClickHandler = function(){
      self.lightbox.setCurrIndex(parseInt(this.getAttribute("id")));
    };

    this.div = document.getElementById(divId);
    this.flickrUser = this.div.getAttribute('data-flickr-user');
    this.flickrPhotoset = this.div.getAttribute('data-flickr-photoset');
    this.photos = [];
    this.flickr = new Flickr(flickrApiKey);
    this.lightbox = null;

    this.fetchImages = function(user,photoset){
      this.flickr.getImages(user, photoset, function(success, data){
        if(success){
          self.photos = data.photos;
          self.createGrid();
          self.lightbox = new Lightbox(self.photos, self.div);
        }
        else{
          console.log("error: ", error);
        }
      });
    };

    this.createGrid = function(){
      var grid = document.createElement("div");
      grid.setAttribute("id", "lightbox-grid");
      this.photos.forEach(function(photo, i){
        var p = document.createElement("img");
        p.setAttribute("class", "lightbox-thumb");
        p.setAttribute("id", i);
        p.setAttribute("src", photo.thumb);
        p.setAttribute("data-large", photo.url);
        
        p.addEventListener("click", thumbClickHandler, false);
        grid.appendChild(p);
      });
      this.div.appendChild(grid);

    };

    this.fetchImages(this.flickrUser,this.flickrPhotoset);

  }

  return Gallery;
  
})(window);
