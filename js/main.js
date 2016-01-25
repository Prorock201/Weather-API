(function($) {
	$.fn.weatherApi = function(options) {
		var settings = {
			url: 'http://api.openweathermap.org/data/2.5/weather?',
			general: {
				appid: 'dcb260f54b95ad139c9a9f91e651b831',
				lang: 'en',
			},
		};

		return this.each(function() {
			var weather = {
				country: '',
				city: '',
				temp: 0,
				temp_min: 0,
				temp_max: 0,
				weather_img: '',
				weather_back: '',
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

			var that = this;
			$.extend(weather, options, JSON.parse(localStorage.getItem('weather' + $(that).index())));
			_init();

			function _init() {
				if(weather.city) {
					_getData(weather.city);
				} else {
					_getLocation();
				}
			};

			function _getLocation() {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(_getData, _selectCity);
				} else {
					alert('Your browser does not support Geo Location.');
				}
			};

			function _selectCity() {
				var cache = {};
				_renderSelect();
				$(that).find('.city').autocomplete({
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
						$(that).find('.class').css('display', 'none');
						_destroyData();
						_getData(position);
					},
				});
			};

			function _getData(position){
				if(position.coords){
					location.geoData.lat = position.coords.latitude;
					location.geoData.lon = position.coords.longitude;
					$.get(_parseUrl(settings.url, location.geoData, settings.general), _parseData);
				} else {
					location.city.q = position;
					$.get(_parseUrl(settings.url, location.city, settings.general), _parseData);
				}
			};

			function _parseUrl(source, location, sett) {
				return  source + 
								$.map(location, function(val,key) {return (key+'='+val)}).join('&') +
								'&' + $.map(sett, function(val,key){return (key+'='+val)}).join('&');
			};

			function _parseData(data) {
				console.log(data);
				var obj = weather;
				var dat = data.main;
				var fah = 273.15;
				obj.temp = ((dat.temp>fah)?'+':'') + Math.round(dat.temp - fah);
				obj.temp_min = ((dat.temp_min>fah)?'+':'') + Math.round(dat.temp_min - fah);
				obj.temp_max = ((dat.temp_max>fah)?'+':'') + Math.round(dat.temp_max - fah);
				obj.city = data.name;
				obj.country = data.sys.country;
				obj.weather_img = 'http://openweathermap.org/img/w/'+ data.weather[0].icon +'.png';
				_renderData();
			};

			function _renderSelect() {
				var title = '<h3 class="weather-title">Input city</h3>';
				var select = '<input class="city" type="text">';
				$(that).find('.weather-location').css('display', 'none');
				$(that).find('.weather__image').css('display', 'none');
				$(that).find('.weather-temp').css('display', 'none');
				$(that).find('.holder').prepend(select);
				$(that).find('.holder').prepend(title);
				$(that).find('.city').focus();
				$(that).find('.city').on('focusout', _getBackSelect);
			};

			function _getBackSelect() {
				var currentCity = $(that).find('.weather-location');
				if (currentCity.length != 0) {
					$(that).find('.weather-title').remove();
					$(that).find('.city').remove();
					$(currentCity).css('display', 'block');
					$(that).find('.weather__image').css('display', 'block');
					$(that).find('.weather-temp').css('display', 'block');
				};
			};

			function _renderData() {
				var obj = weather;
				var template = '<div class="holder"><p class="weather-location"><input class="save-location"' + 
											 ' type="checkbox" name="checkbox" id="saveLocation"/>' +
											 '<span class="weather-location__name">' + obj.city + ', ' + obj.country + 
											 '</span></p><img class="weather__image" src="' + obj.weather_img + 
											 '" alt=""><div class="weather-temp"><div class="weather-temp__min">' + 
											 obj.temp_min + ' <sup>o</sup><span>C ...</span></div>' + 
											 '<div class="weather-temp__max">... ' + obj.temp_max + 
											 ' <sup>o</sup><span>C</span></div></div></div>';
				$(that).append(template);
				$(that).find('#saveLocation').on('change', saveChooise);
				$(that).find('.weather-location__name').on('click', _selectCity);
			};

			function saveChooise() {
				if($(this).is(':checked')){
					localStorage.setItem('weather' + $(that).index(), JSON.stringify(weather));
				} else {
					localStorage.removeItem('weather' + $(that).index());
				}
			};

			function _destroyData() {
				$(that).empty();
			};
		});
};
$('.weather').weatherApi();
})(jQuery);



