# js-objectdetect #

js-objectdetect is a javascript library for real-time object detection.

This library is based on the work of Paul Viola and Rainer Lienhart and compatible to stump based cascade classifiers used by the OpenCV object detector.

All modern browsers including IE 9+ are supported.


For a demonstration see [this video](https://vimeo.com/44049736) or try out some of the examples with a laptop that has a camera and a browser that has camera webRTC/getUserMedia support (for instance [Opera 12](http://www.opera.com/browser/)). For an overview of browsers supporting the getUserMedia standard see [http://caniuse.com/stream](http://caniuse.com/stream).


### Examples ###

[![facetracking](http://auduno.github.com/headtrackr/examples/media/facetracking_thumbnail.png)](http://auduno.github.com/headtrackr/examples/facetracking.html)
[![sprites](http://auduno.github.com/headtrackr/examples/media/sprites_thumbnail.png)](http://auduno.github.com/headtrackr/examples/sprites_canvas.html)
[![facekat](http://auduno.github.com/headtrackr/examples/media/facekat_thumbnail.png)](http://www.shinydemos.com/facekat/)
[![targets](http://auduno.github.com/headtrackr/examples/media/targets_thumbnail.png)](http://auduno.github.com/headtrackr/examples/targets.html)

### Usage - jQuery ###

Using the provided jQuery plugin, object detection becomed a one-liner. Download the minified library 

- [objectdetect.js](https://github.com/mtschirs/objectdetect/raw/master/js-min)
the jQuery plugin

- [jquery.objectdetect.js](https://github.com/mtschirs/objectdetect/raw/master/js-min)

and a classifier
- [objectdetect.face.js](https://github.com/mtschirs/objectdetect/raw/master/js-min)
 and include it in your webpage together with a recent version of jQuery.

	<script src="http://code.jquery.com/jquery-1.8.0.min.js"></script>
	<script src="js/objectdetect.js"></script>
	<script src="js/objectdetect.face.js"></script>
	<script src="js/jquery.objectdetect.js"></script>

	<img id="image" src="image.png">
	<script>
		$("#image").objectdetect("all", {classifier: objectdetect.frontalface}, function(coords) {
			...
		});
	</script>


### License ###

js-objectdetect is distributed under [GPL3](https://github.com/mtschirs/js-objectdetect/LICENSE.txt). The included classifiers are subject to their own licenses (https://github.com/mtschirs/js-objectdetect/CLASSIFIER-LICENSES.md).