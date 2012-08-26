Smoother = function(alpha, initPos) {
	
	var positions,
		updateTime = +new Date();
	
	var sp = [initPos[0], initPos[1], initPos[2], initPos[3], initPos[4]],
		sp2 = sp,
		sl = sp.length;
	
	this.interpolate = true;
	
	this.smooth = function(pos) {
		positions = [pos[0], pos[1], pos[2], pos[3], pos[4]];
		
		// update
		for (var i = 0;i < sl;i++) {
			sp[i] = alpha*positions[i]+(1-alpha)*sp[i];
			sp2[i] = alpha*sp[i]+(1-alpha)*sp2[i];
		}

		// set time
		updateTime = new Date();
		
		var msDiff = (new Date())-updateTime;
		var newPositions = this.predict(msDiff);
		
		pos[0] = newPositions[0];
		pos[1] = newPositions[1];
		pos[2] = newPositions[2];
		pos[3] = newPositions[3];
		pos[4] = newPositions[4];
		
		return pos;
	};
	
	this.predict = function(letime) {
		var time = letime ? letime :  +new Date();
		var retPos = [];
		
		if (this.interpolate) {
			var step = time/1000;
			var stepLo = step >> 0;
			var ratio = alpha/(1-alpha);
			
			var a = (step-stepLo)*ratio;
			var b = (2 + stepLo*ratio);
			var c = (1 + stepLo*ratio);
			
			for (var i = 0;i < sl;i++) {
				retPos[i] = a*(sp[i]-sp2[i]) + b*sp[i] - c*sp2[i];
			}
		} else {
			var step = time/1000 >> 0;
			var ratio = (alpha*step)/(1-alpha);
			var a = 2 + ratio;
			var b = 1 + ratio;
			for (var i = 0;i < sl;i++) {
				retPos[i] = a*sp[i] - b*sp2[i];
			}
		}
	
		return retPos;
	};
};