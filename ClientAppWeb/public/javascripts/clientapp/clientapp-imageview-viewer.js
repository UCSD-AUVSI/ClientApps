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
        var hostIP = document.location.host.substring(0,document.location.host.indexOf(':'));

		

		this.drawImg = function(img) {
			ctx.drawImage(img, 0,0, canvas.width, canvas.height);
			ctx.stroke();
		}

        this.drawCenterCircle = function(x,y,diam) {
        	startX = x;
        	startY = y;

        	img.imageList[img.currentIndex].centerX = x;
        	img.imageList[img.currentIndex].centerY = y;

			ctx.drawImage(currentImage, 0,0, canvas.width, canvas.height);
			/*if(img.imageList[img.currentIndex].topX != -1) {
				ctx.drawImage(redDot,parseInt(img.imageList[img.currentIndex].topX-diam/2),parseInt(img.imageList[img.currentIndex].topY-diam/2),diam,diam);
			}*/
			ctx.drawImage(greenDot,parseInt(x-diam/2),parseInt(y-diam/2),diam,diam);
		}
        this.drawDirectionCircle = function(x,y,diam) {

        	var angle,dx,dy,length;

        	img.imageList[img.currentIndex].topX = x;
        	img.imageList[img.currentIndex].topY = y;
        	dx = x-startX;
        	dy = y-startY;
        	angle = -Math.atan2(dx,dy);
        	//~~ (x+0.5);
        	length = ~~(Math.sqrt(Math.pow(Math.abs(dx),2) + Math.pow(Math.abs(dy),2))+.5);
        	console.log(dx + ' ' + dy + ' ' + ' = ' + length);

        	ctx.drawImage(currentImage, 0,0, canvas.width, canvas.height);
        	if(img.imageList[img.currentIndex].topX != -1) {
				ctx.drawImage(greenDot,parseInt(img.imageList[img.currentIndex].centerX-diam/2),parseInt(img.imageList[img.currentIndex].centerY-diam/2),diam,diam);
			}

			ctx.save();
			ctx.translate(startX,startY);
			ctx.rotate(angle);  
			ctx.drawImage(arrowBody,-2,-2,4,length);
			ctx.drawImage(arrowHead,-5,length-5,10,10);
			ctx.restore();
        }
        this.switchImage = function() {
        	console.log('images.currImage');
        	self.loadImage(img.currentIndex);
        }

        this.loadImage = function(i) {
        	var imageData = img.imageList[i];
        	currentImage.onload = function() {
				self.drawImg(currentImage);
				self.drawCenterCircle(imageData.centerX,imageData.centerY,CIRCLE_DIAM);
				self.drawDirectionCircle(imageData.topX,imageData.topY,CIRCLE_DIAM);
			};
            console.log('loadImage: ' + hostIP);
			currentImage.src = 'http://'+hostIP+':8888/targets/'+imageData.image_name;
        }

        this.startDrawLoop = function() {
        	var ONE_FRAME_TIME = 1000/60;

        	return function() {
        		console.log('closure');
        		drawInterval = setInterval(self.drawLoop, ONE_FRAME_TIME)
        	};
        }

        this.drawLoop = function() {
        	if(endX !== -1 && mousePressed === true)
        		self.drawDirectionCircle(endX,endY,CIRCLE_DIAM);

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
            console.log('set current img');
        	currentImage.onload = function() {
				self.drawImg(currentImage);
			};
            console.log('handleSetCurrentImg: ' + hostIP + '  ' + e.src);
			currentImage.src = 'http://'+hostIP+':8888/targets/'+e.src;
            
        }

		Y.on('clientapp-imageview:previmage', this.switchImage)
		Y.on('clientapp-imageview:nextimage', this.switchImage)
       	Y.on('clientapp-imageview:setcurrentimg', this.handleSetCurrentImg);

        //Prevent right click context menu in canvas
        document.getElementById('img-canvas').oncontextmenu = function() { return false; }

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

             canvas.setAttribute('height', viewportheight-52+'px');
             //canvas.height = 500;
        }
	}

	Y.ClientApp.ImageView = ImageView;
},'0.1.0', { requires: ['io', 'base'] });