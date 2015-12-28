# Flickr Gallery and Lightbox

A simple Javascript (no jQuery!) library which allows you to make a gallery and lightbox to view a Flickr photo album.

* [Live Demo](https://fiery-heat-4300.firebaseapp.com/) -- or open the file `/index.html` in your browser
* [Documentation](https://fiery-heat-4300.firebaseapp.com/docs/) -- or open the file `/docs/index.html` in your browser

# Browser Compatibility
This project was tested and works on Chrome 47.0, Firefox for Mac 43.0.2, Safari 8.0, and IE11. 

# Approach
For this project, my primary aim was to write code that looked like my ideal view of production code. The areas I focused on were:
* **Modular code:** I split up the library into 3 basic parts: the gallery, a lightbox, and a Flickr helper to interact with the Flickr API. I chose to use the prototype pattern to implement these components since I was familiar with it. 
* **Public/private functions:** In the past, I usually made all functions public as I didn't think much of differentiating the two. This time, I decided to try out "private" functions by prefixing them with an underscore as one convention dictates. While this doesn't actually limit visibility, it seemed the easiest and most understandable way of doing it to me. I chose to make DOM creation and CSS helper functions private, as they did not seem to describe a functionality of the class that would make sense to be accessible by another class. 
* **Documentation:** I love projects with good documentation. So, I really wanted to ensure my code was well documented. I decided to try out JSDocs to document my code, since it also produces generated HTML docs. Documenting so thoroughly was kind of new to me, since I don't tend to document so heavily on my own projects, but I did learn a lot. I chose to document only the "public" functions of classes, so if developers were extending the project they wouldn't attempt to use private functions (like the DOM element creating functions) from one class in other classes. 
* **Clean code:** I like pretty code, so I wanted to be consistent in how my code looks like. So, I followed the [Airbnb ES5 Style Guide](https://github.com/airbnb/javascript/tree/master/es5) to the best of my ability.

# Limitations and TODOs
Since I really wanted to focus on writing clean and solid code, I did not get the time to implement a lot of additional features I would have liked. Also, I did not get a chance to fix some browser compatibility issues with older browsers (i.e. AJAX requests with older versions of IE). I've listed some of the features I'd like to add below

Feature       | Description | Basic Steps
------------- | ----------- | -----------
Animations | Fade pictures in and out when displaying |  Changing CSS `opacity` over time
Preloading | Preload the photo which immediately follows the current picture so navigating between pictures is smoother | Create hidden DOM element for next picture and load it while the lightbox is visible. Make it visible when the next button is clicked.
Browser Compatibility | XHR requests in older versions of IE, certain JS functions used (i.e. addEventListener not supported in IE8) | Research, use Google, and make fixes...
Tests | Unit and End to End tests | Write tests using Jasmine, and learn more about E2E testing...
