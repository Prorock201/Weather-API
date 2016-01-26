;(function($) {
	'use strict';
	var pluginName = 'weather';
	var settings = {
		url: 'http://api.openweathermap.org/data/2.5/weather?',
		general: {
			appid: 'dcb260f54b95ad139c9a9f91e651b831',
			lang: 'en',
		},
	};
	var weather = {
		country: '',
		city: '',
		temp: 0,
		temp_min: 0,
		temp_max: 0,
		weather_img: '',
		weather_back: '',
		fixLocation: false,
	};
	var location = {
		geoData: {
			lat: '',
			lon: '',
		},
		city: {
			q: '',
		}
	};

	function Plugin (element, options) {
		var _this = this;
		this.element = element;
		this.settings = $.extend({}, weather, options, this._loadStorage());
		this._name = pluginName + $(this.element).index();
		this._init();
	};

	$.fn.weatherApi = function(options) {
		this.each(function() {
			if (!$.data(this, "plugin_" + pluginName))
				$.data(this, "plugin_" + pluginName, new Plugin(this, options));
		});
		return this;
	};

	$.extend(Plugin.prototype, {
		_init: function(){
			if(this.settings.city) {
				this._getData(this.settings.city);
			} else {
				this._getLocation();
			}
		},

		_getLocation: function(){
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(this._getData.bind(this), this._selectCity.bind(this));
			} else {
				alert('Your browser does not support Geo Location.');
			}
		},

		_selectCity: function(){
			var that = this;
			var cache = {};
			this._renderSelect();
			$(this.element).find('.city').autocomplete({
				source: function( request, response ) {
					var term = request.term;
					if ( term in cache ) {
						response(cache[term]);
						return;
					}
					$.ajax({
						url: 'http://gd.geobytes.com/AutoCompleteCity',
						dataType: 'jsonp',
						data: {
							q: request.term
						},
						success: function( data ) {
							cache[term] = data;
							response( data );
						}
					});
				},
				minLength: 3,
				select: function( event, ui ) {
					var position = ui.item.value;
					that.settings.fixLocation = false;
					that._destroyData();
					that._getData(position);
				},
			});
		},

		_getData: function(position){
			if(position.coords){
				location.geoData.lat = position.coords.latitude;
				location.geoData.lon = position.coords.longitude;
				$.get(this._parseUrl(settings.url, location.geoData, settings.general), this._parseData.bind(this));
			} else {
				location.city.q = position;
				$.get(this._parseUrl(settings.url, location.city, settings.general), this._parseData.bind(this));
			}
		},

		_parseUrl: function(source, location, sett){
			return  source + 
			$.map(location, function(val,key) {return (key+'='+val)}).join('&') +
			'&' + $.map(sett, function(val,key){return (key+'='+val)}).join('&');
		},

		_parseData: function(data){
			var obj = this.settings;
			var dat = data.main;
			var fah = 273.15;
			obj.temp = ((dat.temp>fah)?'+':'') + Math.round(dat.temp - fah);
			obj.temp_min = ((dat.temp_min>fah)?'+':'') + Math.round(dat.temp_min - fah);
			obj.temp_max = ((dat.temp_max>fah)?'+':'') + Math.round(dat.temp_max - fah);
			obj.city = data.name;
			obj.country = data.sys.country;
			obj.weather_img = 'http://openweathermap.org/img/w/'+ data.weather[0].icon +'.png';
			this._renderData();
		},

		_renderSelect: function(){
			var title = '<h3 class="weather-title">Input city</h3>';
			var select = '<input class="city" type="text">';
			$(this.element).find('.weather-location').css('display', 'none');
			$(this.element).find('.weather__image').css('display', 'none');
			$(this.element).find('.weather-temp').css('display', 'none');
			$(this.element).find('.holder').prepend(select);
			$(this.element).find('.holder').prepend(title);
			$(this.element).find('.city').focus();
			$(this.element).find('.city').on('focusout', this._getBackSelect.bind(this));
		},

		_getBackSelect: function(){
			var currentCity = $(this.element).find('.weather-location');
			if (currentCity.length != 0) {
				$(this.element).find('.weather-title').remove();
				$(this.element).find('.city').remove();
				$(currentCity).css('display', 'block');
				$(this.element).find('.weather__image').css('display', 'block');
				$(this.element).find('.weather-temp').css('display', 'block');
			};
		},

		_renderData: function(){
			var obj = this.settings;
			var template = '<div class="holder"><p class="weather-location"><input class="save-location"' + 
			' type="checkbox" name="checkbox" id="saveLocation"/>' +
			'<span class="weather-location__name">' + obj.city + ', ' + obj.country + 
			'</span></p><img class="weather__image" src="' + obj.weather_img + 
			'" alt=""><div class="weather-temp"><div class="weather-temp__min">' + 
			obj.temp_min + ' <sup>o</sup><span>C ...</span></div>' + 
			'<div class="weather-temp__max">... ' + obj.temp_max + 
			' <sup>o</sup><span>C</span></div></div></div>';
			$(this.element).append(template);
			$(this.element).find('#saveLocation').attr('checked', this.settings.fixLocation);
			$(this.element).find('#saveLocation').on('change', this._saveChooise.bind(this));
			$(this.element).find('.weather-location__name').on('click', this._selectCity.bind(this));
		},

		_saveChooise: function(){
			var obj = this.settings;
			this.settings.fixLocation = !this.settings.fixLocation;
			if(this.settings.fixLocation){
				$(this.element).find('#saveLocation').attr('checked', 'true');
				localStorage.setItem(this._name, JSON.stringify(this.settings));
			} else {
				$(this.element).find('#saveLocation').attr('checked', 'false');
				localStorage.removeItem(this._name);
			}
		},

		_loadStorage: function(){
			return JSON.parse(localStorage.getItem(pluginName + $(this.element).index()));
		},

		_destroyData: function(){
			$(this.element).empty();
		},
	});
$('.weather').weatherApi();
})(jQuery);



