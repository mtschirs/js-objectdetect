Smoother = function(alpha, initPos) {
	
	var positions,
		updateTime = +new Date();
	
	var sp = initPos,
		sp2 = sp,
		sl = sp.length;
	
	this.interpolate = true;
	
	this.smooth = function(pos) {
		positions = pos;
		
		// update
		for (var i = 0;i < sl;i++) {
			sp[i] = alpha[i] * positions[i] + (1-alpha[i]) * sp[i];
			sp2[i] = alpha[i] * sp[i] + (1-alpha[i]) * sp2[i];
		}

		// set time
		updateTime = new Date();
		
		var msDiff = new Date() - updateTime;
		var newPositions = this.predict(msDiff);
		
		return newPositions;
	};
	
	this.predict = function(letime) {
		var time = letime ? letime :  +new Date();
		var retPos = [];
		
		if (this.interpolate) {
			for (var i = 0; i < sl; i++) {
				var step = time / 1000;
				var stepLo = step >> 0;
				var ratio = alpha[i] / (1-alpha[i]);
				
				var a = (step - stepLo)*ratio;
				var b = (2 + stepLo*ratio);
				var c = (1 + stepLo*ratio);
				
				retPos[i] = a * (sp[i] - sp2[i]) + b * sp[i] - c * sp2[i];
			}
		} else {
			var step = time / 1000 >> 0;
			var ratio = (alpha * step) / (1 - alpha);
			var a = 2 + ratio;
			var b = 1 + ratio;
			for (var i = 0; i < sl; i++) {
				retPos[i] = a * sp[i] - b * sp2[i];
			}
		}
	
		return retPos;
	};
};