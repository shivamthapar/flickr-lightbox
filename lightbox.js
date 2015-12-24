var Lightbox = (function(window, undefined) {

  //constructor
  function Lightbox(divId) {
    this.div = document.getElementById(divId);
    this.query = this.div.getAttribute('data-query');
    this.images = [];

    this.fetchImages = function(){
    };

    this.addImage = function(){
    };

  }

  return Lightbox;
  
})(window);
