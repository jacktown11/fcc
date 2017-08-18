/*
game: simon
author: jacktown(https://jacktown11.github.io/)
time: 20170818
tech: web audio api(if not supported, just use audio element )

状态： 
dead: 游戏开关未打开，不能进行任何有效操作
silence: 游戏开关已打开，但是还未开始游戏
show: 显示一串色块
wait: 接受一串色块
error: 输入错误的提示阶段
win: 玩家输入了20个色块，获得胜利，显示提示

重要数据：
当前状态
当前模式
色块串显示数组
色块串接受数组
当前显示色块在数组中的索引
不同色块串程度的显示速度(高亮时间、间隔时间)
显示色块的超时调用id

流程：
1)游戏一开始处于dead，打开游戏开关进入silence;
2)点击start按钮，进入show(1个色块);
3)show完毕自动进入wait，等该玩家输入；
4)wait时如果玩家及时输入正确，进入下一轮show(如果已完成20轮，进入win),如果玩家输入错误或超时，进入error；
5)error完毕，进入show，如果是严格状态需要重置为show（1个色块）；
6)win完毕，进入silence;
以下是强制流程：
1)任何时候关闭游戏开关，进入dead状态；
2)非dead时，点击开始游戏，进入show（1个色块）
3)非dead时，可以修改游戏模式（normal/strict）

 */

var paraJack = {
	game: {
		newGame: null,	//点击开始按钮，开始新已经游戏
		open: null,	//打开游戏总开关
		close: null,	//关闭游戏总开关
		showList: null,	//向玩家显示一串色块
		waitList: null,	//等待接收玩家点击输入
		handleError: null,	//玩家输入错误或超时处理
		handleClick: null,	//玩家点击色块实际处理程序
		showNth: null,	//向玩家显示色块序列中第n个（从0起始）
		genList: null,	//生成20个色块序列	
		getRandomInt: null,	//生成一个随机整数
		playMusic: null,	//播放音乐
		stopMusic: null,	//停止音乐
		showSuccess: null,	//向玩家显示胜利标识
		enableClick: null,	//让所有色块可接受点击
		disableClick: null,	//让所有色块不可接受点击
		countShow: null	//在显示窗口显示色块数目
	},
	dom: {
		setEvent: null,	//设置事件处理程序
		getNodes: null	//获取常用的节点
	},
	osc: {
		init: null,	//创建web audio上下文，如果不支持则添加响应audio元素
		play: null,	//创建并播放振荡器
		stop: null	//关闭振荡器
	}
};
(function(){
	var data = {
			states: ['dead','silent','show','wait','error','win'],	//all possible states
			colors: ['red','blue','green','yellow'],
			stateIndex: 0,	//current state index
			mode: 'normal',	//当前模式
			show: [],	//需要显示的色块序列
			get: [],	//接受的色块序列
			curListCount: 0,	//当前显示/接受序列长度
			curIndex: -1,	//当前正在显示或接受的色块索引
			timerId:{
				showTimeout: 0,
				waitTimeout: 0,
				errorTimeout: 0
			},
			computerSpeed: [{
				show: 600,
				gap: 600
			},{
				show: 400,
				gap: 400
			},{
				show: 200,
				gap: 200
			}],	//向玩家显示时的速度
			threshold:[8,12],	//速度加快的节点，0起始
			opacity:{
				//原始与高亮情况下的色块透明度
				original: '0.7',
				full: '1'
			},
			checkGap: 500,	//没经过该时间段检查一次玩家点击序列
			hasAudioCtx: !!(window.AudioContext || window.webkitAudioContext),
			audioCtx: null,	//web api环境
			oscFreqs: {
				red: 300,
				blue: 400,
				green: 500,
				yellow: 600
			},	//web audio oscillator frequecies
			osc: null	//振荡器
		},
		nodes = {
			$main: null,
			$red: null,
			$blue: null,
			$green: null,
			$yellow: null,
			$coontrol: null,
			$count: null,
			$start: null,
			$mode: null,
			$modeSlide: null,
			$onOff: null,
			$onOffSlide: null,
			$mp3: null
		};
	// init audio context
	paraJack.osc.init = function(){
		if(data.hasAudioCtx){
			//支持web audio,创建环境
			data.audioCtx = new(window.AudioContext || window.webkitAudioContext);
		}else{
			//不支持web audio，使用MP3代替
			var html = 
		'<audio id="red"><source src="mp3/red.mp3" type="audio/mpeg"><source src="mp3/red.wav"></audio>'+
		'<audio id="blue"><source src="mp3/blue.mp3" type="audio/mpeg"><source src="mp3/blue.wav"></audio>'+
		'<audio id="green"><source src="mp3/green.mp3" type="audio/mpeg"><source src="mp3/green.wav"></audio>'+
		'<audio id="yellow"><source src="mp3/yellow.mp3" type="audio/mpeg"><source src="mp3/yellow.wav"></audio>'+
		'<audio id="error"><source src="mp3/error.mp3" type="audio/mpeg"><source src="mp3/error.wav"></audio>';
			nodes.$mp3.html(html);
		}
	};
	paraJack.osc.play = function(fre){
		if(data.hasAudioCtx){
			if(!!data.osc){
				//开启新输出时先停掉之前音源
				data.osc.stop();
			}
			data.osc = data.audioCtx.createOscillator();	//创建振荡器
			data.osc.frequency.value = fre;	//默认情况采用红色块的频率
			data.osc.connect(data.audioCtx.destination);	//连接到输出端
			data.osc.start();
		}
	};
	paraJack.osc.stop = function(){
		if(data.hasAudioCtx){
			data.osc.stop();
		}
	};
	paraJack.game.newGame = function(){
		paraJack.game.disableClick();//关闭各色块点击接收能力
		paraJack.game.countShow('--','bling');//清零计数窗口

		//清空当前可能在执行中的间歇调用
		clearTimeout(data.showTimeout);
		clearTimeout(data.waitTimeout);

		//完全重新生成20个色块序列，开始游戏
		setTimeout(function(){
			paraJack.game.genList();
			paraJack.game.showList(1);
		},1000);	//1000ms等待bling显示‘--’
	};
	paraJack.game.open = function(){
		//打开游戏总开关

		//启用开始按钮和模式控制按钮
		nodes.$start.addClass('active');
		nodes.$mode.find('.slide').addClass('active');
		paraJack.game.disableClick();
		data.stateIndex = 1;
		//让计数窗口显示--，表示其已被启用
		paraJack.game.countShow('--','still');
	};
	paraJack.game.close = function(){
		//关闭游戏总开关
		
		//关闭开始按钮和模式控制按钮,模式显示为普通模式
		nodes.$start.removeClass('active');
		nodes.$mode.find('.slide').removeClass('active');
		nodes.$mode.find('.inner').removeClass('strict');

		//关闭各色块点击接收能力
		nodes.$red.removeClass('active');
		nodes.$blue.removeClass('active');
		nodes.$green.removeClass('active');
		nodes.$yellow.removeClass('active');

		//清空计数窗口
		paraJack.game.countShow('','still');

		//清空当前可能在执行中的间歇调用
		clearTimeout(data.showTimeout);
		clearTimeout(data.waitTimeout);

		//更新数据模型
		data.stateIndex = 0;	//dead
		data.mode = 'normal';
		show = [];
		get = [];
	};
	paraJack.game.showList = function(num){
		//显示前num个色块
		
		data.stateIndex = 2;	//进入显示色块状态
		paraJack.game.countShow(num,'still');	//静态显示当前色块数目
		data.curListCount = num; //当前显示的色块序列中色块数目
		data.curIndex = 0;	//当前显示的色块索引
		paraJack.game.disableClick();//关闭各色块点击接收能力

		var showABlock = function(){
			
			var gap = (num<data.threshold[0])?data.computerSpeed[0].gap:
				(num<data.threshold[1]?data.computerSpeed[1].gap:data.computerSpeed[2].gap),
				show = (num<data.threshold[0])?data.computerSpeed[0].show:
				(num<data.threshold[1]?data.computerSpeed[1].show:data.computerSpeed[2].show);
			if(data.curIndex < num){
				paraJack.game.showNth(data.curIndex++,show);	//高亮色块和触发对应声音
			}
			if(data.curIndex < num){
				//还未完成序列显示
				//间隔gap+show时间后，显示下一个色块
				data.showTimeout = setTimeout(arguments.callee,gap+show);
			}else{
				//当前序列显示完成,show时间以后（等待最后一个色块显示完成）等待用户输入
				data.showTimeout = setTimeout(function(){
					paraJack.game.waitList(num);
				},show);
			}
		};
		data.showTimeout = setTimeout(showABlock,1000);
	};
	paraJack.game.waitList = function(num){
		//接收玩家点击序列

		//清空接受序列，启用色块接受点击的功能
		data.stateIndex = 3;	//进入色块接收状态
		data.get = [];
		data.curIndex = -1;
		paraJack.game.enableClick();

		var curIndexOld = -1,	//上次检查时所点击的色块数目，主要用于检测用户是否超时
			timePass = 0;
		var check = function(){
			//检查当前色块接收情况

			if(data.stateIndex === 3){
				//当前没有因某次用户输入错误而跳出接收状态
				//这隐含此时所有输入是完全正确的(错误点击在点击处理函数中就被解决了)			
				if(data.curIndex < num-1){
					//还有待点击色块
					if(data.curIndex === curIndexOld && timePass >= 5500){
						//连续6秒内没有输入，玩家输入超时
						paraJack.game.handleError();					
					}else{
						if(data.curIndex === curIndexOld){
							//与上次检查相比没有新输入
							timePass += 500;
						}else{
							//相比上次检查有新输入
							timePass = 0;
							curIndexOld = data.curIndex;	//保存当前点击的色块索引
						}
						data.waitTimeout = setTimeout(arguments.callee,data.checkGap);
						//一段时间后再来检查是否有新的点击
					}	
				}else{
					//当前序列点击已成功完成
					if(num === 20){
						//当前已完成长度为20的序列，玩家取得胜利
						paraJack.game.showSuccess();
						paraJack.game.open();	// to silence
					}else{
						//开启下一个序列的显示
						paraJack.game.showList(++data.curListCount);
					}
				}
			}
		};
		data.waitTimeout = setTimeout(check,data.checkGap);
	};
	paraJack.game.handleError = function(){
		//用户点击错误或超时
		
		data.stateIndex = 4;	//进入error状态
		paraJack.game.disableClick();//关闭色块接收点击能力

		paraJack.game.stopMusic();	//停止可能还存在的音乐
		nodes.$main.find('.color-block').each(function(){
			$(this).css({
				opacity: data.opacity.original
			});
		});	//让所有色块恢复初始颜色
		paraJack.game.countShow('!!','bling');	//在显示栏闪烁显示叹号
		paraJack.game.playMusic('error');
		data.timerId.errorTimeout = setTimeout(function(){
			//等待上面的错误叹号显示和音乐结束
			if(data.mode === 'normal'){
				//正常模式，重新显示当前序列
				paraJack.game.showList(data.curListCount);
			}else{
				//严格模式，完全从长度1开始显示序列
				data.curListCount = 1;
				paraJack.game.showList(1);
			}
		},1000);
	};
	paraJack.game.handleClick = function(id){
		//处理玩家对色块的点击事件
		data.get.push(id);
		data.curIndex += 1;
		if(data.show[data.get.length-1] !== id){
			//当前输入错误
			paraJack.game.handleError();
		}
	};
	paraJack.game.showNth = function(nth,show){
		//显示第nth个色块，0起始,显示时长ｓｈｏｗ
		
		nodes['$'+data.show[nth]]	
		.fadeTo(10,data.opacity.full,function(){
			paraJack.game.playMusic(data.show[nth]);
		})	//10ms内达到高亮,开始播放音乐
		.fadeTo(show-10,data.opacity.full,function(){
			$(this).css({
				opacity: data.opacity.original
			});
			paraJack.game.stopMusic(data.show[nth]);
		});	//持续show-10ms，然后恢复初始亮度，停止音乐
	};
	paraJack.game.genList = function(){
		//生成一个长度为20的随机色块串
		data.show = [];
		for(var i = 0; i< 20; i++){
			data.show.push(data.colors[paraJack.game.getRandomInt(0,3)]);		
		}
	};
	paraJack.game.getRandomInt = function(low,high){
		return Math.floor(Math.random()*(high - low + 1) + low);
	};
	paraJack.game.playMusic = function(id){
		if(data.hasAudioCtx && id !== 'error'){
			paraJack.osc.play(data.oscFreqs[id]);
		}else{
			nodes.$mp3.find('#'+id)[0].play();		
		}
	};
	paraJack.game.stopMusic = function(id){
		if(data.hasAudioCtx){
			paraJack.osc.stop();
		}
		if(!data.hasAudioCtx || id === 'error'){
			if(id !== undefined){
				//stop specific sound
				var sound = nodes.$mp3.find('#'+id)[0];	
			}else{
				//stop all sound
				var sound = null,
					ids = data.colors.concat('error');	
				for(var i = 0; i < ids.length; i++){
					sound = nodes.$mp3.find('#'+ids[i])[0];			
					sound.pause();			
					sound.currentTime = 0;				
				}
			}
		}
	};
	paraJack.game.showSuccess = function(){
		$('div.success').slideDown();
	};
	paraJack.game.enableClick = function(){
		nodes.$red.addClass('active');
		nodes.$blue.addClass('active');
		nodes.$green.addClass('active');
		nodes.$yellow.addClass('active');
	};
	paraJack.game.disableClick = function(){
		nodes.$red.removeClass('active');
		nodes.$blue.removeClass('active');
		nodes.$green.removeClass('active');
		nodes.$yellow.removeClass('active');
	};
	paraJack.game.countShow = function(str,style){
		//显示色块数目，str是显示内容，通常是‘01’-‘20’，‘--’，‘!!’
		//style是显示方式，‘still’为静止显示，‘bling’为两次闪烁

		if(style === 'still'){
			//静止显示
			nodes.$count.find('span').html(str);
		}else{
			//闪烁显示
			var span = nodes.$count.find('span');
			span.html(str);
			span
			.fadeToggle(200)
			.fadeToggle(200)
			.fadeToggle(200)
			.fadeToggle(200);
		}
	};
	paraJack.dom.setEvent = function(){
		var color = ['red','blue','green','yellow'];
		for(var i = 0; i < color.length; i++){
			(function(id){
				nodes.$main.on('mousedown','.'+id+'.active',function(){
					nodes['$'+id].css({
						opacity: 1
					});
					paraJack.game.playMusic(id);
				});
				nodes.$main.on('mouseup','.'+id+'.active',function(){
					nodes['$'+id].css({
						opacity: 0.7
					});
					paraJack.game.stopMusic(id);
					paraJack.game.handleClick(id);
				});
			})(color[i]);
		}

		nodes.$mode.on('click','.slide.active',function(){
			//模式切换
			$(this).find('.inner').toggleClass('strict');
			data.mode = (data.mode==='strict')?'normal':'strict';
		});
		nodes.$onOff.on('click','.slide',function(){
			//游戏总开关
			$(this).find('.inner').toggleClass('on');
			if(data.stateIndex !== 0){
				//当前游戏处于开启状态
				data.stateIndex = 0;	//to dead
				paraJack.game.close();	//关闭游戏
			}else{
				//当前游戏处于关闭状态
				data.stateIndex = 1;	//to silcence
				paraJack.game.open();	//打开游戏
			}
		});
		nodes.$control.on('click','.start.active',function(){
			//在非dead状态下，重新开始游戏
			paraJack.game.newGame();
		});

		$('.success button').on('click',function(){
			//胜利页面关闭按钮
			$('div.success').hide();
		});
	};
	paraJack.dom.getNodes = function(){
		nodes.$main = $('.main');
		nodes.$red = nodes.$main.find('.red');
		nodes.$blue = nodes.$main.find('.blue');
		nodes.$green = nodes.$main.find('.green');
		nodes.$yellow = nodes.$main.find('.yellow');
		nodes.$control = nodes.$main.find('.control');
		nodes.$count = nodes.$control.find('.count');
		nodes.$start = nodes.$control.find('.start');
		nodes.$mode = nodes.$control.find('.mode');
		nodes.$modeSlide = nodes.$mode.find('.slide');
		nodes.$onOff = nodes.$control.find('.on-off');
		nodes.$onOffSlide = nodes.$onOff.find('.slide');
		nodes.$mp3 = $('.mp3');
	};
})();

$(document).ready(function(){
	paraJack.dom.getNodes();
	paraJack.dom.setEvent();
	paraJack.osc.init();
});