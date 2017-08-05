var paraJack = {
	data:{
		missImg:'images/alt.jpg'
	},
	app:{
		init: null,
		handleAdd: null
	},
	localData: {
		push: null,
		getByName: null,
		getAllUsers: null,
		addByName: null
	},
	twitchApi: {
		getStreamByName: null,
		getChannelByName: null
	},
	dom: {
		getSearchInputStr: null,	//获取搜索内字符串，搜索框为关闭时返回空字符串
		getAddInputStr: null,	//获取添加主播输入框内字符串，输入框为关闭时返回空字符串
		update: null,	//根据内容显示类型和搜索字符串更新页面内容
		addOneListItem: null,
		getDisplayType: null,	//获取当前内容显示类型(online,offline,all)
		changeDisplayTypeTo: null,	//改变内容显示类型
		expand: null,
		shrink: null,
		setEvent: null
	}
};

(function(){
	var userNames = ["freecodecamp","esl_sc2", "storbeck", "terakilobyte", "habathcx","RobotCaleb","thomasballinger","noobs2ninjas","beohoff"],
		usersArr = [],
		displayedUsers = [],
		client_id = 'qsvynn7au1yjq86sx4f9trgksxxwqi',
		addInfo = {
			fail: 'Sorry, don\'t exist the streamer ',
			succeed: 'succeed!',
			exist: 'you cann\'t add a streamer already in the list, search for it please.'
		}
	//主播数组，每个元素是一个对象，包含一个主播的相关信息

	//压入一个主播详细信息对象
	paraJack.localData.push = function(streamerObj){
		if(streamerObj instanceof Object){
			if(usersArr.indexOf(streamerObj)<0){
				usersArr.push(streamerObj);
				return true;
			}
		}
		return false;
	};

	//根据主播名称获取其详细信息对象
	paraJack.localData.getByName = function(name){
		if(typeof name === 'string'){
			var len = usersArr.length;
			while(len-- > 0){
				if(name.toLowerCase() === usersArr[len].name){
					return usersArr[len];
				}
			}
		}
		return null;
	};

	//获取usersArr数组的副本
	paraJack.localData.getAllUsers = function(){
		return usersArr.concat();
	};

	//请求name的频道信息，并保存结果到本地数组usersArr中
	paraJack.localData.addByName = function(name,succeed,fail){
		//succeed是根据请求结果更新本地数据后调用的函数，如更新dom
		//fail则在请求失败时调用
		if(!paraJack.localData.getByName(name)){
			paraJack.twitchApi.getStreamByName(name,function(data){
				if(!!data.stream){
					//主播在线
					var stream = data.stream,
						channel = stream.channel,
						user = {
							online: true,
							name: channel.name,
							displayName: channel.display_name,
							logo: channel.logo,
							game: channel.game,
							status: channel.status,
							url: channel.url
						};
					paraJack.localData.push(user);
					if(!!succeed){
						(succeed)(user);
					}
				}else{
					//主播不在线
					paraJack.twitchApi.getChannelByName(name,function(data){
						var user = {
							online: false,
							name: data.name,
							displayName: data.display_name,
							logo: data.logo,
							game: data.game,
							status: data.status,
							url: data.url
						};
						paraJack.localData.push(user);
						if(!!succeed){
							(succeed)(user);
						}
					},fail);
				}
			},fail);
		}
	};


	paraJack.app.init = function(){
		var len = userNames.length,
			i = len,
			count = 0;

		paraJack.dom.setEvent();

		while(i-- > 0){
			paraJack.localData.addByName(userNames[i],function(){
				count++;
			},function(){
				count++;
			});
		}
		setTimeout(function(){
			if(count < len){
				setTimeout(arguments.callee,200);
			}else{
				paraJack.dom.changeDisplayTypeTo('all');
			}
		},200);
	};

	paraJack.app.handleAdd = function(){
		var str = paraJack.dom.getAddInputStr(),
			$info = $('section.add-info-jack'),
			$p = $info.find('p');
		if(!!paraJack.localData.getByName(str)){
			$p.html(addInfo.exist);
			$info
			.css({
				color: 'blue'
			})
			.slideDown(200);
		}else{
			if(!!str){
				paraJack.localData.addByName(str,function(data){
				
					$p.html(addInfo.succeed);
					$info
					.css({
						color: 'green'
					})
					.slideDown(200,function(){
						paraJack.dom.addOneListItem(data);

					});
		
				},function(){
					$p.html(addInfo.fail + '<span class="to-add">'+str+'</span>');
					$info.css({
						color: 'red'
					}).slideDown(200);
				});
			}
		}
	};


	//用twitchAPI获取主播信息
	paraJack.twitchApi.getStreamByName = function(name,succeed,fail){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if((xhr.status >=200 && xhr.status < 300)|| xhr.status === 304){
					var data = JSON.parse(xhr.responseText);
					if(!!succeed){
						(succeed)(data);						
					}
				}else{
					if(!!fail){
						(fail)(xhr);
					}					
				}
			}
		};
		xhr.open('get','https://api.twitch.tv/kraken/streams/' + name + '?client_id=' + client_id,true);
		xhr.send(null);
	};

	//用twitchAPI获取频道信息
	paraJack.twitchApi.getChannelByName = function(name,succeed,fail){
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function(){
			if(xhr.readyState === 4){
				if((xhr.status >=200 && xhr.status < 300)|| xhr.status === 304){
					var data = JSON.parse(xhr.responseText);
					// console.log(data);
					if(!!succeed){
						(succeed)(data);						
					}
				}else{
					if(!!fail){
						(fail)(xhr);
					}					
				}
			}
		};
		xhr.open('get','https://api.twitch.tv/kraken/channels/' + name + '?client_id=' + client_id,true);
		xhr.send(null);
	};



	paraJack.dom.getSearchInputStr = function(){
		var $searchItem = $('#search-item'),
			$form = $searchItem.find('form'),
			$input = $searchItem.find('input');
		return $form.hasClass('enabled-jack') ? 
				$input.val() : 
				''; 
	};

	paraJack.dom.getAddInputStr = function(){
		var $searchItem = $('#add-item'),
			$form = $searchItem.find('form'),
			$input = $searchItem.find('input');
		return $form.hasClass('enabled-jack') ? 
				$input.val() : 
				''; 
	};

	paraJack.dom.update = function(type,str){
		//按照指定方式更新dom，
		//type可选值：‘online’,'all','offline'
		//第二个参数str是用于过滤结果的文本（来自搜索框）,
		//传入空字符串或不传入第二个参数时则显示全部
		var users = paraJack.localData.getAllUsers();
		users = users.sort(function(val1,val2){
			return Number(val2.online) - Number(val1.online);
		});
		if(!!str){
			users = users.filter(function(val,index,arr){
				return val.name.toLowerCase().indexOf(str.toLowerCase())>=0;
			});
		}
		switch(type){
			case 'online':
				users = users.filter(function(val,index,arr){
					return val.online;
				});
				break;
			case 'all':
				users = users;
				break;
			case 'offline':
				users = users.filter(function(val,index,arr){
					return !val.online;
				});
				break;
		}

		var len = users.length,
			html = '',
			i= -1,
			temp = null;
		while(i++ < len-1){
			temp = users[i];
			html += '<li class="row' + (temp.online?' online':' offline') + 
			'"><div class="col-xs-3 logo"><img src="' + 
			(!!temp.logo?temp.logo:paraJack.data.missImg) + 
			'" alt="logo"></div><div class="col-xs-3 name"><a href="' + 
			temp.url + 
			'">' + temp.displayName + 
			'</a></div><div class="col-xs-6 detail">' + 
			((temp.online)?(temp.game + temp.status):'offline') + 
			'</div></li>'
		}
		$('ul.result').html(html);
	};

	paraJack.dom.addOneListItem = function(user){
		var html = '';
		html += '<li class="row' + (user.online?' online':' offline') + 
		'"><div class="col-xs-3 logo"><img src="' + 
		(!!user.logo?user.logo:paraJack.data.missImg) + 
		'" alt="logo"></div><div class="col-xs-3 name"><a href="' + 
		user.url + 
		'">' + user.displayName + 
		'</a></div><div class="col-xs-6 detail">' + 
		((user.online)?(user.game + user.status):'offline') + 
		'</div></li>';

		var $li = $(html).hide();
		$('ul.result').prepend($li);
		$li
		.animate({
			fontSize: '300%'
		},400)
		.animate({
			fontSize: '100%'
		},400)
		.fadeIn({
			duration: 200,
			queue: false
		})
	};
	paraJack.dom.setEvent = function(){
		var $switchItem = $('#switch-item'),
			$searchItem = $('#search-item'),
			$addItem = $('#add-item'),
			$info = $('section.add-info-jack')
		$switchItem.click('form div',function(event){
			var newType = $(event.target).text().toLowerCase();
			paraJack.dom.changeDisplayTypeTo(newType);
		});
		$searchItem.on('click','.disabled-jack .close-jack',function(){
			$searchItem.find('form').removeClass('disabled-jack');
			paraJack.dom.expand($searchItem);
		});
		$searchItem.on('click','.enabled-jack .close-jack',function(){
			$searchItem.find('form').removeClass('enabled-jack');
			paraJack.dom.shrink($searchItem);
			paraJack.dom.update(paraJack.dom.getDisplayType());
		});
		$addItem.on('click','.disabled-jack .close-jack',function(){
			$addItem.find('form').removeClass('disabled-jack');
			paraJack.dom.expand($addItem);
		});
		$addItem.on('click','.enabled-jack .close-jack',function(){
			$addItem.find('form').removeClass('enabled-jack');			
			paraJack.dom.shrink($addItem);
			$info.hide();
		});
		$searchItem.on('input propertychange','.enabled-jack input',function(){
			var type = paraJack.dom.getDisplayType(),
				str = paraJack.dom.getSearchInputStr();
			paraJack.dom.update(type,str);
		});
		$searchItem.on('submit',function(event){
			event.preventDefault();
		});
		$addItem.find('form').on('submit',function(event){
			event.preventDefault();
			paraJack.app.handleAdd();
		});
		$info.on('click','button',function(){
			$info.slideUp(200);
		});
	};

	paraJack.dom.getDisplayType = function(){
		var $activeDiv = $('#switch-item .active');
		switch(true){
			case $activeDiv.hasClass('online'):
				return 'online';
			case $activeDiv.hasClass('offline'):
				return 'offline';
			default: 
				return 'all';
		}
	};

	paraJack.dom.changeDisplayTypeTo = function(type){
		type = type.toLowerCase().trim();
		if(type !== 'online' && type !== 'offline'){
			type = 'all';
		}

		var $switchItem = $('#switch-item'),
			$oldDiv = $switchItem.find('.active'),
			$newDiv = $switchItem.find('.' + type);

		$oldDiv.removeClass('active');
		$newDiv.addClass('active');
		paraJack.dom.update(type,paraJack.dom.getSearchInputStr());
	};

	paraJack.dom.expand = function($li){
		var $form = $li.find('form'),
			$input = $li.find('input'),
			$close = $li.find('.close-jack'),
			$span = $close.find('span');
		$close
		.fadeOut(200,function(){
			$span.removeClass('glyphicon-search')
					.addClass('glyphicon-remove');

			$input.fadeIn(200,function(){
				$input.focus();
				$form
				.removeClass('disabled-jack')
				.addClass('enabled-jack');
			});

			$form.animate({
				width: '240px'
			},200);
		})
		.fadeIn(200)
		.animate({
			top: '-40px'
		},{
			duration: 300,
			queue: false,
		});

		
	};

	paraJack.dom.shrink = function($li){
		var $form = $li.find('form'),
			$input = $li.find('input'),
			$close = $li.find('.close-jack'),
			$span = $close.find('span');
		
		$input.fadeOut(200,function(){
			$input.val('');
		});

		$form.animate({
			width: '38px'
		},200,function(){
			$close
			.fadeOut(200,function(){
				$span.removeClass('glyphicon-remove')
						.addClass('glyphicon-' + (($li.attr('id').indexOf('search')>=0)?'search':'plus'));
				$form
				.removeClass('enabled-jack')
				.addClass('disabled-jack');
			})
			.fadeIn(200)
			.animate({
				top: '5px'
			},{
				duration: 300,
				queue: false,
			});
		});
		
		
	};
})();

$(document).ready(function(){
	paraJack.app.init();
});