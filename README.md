# js-objectdetect #

*js-objectdetect* is a javascript library for real-time object detection.

This library is based on the work of Paul Viola and Rainer Lienhart and compatible to stump based cascade classifiers used by the OpenCV object detector.

Watch [this video](http://www.youtube.com/watch?v=v0tbzTkJYZw) for a short demonstration.

All modern browsers including IE 9+, Safari and Opera Mobile are supported.

### Examples ###

*js-objectdetect* can be used for object detection, tracking and, in combination with mordern HTML5 features such as [WebRTC](http://caniuse.com/stream), for all sorts of augmented reality applications that run in the browser without any plugin.

The following demos are available (Internet Explorer and iOS not supported):

[![gesture input](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_gesture_input.gif)<br>
Rotating a 3D object via hand gesture](http://mtschirs.github.com/js-objectdetect/examples/example_gesture_input.htm)

[![gesture scroll](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_gesture_scroll.gif)<br>
Scrolling a website via hand gesture](http://mtschirs.github.com/js-objectdetect/examples/example_gesture_scroll.htm)

[![glasses](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_glasses.gif)<br>
Trying out various sunglasses](http://mtschirs.github.com/js-objectdetect/examples/example_sunglasses.htm)

### Classifiers ###

*js-objectdetect* is compatible to stump based classifiers used by [OpenCV](http://opencv.org/). Classifiers for face, hand and eye detection are already included. More can be found on the web ([classifier repository](http://alereimondo.no-ip.org/OpenCV/34)). However, not all classifiers have the same performance and some are quite sensitive to lighting conditions.

### Usage - jQuery ###

The provided jQuery plugin provides a simple interface to the object detection library:
	
	<script src="js/objectdetect.js"></script>
	<script src="js/objectdetect.frontalface.js"></script>

	<script src="js/jquery.js"></script>
	<script src="js/jquery.objectdetect.js"></script>

	<img id="image" src="image.png">
	<script>
		$("#image").objectdetect("all", {classifier: objectdetect.frontalface}, function(coords) {
			...
		});
	</script>

More examples can be found in [the repository](https://github.com/mtschirs/js-objectdetect/tree/master/examples).

### Download ###

- The actual library:
	- [objectdetect.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.js)
- One or more classifier:
	- [objectdetect.frontalface.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.frontalface.js)
	- [objectdetect.eye.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.eye.js)
	- [objectdetect.handopen.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.handopen.js)
	- [objectdetect.handfist.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.handfist.js)
- The jQuery plugin:
	- [jquery.objectdetect.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/jquery.objectdetect.js)

### License ###

*js-objectdetect* is distributed under [MIT license](https://raw.github.com/mtschirs/js-objectdetect/master/LICENSE.txt). The included classifiers are subject to [their own licenses](https://raw.github.com/mtschirs/js-objectdetect/master/CLASSIFIER-LICENSES.txt).

### Credits ###

Thanks to Audun Mathias Øygard ([auduno](https://github.com/auduno)) for his inspirational [headtrackr library](https://github.com/auduno/headtrackr), Brandon Jones ([toji](https://github.com/toji)) for his valuable [javascript performance tipps](http://media.tojicode.com/sfjs-vectors/#1) and Nikos ([foo123](https://github.com/foo123)) for his [port of JViolaJones](https://github.com/foo123/HAAR.js) on which the canny pruning algorithm is based on.
