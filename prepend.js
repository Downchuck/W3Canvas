
if (typeof Math == "undefined") {
  var Math = {
    sqrt: function(n) {
      return System.Math.Sqrt(n);
    }
  }
}

if (typeof XMLHttpRequest == "undefined") {
  var XMLHttpRequest = function(){
  		this.readyState = 0;
  		this.open = function(m, url, b){};
  		this.onreadystatechange = {};
  		this.send = function(){};
  }
}

if (typeof setTimeout == "undefined") {
  var setTimeout = window.setTimeout;
  var setInterval = window.setInterval;
  var clearTimeout = window.clearTimeout;
  var clearInterval = window.clearInterval;
}
