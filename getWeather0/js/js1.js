var paraJack = {
	city: '',
	appKey:'55da8fb5538653dfd3e1ee8cefa0f1ec',
	baiduKey: 'EVV9HReuZge80hLR4jlpHyHE2Bd3yrgb'
};

$(document).ready(function(){	
	setEventHandler();
	//设置几个按钮的事件处理程序

	init();	
	//调用新浪地理位置api获取当前ip地理位置，
	//再利用聚合数据天气预报API查询该地理位置天气情况并更新页面
});

function init(){
//调用新浪/百度地理位置api获取当前ip地理位置，
//若成功取得了地理位置，再利用聚合数据天气预报API查询该地理位置天气

/*	//这是新浪地理位置api,不支持https
	$.getScript('http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=js', function(_result) {
		//该请求返回js脚本，脚本中会把地理位置信息赋给remote_ip_info变量
            if (remote_ip_info.ret == '1') {
            	//成功获取到了地理位置
            	paraJack.city = remote_ip_info.city;
				$('#today .dropdown .city').html(paraJack.city);
            	updateWeatherAt(paraJack.city);
            }
    	});
*/
   
 	//这是百度地理位置api,支持https
	var city = new BMap.LocalCity();
	city.get(function(result){
		var cityName = result.name;
		if(cityName.charAt(cityName.length-1) === '市'){
			cityName = cityName.slice(0,cityName.length-1);
		}
		paraJack.city = cityName;
		$('#today .dropdown .city').html(paraJack.city);
		updateWeatherAt(paraJack.city);
	});
}

function setEventHandler(){
	$('#fail-info').on('click','button',function(){
		//在获取天气请求失败的提示信息窗口中，
		//点击任意按钮时，关闭提示信息窗口
		$('#fail-info').hide();
	});
	$('#fail-info').on('click','.change',function(){
		//在获取天气请求失败的提示信息窗口中，
		//点击“更改位置”按钮时，显示手动修改位置输入框
		setTimeout(function(){$('#today .dropdown-toggle').trigger('click')},100);
	});
	$('#today').on('click','#modify button',function(){
		//用户已手动输入了地理位置
		updateLocation();
		updateWeatherAt($('#today .dropdown .city').html());
	});
}

function updateWeatherAt(location){
//location是待查询天气的地理位置名称（城市名）
//利用聚合数据的天气预报API查询某地理位置的天气

	$.getJSON('https://v.juhe.cn/weather/index?format=2&cityname=' + encodeURIComponent(location) + '&key='+paraJack.appKey + '&callback=?',function(data){
		if(data.resultcode && data.resultcode === '200'){
			//成功获得该地理位置天气信息，更新页面所有相关部分内容
			updateDom(data);
		}else{
			//请求失败
			handleFalse();
		}		
	});
}

function handleFalse(){
//显示请求失败提示窗口
	$('#fail-info').show();
}

function updateDom(weather){
//根据获取到的天气信息，更新页面所有相关部分内容
	var today = weather.result.today,
		future = weather.result.future,
		$weatherSpan = $('#today div.weather span'),
		$tr = $('#today table tr'),
		$nextSixDays =  $('#future .row');

	//更新日期和时间
	$('#today div.info .time').html(today.date_y + ' ' + today.week);

	var weatherId = [parseInt(today.weather_id.fa),parseInt(today.weather_id.fb)],
		current =  new Date(Date.now());
		currentHour = current.getHours(),
		isInDay = (currentHour>=6 && currentHour<18);

	//更新当日主要天气情况
	$weatherSpan.eq(0).html(getWeatherImgHtml(isInDay,weatherId[0],weatherId[1]));
	$weatherSpan.eq(1).html(today.weather);
	$weatherSpan.eq(2).html(today.temperature);
	$weatherSpan.eq(3).html(today.wind);

	//更新当日天气附加信息
	$tr.eq(0).find('td:last-child').html(today.dressing_index);
	$tr.eq(1).find('td:last-child').html(today.wash_index);
	$tr.eq(2).find('td:last-child').html(today.travel_index);
	$tr.eq(3).find('td:last-child').html(today.exercise_index);
	$tr.eq(4).find('td:last-child').html(today.uv_index);

	//更新未来6日天气信息
	$('#future p.day-range').html(future[1].date + ' - ' + future[6].date);
	for(var i = 0; i<6; i++){
		var $div = $nextSixDays.find('div:eq('+i+')'),
			$p = $div.find('p');
			theDay = future[i+1],
			imgHtml = getWeatherImgHtml(true,parseInt(theDay.weather_id['fa']),parseInt(theDay.weather_id['fb']));
		$div.find('h3').html(theDay.week);

		$p.eq(0).html(imgHtml);
		$p.eq(1).html(theDay.weather);
		$p.eq(2).html(theDay.temperature);
		$p.eq(3).html(theDay.wind);
	}
}

function getWeatherImgHtml(isInDay,num1,num2){
//根据某天的天气情况生成表示天气情况的html内容(一个img元素，或者两个用'~'字符连接的img元素)字符串，如'<img src="url" alt="">'
//isInDay 是否是白天，num1和num2是两个表示天气的数字id，
//非组合天气时id时传入两个相同的数字
	var str1 = '<img src="https://jacktown11.github.io/images/weather/' + 
		(isInDay?'day/':'night/') + ('0'+num1).slice(-2) +  
		'.png" alt="" />',
		str2 = '<img src="https://jacktown11.github.io/images/weather/' + 
		(isInDay?'day/':'night/') + ('0'+num2).slice(-2) +  
		'.png" alt="" />';
	return (num1 === num2)?str1:(str1 + '~' + str2);
}

function updateLocation(){
//用户手动输入了地理位置时，更新页面上的地理位置显示

	var $dropdown = $('#today .dropdown'),
		$input = $dropdown.find('input'),
		city = $input.val().trim();
	if(!!city){
		//省和市名称都非空，那么更新当前地点
		$dropdown.find('.city').html(city);
	}
}
