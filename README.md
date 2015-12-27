# Flickr Gallery and Lightbox

A simple Javascript (no jQuery!) library which allows you to make a gallery and lightbox to view a Flickr photo album.

* [Live Demo](https://fiery-heat-4300.firebaseapp.com/)
* [JSDocs](https://fiery-heat-4300.firebaseapp.com/docs/)

## Usage
See [index.html](https://github.com/shivamthapar/flickr-lightbox/blob/master/index.html).
```html
<!DOCTYPE html>
  <head>
      <link rel="stylesheet" href="lightbox.css" />
  </head>
  <body>
    <div id="gallery-div" data-flickr-user="FLICKR_USER_ID" data-flickr-photoset="FLICKR_PHOTOSET_ID"></div>
    <script src="lightbox.js"></script>
    <script type="text/javascript">
      var gallery = new Gallery("gallery-div");
    </script>
  </body>
</html>
```

## Getting Flickr IDs
* You can use [http://idgettr.com/](http://idgettr.com/) to find a Flickr User ID. 
* A Flickr Photoset's ID can be found by looking at the end of the url of an album page on Flickr. For example, [this album's] (https://www.flickr.com/photos/parismadrid/sets/72157649350793497) Photoset ID is 72157649350793497, since its URL is: 
`https://www.flickr.com/photos/parismadrid/sets/72157649350793497`
