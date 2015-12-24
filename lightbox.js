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

var Lightbox = (function(window) {

  //constructor
  function Lightbox(divId, flickrApiKey) {
    var self = this;
    this.div = document.getElementById(divId);
    this.flickrUser = this.div.getAttribute('data-flickr-user');
    this.flickrPhotoset = this.div.getAttribute('data-flickr-photoset');
    this.photos = [];
    this.flickr = new Flickr(flickrApiKey);

    this.fetchImages = function(user,photoset){
      this.flickr.getImages(user, photoset, function(success, data){
        if(success){
          self.photos = data.photos;
          self.createGrid();
        }
        else{
          console.log("error: ", error);
        }
      });
    };

    this.createGrid = function(){
      var grid = document.createElement("div");
      grid.setAttribute("id", "lightbox-grid");
      this.photos.forEach(function(photo){
        var p = document.createElement("img");
        p.setAttribute("class", "lightbox-thumb");
        p.setAttribute("src", photo.thumb);
        p.setAttribute("data-large", photo.url);
        grid.appendChild(p);
      });
      this.div.appendChild(grid);

    };

    this.addImage = function(){
    };
    this.fetchImages(this.flickrUser,this.flickrPhotoset);

  }

  return Lightbox;
  
})(window);
