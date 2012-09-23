(function($) {
	
	var methods = {
		init: function() {
			return this.each(function() {
				var canvas = document.createElement("canvas"),
					context = canvas.getContext("2d");
				
				$(this).data("objectdetect", {canvas: canvas, context: context});
			});
		},
		
		destroy: function() {
			return this.each(function() {
				$(this).removeData("objectdetect");
			});
		},
     
		all: function(options, callback) {
			options = $.extend({}, $.fn.objectdetect.options, options);
			if (!options.classifier) throw "jQuery.objectdetect cannot operate without specified object classifier";
			
			return this.each(function() {
				var $this = $(this),
					data = $this.data("objectdetect");
				
				if (!data) {
					methods.init.apply($this, options);
					data = $this.data("objectdetect");
				}
				
				if (!options.selection) {
					options.selection = this.videoWidth ? [0, 0, this.videoWidth, this.videoHeight] : [0, 0, $this.width(), $this.height()];
				}
				
				var canvasWidth = data.canvas.width = ~~(options.size * options.selection[2] / options.selection[3]),
					canvasHeight = data.canvas.height = ~~(options.size),
					canvasWidthRatio = options.selection[2] / canvasWidth,
					canvasHeightRatio = options.selection[3] / canvasHeight,
					gray = data.gray,
					sat = data.sat,
					rsat = data.rsat,
					ssat = data.ssat;
				
				if (gray && canvasWidth * canvasHeight != gray.length) {
					gray = sat = rsat = ssat = null;
				}
				
				data.context.drawImage(this, options.selection[0], options.selection[1], options.selection[2], options.selection[3], 0, 0, canvasWidth, canvasHeight);
				imageData = data.context.getImageData(0, 0, canvasWidth, canvasHeight);

				gray = objectdetect.convertRgbaToGrayscale(imageData.data, gray);
				objectdetect.equalizeHistogram(gray);
				sat = objectdetect.computeSat(gray, canvasWidth, canvasHeight, sat);
				ssat = objectdetect.computeSquaredSat(gray, canvasWidth, canvasHeight, ssat);
				if (options.classifier.tilted) rsat = objectdetect.computeRsat(gray, canvasWidth, canvasHeight, rsat);
				
				var rects = objectdetect.detectMultiScale(sat, rsat, ssat, undefined, canvasWidth, canvasHeight, options.classifier, options.scaleFactor, options.scaleMin);
				rects = objectdetect.groupRectangles(rects, 1).sort(function(rect) {return rect[4];});
				
				for (var i = rects.length - 1; i >= 0; --i) {
					rects[i][0] = ~~(rects[i][0] * canvasWidthRatio) + options.selection[0];
					rects[i][1] = ~~(rects[i][1] * canvasHeightRatio) + options.selection[1];
					rects[i][2] = ~~(rects[i][2] * canvasWidthRatio);
					rects[i][3] = ~~(rects[i][3] * canvasHeightRatio);
				}
				
				if (options.cache) {
					data.gray = gray;
					data.sat = sat;
					data.rsat = rsat;
					data.ssat = ssat;
					$this.data("objectdetect", data);
				}
				
				if (typeof callback == "function") {
					callback.call(this, rects);
				}
	    	});
		}
	};
	
	$.fn.objectdetect = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === "object" || !method ) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " +  method + " does not exist on jQuery.objectdetect");
		}
	};
	
	$.fn.objectdetect.options = {
		size: 200,
		scaleFactor: 1.2,
		scaleMin: 1,
		classifier: null,
		selection: null,
		cache: true
	};

})(jQuery);