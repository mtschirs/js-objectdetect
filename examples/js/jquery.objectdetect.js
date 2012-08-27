(function($) {
	
	var methods = {
		init: function(options) {
			options = $.extend({}, $.fn.objectdetect.options, options);
			 
			return this.each(function() {
				var $this = $(this),
					data = $this.data("objectdetect") || {};

				if (!data.canvas) data.canvas = document.createElement("canvas");
				if (!data.context) data.context = data.canvas.getContext("2d");
				
				if (this.videoWidth) {
					data.canvas.width = ~~(options.size * this.videoWidth / this.videoHeight);
					data.canvas.height = ~~(options.size);
				} else if ($this.width) {
					data.canvas.width = ~~(options.size * $this.width() / $this.height());
					data.canvas.height = ~~(options.size);
				} else throw "jQuery.objectdetect cannot operate on dimensionless or incompletely loaded elements";

				if (data.gray && data.canvas.width * data.canvas.height != data.gray.length) {
					data.gray = data.sat = data.rsat = data.ssat = undefined;
				}
				
				$this.data("objectdetect", data);
			});
		},
     
		destroy: function() {
			return this.each(function() {
				var $this = $(this);
				
				$this.removeData("objectdetect");
			});
		},
     
		all: function(options, callback) {
			if (options) methods.init.apply(this, options);
			if (!options.classifier) throw "jQuery.objectdetect cannot operate without specified object classifier";
			
			return this.each(function() {
				var $this = $(this),
					data = $this.data("objectdetect"),
					width = data.canvas.width,
					height = data.canvas.height,
					gray = data.gray,
					sat = data.sat,
					rsat = data.rsat,
					ssat = data.ssat;
				
				data.context.drawImage(this, 0, 0, width, height);
				imageData = data.context.getImageData(0, 0, width, height),
				
				gray = objectdetect.convertRgbaToGrayscale(imageData.data, gray);
				objectdetect.equalizeHistogram(gray);
				sat = objectdetect.computeSat(gray, width, height, sat);
				rsat = objectdetect.computeRsat(gray, width, height, rsat);
				ssat = objectdetect.computeSquaredSat(gray, width, height, ssat);
				
				var rects = objectdetect.detectMultiScale(sat, rsat, ssat, undefined, width, height, options.classifier, options.scaleFactor, options.scaleMin);
				rects = objectdetect.groupRectangles(rects, 1).sort(function(rect) {return rect[4];});
				
				var xfactor = $this.width() / data.canvas.width;
					yfactor = $this.height() / data.canvas.height;
				for (var i = rects.length - 1; i >= 0; --i) {
					rects[i][0] = ~~(rects[i][0] * xfactor);
					rects[i][1] = ~~(rects[i][1] * yfactor);
					rects[i][2] = ~~(rects[i][2] * xfactor);
					rects[i][3] = ~~(rects[i][3] * yfactor);
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
		classifier: undefined
	};

})(jQuery);