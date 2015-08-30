# js-objectdetect #

*js-objectdetect* is a javascript library for real-time object detection.

This library is based on the work of Paul Viola and Rainer Lienhart and compatible to stump based HAAR cascade classifiers used by the OpenCV object detector.

Watch [this video](http://www.youtube.com/watch?v=v0tbzTkJYZw) for a short demonstration.

All modern browsers including IE 9+, Safari and Opera Mobile are supported.

### Examples ###

*js-objectdetect* can be used for object detection, tracking and, in combination with mordern HTML5 features such as [WebRTC](http://caniuse.com/stream), for all sorts of augmented reality applications that run in the browser without any plugin.

The following demos are available (Internet Explorer and iOS not supported):

[![gesture input](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_gesture_input.gif) Rotating a 3D object via hand gesture](http://mtschirs.github.com/js-objectdetect/examples/example_gesture_input.htm)

[![gesture scroll](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_gesture_scroll.gif) Scrolling a website via hand gesture](http://mtschirs.github.com/js-objectdetect/examples/example_gesture_scroll.htm)

[![glasses](http://mtschirs.github.io/js-objectdetect/media/js_objectdetect_glasses.gif) Trying out various sunglasses](http://mtschirs.github.com/js-objectdetect/examples/example_sunglasses.htm)

### Classifiers ###

*js-objectdetect* is compatible to stump based classifiers used by [OpenCV](http://opencv.org/). Classifiers for face, hand and eye detection are already included. More can be found on the web ([classifier repository](http://alereimondo.no-ip.org/OpenCV/34)). However, not all classifiers have the same performance and some are quite sensitive to lighting conditions.
Cascades have to be converted into the js-objectdetect format before usage. The cascade format is similar to that of [tracking.js](https://github.com/eduardolundgren/tracking.js). Converters for old and new style [OpenCV](http://opencv.org/) xml haarcascades are available.

### Performance ###

The following list provides a runtime and detection performance comparison among current JavaScript face detection libraries. All test results have been acquired by applying either a 24x24 stump-based HAAR cascade or, in case of CCV, a 24x24 SURF cascade classifier with minimum step size on a single scale 80x80 image. Measured times are summed over 100 executions.

*Last updated on February 7, 2015*

 Chrome 40 / FF 35  | Detections per Second | Detections | Seconds
------------------- |:---------------------:|:----------:|:-------:
[js-objectdetect](https://github.com/mtschirs/js-objectdetect) | **17.5** / **16.9** | 50 / 50 | 2.86 / 2.96
[jsfeat](https://github.com/inspirit/jsfeat)<sup>1</sup> | 9.4 / 6.3 | 30 / 30 | 3.18 / 4.75
[tracking.js](https://github.com/eduardolundgren/tracking.js) | 7.7 / 8.97 | 48 / 48 | 6.24 / 5.35
[Beyond Reality Face](https://www.beyond-reality-face.com/)<sup>2</sup> | 7.4 / 1.7 | 41 / 41 | 5.50 / 23.98
[CCV](https://github.com/liuliu/ccv)<sup>3</sup> | 2.2 / 4.4 | 8 / 8 | 2.22 / 1.80

[js-objectdetect](https://github.com/mtschirs/js-objectdetect) | [tracking.js](https://github.com/eduardolundgren/tracking.js) | [jsfeat](https://github.com/inspirit/jsfeat)<sup>1</sup> | [Beyond Reality Face](https://www.beyond-reality-face.com/)<sup>2</sup> | [CCV](https://github.com/liuliu/ccv)<sup>3</sup>
:---:|:---:|:---:|:---:|:---:
![Detections](http://mtschirs.github.io/js-objectdetect/media/result_jsobjectdetect.png) | ![Detections](http://mtschirs.github.io/js-objectdetect/media/result_trackingjs.png) | ![Detections](http://mtschirs.github.io/js-objectdetect/media/result_jsfeat.png) | ![Detections](http://mtschirs.github.io/js-objectdetect/media/result_brf_nxt.png) | ![Detections](http://mtschirs.github.io/js-objectdetect/media/result_ccv.png)

<sup>1</sup> also [auduno/clmtrackr](https://github.com/auduno/clmtrackr), [camgaze.js](https://github.com/wallarelvo/camgaze.js). Based on an older version of [js-objectdetect](https://github.com/mtschirs/js-objectdetect). 

<sup>2</sup> Proprietary software, tested with v3.0.15. Fails to compile asm module in FF.

<sup>3</sup> also [jquery.facedetection](https://github.com/jaysalvat/jquery.facedetection), [neave/face-detection](https://github.com/neave/face-detection), [wesbos/HTML5-Face-Detection](https://github.com/wesbos/HTML5-Face-Detection), [auduno/headtrackr](https://github.com/auduno/headtrackr)

### Usage ###

Examples can be found in [the repository](https://github.com/mtschirs/js-objectdetect/tree/master/examples).
For documentation, refer to the JSDoc in the source files.

### Download ###

- The actual library:
	- [objectdetect.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.js)
- One or more classifier:
	- [objectdetect.frontalface.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.frontalface.js)
	- [objectdetect.eye.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.eye.js)
	- [objectdetect.handopen.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.handopen.js)
	- [objectdetect.handfist.js](https://raw.github.com/mtschirs/js-objectdetect/master/js/objectdetect.handfist.js)
	- ...

### License ###

*js-objectdetect* is distributed under [MIT license](https://raw.github.com/mtschirs/js-objectdetect/master/LICENSE.txt). The included classifiers are subject to [their own licenses](https://raw.github.com/mtschirs/js-objectdetect/master/CLASSIFIER-LICENSES.txt).

### Credits ###

Thanks to Audun Mathias Øygard ([auduno](https://github.com/auduno)) for his inspirational [headtrackr library](https://github.com/auduno/headtrackr), Brandon Jones ([toji](https://github.com/toji)) for his valuable [javascript performance tipps](http://media.tojicode.com/sfjs-vectors/#1), Nikos ([foo123](https://github.com/foo123)) for his [port of JViolaJones](https://github.com/foo123/HAAR.js) on which the canny pruning algorithm is based on and [tracking.js](https://github.com/eduardolundgren/tracking.js) for the classifier format.
