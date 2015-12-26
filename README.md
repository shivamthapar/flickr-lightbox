# Simple Gallery and Lightbox

##### What is it?
A simple Javascript library which allows you to make a gallery and lightbox to view your Flickr photo album.

## Usage
1. Include the `lightbox.css` stylesheet in the `head` section of your HTML.
```
<link rel="stylesheet" href="lightbox.css" />
```
2. Include the `lightbox.js` script at the bottom the `body` section of your HTML.
```
<script src="lightbox.js"></script>
```
3. Add a `div` with an id to hold the gallery. Give the div 2 attributes, `data-flickr-user` and `data-flickr-photoset`: 
```
<div id = "gallery" data-flickr-user="USER_ID" data-flickr-photoset="PHOTOSET_ID">
``` 
**Note:** You can use [http://idgettr.com/](http://idgettr.com/) to find your Flickr id. The `PHOTOSET_ID` can be found by looking at the end of the url of an album page on Flickr. For example, [this album] (https://www.flickr.com/photos/parismadrid/sets/72157649350793497)'s `PHOTOSET_ID` is 72157649350793497, since its URL is: 
`https://www.flickr.com/photos/parismadrid/sets/72157649350793497`
4. Create a new `Gallery` by adding the following snippet at the end of the `body` section of your HTML.
```
<script type="text/javascript">
      var gallery = new Gallery("gallery","FLICKR_API_KEY");
</script>
```
The first argument is the ID of the div of your gallery. The second argument is your Flickr API Key, which you can create [here](https://www.flickr.com/services/apps/create/).
