$(function() {
	$.widget( "custom.weatherWidjet", {
		options: {},
		store: {
			weather: {
				country: 'countryName',
				city: 'cityName',
				temp: 0,
				temp_min: 0,
				temp_max: 0,
				weather_img: '',
			}
		},

		_create: function() {
			this._getLocation();
			
		},

		_getLocation: function() {
			var that = this;
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(this._getData.bind(that), this._selectCity.bind(that));
			} else {
				alert('Your browser does not support Geo Location.');
			}
		},

		_selectCity: function() {
			var that = this;
			var cache = {};
			$(".city").css('display', 'block');
			$(".city").autocomplete({
				source: function( request, response ) {
					var term = request.term;
					if ( term in cache ) {
						response(cache[term]);
						return;
					}
					$.ajax({
						url: "http://gd.geobytes.com/AutoCompleteCity",
						dataType: "jsonp",
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
					$(".class").css('display', 'none');
					that._getData(position);
				},
			});
		},

		_getData: function(position){
			var that = this;
			var url = 'http://api.openweathermap.org/data/2.5/weather?';
			var apiKey = 'dcb260f54b95ad139c9a9f91e651b831';
			var lang = 'en';
			if(position.coords){
				var lat = position.coords.latitude;
				var lon = position.coords.longitude;
				$.get(url+'lat='+lat+'&lon='+lon+'&appid='+apiKey+'&lang='+lang, this._parseData.bind(that));
			} else {
				var city = position;
				$.get(url+'q='+city+'&appid='+apiKey+'&lang='+lang, this._parseData.bind(that));
			}
		},

		_parseData: function(data) {
			console.log(data);
			var obj = this.store.weather;
			var fah = 273.15;
			obj.temp = data.main.temp - fah;
			obj.temp_min = data.main.temp_min - fah;
			obj.temp_max = data.main.temp_max - fah;
			obj.city = data.name;
			obj.country = data.sys.country;
			obj.weather_img = 'http://openweathermap.org/img/w/'+ data.weather[0].icon +'.png';
			this._renderData();
		},

		_renderData: function() {
			var obj = this.store.weather;
			console.log(obj.weather_img);
			var template = '<img class="weather__image" src="' + obj.weather_img + 
										 '" alt=""><div class="weather-location__name">' + obj.city + ', ' + obj.country +
										 '</div><div class="weather-temp"><div class="weather-temp__min">' + obj.temp_min + 
										 '</div><div class="weather-temp__max">' + obj.temp_max + '</div></div>';
			$('.weather').append(template);
			$('.weather-location__name').on('click', this._selectCity);
		},
	});
	$('.weather').weatherWidjet();
});



