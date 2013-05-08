//Images is maybe a bad name. This is the core module in which other modules are instatiated
YUI.add('clientapp-images', function(Y){
	Y.namespace('ClientApp');

	var Images = function() {
		Images.superclass.constructor.apply(this,arguments);
		console.log('images start');


		var self = this;
		var timestamp = -1;
		var ldImgInterval;
		var currentImage = new Image();
		


		this.computerData = [];//Static data from the computer
		this.imageList = [];//A copy of computerData that changes based on user input
		this.currentIndex = 0;
		this.imageIP = '';
		//home
		//this.socket = io.connect('http://192.168.1.104');
		//school
		this.socket = io.connect('http://'+document.location.host.substring(0,document.location.host.indexOf(':')));

		var poller = new Y.ClientApp.Poller();
		var imageView = new Y.ClientApp.ImageView(this);
		var drawLoop = imageView.startDrawLoop();
    	drawLoop();
		var Sidebar = new Y.ClientApp.Sidebar(this);
		
		this.startPolling = function() {
			poller.start('/rest/flightdata',700);
			//this.loadImages();
			//in reality, the polling should continue forever.
			//This function stops it after 3 seconds
			/*setTimeout(function() {
				self.stopPolling();
			}, 3000);*/
		}
		this.stopPolling = function() {
			poller.stop();
		}
		this.loadImages = function() {
			var data = poller.get('data');
			self.imageIP = poller.get('imageIP');
			console.log('loadImages::');
			console.log(data);
			if(timestamp == -1) {
				//Grab all images since this is the first poll.
				self.computerData = data;
				self.imageList = data;

				currentIndex = 0;

				Y.fire('clientapp-imageview:setcurrentimg',{src: self.imageList[0].image_name});
				
				self.imageList.forEach(function(s, i) {
					self.imageList[i].shapeguess = '';
					self.imageList[i].shapecolorguess = '';
					self.imageList[i].letterguess = '';
					self.imageList[i].lettercolorguess = '';
					self.imageList[i].target_x = -1;
					self.imageList[i].target_y = -1;
					self.imageList[i].top_x = -1;
					self.imageList[i].top_y = -1;
					//Find maximum timestamp
					if(timestamp < s.timestamp) {
						timestamp = s.timestamp;
					}
				});

				Y.fire('clientapp-sidebar:show-comp-guesses',{imageData: self.imageList[currentIndex]});

			} else {
				data.forEach(function(s, i) {
					//Grab new images only.
					if(timestamp < s.timestamp) {
						timestamp = s.timestamp;
						self.computerData.push(s);
						self.imageList.push(s);

						self.imageList[i].shapeguess = '';
						self.imageList[i].shapecolorguess = '';
						self.imageList[i].letterguess = '';
						self.imageList[i].lettercolorguess = '';
						self.imageList[i].target_x = -1;
						self.imageList[i].target_y = -1;
						self.imageList[i].top_x = -1;
						self.imageList[i].top_y = -1;
					}
				});
			}

			console.log('emit setcurrentimg: ');
			console.log(self.imageList);
			self.socket.emit('clientapp-imageview:setcurrentimg', {imageList: self.imageList, currentIndex: self.currentIndex});
			
		}


		this.startPolling();
		//Listeners
		Y.on('poller:newdataloaded', this.loadImages);
		
	}

	Y.extend(Images, Y.Base, {}, {
		NAME: 'images',
		ATTRS: {
			imageList: {
				value:[]
			},
			currentIndex: {
				value: 0
			}
		}
	});

	Y.ClientApp.Images = Images;
},'0.1.0', { requires: ['io', 'base','clientapp-sidebar','clientapp-imageview','poller'] });