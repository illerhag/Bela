'use strict';
var View = require('./View');

var xTime, sampleRate, upSampling=1, downSampling=1;

class ControlView extends View{

	constructor(className, models){
		super(className, models);
		$('#controlsButton').click(() => this.$parents.toggleClass('hidden') );
	}
	
	// UI events
	selectChanged($element, e){
		var key = $element.data().key;
		var value = $element.val();
		//if (this[key]) this[key](value);
		this.emit('settings-event', key, parseFloat(value));
		this.$elements.not($element).filterByData('key', key).val(value);
	}
	inputChanged($element, e){
		var key = $element.data().key;
		var value = $element.val();
		this.emit('settings-event', key, parseFloat(value));
		this.$elements.not($element).filterByData('key', key).val(value);
	}
	buttonClicked($element, e){
		if ($element.data().key === 'upSampling'){
			if (downSampling > 1){
				downSampling -= 1;
				this.emit('settings-event', 'downSampling', downSampling);
			} else {
				upSampling += 1;
				this.emit('settings-event', 'upSampling', upSampling);
			}
			// this._upSampling();
		} else if ($element.data().key === 'downSampling'){
			if (upSampling > 1){
				upSampling -= 1;
				this.emit('settings-event', 'upSampling', upSampling);
			} else {
				downSampling += 1;
				this.emit('settings-event', 'downSampling', downSampling);
			}
			// this._downSampling();
		} else {
			this.emit('settings-event', $element.data().key);
		}
	}
	
	// settings model events
	modelChanged(data, changedKeys){
		for (let key of changedKeys){
			if (this['_'+key]){
				this['_'+key](data[key], data);
			} else {
				if (key === 'plotMode') this.plotMode(data[key], data);
				//this.$elements.filterByData('key', key).val(data[key]);
			}
		}
	}
	
	setControls(data){
		for (let key in data){
			this.$elements.filterByData('key', key).val(data[key]);
		}
	}
	
	plotMode(val, data){
		this.emit('plotMode', val, data);
		if (val == 0){
			if ($('#triggerControls').hasClass('hidden')) $('#triggerControls').removeClass('hidden');
			if (!$('#FFTControls').hasClass('hidden')) $('#FFTControls').addClass('hidden');
			$('.xAxisUnits').html('ms');
			$('.xUnit-display').html((xTime * downSampling/upSampling).toPrecision(2));
			$('#zoomUp').html('in');
			$('#zoomDown').html('out');
		} else if (val == 1){
			if (!$('#triggerControls').hasClass('hidden')) $('#triggerControls').addClass('hidden');
			if ($('#FFTControls').hasClass('hidden')) $('#FFTControls').removeClass('hidden');
			$('.xAxisUnits').html('Hz');
			$('.xUnit-display').html((sampleRate/20 * upSampling/downSampling));
			$('#zoomUp').html('out');
			$('#zoomDown').html('in');
		}
	}
	
	_upSampling(value, data){
		upSampling = value;
		if (data.plotMode == 0){
			$('.xUnit-display').html((data.xTimeBase * data.downSampling/data.upSampling).toPrecision(2));
		} else if (data.plotMode == 1){
			$('.xUnit-display').html((data.sampleRate/20 * data.upSampling/data.downSampling));
		}
		$('.zoom-display').html((100*upSampling/downSampling).toPrecision(4)+'%');
	}
	_downSampling(value, data){
		downSampling = value;
		if (data.plotMode == 0){
			$('.xUnit-display').html((data.xTimeBase * data.downSampling/data.upSampling).toPrecision(2));
		} else if (data.plotMode == 1){
			$('.xUnit-display').html((data.sampleRate/20 * data.upSampling/data.downSampling));
		}
		$('.zoom-display').html((100*upSampling/downSampling).toPrecision(4)+'%');
	}
	_xTimeBase(value, data){
		xTime = data.xTimeBase;
		sampleRate = data.sampleRate;
		if (data.plotMode == 0){
			$('.xUnit-display').html((data.xTimeBase * data.downSampling/data.upSampling).toPrecision(2));
		}
	}
	
	__numChannels(val, data){
		var el = this.$elements.filterByData('key', 'triggerChannel');
		el.empty();
		for (let i=0; i<val; i++){
			let opt = $('<option></option>').html(i+1).val(i).appendTo(el);
			if (i === data.triggerChannel) opt.prop('selected', 'selected'); 
		}
	}
	
	_triggerMode(value){
		this.$elements.filterByData('key', 'triggerMode').val(value);
	}
	
	_triggerChannel(value){
		this.$elements.filterByData('key', 'triggerChannel').val(value);
	}

	_triggerDir(value){
		this.$elements.filterByData('key', 'triggerDir').val(value);
	}

	_triggerLevel(value){
		this.$elements.filterByData('key', 'triggerDir').find('input').val(value);
	}
}

module.exports = ControlView;

$.fn.filterByData = function(prop, val) {
    return this.filter(
        function() { return $(this).data(prop)==val; }
    );
}
