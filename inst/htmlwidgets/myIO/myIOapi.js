class myIOchart {
	
	constructor(opts) {
		this.element = opts.element;
		this.plotLayers = opts.plotLayers;
		this.options = opts.options;
		this.margin = this.options.margin;
		this.totalWidth = Math.max(opts.width, 280);
		this.width = this.totalWidth > 600 & this.options.suppressLegend == false ? this.totalWidth * 0.8 : this.totalWidth;
		this.height = opts.height;
		this.draw();
    }
	
	get opts(){
		return this.options;
	}
	
	set opts(x){
		this.options = x ;
	}
	
	draw(){		
		//set up parent element and SVG
		this.element.innerHTML = '';
		
		this.svg = d3.select(this.element)
			.append('svg')
			.attr('class', 'myIO-svg')
			.attr('id', 'myIO-svg' + this.element.id)
			.attr('width', this.totalWidth)
			.attr('height', this.height);
		
		switch ( this.plotLayers[0].type ) {

			case "gauge":
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.width/2+','+(this.totalWidth > 600 ? this.height *0.8 : this.height * 0.6)+')')
				.attr('class', 'myIO-chart-offset');
			break;
			
			case "donut":
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.width/2+','+(this.totalWidth > 600 ? this.height: this.height * 0.8)/2+')')
				.attr('class', 'myIO-chart-offset');
			break;
			
			default:
			this.plot = this.svg.append('g')
				.attr('transform','translate('+this.margin.left+','+this.margin.top+')')
				.style('width', this.width - this.margin.right)
				.attr('class', 'myIO-chart-offset');
		
		}
		
		this.chart = this.plot
			.append('g')
			.attr('class', 'myIO-chart-area');
		
		if(this.options.suppressLegend == false){
			this.legendTranslate = this.totalWidth > 600 ? 'translate(' + (this.width) + ',0)' : 'translate(' + this.margin.left + ',' + ( this.height*0.8 ) +')';
		
		
			this.legendArea = this.svg
			.append('g')
			.attr('class', 'myIO-legend-area')
			.attr('transform', this.legendTranslate )
			.style( 'height', this.totalWidth > 600 ? this.height : this.height * 0.2 )
			.style( 'width', this.totalWidth > 600 ? this.totalWidth - this.width : this.totalWidth - this.margin.left );
		}
		
	
		this.initialize();
	}
	
	initialize(){
		this.currentLayers = this.plotLayers;
		
		this.addButtons(this.currentLayers);
		
		this.tooltip = d3.select(this.element).append("div").attr("class", "toolTip");
		
		this.toolTipTitle = this.tooltip
			.append('div')
			.attr('class', 'toolTipTitle')
			.style('background-color', 'lightgray');
		
		this.toolTipBody = this.tooltip
			.append('div')
			.attr('class', 'toolTipBody');
			
		this.setClipPath( this.currentLayers[0].type );
				
		switch ( this.currentLayers[0].type ) {
			case "gauge":
				this.routeLayers(this.currentLayers);
				this.updateRollover(this.currentLayers);
				break;
				
			case "donut":
				this.routeLayers(this.currentLayers);
				this.updateRollover(this.currentLayers);				
				break;
				
			case "treemap":
				this.routeLayers(this.currentLayers);
				this.updateRollover(this.currentLayers);
				break;
				
			case "histogram":
				this.setZoom();
				this.createBins(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);				
				break;
				
			case "hexbin":				
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateContinuousColorLegend();
				this.updateRollover(this.currentLayers);				
				break;
				
			case "bar":				
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
				break;
				
			case "groupedBar":
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
				break;
				
			case "line":				
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
				break;
				
			case "point":				
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
				break;
			
			case "area":		
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
				break;
				
			case "stat_line":				
				this.setZoom();
				this.processScales(this.currentLayers);
				this.addAxes();
				this.routeLayers(this.currentLayers);
				this.updateReferenceLines();
				if(this.options.suppressLegend == false) this.updateLegend();
				this.updateRollover(this.currentLayers);
		}
	}
	
	addButtons(lys){
		var that = this;
	
		var buttonData = [
		{
			'name': 'image',
			'html': '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><title>PNG</title><path d="M9.5 19c0 3.59 2.91 6.5 6.5 6.5s6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5-6.5 2.91-6.5 6.5zM30 8h-7c-0.5-2-1-4-3-4h-8c-2 0-2.5 2-3 4h-7c-1.1 0-2 0.9-2 2v18c0 1.1 0.9 2 2 2h28c1.1 0 2-0.9 2-2v-18c0-1.1-0.9-2-2-2zM16 27.875c-4.902 0-8.875-3.973-8.875-8.875s3.973-8.875 8.875-8.875c4.902 0 8.875 3.973 8.875 8.875s-3.973 8.875-8.875 8.875zM30 14h-4v-2h4v2z"></path></svg>'
		},
		{
			'name': 'chart',
			'html': '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 -3 35 35"><title>Download Data</title><path d="M26 2h-20l-6 6v21c0 0.552 0.448 1 1 1h30c0.552 0 1-0.448 1-1v-21l-6-6zM16 26l-10-8h6v-6h8v6h6l-10 8zM4.828 6l2-2h18.343l2 2h-22.343z"></path></svg>'
		},
		{
			'name': 'percent',
			'html': '<!-- Generated by IcoMoon.io --><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="-5 -5 32 32"><title>Percent to Number</title><path d="M18.293 4.293l-14 14c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l14-14c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0zM10 6.5c0-0.966-0.393-1.843-1.025-2.475s-1.509-1.025-2.475-1.025-1.843 0.393-2.475 1.025-1.025 1.509-1.025 2.475 0.393 1.843 1.025 2.475 1.509 1.025 2.475 1.025 1.843-0.393 2.475-1.025 1.025-1.509 1.025-2.475zM8 6.5c0 0.414-0.167 0.788-0.439 1.061s-0.647 0.439-1.061 0.439-0.788-0.167-1.061-0.439-0.439-0.647-0.439-1.061 0.167-0.788 0.439-1.061 0.647-0.439 1.061-0.439 0.788 0.167 1.061 0.439 0.439 0.647 0.439 1.061zM21 17.5c0-0.966-0.393-1.843-1.025-2.475s-1.509-1.025-2.475-1.025-1.843 0.393-2.475 1.025-1.025 1.509-1.025 2.475 0.393 1.843 1.025 2.475 1.509 1.025 2.475 1.025 1.843-0.393 2.475-1.025 1.025-1.509 1.025-2.475zM19 17.5c0 0.414-0.167 0.788-0.439 1.061s-0.647 0.439-1.061 0.439-0.788-0.167-1.061-0.439-0.439-0.647-0.439-1.061 0.167-0.788 0.439-1.061 0.647-0.439 1.061-0.439 0.788 0.167 1.061 0.439 0.439 0.647 0.439 1.061z"></path></svg>'
		},
		{
			'name': 'group2stack',
			'html': '<!-- Generated by IcoMoon.io --><svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 32 32"><title>Grouped2Stacked</title><path d="M8 6l-4-4h-2v2l4 4zM10 0h2v4h-2zM18 10h4v2h-4zM20 4v-2h-2l-4 4 2 2zM0 10h4v2h-4zM10 18h2v4h-2zM2 18v2h2l4-4-2-2zM31.563 27.563l-19.879-19.879c-0.583-0.583-1.538-0.583-2.121 0l-1.879 1.879c-0.583 0.583-0.583 1.538 0 2.121l19.879 19.879c0.583 0.583 1.538 0.583 2.121 0l1.879-1.879c0.583-0.583 0.583-1.538 0-2.121zM15 17l-6-6 2-2 6 6-2 2z"></path></svg>'
		}
	]
			
		//d3.select(this.element).select('.buttonDiv').remove();
		var data2Use = this.options.toggleY ? ( this.plotLayers[0].type == "groupedBar" ? buttonData : buttonData.slice(0,3) ) : buttonData.slice(0,2);
		
		var buttonDiv = d3.select(this.element).append("div")
			.attr("class", "buttonDiv")  
			.style('opacity', 1)
			.style("left", ( that.width - ( 40 + ( 40*data2Use.length ) ) ) + 'px')
			.style("top", '0px');
				
		var buttons = buttonDiv.selectAll('.button')
			.data(data2Use)
		  .enter()
			.append('div')
			.attr('class', 'button')		
			//.attr("transform", function(d) { return "translate(" +  tempData.indexOf(d)* 20 + ", 0)"; })
			.html(function(d){ return d.html})
			.on('click', function(event, d){
				
				if(d.name == "image"){
					var svgString = getSVGString(that.svg.node());
					svgString2Image( svgString, 2*that.width, 2*that.height, 'png', save ); // passes Blob and filesize String to the callback

					function save( dataBlob, filesize ){
						saveAs( dataBlob, that.element.id + '.png' ); // FileSaver.js function
					}
				} else if(d.name == "chart"){
					var csvData =  [];
				
					that.plotLayers.forEach(function(d){
							csvData.push(d.data);
						});
						
					var finalCSVData = [].concat.apply([], csvData);
					
					exportToCsv(that.element.id + '_data.csv', finalCSVData)
				} else if(d.name == "percent"){
					
					if(that.toggleY){
					
						if(that.toggleY[0] == that.options.toggleY[0]){
							
							that.toggleY = [that.plotLayers[0].mapping.y_var, that.options.yAxisFormat];
							
						} else if(that.toggleY[0] == that.plotLayers[0].mapping.y_var){
							
							that.toggleY = that.options.toggleY;
							
						}
						
					} else {
						that.toggleY = that.options.toggleY;
					}
					
					that.toggleVarY(that.toggleY);
				} else if(d.name == "group2stack"){
					var m = that.margin;
					
					var barSize = lys[0].options.barSize == "small" ? 0.5 : 1;
					
					var transitionSpeed = that.options.transition.speed;
					
					var data = getGroupedDataObject(lys, that);
					var colors = lys.map(d => d.color);
					
					var bandwidth = ( ( that.width - ( that.margin.right + that.margin.left ) ) / (data[0].length + 1) ) / colors.length;
					
					updateBarsClicked();
					
					function updateBarsClicked(){
			
						if (that.layout === "stacked"){
							transitionGrouped(that, data, colors, bandwidth);
							that.layout = "grouped";
						} else {
							transitionStacked(that, data, colors, bandwidth);
							that.layout = "stacked";
						} 
					}
				}
					
				});
	}
	
	toggleVarY(newY){
		this.newY = newY[0];
		this.newScaleY = newY[1]
		this.processScales(this.currentLayers);
		this.updateAxes();
		this.routeLayers(this.currentLayers);
		this.updateRollover(this.currentLayers);
		if(this.options.suppressLegend == false) this.updateLegend();
	}
	
	setClipPath(type){
		
		switch (type){
			case "donut":
			case "gauge":
				
				break;
			
			default:
				if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
				
				
				this.clipPath = this.chart.append('defs').append('svg:clipPath')
					.attr('id', this.element.id + 'clip')
				  .append('svg:rect')
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', this.width - (this.margin.left + this.margin.right))
					.attr('height', chartHeight - (this.margin.top + this.margin.bottom));
				
				this.chart.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
		}
		
	}
	
	setZoom(){
		
	}
	
	createBins(lys){
		var m = this.margin;
		
		if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
		var x_extents = [];
		
		lys.forEach(function(d){
				
			var x = d3.extent( d.data, function(e) { return +e[d.mapping.value]; });
	
			x_extents.push(x);

		});
		
		var x_min = d3.min(x_extents, function(d,i) {return d[0]; });
		var x_max = d3.max(x_extents, function(d,i) {return d[1]; });
		
		var xExtent = [ x_min, 
					   x_max ];
		
		var x = d3.scaleLinear()
			.domain(xExtent).nice()
			.range([0, this.width - (m.left + m.right)]);
	
		lys.forEach(function(d){
			
			var values = d.data.map(e => e[d.mapping.value]);
			
			console.log(values);
			
			d.bins = d3.bin()
				.domain(x.domain())
				.thresholds(x.ticks(d.mapping.bins))
			  (values);
			  
			d.max_value =  d3.max(d.bins, d => d.length);
		});	
		
		this.xScale = x;
		
		this.yScale = d3.scaleLinear()
			.domain([0, d3.max(lys, d => d.max_value)]).nice()
			.range([chartHeight - (m.top + m.bottom), 0])
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
			var low_y = d.mapping.low_y;
			var high_y = d.mapping.high_y;
		
			var x = d3.extent( d.data, function(e) { return +e[x_var]; });
			var y = d3.extent( d.data, function(e) { return +e[y_var]; });
			var y1 = d3.extent( d.data, function(e) { return +e[low_y]; });
			var y2 = d3.extent( d.data, function(e) { return +e[high_y]; });
			
			var final_y_low = d3.min([ y[0], y1[0], y2[0] ]);
			var final_y_high = d3.max([ y[1], y1[1], y2[1] ]);
			var final_y_extent = [final_y_low, final_y_high];
			
			
			var x_cat = d.data.map(function(e) { return e[x_var]; });
			var y_cat = d.data.map(function(e) { return e[y_var]; });

			x_extents.push(x);
			y_extents.push(final_y_extent);
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
	
		var final_x_min = this.options.xlim.min ? +this.options.xlim.min : (x_min - x_buffer) ;
		var final_x_max = this.options.xlim.max ? +this.options.xlim.max : (x_max + x_buffer) ;
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
		var final_y_min = this.options.ylim.min ? +this.options.ylim.min : (y_min - y_buffer) ;
		var final_y_max = this.options.ylim.max ? +this.options.ylim.max : (y_max + y_buffer) ;
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
		if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
				
		switch (this.options.categoricalScale.xAxis){
			case true:
				this.xScale = d3.scaleBand()
					.range([0, this.width - (m.left + m.right)])
					.domain(that.options.flipAxis == true ? this.y_banded : this.x_banded );
				break;
				
			case false:
				this.xScale = d3.scaleLinear()
					.range([0, this.width - (m.right + m.left)])
					.domain(that.options.flipAxis == true ? yExtent : xExtent);
		}
		
		// create y scale
		switch (this.options.categoricalScale.yAxis){
			case true:
				this.yScale = d3.scaleBand()
					.range([chartHeight - (m.top + m.bottom), 0])
					.domain(that.options.flipAxis == true ? this.x_banded : this.y_banded );
				break;
				
			case false:
				this.yScale = d3.scaleLinear()
					.range([chartHeight - (m.top + m.bottom), 0])
					.domain(that.options.flipAxis == true ? xExtent : yExtent);
		}
		
		// if there is a color scheme defined
		if(this.options.colorScheme){
			console.log("color scheme yes!");
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
		var that = this;
		var m = this.margin;
		if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
		
		switch (this.options.xAxisFormat){
			case "yearMon":
				var xFormat = d3.format("s");
				break;
			
			default:
				var xFormat = d3.format(this.options.xAxisFormat);
			
		}
		
		var yFormat = d3.format(this.options.yAxisFormat);
		
		switch (this.options.categoricalScale.xAxis){
			case true:
			this.plot.append('g')
				.attr("class", "x-axis")
				.attr("transform", "translate(0," + (chartHeight-(m.top+m.bottom)) + ")")
				.call(d3.axisBottom(this.xScale))
					.selectAll("text")
					.attr("class", "x-label")
					.attr("dx", "-.25em")
					.attr('text-anchor', this.width < 550 ? 'end' : 'center')
					.attr("transform", this.width < 550 ? "rotate(-65)" : "rotate(-0)");
			break;
			
			case false:
				this.plot.append('g')
					.attr("class", "x-axis")
					.attr("transform", "translate(0," + (chartHeight-(m.top+m.bottom)) + ")")
					.call(d3.axisBottom(this.xScale)
							.ticks(this.width < 550 ? 5 : 10, xFormat)
							//.tickFormat(function(e){ if(Math.floor(+e) != +e){return;} return +e;})
							.tickSize( -(this.height-(m.top+m.bottom)) )
								)
						.selectAll("text")
							.attr("class", "x-label")
							.attr('dy', '1.25em')
							.attr('text-anchor', this.width < 550 ? 'end' : 'center')
							.attr("transform", this.width < 550 ? "rotate(-65)" : "rotate(-0)");
			
		}
		
		this.plot.selectAll('.x-axis').selectAll('.domain')
			.attr('class', 'x-axis-line');
			
		this.plot.selectAll('.x-axis').selectAll('.tick line')
			.attr('class', 'x-grid');
		
		this.plot.selectAll('.x-axis').selectAll('text')
			.attr('class', 'x-label');
		
		var currentFormatY = this.newScaleY ? this.newScaleY : yFormat;

		this.plot.append('g')
			.attr("class", "y-axis")
			.call(d3.axisLeft(this.yScale)
				.ticks(chartHeight < 450 ? 5 : 10, currentFormatY)
				.tickSize( -(this.width-(m.right+m.left)) )
				)
			.selectAll("text")
				.attr("class", "y-label")
				.attr("dx", "-.25em");
		
		this.plot.selectAll('.y-axis').selectAll('.domain')
			.attr('class', 'y-axis-line');
			
		this.plot.selectAll('.y-axis').selectAll('.tick line')
			.attr('class', 'y-grid');
			
		this.plot.selectAll('.y-axis').selectAll('text')
			.attr('class', 'y-label');
	}
	
	updateAxes(){
		var that = this;
		var m = this.margin;
		if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
		
		var transitionSpeed = this.options.transition.speed;
		
		
		
		switch (this.options.xAxisFormat){
			case "yearMon":
				var xFormat = d3.format("s");
				break;
			
			default:
				var xFormat = d3.format(this.options.xAxisFormat);
			
		}
		
		var yFormat = d3.format(this.options.yAxisFormat);
		
		switch (this.options.categoricalScale.xAxis){
			case true:
				this.svg.selectAll('.x-axis')
					.transition().ease(d3.easeQuad)
					.duration(transitionSpeed)
					.attr("transform", "translate(0," + (chartHeight-(m.top+m.bottom)) + ")")
					.call(d3.axisBottom(this.xScale))
						.selectAll("text")
						.attr("dx", "-.25em")
						.attr('text-anchor', this.width < 550 ? 'end' : 'center')
						.attr("transform", this.width < 550 ? "rotate(-65)" : "rotate(-0)");
			break;
			
			case false:
				this.svg.selectAll('.x-axis')
					.transition().ease(d3.easeQuad)
					.duration(transitionSpeed)
					.attr("transform", "translate(0," + (chartHeight-(m.top+m.bottom)) + ")")
						.call(d3.axisBottom(this.xScale)
								.ticks(this.width < 550 ? 5 : 10, xFormat)
								.tickSize( -(chartHeight-(m.top+m.bottom)) )
								//.tickFormat(function(e){ if(Math.floor(+e) != +e){return;} return +e;})
									)
							.selectAll("text")
								.attr('dy', '1.25em')
								.attr('text-anchor', this.width < 550 ? 'end' : 'center')
								.attr("transform", this.width < 550 ? "rotate(-65)" : "rotate(-0)");
			
		}
		
		this.plot.selectAll('.x-axis').selectAll('.domain')
			.attr('class', 'x-axis-line');
			
		this.plot.selectAll('.x-axis').selectAll('.tick line')
			.attr('class', 'x-grid');
			
		this.plot.selectAll('.x-axis').selectAll('text')
			.attr('class', 'x-label');
		
		var currentFormatY = this.newScaleY ? this.newScaleY : yFormat;
		
		this.svg.selectAll('.y-axis')
			.transition().ease(d3.easeQuad)
			.duration(transitionSpeed)
			.call(d3.axisLeft(this.yScale)
				.ticks(chartHeight < 450 ? 5 : 10, currentFormatY)
				.tickSize( -(this.width-(m.right+m.left)) )
				)				
			.selectAll("text")
				.attr("dx", "-.25em");
		
		this.plot.selectAll('.y-axis').selectAll('.domain')
			.attr('class', 'y-axis-line');
			
		this.plot.selectAll('.y-axis').selectAll('.tick line')
			.attr('class', 'y-grid');
		
		this.plot.selectAll('.y-axis').selectAll('text')
			.attr('class', 'y-label');
	}
	
	routeLayers(lys){
		var that = this;
		
		if(lys[0].type == "groupedBar") this.addGroupedBars(lys) ;
	
		this.layerIndex = this.plotLayers.map(function(d) {return d.label; });
		
		lys.forEach(function(d){
			
			var layerType = d.type;
			
			switch (layerType){
				case "histogram":
					console.log("route layers achieved");
					that.addHistogramBars(d);
					break;
				
				case "line":
					that.addLine(d);
					that.addPoints(d);
					break;
				
				case "point":
					if(d.mapping.low_y) { that.addCrosshairsY(d); }
					if(d.mapping.low_x) { that.addCrosshairsX(d); }
					that.addPoints(d);
					break;
				
				case "area":
					that.addArea(d);
					break;
					
				case "bar":
					that.options.flipAxis == true ? that.addHorizontalBars(d): that.addVerticalBars(d);
					break;
					
				case "hexbin":
					that.addHexBins(d);
					break;
				case "treemap":
					that.addTreemap(d);
					that.updateOrdinalColorLegend(d);
					break;
					
				case "donut":
					that.addDonut(d);
					that.updateOrdinalColorLegend(d);
					break;
				
				case "gauge":
					that.addGauge(d);
					break;
					
				default:
				
			}
			
		});
	}
	
	removeLayers(lys){
		var that = this;
	
		lys.forEach(function(d) {
			
			d3.selectAll( '.tag-line-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-bar-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-point-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-regression-line-' + that.element.id + '-'  + d.replace(/\s+/g, '') ).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-hexbin-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-area-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-crosshairY-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
			d3.selectAll( '.tag-crosshairX-' + that.element.id + '-'  + d.replace(/\s+/g, '')).transition().duration(500).style('opacity', 0).remove() ;
		})
	}
	
	addLine(ly){
		var that = this;
		
		var data = ly.data;
		var key = ly.label;
		
		var currentY = this.newY ? this.newY : ly.mapping.y_var;
		
		var transitionSpeed = this.options.transition.speed;
		
		var valueLine = d3.line()
			.curve(d3.curveMonotoneX)
			.x(d => this.xScale( d[ly.mapping.x_var] ) )
			.y(d => this.yScale( d[ currentY ] ) );
	
		var linePath = this.chart
			.selectAll( '.tag-line-' + this.element.id + '-'  + key.replace(/\s+/g, '')) 
			.data([data]);
		
		//EXIT old elements not present in new data
		linePath.exit()
		  .transition().duration(transitionSpeed).style('opacity', 0)
			.remove();
		
		//ENTER new elements present in new data
		var newLinePath = linePath.enter().append("path")
			.attr("fill", "none")
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('stroke', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.group]) : ly.color )
			.style("stroke-width", this.totalWidth > 600 ? 3:1)
			.style('opacity', 0)
			.attr("class", 'tag-line-' + this.element.id + '-'  + key.replace(/\s+/g, '') );
			
		//UPDATE old elements present in new data
		linePath.merge(newLinePath)	
		  .transition()
		  .ease(d3.easeQuad)
		  .duration(transitionSpeed)
			.style('opacity', 1)
			.style("stroke-width", this.totalWidth > 600 ? 3:1)
			.style('stroke',d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[0][ly.mapping.group]) : ly.color )
			.attr("d", valueLine);
	}
	
	addPoints(ly){
		
		var transitionSpeed = this.options.transition.speed;
		
		//join data to points
		var points = this.chart
			.selectAll( '.tag-point-' + this.element.id + '-'  +ly.label.replace(/\s+/g, '')) 
			.data(ly.data);

		points.exit()
		  .transition().remove();
		
		points
		  .transition()
		  .ease(d3.easeQuad)
		  .duration(transitionSpeed)
			.attr('r', this.totalWidth > 600 ? 5:3)
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.group]) : ly.color )
			.attr('cx', e => this.xScale( e[ly.mapping.x_var] ) )
			.attr('cy', e => this.yScale( e[ this.newY ? this.newY : ly.mapping.y_var ] ) );
		
		points.enter()
			.append('circle')
			.attr('r', this.totalWidth > 600 ? 5:3)
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.group]) : ly.color )
			.style('opacity', 0)
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.attr('cx', e => this.xScale( e[ly.mapping.x_var] ) )
			.attr('cy', e => this.yScale( e[ this.newY ? this.newY : ly.mapping.y_var ] ) )
			.attr("class", 'tag-point-' + this.element.id + '-' + ly.label.replace(/\s+/g, '')  )
		  .transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.style('opacity', 1);
		
		if(this.options.dragPoints == true) { 
			this.dragPoints(ly); 
			//regression needs to wait for transition to properly calculate
			var color = this.options.colorScheme[2] == "on" ? this.colorScheme(ly.data[ly.mapping.group]) : ly.color; 
			setTimeout( () => this.updateRegression(color, ly.label), transitionSpeed );
		}
	}
	
	addArea(ly){
		var that = this;
	
		var data = ly.data;
		var key = ly.label;
		var transitionSpeed = this.options.transition.speed;
		
		var valueArea = d3.area()
			.curve(d3.curveMonotoneX)
			.x(d => this.xScale( d[ ly.mapping.x_var ] ) )
			.y0(d => this.yScale( d[ ly.mapping.low_y ] ) )
			.y1(d => this.yScale( d[ ly.mapping.high_y ] ) );
			
		var linePath = this.chart
			.selectAll( '.tag-area-' + this.element.id + '-'  + key.replace(/\s+/g, '')) 
			.data([data]);
		
		//EXIT old elements not present in new data
		linePath.exit()
		  .transition().duration(transitionSpeed).style('opacity', 0)
			.remove();
		
		//ENTER new elements present in new data
		var newLinePath = linePath.enter().append("path")
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[0][ly.mapping.group]) : ly.color )
			.style('opacity', 0)
			.attr("class", 'tag-area-' + this.element.id + '-'  + key.replace(/\s+/g, '') );
			
		//UPDATE old elements present in new data
		linePath.merge(newLinePath)
			.attr('clip-path', 'url(#' + this.element.id + 'clip' + ')')
		  .transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr("d", valueArea)
			.style('opacity', 0.4);
	}
	
	addHistogramBars(ly){
		var that = this;
		var m = this.margin;
		var data = ly.bins;
		var key = ly.label;
		var transitionSpeed = this.options.transition.speed;
		
		var bars = this.chart
			.selectAll('.tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			//.selectAll('rect')
			.data(data);
		
		bars.exit()
			.transition().duration(transitionSpeed).attr('y', this.yScale(0))
			.remove();
		
		var newBars = bars.enter()
			.append('rect')
			.attr('class', 'tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.x_var]) : ly.color )
			.attr("x", d => this.xScale(d.x0) + 1)
			.attr('y', this.yScale(0))
			.attr("width", d => Math.max(0, this.xScale(d.x1) - this.xScale(d.x0) - 1))
			.attr('height', this.yScale(0));
			
		bars.merge(newBars)
			.transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr("x", d => this.xScale(d.x0) + 1)
			.attr("width", d => Math.max(0, this.xScale(d.x1) - this.xScale(d.x0) - 1))
			.attr("y", d => this.yScale(d.length))
			.attr("height", d => this.yScale(0) - this.yScale(d.length));
	}

	addVerticalBars(ly){
		var that = this;
		var m = this.margin;
		var data = ly.data;
		var key = ly.label;
		var barSize = ly.options.barSize == "small" ? 0.5 : 1;
		var bandwidth = this.options.categoricalScale.xAxis == true ? (this.width - (m.left + m.right)) / that.x_banded.length : Math.min(100, (that.width - (that.margin.right + that.margin.left)) / ly.data.length);
		var transitionSpeed = this.options.transition.speed;
		
		var bars = this.chart
			.selectAll('.tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			//.selectAll('rect')
			.data(data);
		
		bars.exit()
			.transition().duration(transitionSpeed).attr('y', this.yScale(0))
			.remove();
		
		var newBars = bars.enter()
			.append('rect')
			.attr('class', 'tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.x_var]) : ly.color )
			.attr('x', d => defineScale(d,ly,bandwidth, barSize, this.options.categoricalScale.xAxis) )
			.attr('y', this.yScale(0))
			.attr('width', (barSize * bandwidth)-2)
			.attr('height', this.yScale(0));
			
		bars.merge(newBars)
			.transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr('x', d => defineScale(d, ly, bandwidth, barSize, this.options.categoricalScale.xAxis) )
			.attr('y', d => this.yScale(d[ly.mapping.y_var]) )
			.attr('width', (barSize * bandwidth)-2)
			.attr('height', d => (this.height -( m.top + m.bottom )) - this.yScale(d[ly.mapping.y_var]) );
		
		function defineScale(d,ly, bandwidth, barSize, scale){
			switch (scale){
				case true:
					return barSize == 1 ? that.xScale(d[ly.mapping.x_var]) : that.xScale(d[ly.mapping.x_var]) + (bandwidth/4) ;
					break;
				default:
					return barSize == 1 ? that.xScale(d[ly.mapping.x_var]) - (bandwidth/2) : that.xScale(d[ly.mapping.x_var]) - (bandwidth/4);
			}
		}
	}
	
	addHorizontalBars(ly){
		
		var that = this;
		var m = this.margin;
		
		var data = ly.data;
		var key = ly.label;
		
		var barSize = ly.options.barSize == "small" ? 0.5 : 1;
		var bandwidth = this.options.categoricalScale.yAxis == true ? (this.height - (m.top + m.bottom)) / ly.data.length : Math.min(100, (this.height - (this.margin.top + this.margin.bottom)) / ly.data.length);
		
		var transitionSpeed = this.options.transition.speed;
		
		var bars = this.chart
			.selectAll('.tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			//.selectAll('rect')
			.data(data);
		
		bars.exit()
			.transition()
			.duration(transitionSpeed)
			.attr('width', 0)
			.remove();
		
		var newBars = bars.enter()
			.append('rect')
			.attr('class', 'tag-bar-' + this.element.id + '-'  + key.replace(/\s+/g, ''))
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('fill', d => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.x_var]) : ly.color )
			.attr('y', d => barSize == 1 ? this.yScale(d[ly.mapping.x_var]) : this.yScale(d[ly.mapping.x_var]) + bandwidth/4 )
			.attr('x', d => this.xScale(Math.min(0, d[ly.mapping.y_var])) )
			.attr('height', (barSize * bandwidth)-2)
			.attr('width', 0);			
	
		bars.merge(newBars)
			.transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr('y', d => barSize == 1 ? this.yScale(d[ly.mapping.x_var]) : this.yScale(d[ly.mapping.x_var]) + bandwidth/4 )
			.attr('x', d => this.xScale(Math.min(0, d[ly.mapping.y_var])) )
			.attr('height', (barSize * bandwidth)-2)
			.attr('width', d => Math.abs(this.xScale(d[ly.mapping.y_var]) - this.xScale(0)) );
		
		function defineScale(d,ly, bandwidth, barSize, scale){
			switch (scale){
				case true:
					return barSize == 1 ? that.yScale(d[ly.mapping.y_var]) : that.yScale(d[ly.mapping.y_var]) + (bandwidth/4) ;
					break;
				default:
					return barSize == 1 ? that.yScale(d[ly.mapping.y_var]) - (bandwidth/2) : that.yScale(d[ly.mapping.y_var]) - (bandwidth/4);
			}
		}
	}
	
	addGroupedBars(lys){
		var that = this;
		var m = this.margin;
		
		var barSize = lys[0].options.barSize == "small" ? 0.5 : 1;
		
		var transitionSpeed = this.options.transition.speed;
		
		var data = getGroupedDataObject(lys, that);
		
		var colors = lys.map(d => d.color);
		
		var bandwidth = ( ( that.width - ( that.margin.right + that.margin.left ) ) / (data[0].length) ) / colors.length;
		
		if(typeof this.layout == 'undefined'){
				this.layout = "grouped";
			}
			
		const bars = this.chart
			.selectAll( 'g' )
			.data(data);
			
		bars
			.exit()
			.remove();
			
		bars			
			.enter()
			.append('g')
			.style('fill', (d,i) => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.group]) : colors[i] )
			.attr('class', 'tag-grouped-bar-g' );
			
		bars.merge(bars)
			.style('fill', (d,i) => this.options.colorScheme[2] == "on" ? this.colorScheme(d[ly.mapping.group]) : colors[i] )
			.call(updateBars);
			/*
			.join('rect')
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.attr('x', (d,i) => that.xScale(+d.data.key) )
			.attr('y', this.yScale(0))
			.attr('width', bandwidth )
			.attr('height', 0)
		 .transition()
				.duration(transitionSpeed)
				//.delay( (d) => d.idx * 20 )
				.attr('x', (d) => that.xScale(+d.data.key) + (bandwidth * d.idx)  )
				.attr('width', bandwidth )
			  .transition()
				.attr('y', d => that.yScale( d[1] - d[0] ) )
				.attr('height', d => that.yScale(0) - that.yScale( d[1] - d[0] ) );
		
		this.chart
			.on('click', updateBarsClicked);
		*/	
		
		
		function updateBars(){
			
			if (that.layout === "grouped"){
				transitionGrouped(that, data, colors, bandwidth);
				
			} else {
				transitionStacked(that, data, colors, bandwidth);
				
			} 
		}
		
		function defineScale(d,ly, bandwidth, barSize, scale){
			switch (scale){
				case true:
					return barSize == 1 ? that.xScale(d.data[0]) : that.xScale(d.data[0]) + (bandwidth/4) ;
					break;
				default:
					return barSize == 1 ? that.xScale(+d.data[0]) - (bandwidth/2) : that.xScale(+d.data[0]) - (bandwidth/4);
			}
		}
	
	}
	
	addHexBins(ly){
		var that = this;
		var transitionSpeed = this.options.transition.speed;

		//create points	
		var points = ly.data.map(function(d) { return  { 0: that.xScale(+d[ly.mapping.x_var]), 1: that.yScale(+d[ly.mapping.y_var]) } ; });
		points = points.sort(function(d) { return d3.ascending(d.index); });
		var x_extent = d3.extent(ly.data, function(d) { return +d[ly.mapping.x_var]; })
		var y_extent = d3.extent(ly.data, function(d) { return +d[ly.mapping.y_var]; })
			
		//hexbin function
		var hexbin = d3.hexbin()
			.radius(ly.mapping.radius * (Math.min(this.width, this.height) / 1000 ))
			.extent([
				[x_extent[0], y_extent[0]],
				[x_extent[1], y_extent[1]]
			]);
			
		var binnedData = hexbin(points);
		
		//color scale
		this.colorContinuous = d3.scaleSequential(d3.interpolateBuPu)
		 .domain([ 0, d3.max(binnedData, d => d.length) ]);
		
		//data join
		var bins = this.chart
			.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
			.selectAll( '.tag-hexbin-' + that.element.id + '-'  +ly.label.replace(/\s+/g, '')) 
			.data(binnedData);
		
		//EXIT
		bins.exit()
		  .transition()
			.duration(transitionSpeed)
			.remove();
		  
		//ENTER
		var newbins = bins.enter()
			.append('path')
			.attr("class", 'tag-hexbin-' + that.element.id + '-' + ly.label.replace(/\s+/g, '')  )
			.attr('d', hexbin.hexagon())
			.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })	
			.attr('fill', 'white');
			
		//UPDATE
		bins.merge(newbins)
			.transition()
				.ease(d3.easeQuad)
				.duration(transitionSpeed)
			.attr('d', hexbin.hexagon())
			.attr('transform', function(d) { return "translate(" + d.x + "," + d.y + ")"; })
			.attr('fill', function(d) { return that.colorContinuous(d.length); });
	}
	
	addTreemap(ly){
		var that = this;
		var m = this.margin;
		var format = d3.format(",d")
		var key = ly.label;
		
		if(this.options.colorScheme[2] == "on"){
			
			this.colorDiscrete = d3.scaleOrdinal()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
			
			this.colorContinuous = d3.scaleLinear()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
		} else {
			var colorKey = ly.data.children.map( d => d.name );
			this.colorDiscrete = d3.scaleOrdinal()
				.range(ly.color)
				.domain(colorKey);
		}
		
		// create hierarchy from data
		var root = d3.hierarchy(ly.data)
			.eachBefore(function(d) { d.data.id = (d.parent ? d.parent.data.id + "." : "") + d.data.name; })
			.sum(sumBySize)
			.sort(function(a,b) { return b.height - a.height || b.value - a.value});
		
		// define treemap function
		var treemap = d3.treemap()
			.tile(d3.treemapResquarify)
			.size([
				this.width - (m.left + m.right),
				(this.totalWidth > 600 ? this.height : this.height *0.8) - (m.top + m.bottom)
			])
			.round(true)
			.paddingInner(1);
		
		treemap(root);
		
		// data join
		var cell = this.chart
			.selectAll('.root')
			.data(root.leaves());
			
		// EXIT
		cell.exit().remove();
		
		// ENTER
		var newCell = cell.enter()
			.append('g')
			.attr('class', 'root')
			//.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
			.attr('transform', function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
		
		// append rect
		newCell.append("rect")
			.attr('class', 'tag-tree-' + that.element.id + '-'  + key.replace(/\s+/g, ''))
			.attr('id', function(d) { return d.data.id; })
			.attr('width', function(d) { return d.x1 - d.x0; })
			.attr('height', function(d) { return d.y1 - d.y0; })
			//.attr('opacity', 0.5)
			.attr('fill', function(d) { while (d.depth > 1) d = d.parent; return that.colorDiscrete(d.data.id); });
		
		// UPDATE
		cell.merge(newCell)
			.transition()
			.duration(750)
			.attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
		  .select("rect")
			.attr("width", function(d) { return d.x1 - d.x0; })

			.attr("height", function(d) { return d.y1 - d.y0; })
			.attr('fill', function(d) { while (d.depth > 1) d = d.parent; return that.colorDiscrete(d.data.id); });

			
		// append text
		newCell.append('text')
			.attr('class', 'inner-text')
			.selectAll('tspan')
			.data(function(d) { 
				var name = d.data[ly.mapping.x_var];
				return name[0].split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)); 
			})
			.enter().append('tspan')
			.attr('x', 3)
			.attr('y', function(d,i,nodes) { return (i === nodes.length - 1) * 3 + 16 + (i - 0.5) * 9; })
			.attr('fill-opacity',  function(d,i) { 
				return this.parentNode.parentNode.getBBox().width > 40 ? 1 : 0; 
				})
			.attr('fill', 'black')
			.text(function(d) { return d; });
			
		// append title/tooltip
		newCell.append('title')
			.text(function(d) { 
				return d.data[ly.mapping.level_1] + "  \n" + 
					d.data[ly.mapping.level_2] + " \n" +
					d.data[ly.mapping.x_var] + "  \n" +
					format(d.value); })
					
		// append text
		cell.selectAll('text').remove();
		
		cell.append('text')
			.selectAll('tspan')
			.data(function(d) { 
				var name = d.data[ly.mapping.x_var];
				return name[0].split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)); 
			})
			.enter().append('tspan')
			.attr('x', 3)
			.attr('y', function(d,i,nodes) { return (i === nodes.length - 1) * 3 + 16 + (i - 0.5) * 9; })
			.attr('fill-opacity',  function(d,i) { 
				return this.parentNode.parentNode.getBBox().width > 40 ? 1 : 0; 
				})
			.attr('fill', 'black')

			.text(function(d) { return d; });
			
		// append title/tooltip
		cell.selectAll('title').remove();
		
		cell.append('title')
			.text(function(d) { 
				return d.data[ly.mapping.level_1] + "  \n" + 
					d.data[ly.mapping.level_2] + "  \n" +
					d.data[ly.mapping.x_var] + "  \n" +

					format(d.value); })
		
		//helper functions
		function sumBySize(d) {
			return d[ly.mapping.y_var];
		}		
	}
	
	addCrosshairsX(ly){
		var transitionSpeed = this.options.transition.speed;
		
		var crosshairsX = this.chart
			.selectAll( '.tag-crosshairX-' + this.element.id + '-'  +ly.label.replace(/\s+/g, '')) 
			.data(ly.data);
		
		crosshairsX.exit()
		  .transition().remove();
			  
		crosshairsX
			.transition()
			.duration(transitionSpeed)
			.ease(d3.easeQuad)
			.attr('x1', d => this.xScale(d[ly.mapping.low_x]) )
			.attr('x2', d => this.xScale(d[ly.mapping.high_x]) )
			.attr('y1', d => this.yScale(d[ly.mapping.y_var]) )
			.attr('y2', d => this.yScale(d[ly.mapping.y_var]) );
			
		crosshairsX.enter()
			.append('line')
			.style('fill', 'none')
			.style('stroke', 'black')
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('opacity', 0.5)
			.attr('x1', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('x2', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('y1', d => this.yScale(d[ly.mapping.y_var]) )
			.attr('y2', d => this.yScale(d[ly.mapping.y_var]) )
			.attr("class", 'tag-crosshairX-' + this.element.id + '-' + ly.label.replace(/\s+/g, '')  )
			.transition()
			.delay(transitionSpeed)
			.duration(transitionSpeed)
			.ease(d3.easeQuad)
			.attr('x1', d => this.xScale(d[ly.mapping.low_x]) )
			.attr('x2', d => this.xScale(d[ly.mapping.high_x]) );
	}
	
	addCrosshairsY(ly){
		
		var transitionSpeed = this.options.transition.speed;
		
		var crosshairsY = this.chart
			.selectAll( '.tag-crosshairY-' + this.element.id + '-'  +ly.label.replace(/\s+/g, '')) 
			.data(ly.data);
		
		crosshairsY.exit()
		  .transition().remove();
			  
		crosshairsY
			.transition()
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr('x1', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('x2', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('y1', d => this.yScale(d[ly.mapping.low_y]) )
			.attr('y2', d => this.yScale(d[ly.mapping.high_y]) );
			
		crosshairsY.enter()
			.append('line')
			.style('fill', 'none')
			.style('stroke', 'black')
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style('opacity', 0.5)
			.attr('x1', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('x2', d => this.xScale(d[ly.mapping.x_var]) )
			.attr('y1', d => this.yScale(d[ly.mapping.y_var]) )
			.attr('y2', d => this.yScale(d[ly.mapping.y_var]) )
			.attr("class", 'tag-crosshairY-' + this.element.id + '-' + ly.label.replace(/\s+/g, '')  )
			.transition()
			.delay(transitionSpeed)
			.ease(d3.easeQuad)
			.duration(transitionSpeed)
			.attr('y1', d => this.yScale(d[ly.mapping.low_y]) )
			.attr('y2', d => this.yScale(d[ly.mapping.high_y]) );		
	}
	
	addDonut(ly){
		var that = this;
		var m = this.margin;
		
		var transitionSpeed = this.options.transition.speed;

		//define gauge variable
		var twoPi = 2 * Math.PI;
		var radius = Math.min(this.width - (m.right + m.left), this.height - (m.top + m.bottom))/2;
		var barWidth = 30 ;
		
		var pie = d3.pie()
			.sort(null)
			.value( d => d[ly.mapping.y_var] );
		
		var arc = d3.arc()
		  .innerRadius(radius * 0.8)
		  .outerRadius(radius * 0.4);
		  
		var outerArc  = d3.arc()
		  .innerRadius(radius * 0.9)
		  .outerRadius(radius * 0.9);
		  
		var data = ly.data;
		
		if(this.options.colorScheme[2] == "on"){
			
			this.colorDiscrete = d3.scaleOrdinal()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
			
			this.colorContinuous = d3.scaleLinear()
				.range( this.options.colorScheme[0] )
				.domain( this.options.colorScheme[1] );
		} else {
			var colorKey = ly.data.map( d => d[ly.mapping.x_var] );
			this.colorDiscrete = d3.scaleOrdinal()
				.range(ly.color)
				.domain(colorKey);
		}
		
		var key = function(d){ return d.data[ly.mapping.x_var]; };
		
		//data join
		var path = this.chart
			.selectAll('.donut')
			.data(pie(data));
		 
		path.exit().remove();
		
		var newPath = path.enter()
			.append('path')
			.attr('class', 'donut')
			.attr('fill', (d,i) => this.colorDiscrete(i) )
			.attr('d', arc)
			.each(function(d) { this._current = 0; });
			
		path.merge(newPath).transition()
			.duration(transitionSpeed)
			.ease(d3.easeQuad)
			.attr('fill', (d,i) => this.colorDiscrete(i) )
			.attrTween('d', arcTween)

		/* ------- TEXT LABELS -------*/

		var textLabel = this.chart.selectAll("text")
			.data(pie(data));

		var newText = textLabel.enter()
			.append("text")
			.attr('class', 'inner-text')
			.style('font-size', '12px')
			.style('opacity', 0)
			.attr("dy", ".35em")
			.text(d => d.data[ly.mapping.x_var] );
		
		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}

		textLabel.merge(newText).transition().duration(transitionSpeed).ease(d3.easeQuad)
			.text(d => d.data[ly.mapping.x_var] )
			.style('opacity', function(d){
				var wedgeSize =  Math.abs(d.endAngle - d.startAngle);
				if(wedgeSize > 0.3) {
					return 1;
					} else {
						return 0;
					}
			})
			.attrTween("transform", function(d) {
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate("+ pos +")";
				};
			})
			.styleTween("text-anchor", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start":"end";
				};
			});

		textLabel.exit()
			.remove();

		/* ------- SLICE TO TEXT POLYLINES -------*/

		var polyline = this.chart.selectAll("polyline")
			.data(pie(data));
		
		var newPolyline = polyline.enter()
			.append("polyline")
			.style('fill', 'none')
			.style('stroke-width', '1px')
			.style('opacity', 0)
			.style('stroke' , 'gray');

		polyline.merge(newPolyline).transition().duration(transitionSpeed).ease(d3.easeQuad)
			.style('opacity', function(d){
				var wedgeSize =  Math.abs(d.endAngle - d.startAngle);
				if(wedgeSize > 0.3) {
					return 1;
					} else {
						return 0;
					}
			})
			.attrTween("points", function(d){
				this._current = this._current || d;
				var interpolate = d3.interpolate(this._current, d);
				this._current = interpolate(0);
				return function(t) {
					var d2 = interpolate(t);
					var pos = outerArc.centroid(d2);
					pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
					return [arc.centroid(d2), outerArc.centroid(d2), pos];
				};			
			});
		
		polyline.exit()
			.remove();
			
		function arcTween(a) {
		  this._current = this._current || a;		
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) {
			return arc(i(t));
		  };
		}
	}
	
	addGauge(ly){
		var that = this;
		var m = this.margin;
		var transitionSpeed = this.options.transition.speed;
		
		//define gauge variable
		var tau = Math.PI;
		var radius = Math.max(Math.min(this.width, (this.totalWidth > 600 ? this.height: this.height * 0.8))/2, 30);
		var barWidth = 30 ;
		var value = ly.data[0].value[0]; 
		var data = [value, 1 - value];
			
		//define gauge functions
		var arc = d3.arc()
			.innerRadius(radius-barWidth)
			.outerRadius(radius)
			.cornerRadius(10);
			
		var pie = d3.pie()
			.sort(null)
			.value( d => d)
			.startAngle( tau * -0.5 )
			.endAngle( tau * 0.5);
		
		var percentFormat = d3.format(".1%")
		
		var pathBackground = this.chart
			.selectAll('.myIO-gauge-background')
			.data(pie([1]));
		
		pathBackground.exit().remove();
		
		var newPathBackground = pathBackground.enter()
			.append('path')
			.attr('class', 'myIO-gauge-background')
			.attr('fill', "gray" )
			.transition().duration(transitionSpeed).ease(d3.easeBack)
			.attr('d', arc)
			.each(function(d) { this._current = 0; });
		
		pathBackground.transition().duration(transitionSpeed).ease(d3.easeBack)
			.duration(transitionSpeed)
			.attr('fill', "gray" )
			.attrTween('d', arcTween);
		
		
		var path = this.chart
			.selectAll('.myIO-gauge-value')
			.data(pie(data));
		
		path.exit().remove();
		
		var newPath = path.enter()
			.append('path')
			.attr('class', 'myIO-gauge-value')
			.attr('fill', (d,i) => [ly.color, "transparent"][i] )
			.transition().duration(transitionSpeed).ease(d3.easeBack)
			.attr('d', arc)
			.each(function(d) { this._current = 0; });
		
		path.merge(newPath).transition().duration(transitionSpeed).ease(d3.easeBack)
			.duration(transitionSpeed)
			.attr('fill', (d,i) => [ly.color, "transparent"][i] )
			.attrTween('d', arcTween);
		
		function arcTween(a) {
		  this._current = this._current || a;		
		  var i = d3.interpolate(this._current, a);
		  this._current = i(0);
		  return function(t) {
			return arc(i(t));
		  };
		}
		
		this.chart.selectAll('.gauge-text').remove();
		
		var label = this.chart
			.append('g')
			.append('text')
			.attr('class', 'inner-text')
			.text(percentFormat(data[0]))
			.attr('class', 'gauge-text')
			.attr('text-anchor', 'middle')
			.attr('font-size', 20)
			.attr('dy', '-0.45em');
		
	}
	
	dragPoints(ly){
		const that = this;
		
		var color = this.options.colorScheme[2] == "on" ? this.colorScheme(ly.data[ly.mapping.group]) : ly.color; 
	
		var drag = d3.drag()
			.on('start', dragStart)
			.on('drag', dragging)
			.on('end', dragEnd);
		
		this.chart
			.selectAll('.tag-point-' + that.element.id + '-'  +ly.label.replace(/\s+/g, ''))
			.call(drag);
		
		
		function dragStart(d) {
			d3.select(this).raise().classed('active', true);
		}
		
		function dragging(d) {
			d[0] = that.xScale.invert(d3.event.x);
			d[1] = that.yScale.invert(d3.event.y);
			
			d3.select(this)
				.attr('cx', that.xScale(d[0]))
				.attr('cy', that.yScale(d[1]));
		}
		
		function dragEnd(d){
			d3.select(this).classed('active', false);

			that.updateRegression(color, ly.label);
			
			if(HTMLWidgets.shinyMode) {
				const x = points.map(function(d){return d['x_var']; });
				const y = points.map(function(d){return d['y_var']; });
				const est = points.map(function(d){return d['y_est']; });
			
				Shiny.onInputChange('myIOpointsX-'  + label.replace(/\s+/g, ''), x);
				Shiny.onInputChange('myIOpointsY-'  + label.replace(/\s+/g, ''), y);
				Shiny.onInputChange('myIOpointsEst-'  + label.replace(/\s+/g, ''), est);
			}
			
		}

	}
	
	updateRegression(color, label){		
		var that = this;
		var transitionSpeed = this.options.transition.speed / 2;
		
		//define line function
		var valueLine = d3.line()
			.x(d => this.xScale(d.x_var) )
			.y(d => this.yScale(d.y_est));
		
		var points = [];
		
		this.chart
			.selectAll('.tag-point-' + this.element.id + '-'  + label.replace(/\s+/g, ''))
			.each(function(){
				var x = that.xScale.invert(this.getAttribute('cx'));
				var y = that.yScale.invert(this.getAttribute('cy'));	
				var point = {
					x_var:x,
					y_var:y
				}
				points.push(point)
			});
			
		//regress points
		var regression = linearRegression(points, "y_var", "x_var");
		
		if(HTMLWidgets.shinyMode) {
			Shiny.onInputChange('myIOregression-'  + label.replace(/\s+/g, ''), regression);
		}
		
		points.forEach(function(d){
		 d.y_est = regression.fn(d.x_var);
		});
		
		var finalPoints = points
			.sort(function(a,b){ return a.x_var - b.x_var; })
			.filter(function(d, i){
				return i === 0 || i === (points.length - 1);
			});
		
		//data join regressed points
		var linePath = this.chart
			.selectAll( '.tag-regression-line-' + this.element.id + '-'  + label.replace(/\s+/g, '') )
			.data([finalPoints]);
		
		//EXIT old elements not present in new data
		linePath.exit()
		  .transition()
		  .duration(transitionSpeed)
			.style('opacity', 0)
			.remove();
		
		//ENTER new elements present in new data
		var newLinePath = linePath
		  .enter().append("path")
			.attr("class", 'tag-regression-line-'+ this.element.id + '-'  + label.replace(/\s+/g, '') )
			.attr('clip-path', 'url(#' + this.element.id + 'clip'+ ')')
			.style("fill", "none")
			.style('stroke', color )
			.style("stroke-width", 3)
			.style('opacity', 0)
			;
			
		//UPDATE old elements present in new data
		linePath.merge(newLinePath)	
		  .transition()
		  .ease(d3.easeQuad)
		  .duration(transitionSpeed)
			.style('opacity', 1)
			.style('stroke', color )
			.attr("d", valueLine);
			
		function linearRegression(data,y_var,x_var){
			
			const x = data.map(function(d) { return d[x_var]; });
			const y = data.map(function(d) { return d[y_var]; });
			
			const lr = {};
			const n = y.length;
			let sum_x = 0;
			let sum_y = 0;
			let sum_xy = 0;
			let sum_xx = 0;
			let sum_yy = 0;
			
			for (var i = 0; i < y.length; i++) {
				
				sum_x += x[i];
				sum_y += y[i];
				sum_xy += (x[i]*y[i]);
				sum_xx += (x[i]*x[i]);
				sum_yy += (y[i]*y[i]);
			} 
			
			lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
			lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
			lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
			lr['fn'] = function (x) { return this.slope * x + this.intercept; };
			return lr;
		}
	}
	
	updateReferenceLines(){
		var that = this;
		var m =  this.margin;
		
		var transitionSpeed = this.options.transition.speed;
		
		var xRef = [this.options.referenceLine.x];
		var yRef = [this.options.referenceLine.y];
		
		if(this.options.referenceLine.x) {
			var xRefLine = this.plot
				.selectAll('.ref-x-line')
				.data(xRef);
			
			xRefLine.exit() 
				.transition().duration(100)
				.style('opacity', 0)
				.attr('y2', this.height - (m.top + m.bottom))
				.remove();
			
			var newxRef =xRefLine.enter().append('line')
				.attr('class', 'ref-x-line')
				.attr('fill', 'none')
				.style('stroke', 'gray')
				.style('stroke-width', 3)
				//.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
				.attr('x1', d => this.xScale(d) )
				.attr('x2', d => this.xScale(d) )
				.attr('y1', this.height - (m.top + m.bottom))
				.attr('y2', this.height - (m.top + m.bottom ))
				.transition()
				.ease(d3.easeQuad)
				.duration(transitionSpeed)
				.attr('y2', 0);
			
			xRefLine
				.transition()
				.ease(d3.easeQuad)
				.duration(transitionSpeed)
				.attr('x1', d => this.xScale(d) )
				.attr('x2', d => this.xScale(d) )
				.attr('y1', this.height - (m.top + m.bottom))
				.attr('y2', 0);
				
		}
		
		if(this.options.referenceLine.y) {
			var yRefLine = this.plot
				.selectAll('.ref-y-line')
				.data(yRef);
				
			yRefLine.exit()
				.transition().duration(100)
				.attr('y2', this.width - (m.left + m.right))
				.style('opacity', 0)
				.remove();
				
			var newyRef = yRefLine.enter().append('line')
				.attr('class', 'ref-y-line')
				.attr('fill', 'none')
				.style('stroke', 'gray')
				.style('stroke-width', 3)
				//.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
				.attr('x1', 0)
				.attr('x2', 0)
				.attr('y1',d => this.yScale(d) )
				.attr('y2',  d => this.yScale(d) )
				.transition()
				.ease(d3.easeQuad)
				.duration(transitionSpeed)
				.attr('x2', this.width - (m.left + m.right));
				
			yRefLine.merge(newyRef)
				.transition()
				.ease(d3.easeQuad)
				.duration(transitionSpeed)
				.attr('x1', 0)
				.attr('x2', this.width - (m.left + m.right))
				.attr('y1', d => this.yScale(d) )
				.attr('y2',  d => this.yScale(d) );
		}
	}
	
	updateLegend(){
		var that = this;
		var m = this.margin;
		
		d3.select(this.element).select('.legend-box').remove();
		d3.select(this.element).selectAll('.legendElements').remove();
		
		var svg = this.legendArea;
		
		var labelIndex = this.plotLayers.map( function(d) { return d.label; } );
		var currentLayerIndex = this.currentLayers.map( function(d) { return d.label; } );
		var hiddenLayers = labelIndex.filter(d => currentLayerIndex.indexOf(d) < 0);
		
		var itemWidth = this.totalWidth > 600 ? 140 : 125;
		var itemHeight = this.totalWidth > 600 ? 25 : 22;
		var n = this.totalWidth > 600 ? 1 : Math.floor(this.totalWidth/itemWidth);
		
		//create legend	box (exists in the background)
		var legendBox = svg.append('rect')
			.attr('class', 'legend-box')
			.attr("transform", function(d) { return "translate(5," + (this.totalWidth > 600 ? m.top : 0) + ")";})
			.style( 'width', this.totalWidth > 600 ? this.height : this.height * 0.2 )
			.style( 'width', this.totalWidth > 600 ? this.totalWidth - this.width : this.totalWidth - this.margin.left )
			.style('fill', 'white')
			.style('opacity', 0.75);
			
		this.plotLayers.forEach(function(d,i){

			var legendElement = svg.append('g')
				.attr('class', 'legendElements')
				.selectAll('.legendElement')
				.data([d.label])
				.enter()
				.append('g')
				.attr('class', 'legendElement')
				.attr("transform", () => "translate(" + i%n * itemWidth + "," + Math.floor(i/n) * itemHeight + ")" )
				.attr("text-anchor", "start")
				.attr('font-size', that.totalWidth > 600 ? 12 : 10)
				.style("opacity", currentLayerIndex.indexOf(d.label) > -1 ? 1: 0.5 )
				//.style("fill-opacity", currentLayerIndex.indexOf(d.label) > -1 ? 1: 0 )
				.on('click', toggleLine);
			
			switch (d.type){
				case "line":
					legendElement.append("rect")
						.attr("x", 5)
						.attr('y', 5)
						.attr("width", 12)
						.attr("height", 12)
						.attr("fill", d.color )
						//.attr("fill-opacity", currentLayerIndex.indexOf(d.label) > -1 ? 1: 0.1 )
						.attr("stroke", d.color);
					break;
				case "point":
					legendElement.append("circle")
						.attr("cx", 5)
						.attr('cy', 6)
						.attr('r', 5)
						.attr("fill", d.color)
						//.attr("fill-opacity", currentLayerIndex.indexOf(d.label) > -1 ? 1: 0.1 )
						.attr("stroke", d.color);
					break;
				
				default:
					legendElement.append("rect")
					.attr("x", 5)
					.attr("width", 12)
					.attr("height", 12)
					.attr("fill", d.color)
					//.attr("fill-opacity", currentLayerIndex.indexOf(d.label) > -1 ? 1: 0.1 )
					.attr("stroke", d.color);
			}
			
			legendElement.append("text")
				.attr("x", 20)
				.attr("y", 10.5)
				.attr("dy", "0.35em")
				.text( d => d );
				
			})
		
		var filteredElements = hiddenLayers ? hiddenLayers : [];
			
		function toggleLine(){
			var selectedData = d3.select(this).data();
			
			//toggle elements in and out of filteredElements
			if ( !filteredElements.includes(selectedData[0]) ){
				
				filteredElements.push(selectedData[0]);
				
				d3.select(this)
					.style('opacity', 0.5);
				/*	
				d3.select(this).select('rect')
					.attr('fill-opacity', 0.1);
					
				d3.select(this).select('circle')
					.attr('fill-opacity', 0.1);
				*/	
			} else if ( filteredElements.includes(selectedData[0]) ){
				
				filteredElements = filteredElements.filter(function(d){
					return d != selectedData[0];
				});
				d3.select(this).style('opacity', 1);
				/*
				d3.select(this).select('rect')
					.attr('fill-opacity', 1);
				
				d3.select(this).select('circle')
					.attr('fill-opacity', 1);
				*/
			} else if(filteredElements.length < 1) {
				
				filteredElements.push(selectedData[0]);
				
				d3.select(this)
					.style('opacity', 0.5);
				/*	
				d3.select(this).select('rect')
					.attr('fill-opacity', 0.1);
					
				d3.select(this).select('circle')
					.attr('fill-opacity', 0.1);	
				*/
				
			}
			
			var filteredLayers = that.plotLayers.filter(function(d){
				return filteredElements.indexOf(d.label) === -1;
			});
			
			var removedLayers = that.plotLayers
				.filter(function(d){
					return filteredElements.indexOf(d.label) > -1;
				})
				.map(function(d) { return d.label; });;
			
			that.currentLayers = filteredLayers;
			that.processScales(that.currentLayers);
			that.removeLayers(removedLayers);
			that.routeLayers(that.currentLayers);
			if(that.currentLayers[0].type != "groupedBar") that.updateAxes();
			that.updateRollover(that.currentLayers);
			//that.addButtons();
		
		}
	}
	
	updateOrdinalColorLegend(ly){
		var that = this;
		var m = this.margin;
		
		d3.select(this.element).select('.legend-box').remove();
		d3.select(this.element).selectAll('.legendElements').remove();
		
		var svg = this.legendArea;
		
		var itemWidth = this.totalWidth > 600 ? 140 : 125;
		var itemHeight = this.totalWidth > 600 ? 25 : 22;
		var n = this.totalWidth > 600 ? 1 : Math.floor(this.totalWidth/itemWidth);
		
		//create legend	box (exists in the background)
		var legendBox = svg.append('rect')
			.attr('class', 'legend-box')
			.attr("transform", function(d) { return "translate(5," + (this.totalWidth > 600 ? m.top : 0) + ")";})
			.style( 'width', this.totalWidth > 600 ? this.height : this.height * 0.2 )
			.style( 'width', this.totalWidth > 600 ? this.totalWidth - this.width : this.totalWidth - this.margin.left )
			.style('fill', 'white')
			.style('opacity', 0.75);
		
		switch (ly.type) {
			case "treemap":
				var colorKey = ly.data.children.map( d => d.name );	
				break;
			case "donut":
				var colorKey = ly.data.map( d => d[ly.mapping.x_var] );
				console.log(colorKey);
				break;
			
			default:
		}
		
		
		colorKey.forEach(function(d,i){
			
			var legendElement = svg.append('g')
				.attr('class', 'legendElements')
				.selectAll('.legendElement')
				.data(d)
				.enter()
				.append('g')
				.attr('class', 'legendElement')
				.attr("transform", () => "translate(" + i%n * itemWidth + "," + Math.floor(i/n) * itemHeight + ")" )
				.attr("text-anchor", "start")
				.attr('font-size', that.totalWidth > 600 ? 12 : 10);
			
			legendElement.append("rect")
				.attr("x", 5)
				.attr("width", 12)
				.attr("height", 12)
				.attr("fill", ly.type == "treemap" ? that.colorDiscrete("treemap."+ d) : that.colorDiscrete(d[0]) )
				.attr("stroke", ly.type == "treemap" ? that.colorDiscrete("treemap."+ d) : that.colorDiscrete(d[0]) );
						
			legendElement.append("text")
				.attr("x", 20)
				.attr("y", 10.5)
				.attr("dy", "0.35em")
				.text( d );
				
			})
	}
	
	updateContinuousColorLegend(){
		var that = this;
		var m = this.margin;
		
		d3.select(this.element).select('.legend-box').remove();
		d3.select(this.element).selectAll('.legendElements').remove();
		d3.select(this.element).select('#linear-gradient').remove();
		
		var svg = this.legendArea;
		var defs = this.chart.select('defs')
		var colorContinuous = this.colorContinuous;
		console.log(colorContinuous.domain());
		//create legend	box (exists in the background)
		var legendBox = svg.append('rect')
			.attr('class', 'legend-box')
			.attr("transform", function(d) { return "translate(5," + (this.totalWidth > 600 ? m.top : 0) + ")";})
			.style( 'width', this.totalWidth > 600 ? this.height : this.height * 0.2 )
			.style( 'width', this.totalWidth > 600 ? this.totalWidth - this.width : this.totalWidth - this.margin.left )
			.style('fill', 'white')
			.style('opacity', 0.75);
		
		var whichWay = this.totalWidth > 600 ? "up" : "over" ;
		switch (whichWay){
			case "up":
				buildVerticalLegend();
			break;
			
			case "over":
				buildHorizontalLegend();
			break;
		}
		
		function buildVerticalLegend(){
			//create gradient
			const linearGradient = defs.append("linearGradient")
				.attr("id", "linear-gradient")
				.attr('x1', '0%') // bottom
				.attr('y1', '100%')
				.attr('x2', '0%') // to top
				.attr('y2', '0%')
				.attr('spreadMethod', 'pad');
	  
			linearGradient.selectAll("stop")
				.data(colorContinuous.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorContinuous(t) })))
				.enter().append("stop")
				.attr("offset", d => d.offset)
				.attr("stop-color", d => d.color);
			
			//append rect for legend element
			svg.append('g')
				.attr('class', 'legendElements')
				.attr("transform", `translate(10, 15)`)
				.append("rect")
				.attr('transform', `translate(0, 0)`)
				.attr("width", 20)
				.attr("height", that.height - m.top - 10)
				.style("fill", "url(#linear-gradient)");
			///call axis on the legend
			var legendScale = d3.scaleLinear()
				.range([ that.height - m.top - m.bottom, 0 ])
				.domain([ colorContinuous.domain()[0], colorContinuous.domain()[1] ]);
			
			var legendAxis = d3.axisRight()
				.scale(legendScale)
				.ticks(5);
				
			svg.append("g")
			  .attr("class", "legendElements legendAxis")
			  .attr("transform", "translate(30, 15)")
			  .call(legendAxis)
			  .selectAll("text")
				.attr("class", "legend-label");
			  
			svg.selectAll('.domain')
				.attr('class', 'legend-line');
			
		}
		
		function buildHorizontalLegend(){
			//create gradient
			const linearGradient = defs.append("linearGradient")
				.attr("id", "linear-gradient");
	  
			linearGradient.selectAll("stop")
				.data(colorContinuous.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colorContinuous(t) })))
				.enter().append("stop")
				.attr("offset", d => d.offset)
				.attr("stop-color", d => d.color);
			
			//append rect for legend element
			svg.append('g')
				.attr('class', 'legendElements legendBox')
				.attr("transform", `translate(0, 20)`)
				.append("rect")
				.attr('transform', `translate(10, 0)`)
				.attr("width", that.width - m.right - m.left)
				.attr("height", 20)
				.style("fill", "url(#linear-gradient)");
			
			//call axis on the legend
			var legendScale = d3.scaleLinear()
				.range([ 0, that.width - m.right - m.left])
				.domain([ colorContinuous.domain()[0], colorContinuous.domain()[1] ]);
			
			var legendAxis = d3.axisBottom()
				.scale(legendScale)
				.ticks(5);
				
			svg.append("g")
			  .attr("class", "legendElements legendAxis")
			  .attr("transform", "translate(10, 40)")
			  .call(legendAxis)
			  .selectAll("text")
				.attr("class", "legend-label");
			  
			svg.selectAll('.domain')
				.attr('class', 'legend-line');
		}
		
	}
	
	updateRollover(lys){
		var that = this;
		var m = this.margin;
		var horizontalBreakPoint = this.width * 0.8;
		var verticalBreakPoint = this.height * 0.5;
		
		var exclusions = ["text", "yearMon"];
	
		var xFormat = !(exclusions.indexOf(this.options.xAxisFormat) in exclusions) ? d3.format(this.options.xAxisFormat ? this.options.xAxisFormat : "d") : function(x) {return x;} ;	
		
		var yFormat = d3.format(this.options.yAxisFormat ? this.options.yAxisFormat : "d");
		var currentFormatY = this.newScaleY ? d3.format(this.newScaleY) : yFormat;
		
		var toolTipFormat = !(exclusions.indexOf(this.options.xAxisFormat) in exclusions) ?  d3.format(this.options.toolTipFormat ? this.options.toolTipFormat : "d"): function(x) {return x;} ;
	
		switch (lys[0].type){
			case "bar":
				this.chart.selectAll('rect')
					.on("mouseout", hoverTipHide)
					.on("mouseover", hoverTip)
					.on("mousemove", hoverTip);				
				break;
			case "groupedBar":
				this.chart.selectAll('rect')
					.on("mouseout", hoverGroupedBarHide)
					.on("mouseover", hoverGroupedBar)
					.on("mousemove", hoverGroupedBar);
				break;
			case "histogram":
				this.chart.selectAll('rect')
					.on("mouseout", hoverHistogramHide)
					.on("mouseover", hoverHistogram)
					.on("mousemove", hoverHistogram);
				break;
			case "point":
				this.chart.selectAll('circle')
					.on("mouseout", hoverTipHide)
					.on("mouseover", hoverTip)
					.on("mousemove", hoverTip);				
				break;
			
			case "hexbin":
				this.chart.selectAll('path')
					.on("mouseout", hoverHexHide)
					.on("mouseover", hoverHex)
					.on("mousemove", hoverHex);
				break;
				
			case "line":
				d3.select(this.element).select('.toolTipBox').remove();
				d3.select(this.element).select('.toolLine').remove();
				this.toolLine =  this.chart.append('line').attr('class', 'toolLine');
				this.toolTipBox = this.svg.append("rect")
					.attr('class', 'toolTipBox')
					.attr("opacity", 0)
					.attr("width", this.width - (this.margin.left + this.margin.right))
					.attr("height", this.height - ( this.margin.top + this.margin.bottom))
					.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
					.on("mouseover", function() { 
						that.tooltip.style("display", null); 
						that.toolLine.style("stroke", null); 
						})
					.on("mouseout", function() { 
						that.tooltip.style("display", "none"); 
						that.toolLine.style("stroke", "none"); 
						})
					.on("mousemove", scalePointPosition);
		}
		
		function hoverTip(event){
			
			var data = d3.select(this).data()[0];
			
			//TODO: this function isn't working well for charts where the label isn't in the data
			var thisLayer = lys.filter(function(d){
				var keepLayer = Object.values(data).filter(function(e){
					return e == d.label;
				});
				return keepLayer == d.label;
			});

			var xData = xFormat( data[thisLayer[0].mapping.x_var] );
			var yData = yFormat( data[thisLayer[0].mapping.y_var] );
			var groupData = thisLayer[0].label;
			var color = that.options.colorScheme[2] == "on" ? that.colorScheme(groupData) : thisLayer[0].color ;
			
			if(HTMLWidgets.shinyMode){
				
				//var data = tipText.map( d => d.values);

				Shiny.onInputChange('myIO-' + that.element.id + '-rollover', JSON.stringify(data));
			}
			
			d3.select(this).style('stroke-width', '4px').style('stroke', color);
			
			that.tooltip.transition();
			
			that.tooltip
              .style("left", (d3.pointer(event, this)[0] > horizontalBreakPoint ? horizontalBreakPoint : d3.pointer(event, this)[0]) + 'px')
			  .style("top", ( d3.pointer(event, this)[1] > verticalBreakPoint ? verticalBreakPoint - 70 : Math.max(d3.pointer(event, this)[1] - 70, 0) ) + 'px')
			  .style('opacity', 1)
              .style("display", "inline-block");
			
			that.toolTipTitle
				.html('<span>' + thisLayer[0].mapping.x_var + ': ' + xData + '</span>'); 
			
			that.toolTipBody
				.html('<div class="dot" style="background-color:'+ color + ';"></div>' +
					'<span><strong>' + thisLayer[0].mapping.y_var + '</strong> ' + yData + '</span>'
				);
		}
		
		function hoverTipHide(){
			d3.select(this).transition().duration(800).style('stroke-width', '0px').style('stroke', 'transparent');
			that.tooltip.transition().delay(800).style("display", "none");
		}
		
		function scalePointPosition(event) {
			
			var tipText = [];
			var mouse = d3.pointer(event, this);
			
			var indexExtent = d3.max(lys.map(d => d.data.length));
			
			var xPos =  that.xScale.invert(mouse[0]);
				
			var bisect = d3.bisector(d => +d[0]).left;
			
			//line tool tip text
			lys.forEach(function(d,i) {	
				var key = d.label;
				var color = d.color;
				var values = d.data;
				var x_var = d.mapping.x_var;
				
				var layerIndex =  values.map( d => d[x_var] );
				
				var layerIndexLength = values.length;
				
				//if(layerIndexLength < indexExtent) layerIndex.push([indexExtent]);
							
				var currentY = that.newY ? that.newY : d.mapping.y_var;
				var y_var = currentY;
				
				var toolTip_var = d.mapping.toolTip;
				
				var idx = bisect(layerIndex, xPos);
				
				var d0 = values[idx - 1];
				var d1 = values[idx];
				
				// this nested if/then handles situations where layers have uneven sizes
				// it only allows for max values at this point
				// TODO: (potential first issue for someone) programmtically handle uneven layer x axis lengths
				if(d0 == undefined | d1 == undefined){
					if(layerIndexLength < indexExtent ){
						if( xPos < (d3.max(layerIndex, d => +d) + 0.5)) {
							var v = d0;
						} else {
							return ;
						}						
					} else {
						return ;
					}
				} else {
					var v = xPos - d0[x_var] > d1[x_var] - xPos ? d1 : d0;
				}
									
				var finalObject = {
					color: color,
					label: key,
					x_var: x_var,
					y_var: y_var,
					toolTip_var: toolTip_var,
					values: v
				}
				tipText.push(finalObject);
			});
			
			if(HTMLWidgets.shinyMode){
				
				var data = tipText.map( d => d.values);

				Shiny.onInputChange('myIO-' + that.element.id + '-rollover', JSON.stringify(data));
			}
			
			if(tipText[0] != undefined){
				that.toolLine
				.style('stroke', 'black')
				.style('stroke-dasharray', '1,1')
				.attr('x1', that.xScale(tipText[0].values[tipText[0].x_var]))
				.attr('x2', that.xScale(tipText[0].values[tipText[0].x_var]))
				.attr('y1',0)
				.attr('y2', that.height - (that.margin.top +that.margin.bottom));
			
			that.tooltip
				.style('display', 'inline-block')
				.style('opacity', 1)
				.style("left", (d3.pointer(event, this)[0] > horizontalBreakPoint ? horizontalBreakPoint : (that.xScale(tipText[0].values[tipText[0].x_var])) )+ 'px')
				.style("top", ( d3.pointer(event, this)[1] > verticalBreakPoint ? verticalBreakPoint - 70 : Math.max(d3.mouse(event, this)[1] - 70, 0) ) + 'px')
				
			that.toolTipTitle
				.html('<span>' + tipText[0].x_var + ': ' + xFormat(tipText[0].values[tipText[0].x_var]) + '</span>'); 
			
			that.toolTipBody
				.html(function() {
					var y_text = []
					tipText.forEach(function(d){
						y_text.push('<div class="dot" style="background-color:' + d.color + ';"></div><span><strong>' + d.label + '</strong>: ' + currentFormatY(d.values[d.y_var]) + '</span><br>' );
						});
					return y_text.join(' ')
				});
			}
			
		}
		
		function hoverHex(){
			var data = d3.select(this).data()[0];
			var color = d3.select(this).attr('fill')
			var xPoint = data['x'] ;
			var yPoint = data['y'] ;
			var pointFormat = d3.format(',.2f')
			
			if(HTMLWidgets.shinyMode){

				Shiny.onInputChange('myIO-' + that.element.id + '-rollover', JSON.stringify(data));
			}
			
			that.tooltip.transition();
			
			that.tooltip
              .style("left", ( xPoint > horizontalBreakPoint ? horizontalBreakPoint : xPoint ) + 'px')
			  .style("top", ( yPoint > verticalBreakPoint ? verticalBreakPoint - 70 : Math.max(yPoint - 70, 0) ) + 'px')
			  .style('opacity', 1)
              .style("display", "inline-block");
			
			that.toolTipTitle
				.html('<span>x: ' + pointFormat(that.xScale.invert(xPoint))  + ', y: ' + pointFormat(that.yScale.invert(yPoint)) + '</span>'); 
			
			that.toolTipBody
				.html('<div class="dot" style="background-color:'+ color + ';"></div>' +
					'<span><strong>Count: </strong> ' + data.length + '</span>'
				);
		}		
		
		function hoverHexHide(){
			that.tooltip.transition().delay(800).style("display", "none");
		}
		
		function hoverGroupedBar(event){
			const selection = d3.select(this);
			const data = selection.data()[0];
			
			var thisLayer = lys[data.idx];
			
			console.log(data)

			var xData = xFormat( data.data[0] );
			var yData = currentFormatY( data[1] - data[0] );
			var groupData = thisLayer.label;
			var color = that.options.colorScheme[2] == "on" ? that.colorScheme(groupData) : thisLayer.color ;
			
			if(HTMLWidgets.shinyMode){
			
				Shiny.onInputChange('myIO-' + that.element.id + '-rollover', JSON.stringify(data.data.values));
			}
			
			d3.select(this).style('opacity', 0.8);
			
			that.tooltip.transition();
			
			that.tooltip
              .style("left", (d3.pointer(event, this)[0] > horizontalBreakPoint ? horizontalBreakPoint : d3.pointer(event, this)[0]) + 'px')
			  .style("top", ( d3.pointer(event, this)[1] > verticalBreakPoint ? verticalBreakPoint - 70 : Math.max(d3.pointer(event, this)[1] - 70, 0) ) + 'px')
			  .style('opacity', 1)
              .style("display", "inline-block");
			
			that.toolTipTitle
				.html('<span>' + thisLayer.mapping.x_var + ': ' + xData + '</span>'); 
			
			that.toolTipBody
				.html('<div class="dot" style="background-color:'+ color + ';"></div>' +
					'<span><strong>' + thisLayer.mapping.y_var + '</strong> ' + yData + '</span>'
				);
		}
		
		function hoverGroupedBarHide(){
			d3.select(this).style('opacity', null);
			that.tooltip.transition().delay(800).style("display", "none");
		}
		
		function hoverHistogram(){
			var data = d3.select(this).data()[0];
			var color = d3.select(this).attr('fill')
			console.log(data);
			var xPoint = data['x0'] ;
			var yPoint = data.length ;
			var pointFormat = d3.format(',.2f')
			
			if(HTMLWidgets.shinyMode){

				Shiny.onInputChange('myIO-' + that.element.id + '-rollover', JSON.stringify(data));
			}
			
			that.tooltip.transition();
			
			that.tooltip
				.transition()
				.duration(100)
              .style("left", ( that.xScale(xPoint) > horizontalBreakPoint ? horizontalBreakPoint : that.xScale(xPoint) ) + 'px')
			  .style("top", ( that.yScale(yPoint) > verticalBreakPoint ? verticalBreakPoint - 70 : Math.max(that.yScale(yPoint) - 70, 0) ) + 'px')
			  .style('opacity', 1)
              .style("display", "inline-block");
			
			that.toolTipTitle
				.html('<span>Bin: ' + data['x0'] + ' to ' + data['x1'] + '</span>'); 
			
			that.toolTipBody
				.html('<div class="dot" style="background-color:'+ color + ';"></div>' +
					'<span><strong>Count: </strong> ' + data.length + '</span>'
				);
		}
		
		function hoverHistogramHide(){
			that.tooltip.transition().delay(500).style("display", "none");
		}
	}
	
	updateChart(x) {
		var that = this;
		var m = this.margin;
		this.options = x.options;
		
		this.plotLayers = x.layers;
		this.currentLayers = this.plotLayers;
		var newLayers = x.layers.map( d => d.label );
		var oldLayers = [];
		this.layerIndex.forEach(function(d){
				var x = newLayers.indexOf(d);
				if(x < 0) {
					oldLayers.push(d);
					}
			});
			
		if(this.plotLayers[0].type != "treemap"& this.plotLayers[0].type != "gauge" & this.plotLayers[0].type != "donut"){
			this.processScales(this.currentLayers);
			this.updateAxes();
		}	
		
		this.routeLayers(this.currentLayers);
		this.updateRollover(this.currentLayers);

		this.removeLayers(oldLayers);
		
		if(this.options.suppressLegend == false){
			if(this.legendArea.selectAll('.legendElement').data().length > 0 & this.plotLayers[0].type != "treemap" & this.plotLayers[0].type != "gauge" & this.plotLayers[0].type != "donut"){
			 this.updateLegend();
		} 
			if(this.legendArea.selectAll('.legendElement').data().length > 0 & this.plotLayers[0].type == "treemap" || this.plotLayers[0].type == "donut"){
				this.updateOrdinalColorLegend(this.plotLayers[0]);
			}	
		}
		
	}
	
	resize(width, height){
		
		this.totalWidth = Math.max(width, 280);
		this.width = this.totalWidth > 600 & this.options.suppressLegend == false ? this.totalWidth * 0.8 : this.totalWidth;
		this.height = height;
		
		this.svg
			.attr('width', width)
			.attr('height', height);
		
		var buttons2Use = d3.select(this.element).select(".buttonDiv").selectAll('.button').data(); 
		
		d3.select(this.element).select(".buttonDiv")  
			.style("left", ( this.width - ( 40 + ( 40*buttons2Use.length ) ) ) + 'px')
			.style("top", '0px');	
		
		switch ( this.plotLayers[0].type ) {

			case "gauge":
				this.plot
					.attr('transform','translate('+this.width/2+','+(this.totalWidth > 600 ? this.height * 0.8 : this.height * 0.6)+')')
					.attr('class', 'myIO-chart-offset');
				
				break;
			
			case "donut":
				this.plot
					.attr('transform','translate('+this.width/2+','+(this.totalWidth > 600 ? this.height: this.height * 0.8)/2+')')
					.attr('class', 'myIO-chart-offset');

				break;
			
			default:
				this.plot 
					.attr('transform','translate('+this.margin.left+','+this.margin.top+')')
					.style('width', this.width - (this.margin.left + this.margin.right) );
				
				if(this.options.suppressLegend == false){
					var chartHeight = this.totalWidth > 600 ? this.height : this.height * 0.8 ;
				} else {
					var chartHeight = this.height ;
				}
				
				this.clipPath
					.attr('x', 0)
					.attr('y', 0)
					.attr('width', this.width - (this.margin.left + this.margin.right))
					.attr('height', chartHeight - (this.margin.top + this.margin.bottom));
		
		}
		
		
		if(this.options.suppressLegend == false) {
			this.legendTranslate = this.totalWidth > 600 ? 'translate(' + (this.width) + ',0)' : 'translate(' + this.margin.left + ',' + ( this.height*0.8 ) +')';
		
			this.legendArea 
				.attr('transform', this.legendTranslate )
				.style( 'height', this.totalWidth > 600 ? this.height : this.height * 0.2 )
				.style( 'width', this.totalWidth > 600 ? this.totalWidth - this.width : this.totalWidth - this.margin.left );
		}	
		
		
		if(this.plotLayers[0].type != "treemap"& this.plotLayers[0].type != "gauge" & this.plotLayers[0].type != "donut"){
			this.processScales(this.currentLayers);
			this.updateAxes();
		}	
		
		this.routeLayers(this.currentLayers);
		if(this.options.suppressLegend == false) {
			if(this.legendArea.selectAll('.legendElement').data().length > 0 & this.plotLayers[0].type != "treemap" & this.plotLayers[0].type != "gauge" & this.plotLayers[0].type != "donut" & this.plotLayers[0].type != "hexbin"){
				this.updateLegend();
				this.updateRollover(this.currentLayers);
			} 
			
			if(this.legendArea.selectAll('.legendElement').data().length > 0 & this.plotLayers[0].type == "treemap" || this.plotLayers[0].type == "donut"){
			this.updateOrdinalColorLegend(this.plotLayers[0]);
			} 
		} else{
			this.updateRollover(this.currentLayers);
		}
		
		if(this.plotLayers[0].type == "hexbin"){
			this.updateContinuousColorLegend();
			this.updateRollover(this.currentLayers);
		}
		
	}
}

function transitionGrouped(that, data, colors, bandwidth){
	console.log("transition grouped hit");
	var m = that.margin;
	var transitionSpeed = that.options.transition.speed;
	
	if(that.options.suppressLegend == false){
			var chartHeight = that.totalWidth > 600 ? that.height : that.height * 0.8 ;
		} else {
			var chartHeight = that.height ;
		}
	
	var yFormat = d3.format(that.options.yAxisFormat);
	
	var currentFormatY = that.newScaleY ? that.newScaleY : yFormat;
	
	that.svg.selectAll('.y-axis')
		.transition().ease(d3.easeQuad)
		.duration(transitionSpeed)
		.call(d3.axisLeft(that.yScale)
			.ticks(chartHeight < 450 ? 5 : 10, currentFormatY)
			.tickSize( -(that.width-(m.right+m.left)) )
			)				
		.selectAll("text")
			.attr("dx", "-.25em");
	
	that.plot.selectAll('.y-axis').selectAll('.domain')
		.attr('class', 'y-axis-line');
		
	that.plot.selectAll('.y-axis').selectAll('.tick line')
		.attr('class', 'y-grid');
		
	that.plot.selectAll('.y-axis').selectAll('text')
		.attr('class', 'y-label');
	
	const barsNew = d3.select(that.element).selectAll('.tag-grouped-bar-g')
		.selectAll( 'rect' )
		.data( function(d){ return d; } );
	
	barsNew
		.exit()
		.transition()
		.duration(transitionSpeed)
		.attr('height', 0)
		.attr('y', 0)
		.remove();
		
	barsNew.enter()
		.append('rect')
		.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
		.attr('x', (d) => that.xScale(+d.data[0]) + (bandwidth * d.idx)  )
		.attr('y', that.yScale(0))
		.attr('height', 0)
		.attr('width', bandwidth )
		.transition()
		.duration(transitionSpeed)
		.delay( d => d.idx *20 )
		.attr('y', d => that.yScale( d[1] - d[0] ) )
		.attr('height', d => that.yScale(0) - that.yScale( d[1] - d[0] ) );			

	barsNew.merge(barsNew)
		.transition()
		.duration(transitionSpeed)
		.delay( d => d.idx *20 )
		.attr('x', function(d) { console.log(d); return that.xScale(+d.data[0]) + (bandwidth * d.idx) } )
		.attr('width', bandwidth )
	  .transition()
		.attr('y', d => that.yScale( d[1] - d[0] ) )
		.attr('height', d => that.yScale(0) - that.yScale( d[1] - d[0] ) );
	
}

function transitionStacked(that, data, colors, bandwidth){
	console.log("transition stacked hit");
	var m = that.margin;
	var transitionSpeed = that.options.transition.speed;
	
	if(that.options.suppressLegend == false){
			var chartHeight = that.totalWidth > 600 ? that.height : that.height * 0.8 ;
		} else {
			var chartHeight = that.height ;
		}
	
	var yScale = d3.scaleLinear()
			.range( that.yScale.range() );
	
	var yMax = getStackedMax(data);
	
	yScale.domain([ 0, (yMax * 1.1) ]);
	
	var yFormat = d3.format(that.options.yAxisFormat);
	
	var currentFormatY = that.newScaleY ? that.newScaleY : yFormat;
	
	that.svg.selectAll('.y-axis')
		.transition().ease(d3.easeQuad)
		.duration(transitionSpeed)
		.call(d3.axisLeft(yScale)
			.ticks(chartHeight < 450 ? 5 : 10, currentFormatY)
			.tickSize( -(that.width-(m.right+m.left)) )
			)				
		.selectAll("text")
			.attr("dx", "-.25em");
	
	that.plot.selectAll('.y-axis').selectAll('.domain')
		.attr('class', 'y-axis-line');
		
	that.plot.selectAll('.y-axis').selectAll('.tick line')
		.attr('class', 'y-grid');
		
	that.plot.selectAll('.y-axis').selectAll('text')
		.attr('class', 'y-label');
				
	const barsNew = d3.select(that.element).selectAll('.tag-grouped-bar-g')
		.selectAll( 'rect' )
		.data( function(d){ return d; } );
		
	barsNew
		.exit()
		.transition()
		.duration(transitionSpeed)
		.attr('height', 0)
		.attr('y', 0)
		.remove();
	
	barsNew.enter()
		.append('rect')
		.attr('clip-path', 'url(#' + that.element.id + 'clip'+ ')')
		.attr('x', (d) => that.xScale(+d.data[0]) )
		.attr("y", d => yScale(d[1]))
		.attr('height', 0)
		.attr('width', bandwidth * data.length )
	  .transition()
		.duration(transitionSpeed)
		.delay( d => d.idx *20 )
		.attr("y", d => yScale(d[1]))
		.attr("height", d => yScale(d[0]) - yScale(d[1]))
	  .transition()
		.attr('x', (d) => that.xScale(+d.data[0]) )
		.attr('width', bandwidth * data.length );
	
	barsNew.merge(barsNew)
		.transition()
		.duration(transitionSpeed)
		.delay( d => d.idx *20 )
		.attr("y", d => yScale(d[1]))
		.attr("height", d => yScale(d[0]) - yScale(d[1]))
	  .transition()
		.attr('x', (d) => that.xScale(+d.data[0]) )
		.attr('width', bandwidth * data.length );
	
	
	
}

function getStackedMax(data){
	var temp = d3.max(data[data.length - 1], d => d[1]);
	return temp;
}

function getGroupedDataObject(lys, that){
	
	var data =  [];
	var keys = [];
	var x_var = [];
	var y_var = [];
	var group_var = [];
	
	lys.forEach(function(d){
		data.push(d.data);
		keys.push(d.label);
		x_var.push(d.mapping.x_var);
		y_var.push(d.mapping.y_var);
		group_var.push(d.mapping.group);
	});
	
	var flattenedData = [].concat.apply([],data);
	
	var nestedData =  d3.group(flattenedData, d => d[ x_var[0] ][0] );
		//.key( function(d){
		//	return d[x_var[0]];
		//})
		//.entries(flattenedData);		
	
	var groupedKeys = [...Array(keys.length).keys()];
	
	var currentY = that.newY ? that.newY : y_var[0];
	
	var groupedData = d3.stack()
		.keys(groupedKeys)
		.value( (d,key) => {
			return d[1][key] == undefined ? 0 : d[1][key][ currentY ];
		} )(nestedData);
	
	
	groupedData.forEach(function(d,i){
		d.forEach(function(e){
			e['idx'] = i;
		});
	});	
	
	return groupedData;
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
			
			if ( '@'+id )
				selectorTextArr.push( '@'+id );

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