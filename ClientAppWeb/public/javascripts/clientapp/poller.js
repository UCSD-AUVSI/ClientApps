
YUI.add('poller', function (Y) {
	Y.namespace('ClientApp');

	var Poller = function() {
		Poller.superclass.constructor.apply(this,arguments);

		var self = this;
		var url = '';
		var timestamp = 0;
		
		this.start = function(url,interval) {
			var getdata = function() {
				self.getData(url);
			}
			this.set('intervalID',setInterval(getdata, interval));
			
		}
		this.stop = function() {
			clearInterval(this.get('intervalID'));
		}
		this.getData = function (url) {
			var transactionId, cfg = {
				method: 'GET',
				on: {
					complete: function(id,o,args) {
						if(id == transactionId) {
							var data = JSON.parse(o.responseText);
							self.set('data',data[0]);
							self.set('imageIP',data[1]);
							Y.fire('poller:newdataloaded');
						}
					}
				}
			};
			var request = Y.io(url, cfg);
			transactionId = request.id;

			//Populate computeroutput with dummy data
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
		}
	}


	Y.extend(Poller, Y.Base, {
		initializer: function() {},
		destructor: function() {}
	}, {
		ATTRS : {
			'intervalID': {
				value: 2000,
				getter: function(val, name) {return val},
				setter: function(val, name) {return val}
			},
			'data': {
				value: []
			},
			'imageIP' : {
				value: ''
			}
		},
		NAME : 'poller'
	});

	Y.ClientApp.Poller = Poller;
},'0.0.1', { requires: ['io', 'base'] });