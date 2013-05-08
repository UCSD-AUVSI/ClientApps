//Images is maybe a bad name. This is the core module in which other modules are instatiated
YUI.add('clientapp-images', function(Y){
	Y.namespace('ClientApp');

	var Images = function() {
		Images.superclass.constructor.apply(this,arguments);

		var self = this;
		var timestamp = -1;
		var ldImgInterval;
		var currentImage = new Image();


		this.computerData = [];//Static data from the computer
		this.imageList = [];//A copy of computerData that changes based on user input
		this.currentIndex = 0;
		//this.socket = io.connect('http://localhost');
		//home
		//this.socket = io.connect('http://192.168.1.104');
		//school
		//this.socket = io.connect('http://192.168.19.3');
		

		//get IP address
		/*var transactionId2, cfg2 = {
			method: 'PUT',
			on: {
				complete: function(id,o,args) {
					if(id == transactionId2) {
						var data2 = o.responseText;
						console.log(data2);
					}
				}
			}
		};
		var request2 = Y.io('/rest/testinsert', cfg2);
		transactionId2 = request2.id;*/
		console.log('socket setup http://'+document.location.host.substring(0,document.location.host.indexOf(':')));
		this.socket = io.connect('http://'+document.location.host.substring(0,document.location.host.indexOf(':')));
		
		this.socket.on('clientapp-imageview:setcurrentimg', function(data) {
			console.log('load new images!!!');
			console.log(data.currentIndex);
			console.log(data.image_name);
			self.currentIndex = data.currentIndex;
			self.imageList = data.imageList;
			Y.fire('clientapp-imageview:setcurrentimg',{src: self.imageList[self.currentIndex].image_name});
		});
		this.socket.on('clientapp-imageview:nextimage', function(data) {
			console.log('next image!!!')
			self.currentIndex = (self.currentIndex==self.imageList.length-1)?0:self.currentIndex+1;
			Y.fire('clientapp-imageview:nextimage',{src: self.imageList[self.currentIndex].image_name});
		});
		this.socket.on('clientapp-imageview:previmage', function(data) {
			console.log('prev image!!!')
			self.currentIndex = (self.currentIndex==0)?self.imageList.length-1:self.currentIndex-1;
			Y.fire('clientapp-imageview:previmage',{src: self.imageList[self.currentIndex].image_name});
		});

		var imageView = new Y.ClientApp.ImageView(this);
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
},'0.1.0', { requires: ['io', 'base','clientapp-imageview','poller'] });