class myIOchart {
	
	constructor(opts) {
		this.element = opts.element;
		this.plotLayers = opts.plotLayers;
		this.options = opts.options;
		this.draw();
    }
	
	get opts(){
		return this.options;
	}
	
	set opts(x){
		this.options = x ;
	}
	
	draw(){
		
		//define dimensions
		this.width = this.element.offsetWidth;
		this.height = this.element.offsetHeight;
		this.margin = this.options.margin
		
		//set up parent element and SVG
		this.element.innerHTML = '';
		this.svg = d3.select(this.element).append('svg').attr('id', this.element.id);
		this.svg.attr('width', this.width);
		this.svg.attr('height', this.height);
		
		switch ( this.plotLayers[0].type ) {

			case "gauge":
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.width/2+','+this.height/2+')')
				.attr('class', 'myIOchart-offset');
			break;
			
			case "donut":
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.width/2+','+this.height/2+')')
				.attr('class', 'myIOchart-offset');
			break;
			
			default:
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.margin.left+','+this.margin.top+')')
				.attr('class', 'myIOchart-offset');	
		
		}
		
		this.chart = this.plot
			.append('g')
			.attr('class', 'myIOchart-area');
	
		this.initialize();
	}
	
	initialize(){
		this.addButtons();
		this.setClipPath();
		
		switch ( this.plotLayers[0].type ) {
			case "gauge":
				this.routeLayers();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "donut":
				this.routeLayers();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "treemap":
				this.routeLayers();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "hexbin":
				this.setZoom();
				this.processScales(this.plotLayers);
				this.addAxes();
				this.routeLayers();
				this.updateReferenceLines();
				this.updateLegend();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "bar":
				this.setZoom();
				this.processScales(this.plotLayers);
				this.addAxes();
				this.routeLayers();
				this.updateReferenceLines();
				this.updateLegend();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "line":
				this.setZoom();
				this.processScales(this.plotLayers);
				this.addAxes();
				this.routeLayers();
				this.updateReferenceLines();
				this.updateLegend();
				this.updateRollover(this.plotLayers);
				break;
				
			case "point":
				this.setZoom();
				this.processScales(this.plotLayers);
				this.addAxes();
				this.routeLayers();
				this.updateReferenceLines();
				this.updateLegend();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
				break;
				
			case "stat_line":
				this.setZoom();
				this.processScales(this.plotLayers);
				this.addAxes();
				this.routeLayers();
				this.updateReferenceLines();
				this.updateLegend();
				this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
		}
	}
	
	addButtons(){
		
	}
	
	setClipPath(){
		this.clipPath = this.chart.append('defs').append('svg:clipPath')
			.attr('id', this.element.id + 'clip')
		  .append('svg:rect')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', this.width - (this.margin.left + this.margin.right))
			.attr('height', this.height - (this.margin.top + this.margin.bottom));
		
		this.chart.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
	}
	
	setZoom(){
		
	}
	
	processScales(lys){
		var that = this;
		var m = this.margin;
		
		var x_extents = [];
		var y_extents = [];
		var x_bands = [];
		var y_bands = [];
		
		
		lys.forEach(function(d){
			var currentY = that.newY ? that.newY : d.mapping.y_var;
			
			var x_var = d.mapping.x_var; 
			var y_var = currentY;
		
			var x = d3.extent( d.data, function(e) { return +e[x_var]; });
			var y = d3.extent( d.data, function(e) { return +e[y_var]; });
			var x_cat = d.data.map(function(e) { return e[x_var]; });
			var y_cat = d.data.map(function(e) { return e[y_var]; });

			x_extents.push(x);
			y_extents.push(y);
			x_bands.push(x_cat);
			y_bands.push(y_cat);
		})

		//find min and max - X axis
		var x_min = d3.min(x_extents, function(d,i) {return d[0]; });
		var x_max = d3.max(x_extents, function(d,i) {return d[1]; });
		
		//assess if there's any data
		var x_check1 = d3.min(x_extents, function(d,i) {return d[0]; });
		var x_check2 = d3.max(x_extents, function(d,i) {return d[1]; });
		this.x_check = (x_check1 == 0 & x_check2 == 0) == 1;
		
		//prevent single tick on axis
		if(x_min == x_max) { x_min = x_min-1; x_max = x_max+1;}
		
		//calculate buffer
		var x_buffer = Math.max(Math.abs(x_max - x_min) * .05, 0.5) ;
	
		var final_x_min = this.options.xlim.min ? this.options.xlim.min : (x_min+ x_buffer) ;
		var final_x_max = this.options.xlim.max ? this.options.xlim.max : (x_max+ x_buffer) ;
		var xExtent = [final_x_min, 
					   final_x_max ];
					   
		this.x_banded = [].concat.apply([], x_bands).map(function(d){
			try {
				return d[0];
			}
			
			catch(err) {
				console.log(err.message);
			}
		}).filter(onlyUnique);
					   
		//find min and max - Y axis
		var y_min = d3.min(y_extents, function(d,i) {return d[0]; });
		var y_max = d3.max(y_extents, function(d,i) {return d[1]; });
		
		//prevent single tick on axis
		if(y_min == y_max) { y_min = y_min-1; y_max = y_max+1;}
		
		//calculate buffer
		var y_buffer = Math.abs(y_max - y_min) * .15 ;
		
		//user inputs if available
		var final_y_min = this.options.ylim.min ? this.options.ylim.min : (y_min-y_buffer) ;
		var final_y_max = this.options.ylim.max ? this.options.ylim.max : (y_max+y_buffer) ;
		var yExtent = [(final_y_min), 
					   (final_y_max)];
					   
		this.y_banded = [].concat.apply([], y_bands).map(function(d){
			try {
				return d[0];
			}
			
			catch(err) {
				console.log(err.message);
			}
		}).filter(onlyUnique);
					   
		// create x scale
		switch (this.options.categoricalScale.xAxis){
			case true:
				this.xScale = d3.scaleBand()
					.range([0, this.width - (m.left + m.right)])
					.domain(this.x_banded );
				break;
				
			case false:
				this.xScale = d3.scaleLinear()
					.range([0, this.width - (m.right + m.left)])
					.domain(xExtent);
		}
		
		// create y scale
		switch (this.options.categoricalScale.yAxis){
			case true:
				this.yScale = d3.scaleBand()
					.range([this.height - (m.top + m.bottom), 0])
					.domain(this.y_banded );
				break;
				
			case false:
				this.yScale = d3.scaleLinear()
					.range([this.height - (m.top + m.bottom), 0])
					.domain(yExtent);
		}
		
		// if there is a color scheme defined
		if(this.options.colorScheme){
			this.colorDiscrete = d3.scaleOrdinal()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
			
			this.colorContinuous = d3.scaleLinear()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
		}
		
		//helper function(s)
		function onlyUnique(value, index, self) { 
			return self.indexOf(value) === index;
		}
	}
	
	addAxes(){
		
	}
	
	updateAxes(){
		
	}
	
	routeLayers(lys){
		
	}
	
	updateReferenceLines(){
		
	}
	
	updateLegend(){
		
	}
	
	updateRollover(lys){
		
	}
}

function getSVGString( svgNode ) {
	svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
	var cssStyleText = getCSSStyles( svgNode );
	appendCSS( cssStyleText, svgNode );

	var serializer = new XMLSerializer();
	var svgString = serializer.serializeToString(svgNode);
	svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
	svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

	return svgString;

	function getCSSStyles( parentElement ) {
		var selectorTextArr = [];

		// Add Parent element Id and Classes to the list
		selectorTextArr.push( '#'+parentElement.id );
		for (var c = 0; c < parentElement.classList.length; c++)
				if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
					selectorTextArr.push( '.'+parentElement.classList[c] );

		// Add Children element Ids and Classes to the list
		var nodes = parentElement.getElementsByTagName("*");
		for (var i = 0; i < nodes.length; i++) {
			var id = nodes[i].id;
			if ( !contains('#'+id, selectorTextArr) )
				selectorTextArr.push( '#'+id );

			var classes = nodes[i].classList;
			for (var c = 0; c < classes.length; c++)
				if ( !contains('.'+classes[c], selectorTextArr) )
					selectorTextArr.push( '.'+classes[c] );
		}

		// Extract CSS Rules
		var extractedCSSText = "";
		for (var i = 0; i < document.styleSheets.length; i++) {
			var s = document.styleSheets[i];
			
			try {
			    if(!s.cssRules) continue;
			} catch( e ) {
		    		if(e.name !== 'SecurityError') throw e; // for Firefox
		    		continue;
		    	}

			var cssRules = s.cssRules;
			for (var r = 0; r < cssRules.length; r++) {
				if ( contains( cssRules[r].selectorText, selectorTextArr ) )
					extractedCSSText += cssRules[r].cssText;
			}
		}
		
		console.log(extractedCSSText);
		return extractedCSSText;

		function contains(str,arr) {
			return arr.indexOf( str ) === -1 ? false : true;
		}

	}

	function appendCSS( cssText, element ) {
		var styleElement = document.createElement("style");
		styleElement.setAttribute("type","text/css"); 
		styleElement.innerHTML = cssText;
		var refNode = element.hasChildNodes() ? element.children[0] : null;
		element.insertBefore( styleElement, refNode );
	}
}


function svgString2Image( svgString, width, height, format, callback ) {
	var format = format ? format : 'png';

	var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");

	canvas.width = width;
	canvas.height = height;

	var image = new Image();
	image.onload = function() {
		context.clearRect ( 0, 0, width, height );
		context.drawImage(image, 0, 0, width, height);

		canvas.toBlob( function(blob) {
			var filesize = Math.round( blob.length/1024 ) + ' KB';
			if ( callback ) callback( blob, filesize );
		});

		
	};

	image.src = imgsrc;
}

if (!HTMLCanvasElement.prototype.toBlob) {
  Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
    value: function (callback, type, quality) {
      var dataURL = this.toDataURL(type, quality).split(',')[1];
      setTimeout(function() {

        var binStr = atob( dataURL ),
            len = binStr.length,
            arr = new Uint8Array(len);

        for (var i = 0; i < len; i++ ) {
          arr[i] = binStr.charCodeAt(i);
        }

        callback( new Blob( [arr], {type: type || 'image/png'} ) );

      });
    }
  });
}

function exportToCsv(filename, rows) {
	
	var jsonObject = JSON.stringify(rows);
	
    function ConvertToCSV(objArray) {
            var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
			
			var names = Object.keys(array[0]).toString();
						
            var str = names + '\r\n';

            for (var i = 0; i < array.length; i++) {
                var line = '';
                for (var index in array[i]) {
                    if (line != '') line += ','

                    line += array[i][index];
                }

                str += line + '\r\n';
            }

            return str;
        }

    var csvFile = ConvertToCSV(jsonObject);

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}

/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */
var saveAs=saveAs||function(e){"use strict";if("undefined"==typeof navigator||!/MSIE [1-9]\./.test(navigator.userAgent)){var t=e.document,n=function(){return e.URL||e.webkitURL||e},o=t.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in o,i=function(e){var t=new MouseEvent("click");e.dispatchEvent(t)},a=/Version\/[\d\.]+.*Safari/.test(navigator.userAgent),c=e.webkitRequestFileSystem,d=e.requestFileSystem||c||e.mozRequestFileSystem,u=function(t){(e.setImmediate||e.setTimeout)(function(){throw t},0)},s="application/octet-stream",f=0,l=4e4,v=function(e){var t=function(){"string"==typeof e?n().revokeObjectURL(e):e.remove()};setTimeout(t,l)},p=function(e,t,n){t=[].concat(t);for(var o=t.length;o--;){var r=e["on"+t[o]];if("function"==typeof r)try{r.call(e,n||e)}catch(i){u(i)}}},w=function(e){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(e.type)?new Blob(["\uFEFF",e],{type:e.type}):e},y=function(t,u,l){l||(t=w(t));var y,m,S,h=this,R=t.type,O=!1,g=function(){p(h,"writestart progress write writeend".split(" "))},b=function(){if(m&&a&&"undefined"!=typeof FileReader){var o=new FileReader;return o.onloadend=function(){var e=o.result;m.location.href="data:attachment/file"+e.slice(e.search(/[,;]/)),h.readyState=h.DONE,g()},o.readAsDataURL(t),void(h.readyState=h.INIT)}if((O||!y)&&(y=n().createObjectURL(t)),m)m.location.href=y;else{var r=e.open(y,"_blank");void 0===r&&a&&(e.location.href=y)}h.readyState=h.DONE,g(),v(y)},E=function(e){return function(){return h.readyState!==h.DONE?e.apply(this,arguments):void 0}},N={create:!0,exclusive:!1};return h.readyState=h.INIT,u||(u="download"),r?(y=n().createObjectURL(t),void setTimeout(function(){o.href=y,o.download=u,i(o),g(),v(y),h.readyState=h.DONE})):(e.chrome&&R&&R!==s&&(S=t.slice||t.webkitSlice,t=S.call(t,0,t.size,s),O=!0),c&&"download"!==u&&(u+=".download"),(R===s||c)&&(m=e),d?(f+=t.size,void d(e.TEMPORARY,f,E(function(e){e.root.getDirectory("saved",N,E(function(e){var n=function(){e.getFile(u,N,E(function(e){e.createWriter(E(function(n){n.onwriteend=function(t){m.location.href=e.toURL(),h.readyState=h.DONE,p(h,"writeend",t),v(e)},n.onerror=function(){var e=n.error;e.code!==e.ABORT_ERR&&b()},"writestart progress write abort".split(" ").forEach(function(e){n["on"+e]=h["on"+e]}),n.write(t),h.abort=function(){n.abort(),h.readyState=h.DONE},h.readyState=h.WRITING}),b)}),b)};e.getFile(u,{create:!1},E(function(e){e.remove(),n()}),E(function(e){e.code===e.NOT_FOUND_ERR?n():b()}))}),b)}),b)):void b())},m=y.prototype,S=function(e,t,n){return new y(e,t,n)};return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(e,t,n){return n||(e=w(e)),navigator.msSaveOrOpenBlob(e,t||"download")}:(m.abort=function(){var e=this;e.readyState=e.DONE,p(e,"abort")},m.readyState=m.INIT=0,m.WRITING=1,m.DONE=2,m.error=m.onwritestart=m.onprogress=m.onwrite=m.onabort=m.onerror=m.onwriteend=null,S)}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this.content);"undefined"!=typeof module&&module.exports?module.exports.saveAs=saveAs:"undefined"!=typeof define&&null!==define&&null!==define.amd&&define([],function(){return saveAs});