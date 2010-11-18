
colorjack.debug = {
  info: function(v) {
  	if (typeof(v) == 'object') {
  		var z='';
  		for (var i = 0; i < v.length; i++) {
  			z+=i+':'+v[i]+', ';
  		}
  		z=z.substr(0,z.length-2);
  		return z;
  	}
  	return "v is not an object";
  },
  
  programmerPanic: function(msg) {
	//alert(msg);
	console.trace();
  	throw new Error("PANIC: " + msg);	
  },
  
  checkNull: function(fn, args) {
  	if (args.length > 0) {
  		for (var j = 0; j < args.length; j++) {
  			if (args[j] === null) {
  				throw new Error("Arg[" + j + "] is null in " + fn + ".init()");
  			}
  		}
  	}
  }
};


