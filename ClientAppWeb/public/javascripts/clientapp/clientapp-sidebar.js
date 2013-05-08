YUI.add('clientapp-sidebar', function(Y) {
	Y.namespace('ClientApp');

	var Sidebar = function(img) {
		var self = this,
			sidebar = Y.one("#sidebar");
			shapeCompGuess = Y.one('#shape-comp-guess'),
			shapeColorCompGuess = Y.one('#shape-color-comp-guess'),
			letterCompGuess = Y.one('#letter-comp-guess'),
			letterColorCompGuess = Y.one('#letter-color-comp-guess'),
			shapeInput = Y.one('#shape-input'),
			shapeColorInput = Y.one('#shape-color-input'),
			letterInput = Y.one('#letter-input'),
			letterColorInput = Y.one('#letter-color-input'),
			prevBtn = Y.one('#prev-btn'),
			nextBtn = Y.one('#next-btn'),
			submitBtn = Y.one('#submit-btn'),
			discardBtn = Y.one('#discard-btn');

		this.prevImage = function(e) {
			self.saveUserGuesses(img.currentIndex);
			img.currentIndex = (img.currentIndex==0)?img.imageList.length-1:img.currentIndex-1;
			var image = img.imageList[img.currentIndex];
			self.showCompGuesses(image.shape, image.shapecolor, image.letter, image.lettercolor);
			
			self.showUserGuesses(image.shapeguess, image.shapecolorguess, image.letterguess, image.lettercolorguess);
			self.loadUserGuesses(img.currentIndex);

			//Fire event telling the Images module to move to the previous image
			Y.fire('clientapp-imageview:previmage');
			img.socket.emit('clientapp-imageview:previmage');
		}
		this.nextImage = function(e) {
			self.saveUserGuesses(img.currentIndex);
			img.currentIndex = (img.currentIndex==img.imageList.length-1)?0:img.currentIndex+1;
			var image = img.imageList[img.currentIndex];
			self.showCompGuesses(image.shape, image.shapecolor, image.letter, image.lettercolor);
			
			self.showUserGuesses(image.shapeguess, image.shapecolorguess, image.letterguess, image.lettercolorguess);
			self.loadUserGuesses(img.currentIndex);
			

			/*In order to emit nextimage to all other comps, i need to make sure i have some mechanism for delivering
			and indexing all images exactly the same on all comps. currenly, each comp will load at its own pace.
			This means when the app starts I initially need to emit a signal with the same imageList structure, etc.
			*/
			img.socket.emit('nextimage', {my:'data'});
			//Fire event telling the Images module to move to the next image
			Y.fire('clientapp-imageview:nextimage');
			img.socket.emit('clientapp-imageview:nextimage');
		}
		this.saveUserGuesses = function(i) {
			img.imageList[i].shapeguess = shapeInput.get('value');
			img.imageList[i].shapecolorguess = shapeColorInput.get('value');
			img.imageList[i].letterguess = letterInput.get('value');
			img.imageList[i].lettercolorguess = letterColorInput.get('value');
		}
		this.loadUserGuesses = function(i) {
			shapeInput.set('value',img.imageList[i].shapeguess);
			shapeColorInput.set('value',img.imageList[i].shapecolorguess);
			letterInput.set('value',img.imageList[i].letterguess);
			letterColorInput.set('value',img.imageList[i].lettercolorguess);
		}
		this.showCompGuesses = function(shape,shapecolor,letter,lettercolor) {

			shapeCompGuess.setContent(shape);
			shapeColorCompGuess.setContent(shapecolor);
			letterCompGuess.setContent(letter);
			letterColorCompGuess.setContent(lettercolor);
		}
		this.showUserGuesses = function(shape,shapecolor,letter,lettercolor) {
			console.log('shapeguess');
			shapeInput.set('value',shape);
			shapeColorInput.set('value',shapecolor);
			letterInput.set('value',letter);
			letterColorInput.set('value',lettercolor);
		}
		this.submitGuess = function() {
			self.saveUserGuesses(img.currentIndex);
			console.log('shapeguess: ' +img.imageList[img.currentIndex].shapeguess);

			var transactionId, cfg = {
				method: 'PUT',
				on: {
					complete: function(id,o,args) {
						if(id == transactionId) {
							var data = o.responseText;
							console.log(data);
						}
					}
				},
				data: {
					targetid:img.imageList[img.currentIndex].targetid,
					description_id:img.imageList[img.currentIndex].description_id,
					shape:img.imageList[img.currentIndex].shapeguess,
					shapecolor:img.imageList[img.currentIndex].shapecolorguess,
					letter:img.imageList[img.currentIndex].letterguess,
					lettercolor:img.imageList[img.currentIndex].lettercolorguess,
					target_x:img.imageList[img.currentIndex].target_x,
					target_y:img.imageList[img.currentIndex].target_y,
					top_x:img.imageList[img.currentIndex].top_x,
					top_y:img.imageList[img.currentIndex].top_y,
					//userid:img.imageList[img.currentIndex].userid,
					userid:'jordan'
				}
			};
			var request = Y.io('/rest/votes', cfg);
			transactionId = request.id;
			
			//If you write an image that was already written(check by candidateid)
			//Then update instead of insert.
		}
		this.discardImage = function() {
			shapeInput.set('value','not a target');
			shapeColorInput.set('value','not a target');
			letterInput.set('value','not a target');
			letterColorInput.set('value','not a target');

			self.submitGuess();
			//submit to database?
		}

		//Handlers
		this.handleShowCompGuesses = function(e) {
			var image = img.imageList[img.currentIndex];
			self.showCompGuesses(image.shape, image.shapecolor, image.letter, image.lettercolor);
			self.showUserGuesses(image.shapeguess, image.shapecolorguess, image.letterguess, image.lettercolorguess);
		}

		//Listeners
		Y.on('click', this.prevImage, prevBtn);
		Y.on('click', this.nextImage, nextBtn);
		Y.on('click', this.submitGuess, submitBtn);
		Y.on('click', this.discardImage, discardBtn);
		Y.on('clientapp-sidebar:show-comp-guesses', this.handleShowCompGuesses);
	}

	Y.ClientApp.Sidebar = Sidebar;
},'0.1.0', { requires: ['io', 'base'] });
