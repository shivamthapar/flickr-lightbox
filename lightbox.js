var Flickr = function(key){
  this.apiKey = key;
  this.getUrlForQuery = function(user){
    var url = "https://api.flickr.com/services/rest/?&method=flickr.people.getPublicPhotos&api_key=";
    url+=this.apiKey;
    url+="&user_id="+user+"&format=json&per_page=20&nojsoncallback=?";
    return url;
  }
}
Flickr.prototype = (function(){
  return {
    getImagesForUser: function(user, callback){
      var self = this;
      var url = this.getUrlForQuery(user);
      var request = new XMLHttpRequest();
      request.open('GET', url, true);

      request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
          // Success!
          var data = JSON.parse(request.responseText);
          var photos = [];
          data.photos.photo.forEach(function(photo){
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
        console.log(false, {});
      };
      request.send();
    },
    getImageUrl: function(farm,server,id,secret,thumb){
      var url = "https://farm"+farm+".staticflickr.com/"+server+"/"+id+"_"+secret;
      if(thumb)
        url+= "_t";
      url += ".jpg";
      return url;
    }
  };
}());

var Lightbox = (function(window) {

  //constructor
  function Lightbox(divId, flickrApiKey) {
    this.div = document.getElementById(divId);
    this.flickrUser = this.div.getAttribute('data-flickr-user');
    this.images = [];
    this.flickr = new Flickr(flickrApiKey);

    this.fetchImages = function(user){
      this.flickr.getImagesForUser(user, function(success, data){
        if(success){
          console.log(data);
        }
        else{
          console.log("error: ", error);
        }
      });
    };

    this.addImage = function(){
    };
    this.fetchImages(this.flickrUser);

  }

  return Lightbox;
  
})(window);
