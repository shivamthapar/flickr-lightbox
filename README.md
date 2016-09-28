# Flickr Gallery and Lightbox

A simple Javascript (no jQuery!) library which allows you to make a gallery and lightbox to view a Flickr photo album.

* [Live Demo](http://flickr-lightbox.surge.sh) -- or open the file `/index.html` in your browser
* [Documentation](https://fiery-heat-4300.firebaseapp.com/docs/) -- or open the file `/docs/index.html` in your browser

# Features
* Fetches photos from a Flickr photoset and creates a gallery with thumbnails
* Clicking on thumbnail reveals a lightbox showing the fullsize picture and title
* Arrows to navigate between pictures
* Bonus: Use left and right arrow keys to navigate between pictures

# Usage
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
* A Flickr Photoset's ID can be found by looking at the end of the url of an album page on Flickr. For example, [this album](https://www.flickr.com/photos/parismadrid/sets/72157649350793497) has a Photoset ID of 72157649350793497, since its URL is:
`https://www.flickr.com/photos/parismadrid/sets/72157649350793497`

# Browser Compatibility
This project was tested and works on Chrome 47.0, Firefox for Mac 43.0.2, Safari 8.0, and IE11.
