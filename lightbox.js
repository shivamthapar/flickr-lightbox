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
  var self = this;
  this.photos = photos;
  this.parentElem = parentElem;
  this.visible = false;
  this.currIndex = 0;
  this.photoElem = null;
  this.titleElem = null;
  this.leftElem = null;
  this.rightElem = null;

  this.displayCurrPhoto = function(){
    this.setPhotoElem(this.photos[this.currIndex].url);
    this.setTitleElem(this.photos[this.currIndex].title);

    if(this.currIndex === 0)
      this.setVisible(this.leftElem,false);
    else
      this.setVisible(this.leftElem,true);

    if(this.currIndex === this.photos.length-1)
      this.setVisible(this.rightElem,false);
    else
      this.setVisible(this.rightElem,true);

    this.setVisible(this.elem,true);
  }

  this.setVisible = function(elem,b){
    this.visible = b;
    if(!this.visible){
      if(elem.getAttribute("class") !== "hide")
        elem.setAttribute("class", "hide");
    }
    else{
      elem.setAttribute("class","");
    }
  }

  this.createLightboxElem = function(){
    this.elem = document.createElement("div");
    this.elem.setAttribute("id", "lightbox");
    this.elem.addEventListener("click", this.lightboxClickHandler);
    this.setVisible(this.elem,this.visible);
    parentElem.appendChild(this.elem);
    this.createContentElem();
  }

  // TODO: abstract logic for creating photo elem, and add title to photo

  this.createContentElem = function(){
    this.contentElem = document.createElement("div");
    this.contentElem.setAttribute("id", "lightbox-content");
    
    this.leftElem = document.createElement("div");
    this.leftElem.setAttribute("id", "lightbox-left-arrow");
    this.contentElem.appendChild(this.leftElem);
    this.rightElem = document.createElement("div");
    this.rightElem.setAttribute("id", "lightbox-right-arrow");
    this.contentElem.appendChild(this.rightElem);

    this.elem.appendChild(this.contentElem);
  }

  this.setPhotoElem = function(url){
    if(!this.photoElem){
      this.photoElem = document.createElement("img");
      this.photoElem.setAttribute("id", "lightbox-photo");
    }
    this.photoElem.setAttribute("src", url);
    this.photoElem.onload = this.onPhotoLoadHandler;
    this.contentElem.appendChild(this.photoElem);
  }

  this.setTitleElem = function(text){
    if(!this.titleElem){
      this.titleElem = document.createElement("p");
      this.titleElem.setAttribute("id", "lightbox-title");
    }
    this.titleElem.textContent = text;
    this.contentElem.appendChild(this.titleElem);
  }

  this.onPhotoLoadHandler = function(){
    // center picture
    console.log("pic width: ", this.width);
    console.log("div width: ", self.contentElem);
    self.contentElem.style.marginTop = "-" + this.height/2 + "px";
    self.contentElem.style.marginLeft = "-" + this.width/2 + "px";
    console.log(self.leftElem);
    self.leftElem.style.top = this.height/2+"px";
    self.rightElem.style.top = this.height/2+"px";
  }

  this.lightboxClickHandler = function(e){
    switch(e.target.id){
      case "lightbox-left-arrow":
        self.setCurrIndex(self.currIndex-1);
        break;
      case "lightbox-right-arrow":
        self.setCurrIndex(self.currIndex+1);
        break;
      case "lightbox-photo":
        break;
      case "lightbox-title":
        break;
      case "lightbox-content":
        break;
      default: // outside lightbox-contentElem
        self.setVisible(self.elem,false);
        break;
    }
  }

  this.createLightboxElem();
}
Lightbox.prototype = (function(){
  return {
    setCurrIndex: function(idx){
      if(idx < 0 || idx >= this.photos.length) return;
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
