/**
 * Real-time object detector based on the Viola Jones Framework.
 * Compatible to OpenCV Haar Cascade Classifiers (stump based only).
 * 
 * Copyright (c) 2012, Martin Tschirsich

 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
var objectdetect = (function() {
	"use strict";
	
	/**
	 * Define system-specific optimal array types (Float32Array if available).
	 */
	var ImageArray, ZeroFilledImageArray;
	
	if (typeof Float32Array !== "undefined") {
		ImageArray = ZeroFilledImageArray = Float32Array;
	} else {
		ZeroFilledImageArray = function(length) {
	    	Array(length);
	    	for (var i = 0; i < length; ++i) this[i] = 0;
	    };
	    ZeroFilledImageArray.prototype = ImageArray = Array;
	}
    	
    var /**
		 * Converts from a 4-channel RGBA source image to a 1-channel grayscale
		 * image. Corresponds to the CV_RGB2GRAY OpenCV color space conversion.
		 * 
		 * @param {Array} src	4-channel 8-bit RGBA source image
		 * @param {Array} [dst] 1-channel 32-bit destination image. If omitted,
		 *                      a new image will be created
		 * @return {Array} 1-channel 32-bit destination image
		 */
		convertRgbaToGrayscale = function(src, dst) {
			var srcLength = src.length;
			if (!dst) { dst = new ImageArray(srcLength >> 2); }
			
			for (var i = 0; i < srcLength; i += 4) {
				dst[i >> 2] = (src[i] * 4899 + src[i + 1] * 9617 + src[i + 2] * 1868 + 8192) >> 14;
			}
			return dst;
		},
		
		/**
		 * Computes the gradient magnitude using a sobel filter after
		 * applying gaussian smoothing (5x5 filter size). Useful for canny
		 * pruning.
		 * 
		 * @param {Array}  src      1-channel source image
		 * @param {Number} srcWidth Width of the source image
		 * @param {Array}  [dst]    1-channel destination image. If omitted,
		 *                          a new image will be created
		 * @return {Array} Destination image
		 */
		buffer = null,
		computeCanny = function(src, srcWidth, srcHeight, dst) {
			var srcLength = src.length;
			if (!dst) { dst = new ImageArray(srcLength); }
			else if (dst === src) { src = new ImageArray(dst); }
			
			// Gaussian filter (size 5, sigma sqrt(2)) horizontal pass:
			if (!buffer) buffer = new ImageArray(srcLength);
			for (var x = 2; x < srcWidth-2; ++x) {
				for (var y = 0; y < srcHeight; ++y) {
					var index = x + y * srcWidth;
					dst[index] =
						0.1117 * src[index - 2] +
						0.2365 * src[index - 1] +
						0.3036 * src[index    ] +
						0.2365 * src[index + 1] +
						0.1117 * src[index + 2];
				}
			}
			
			// Gaussian filter (size 5, sigma sqrt(2)) vertical pass:
			for (var x = 0; x < srcWidth; ++x) {
				for (var y = 2; y < srcHeight-2; ++y) {
					var index = x + y*srcWidth;
					buffer[index] =
						0.1117 * dst[index - (srcWidth << 1)] +
						0.2365 * dst[index -  srcWidth      ] +
						0.3036 * dst[index                  ] +
						0.2365 * dst[index +  srcWidth      ] +
						0.1117 * dst[index + (srcWidth << 1)];
				}
			}
			
			// Compute gradient:
			for(x = 2; x < srcWidth - 2; ++x) {
				for(y = 2; y < srcHeight - 2; ++y) {
					var grad_x =
						-     buffer[x-1 + (y-1) * srcWidth]
						+     buffer[x+1 + (y-1) * srcWidth]
						- 2 * buffer[x-1 + y     * srcWidth]
						+ 2 * buffer[x+1 + y     * srcWidth]
						-     buffer[x-1 + (y+1) * srcWidth]
						+     buffer[x+1 + (y+1) * srcWidth];
					
					var grad_y = 
						      buffer[x-1 + (y-1) * srcWidth]
						+ 2 * buffer[x   + (y-1) * srcWidth]
						+     buffer[x+1 + (y-1) * srcWidth]
						-     buffer[x-1 + (y+1) * srcWidth]
						- 2 * buffer[x   + (y+1) * srcWidth]
						-     buffer[x+1 + (y+1) * srcWidth];
					
					dst[x + y * srcWidth] = 
						(grad_x < 0 ? -grad_x : grad_x) + 
						(grad_y < 0 ? -grad_y : grad_y);
				}
			}
			return dst;
		},

		/**
		 * Computes the integral image of a 1-channel image. Arithmetic
		 * overflow may occur if the integral exceeds the limits for the
		 * destination image values ([0, 2^32-1] for am unsigned 32-bit image).
		 * The integral image is 1 pixel wider both in vertical and horizontal
		 * direction compared to the source image.
		 * 
		 * SAT = Summed Area Table
		 * 
		 * @param {Array}  src       1-channel source image
		 * @param {Number} srcWidth  Width of the source image
		 * @param {Number} srcHeight Height of the source image
		 * @param {Array}  [dst]     1-channel destination image (optional)
		 * @return {Array} Destination image
		 */
		computeSat = function(src, srcWidth, srcHeight, dst) {
			var srcLength = src.length,
				dstWidth = srcWidth + 1;
			
			if (!dst) { dst = new ZeroFilledImageArray(srcLength + dstWidth + srcHeight); }
			
			for (var x = 1; x <= srcWidth; ++x) {
				var column_sum = 0;
				for (var y = 1; y <= srcHeight; ++y) {
					var index = x + y * dstWidth;
					column_sum += src[index - y - dstWidth];
					dst[index] = dst[index - 1] + column_sum;
				}
			}
			return dst;
		},
		
		/**
		 * Computes the squared integral image of a 1-channel image.
		 * @see computeSat()
		 * 
		 * @param {Array}  src       1-channel source image
		 * @param {Number} srcWidth  Width of the source image
		 * @param {Number} srcHeight Height of the source image
		 * @param {Array}  [dst]     1-channel destination image. If omitted, the
		 *                           result is written to src (faster)
		 * @return {Array} Destination image
		 */
		computeSquaredSat = function(src, srcWidth, srcHeight, dst) {
			var srcLength = src.length,
				dstWidth = srcWidth + 1;
		
			if (!dst) { dst = new ZeroFilledImageArray(srcLength + dstWidth + srcHeight); }
			
			for (var x = 1; x <= srcWidth; ++x) {
				var column_sum = 0;
				for (var y = 1; y <= srcHeight; ++y) {
					var index = x + y * dstWidth;
					var val = src[index - y - dstWidth];
					column_sum += val * val;
					dst[index] = dst[index - 1] + column_sum;
				}
			}
			return dst;
		},
		
		/**
		 * Computes the rotated / tilted integral image of a 1-channel image.
		 * @see computeSat()
		 * 
		 * @param {Array}  src       1-channel source image
		 * @param {Number} srcWidth  Width of the source image
		 * @param {Number} srcHeight Height of the source image
		 * @param {Array}  [dst]     1-channel destination image. If omitted, the
		 *                           result is written to src (faster)
		 * @return {Array} Destination image
		 */
		computeRsat = function(src, srcWidth, srcHeight, dst) {
			var srcLength = src.length,
				dstWidth = srcWidth + 1,
				dstLength = srcLength + dstWidth + srcHeight;
			
			if (!dst) { dst = new ZeroFilledImageArray(dstLength); }
				
			// Compute first diagonal integral:
			for (var y = 1; y <= srcHeight; ++y) {
				for (var x = 1; x <= srcWidth; ++x) {
					dst[x + y * dstWidth] = src[x - 1 + y * srcWidth - srcWidth] + dst[x + y * dstWidth - dstWidth - 1];
				}
			}
			
			// Compute second diagonal integral:
			for (var y = 1; y <= srcHeight; ++y) {
				dst[srcWidth + y * dstWidth] += dst[srcWidth + y * dstWidth - dstWidth];
			}
			
			for (var x = srcWidth - 1; x > 0; --x) {
				for (var y = srcHeight; y > 0; --y) {
					dst[x + y * dstWidth] += dst[x + y * dstWidth - dstWidth] + dst[x + 1 + y * dstWidth - dstWidth];
				}
			}
			
			return dst;
		},
		
		/**
		 * Compute area on a SAT.
		 * 
		 * @param {Array}  sat       1-channel integral source image
		 * @param {Number} satWidth  Width of the integral source image
		 * @param {Number} x         Area to evaluate
		 * @param {Number} y         Area to evaluate
		 * @param {Number} width     Area to evaluate
		 * @param {Number} height    Area to evaluate
		 * @return {Number} Area
		 */
		computeSatSum = function(sat, satWidth, x, y, width, height) {
			y *= satWidth;
			height *= satWidth;
			return sat[x         + y         ] -
			       sat[x + width + y         ] -
			       sat[x         + y + height] +
			       sat[x + width + y + height];
		},
		
		/**
		 * Compute area on a RSAT.
		 * @see computeSatSum()
		 * 
		 * @param {Array}  rsat      1-channel integral source image
		 * @param {Number} rsatWidth Width of the integral source image
		 * @param {Number} x         Area to evaluate
		 * @param {Number} y         Area to evaluate
		 * @param {Number} width     Area to evaluate
		 * @param {Number} height    Area to evaluate
		 * @return {Number} Area
		 */
		computeRSatSum = function(rsat, rsatWidth, x, y, width, height) {
			return rsat[x                  + (y                 ) * rsatWidth] -
			       rsat[x + width          + (y + width         ) * rsatWidth] -
			       rsat[x - height         + (y + height        ) * rsatWidth] +
			       rsat[x + width - height + (y + width + height) * rsatWidth];
		},
		
		/**
		 * Equalizes the histogram of an unsigned 1-channel image with values
		 * in range [0, 255]. Corresponds to the equalizeHist OpenCV function.
		 * 
		 * @param {Array} src   1-channel integer source image
		 * @param {Array} [dst] 1-channel destination image. If omitted, the
		 * 	                    result is written to src
		 * @return {Array} Destination image
		 */
		equalizeHistogram = function(src, dst) {
			var srcLength = src.length;
			if (!dst) { dst = src; }
			
			// Compute histogram and histogram sum:
			var hist = new ZeroFilledImageArray(256);
			for (var i = 0; i < srcLength; ++i) {
				++hist[src[i]];
			}
			
			// Compute integral histogram:
			var prev = hist[0];
			for (var i = 1; i < 256; ++i) {
				prev = hist[i] += prev;
			}
			
			// Equalize image:
			var norm = 255 / srcLength;
			for (var i = 0; i < srcLength; ++i) {
				dst[i] = ~~(hist[src[i]] * norm + 0.5);
			}
			return dst;
		},
		
		/**
		 * Evaluates a Haar cascade classifier at a specified scale.
		 * 
		 * @param {Array}  sat	       SAT of the source image
		 * @param {Array}  rsat	       RSAT of the source image
		 * @param {Array}  ssat	       Squared SAT of the source image
		 * @param {Array}  cannySat	   SAT of canny source image or undefined
		 * @param {Number} width       Width of the source image
		 * @param {Number} height      Height of the source image
		 * @param {Number} scale       Scale
		 * @param {Object} cascadeClassifier Haar cascade classifier
		 * @return {Array} Rectangles representing detected object
		 */
		detectSingleScale = function(sat, rsat, ssat, cannySat, width, height, scale, cascadeClassifier) {
			var windowWidth  = ~~(cascadeClassifier.size[0] * scale);
			var windowHeight = ~~(cascadeClassifier.size[1] * scale);
			var stepX = ~~(0.5 * scale + 1.5); // = 2;
			var stepY = ~~(0.5 * scale + 1.5); // = 2;

			var rects = [];
			for (var x = 0; x + windowWidth <= width; x += stepX) {
				for (var y = 0; y + windowHeight <= height; y += stepY) {
					
					var invArea = 1 / (windowWidth * windowHeight);
					
					// Canny test:
					if (cannySat) {
						var edgesDensity = computeSatSum(cannySat, width + 1, x, y, windowWidth, windowHeight) * invArea;
						if (edgesDensity < 20 || edgesDensity > 100) {
							continue;
						}
					}
					
					// Correct?
					var satOffset = x + y * (width + 1);
					var satHeight = windowHeight * (width + 1);

					var mean = (sat[satOffset] -
							    sat[satOffset + windowWidth] -
						        sat[satOffset + satHeight] +
						        sat[satOffset + windowWidth + satHeight]) * invArea;
					
					var variance = (ssat[satOffset] -
						            ssat[satOffset + windowWidth] -
						            ssat[satOffset + satHeight] +
						            ssat[satOffset + windowWidth + satHeight]) * invArea - mean * mean;
					
					var std = variance > 1 ? Math.sqrt(variance) : 1;
					
					// Evaluate cascade classifier: stages
					var complexClassifiers = cascadeClassifier.complexClassifiers;
					var found = true;
					for (var i = 0, iEnd = complexClassifiers.length; i < iEnd; ++i) {
						var complexClassifier = complexClassifiers[i];
						
						// Evaluate complex classifier: trees
						var simpleClassifiers = complexClassifier.simpleClassifiers;
						var complexClassifierThreshold = complexClassifier.threshold;
						var complexClassifierSum = 0;
						
						for (var j = 0, jEnd = simpleClassifiers.length; j < jEnd; ++j) {
							var simpleClassifier = simpleClassifiers[j];
							
							// Evaluate simple classifier: nodes
							var features = simpleClassifier.features;
							var simpleClassifierSum = 0;
							
							if (simpleClassifier.tilted === 1) {
								for (var k = 0, kEnd = features.length; k < kEnd; ++k) {
									var feature = features[k];
									
									// Evaluate feature: rects
									var featureOffset = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * (width + 1);
									var featureWidth  = ~~(feature[2] * scale);
									var featureWidthTimesWidth  = ~~(feature[2] * scale) * (width + 1);
									var featureHeight = ~~(feature[3] * scale);
									var featureHeightTimesWidth = ~~(feature[3] * scale) * (width + 1);
							
									simpleClassifierSum +=
										(rsat[featureOffset] -
										 rsat[featureOffset +  featureWidth + featureWidthTimesWidth] -
										 rsat[featureOffset - featureHeight +  featureHeightTimesWidth] +
										 rsat[featureOffset + featureWidth - featureHeight + featureWidthTimesWidth + featureHeightTimesWidth]) * feature[4];
								}
							} else {
								for (var k = 0, kEnd = features.length; k < kEnd; ++k) {
									var feature = features[k];
									
									// Evaluate feature: rects
									var featureOffset = ~~(x + feature[0] * scale) + ~~(y + feature[1] * scale) * (width + 1);
									var featureWidth  = ~~(feature[2] * scale);
									var featureHeight = ~~(feature[3] * scale) * (width + 1);
									
									simpleClassifierSum +=
										(sat[featureOffset] -
										 sat[featureOffset + featureWidth] -
										 sat[featureOffset + featureHeight] +
										 sat[featureOffset + featureWidth + featureHeight]) * feature[4];
								}
							}

							complexClassifierSum += (simpleClassifierSum * invArea < simpleClassifier.threshold * std) ? simpleClassifier.left_val : simpleClassifier.right_val;
							// Possible optimization if all values are positive:
							// if (complexClassifierSum >= complexClassifierThreshold) break;
						}
						if (complexClassifierSum < complexClassifierThreshold) {
							found = false;
							break;
						}
					}
					if (found) rects.push([x, y, windowWidth, windowHeight]);
				}
			}
			return rects;
		},
		
		/**
		 * Evaluates a Haar cascade classifier at all scales.
		 * 
		 * @param {Array}  sat	       SAT of the source image
		 * @param {Array}  rsat	       RSAT of the source image
		 * @param {Array}  ssat	       Squared SAT of the source image
		 * @param {Array}  cannySat	   SAT of canny source image or undefined
		 * @param {Number} width       Width of the source image
		 * @param {Number} height      Height of the source image
		 * @param {Object} cascadeClassifier Haar cascade classifier
		 * @return {Array} Rectangles representing detected object
		 */
		detectMultiScale = function(sat, rsat, ssat, cannySat, width, height, cascadeClassifier, scaleFactor, scaleMin) {
			var initialWidth = cascadeClassifier.size[0];
			var initialHeight = cascadeClassifier.size[1];

			if (!scaleMin) scaleMin = 1;
			if (!scaleFactor) scaleFactor = 1.2;
			
			var scale = scaleMin;
			var rects = [];
			while (scale * initialWidth < width && scale * initialHeight < height) {
				rects = rects.concat(detectSingleScale(sat, rsat, ssat, cannySat, width, height, scale, cascadeClassifier));
				scale *= scaleFactor;
			}
			return rects;
		},
		
		/**
		 * Evaluates a Haar cascade classifier at increasingly coarser scale.
		 * Stops the evaluation as soon as the first object has been detected.
		 * 
		 * @param {Array}  sat	       SAT of the source image
		 * @param {Array}  rsat	       RSAT of the source image
		 * @param {Array}  ssat	       Squared SAT of the source image
		 * @param {Array}  cannySat	   SAT of canny source image or undefined
		 * @param {Number} width       Width of the source image
		 * @param {Number} height      Height of the source image
		 * @param {Object} cascadeClassifier Haar cascade classifier
		 * @return {Array} Rectangles representing detected object
		 */
		detectFinestScale = function(sat, rsat, ssat, cannySat, width, height, cascadeClassifier) {
			var initialWidth = cascadeClassifier.size[0];
			var initialHeight = cascadeClassifier.size[1];

			var scale = 1;
			var scaleFactor = 1.2;
			var rects = [];
			while (scale * initialWidth < width && scale * initialHeight < height) {
				rects = detectSingleScale(sat, rsat, ssat, cannySat, width, height, scale, cascadeClassifier);
				if (rects[0]) break;
				scale *= scaleFactor;
			}
			return rects;
		},
	    
		/**
		 * Groups rectangles together using a rectilinear distance metric. For
		 * each group of related rectangles, a representative mean rectangle
		 * is returned.
		 * 
		 * @param {Array} rects         Rectangles (Arrays of 4 floats)
		 * @param {Number} minNeighbors 
		 * @return {Array}              Mean rectangles (Arrays of 4 floats)
		 */
		groupRectangles = function(rects, minNeighbors) {
			var rectsLength = rects.length;
			
	    	// Partition rects into similarity classes:
	    	var numClasses = 0;
	    	var labels = new Array(rectsLength);
			for (var i = 0; i < labels.length; ++i) {
				labels[i] = 0;
			}
			
			for (var i = 0; i < rectsLength; ++i) {
				var found = false;
				for (var j = 0; j < i; ++j) {
					
					// Determine similarity:
					var rect1 = rects[i];
					var rect2 = rects[j];
			        var delta = 0.1 * (Math.min(rect1[2], rect2[2]) + Math.min(rect1[3], rect2[3]));
			        if (Math.abs(rect1[0] - rect2[0]) <= delta &&
			        	Math.abs(rect1[1] - rect2[1]) <= delta &&
			        	Math.abs(rect1[0] + rect1[2] - rect2[0] - rect2[2]) <= delta &&
			        	Math.abs(rect1[1] + rect1[3] - rect2[1] - rect2[3]) <= delta) {
						
						labels[i] = labels[j];
						found = true;
						break;
					}
				}
				if (!found) {
					labels[i] = numClasses++;
				}
			}
			
			// Compute average rectangle (group) for each cluster:
			var groups = new Array(numClasses);
			
			for (var i = 0; i < numClasses; ++i) {
				groups[i] = [0, 0, 0, 0, 0];
			}
			
			for (var i = 0; i < rectsLength; ++i) {
				var label = labels[i];
				groups[label][0] += rects[i][0];
				groups[label][1] += rects[i][1];
				groups[label][2] += rects[i][2];
				groups[label][3] += rects[i][3];
				groups[label][4]++;
			}
			
			for (var i = 0; i < numClasses; ++i) {
				var numNeighbors = groups[i][4];
				if (numNeighbors >= minNeighbors) {
					groups[i][0] /= numNeighbors;
					groups[i][1] /= numNeighbors;
					groups[i][2] /= numNeighbors;
					groups[i][3] /= numNeighbors;
				}
			}
			
			// Filter out small rectangles inside larger rectangles:
			var filteredGroups = [];
			for (var i = 0; i < numClasses; ++i) {
		        var r1 = groups[i];
		        
		        for (var j = 0; j < numClasses; ++j) {
		        	if (i === j) continue;
		            var r2 = groups[j];
		            var dx = r2[2] * 0.2;
		            var dy = r2[3] * 0.2;
		            
		            if (r1[0] >= r2[0] - dx &&
		                r1[1] >= r2[1] - dy &&
		                r1[0] + r1[2] <= r2[0] + r2[2] + dx &&
		                r1[1] + r1[3] <= r2[1] + r2[3] + dy) {
		            	
		            	break;
		            }
		        }
		        
		        if (j === numClasses) {
		        	filteredGroups.push(r1);
		        }
		    }
			return filteredGroups;
		};
	
		return {
			equalizeHistogram: equalizeHistogram,
			convertRgbaToGrayscale: convertRgbaToGrayscale,
			computeCanny: computeCanny,
			computeSat: computeSat,
			computeRsat: computeRsat,
			computeSatSum: computeSatSum,
			computeSquaredSat: computeSquaredSat,
			computeRSatSum: computeRSatSum,
			groupRectangles: groupRectangles,
			detectMultiScale: detectMultiScale,
			detectSingleScale: detectSingleScale,
			detectFinestScale: detectFinestScale
		};
})();