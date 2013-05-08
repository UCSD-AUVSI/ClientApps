YUI.add('clientapp-imageview', function(Y){
	Y.namespace('ClientApp');

	var ImageView = function(img) {
		var CIRCLE_DIAM = 10;

		var self = this;
		var canvas = document.getElementById('img-canvas');
		var ctx = canvas.getContext('2d');
		var currentImage = new Image();
		var greenDot = new Image();
		greenDot.src = 'images/green_dot.png';
		var redDot = new Image();
		redDot.src = 'images/red_dot.png';
		var arrowBody = new Image();
		arrowBody.src = 'images/arrow_body.png';
		var arrowHead = new Image();
		arrowHead.src = 'images/arrow_head.png';

		var startX;
		var startY;
		var endX = -1;
		var endY = -1;
		var mousePressed = false;

		var drawInterval;
		var scalingFactor = document.getElementById('img-canvas').width/document.getElementById('img-canvas').offsetWidth;


		console.log('left-col width: ');
		console.log(document.getElementById('left-col').computedWidth);

		this.drawImg = function(img) {
			console.log('drawImg');
			ctx.drawImage(img, 0,0, canvas.width, canvas.height);
			ctx.stroke();
		}

        this.drawCenterCircle = function(x,y,diam) {
        	startX = x;
        	startY = y;

        	img.imageList[img.currentIndex].target_x = parseInt(x);
        	img.imageList[img.currentIndex].target_y = parseInt(y);

			ctx.drawImage(currentImage, 0,0, canvas.width, canvas.height);
			/*if(img.imageList[img.currentIndex].topX != -1) {
				ctx.drawImage(redDot,parseInt(img.imageList[img.currentIndex].topX-diam/2),parseInt(img.imageList[img.currentIndex].topY-diam/2),diam,diam);
			}*/
			ctx.drawImage(greenDot,parseInt(x-diam/2),parseInt(y-diam/2),diam,diam);
			console.log('center circle: ' + img.imageList[img.currentIndex].target_x + ' ' + img.imageList[img.currentIndex].target_y);
		}
        this.drawDirectionCircle = function(x,y,diam) {

        	var angle,dx,dy,length;

        	img.imageList[img.currentIndex].top_x = parseInt(x);
        	img.imageList[img.currentIndex].top_y = parseInt(y);
        	dx = x-startX;
        	dy = y-startY;
        	angle = -Math.atan2(dx,dy);
        	//~~ (x+0.5);
        	length = ~~(Math.sqrt(Math.pow(Math.abs(dx),2) + Math.pow(Math.abs(dy),2))+.5);

        	ctx.drawImage(currentImage, 0,0, canvas.width, canvas.height);
        	if(img.imageList[img.currentIndex].top_x != -1) {
				ctx.drawImage(greenDot,parseInt(img.imageList[img.currentIndex].target_x-diam/2),parseInt(img.imageList[img.currentIndex].target_y-diam/2),diam,diam);
			}
			//ctx.drawImage(redDot,parseInt(x-diam/2),parseInt(y-diam/2),diam,diam);

			ctx.save();
			ctx.translate(startX,startY);
			ctx.rotate(angle);
			ctx.drawImage(arrowBody,-2,-2,4,length);
			ctx.drawImage(arrowHead,-5,length-5,10,10);
			ctx.restore();

			
        }

        this.prevImage = function() {
        	self.loadImage(img.currentIndex);
        }
        this.nextImage = function() {
        	self.loadImage(img.currentIndex);
        }

        this.loadImage = function(i) {
        	var imageData = img.imageList[i];
        	currentImage.onload = function() {
        		console.log('img onload');
				self.drawImg(currentImage);
				self.drawCenterCircle(imageData.target_x,imageData.target_y,CIRCLE_DIAM);
				self.drawDirectionCircle(imageData.top_x,imageData.top_y,CIRCLE_DIAM);
			};
			console.log('image ip: ' + img.imageIP + "   " + imageData.image_name);
			console.log('img derp');
			//on my computer:
			//currentImage.src = 'http://'+img.imageIP+':3000/flightdata/'+imageData.image_name;
			//ground station:
			currentImage.src = 'http://'+img.imageIP+':8888/targets/'+imageData.image_name;
        }

        //Handlers

        //Place center circle when mouse is pressed
        this.handleMouseDown = function(e) {
       		console.log('mousedown');
        	var coords = canvas.relMouseCoords(e);
			var x = coords.x;
			var y = coords.y;
			endX = x;
			endY = y;
			self.drawCenterCircle(x,y,CIRCLE_DIAM);
			mousePressed = true;
        }
        //Place top circle where mouse is dragged and released
        this.handleMouseUp = function(e) {
       		console.log('mouseup');
			//self.drawDirectionCircle(endX,endY,CIRCLE_DIAM);
			mousePressed = false;
        }
        this.handleMouseMove = function(e) {
        	if(mousePressed === true) {
	       		e.preventDefault();
	       		
	        	var coords = canvas.relMouseCoords(e);
	        	endX = coords.x;
	        	endY = coords.y;
	        	//self.drawDirectionCircle(endX,endY,CIRCLE_DIAM);
        	}
        }

        this.startDrawLoop = function() {
        	var ONE_FRAME_TIME = 1000/60;

        	return function() {
        		console.log('closure');
        		drawInterval = setInterval(self.drawLoop, ONE_FRAME_TIME)
        	};
        }

        this.drawLoop = function() {
        	//make sure to check if endX and endY are set appropriately before  doing this
        	if(endX !== -1 && mousePressed === true)
        		self.drawDirectionCircle(endX,endY,CIRCLE_DIAM);
        	/*
				Instead of calling drawXXXCircle and drawImg functions in each handler,
				call them once every frame. Keep track of the coordinate values within
				those handlers and then use them here.
        	*/

        }
        /*When you release a click draw center if left click and top if right click*/
        /*
        this.handleMouseUp = function(e) {
       		console.log('mouseup');
        	var coords = canvas.relMouseCoords(e);
			var x = coords.x;
			var y = coords.y;

			if(e.button === 1) {
				self.drawCenterCircle(x,y,CIRCLE_DIAM);
			} else if(e.button === 3) {
				self.drawDirectionCircle(x,y,CIRCLE_DIAM);
			}
        }*/
        this.handleSetCurrentImg = function(e) {
        	currentImage.onload = function() {
				self.drawImg(currentImage);
			};
			//on my computer:
			//currentImage.src = 'http://'+img.imageIP+':3000/flightdata/'+e.src;
			//ground station:
			currentImage.src = 'http://'+img.imageIP+':8888/targets/'+e.src;
        }
       
        canvas.addEventListener('touchstart', self.handleMouseDown);
        canvas.addEventListener('touchend', self.handleMouseUp);
        canvas.addEventListener('touchmove', self.handleMouseMove);

        //Listeners
        //canvas.addEventListener('mouseup',handleMouseUp, false);
		

		Y.on('mouseup', this.handleMouseUp, canvas);
		Y.on('mousedown', this.handleMouseDown, canvas);
		Y.on('mousemove', this.handleMouseMove, canvas);
		
		//Y.on('touchstart', this.handleMouseUp, canvas);
		//Y.on('touchend', this.handleMouseDown, canvas);
		Y.on('clientapp-imageview:previmage', this.prevImage)
		Y.on('clientapp-imageview:nextimage', this.nextImage)
       	Y.on('clientapp-imageview:setcurrentimg', this.handleSetCurrentImg);

		Y.on("resize", function() {
			//update all scaling factors by dividing by old, setting new, and multiplying by new.
            //This will involve calling drawCenter and drawDirection again
            scalingFactor = document.getElementById('img-canvas').width/document.getElementById('img-canvas').offsetWidth;
            
			self.drawCenterCircle(img.imageList[img.currentIndex].target_x,img.imageList[img.currentIndex].target_y,CIRCLE_DIAM);
			self.drawDirectionCircle(img.imageList[img.currentIndex].top_x,img.imageList[img.currentIndex].top_y,CIRCLE_DIAM);
        });
        

        //Prevent right click context menu in canvas
        document.getElementById('img-canvas').oncontextmenu = function() { return false; }

        // The general-purpose event handler. This function just determines the mouse 
		// position relative to the canvas element.
		function relMouseCoords(event){
		    var totalOffsetX = 0;
		    var totalOffsetY = 0;
		    var canvasX = 0;
		    var canvasY = 0;
		    var currentElement = this;

		    do{
		        totalOffsetX += currentElement.offsetLeft;
		        totalOffsetY += currentElement.offsetTop;
		    }
		    while(currentElement = currentElement.offsetParent)

		    var ua = navigator.userAgent.toLowerCase();
		    if("ontouchstart" in window) {
			    canvasX = (event.touches[0].pageX - totalOffsetX)*scalingFactor;
			    canvasY = (event.touches[0].pageY - totalOffsetY)*scalingFactor;
			} else {
				canvasX = (event.pageX - totalOffsetX)*scalingFactor;
			    canvasY = (event.pageY - totalOffsetY)*scalingFactor;
			}
		    //canvasX = event.pageX - totalOffsetX;
		    //canvasY = event.pageY - totalOffsetY;


		    return {x:canvasX, y:canvasY}
		}
		HTMLCanvasElement.prototype.relMouseCoords = relMouseCoords;


		this.setCanvasHeight = function() {
            var viewportheight;
            if (typeof window.innerHeight != 'undefined')
             {
                  viewportheight = window.innerHeight
             }
             else if (typeof document.documentElement != 'undefined'
                 && typeof document.documentElement.clientHeight !=
                 'undefined' && document.documentElement.clientHeight != 0)
             {
                   viewportheight = document.documentElement.clientHeight
             }
             else
             {
                   viewportheight = document.getElementsByTagName('body')[0].clientHeight
             }

             document.getElementById('sidebar').setAttribute('height', viewportheight-52+'px');
             //canvas.height = 500;
        }
	}

	Y.ClientApp.ImageView = ImageView;
},'0.1.0', { requires: ['io', 'base'] });