var paraJack = {
	method: {
		run: null,
		pause: null,
		fomateTimeStr: null
	},
	dom:{
		getDomNodes: null,
		updateTimeShow: null,	//更新页面
		reset: null,
		setEvent: null
	}
};

(function(){
	var data = {
			breakTime: 5,
			sessionTime: 25,
			isInSession: true,

			timeLeft: 60,
			oldTime: 0,
			timeSpend: 0,

			timerId: null,
			isOn: false
		},
		nodes = {
			$timeShow: null,
			$left: null,
			$topInner: null,
			$botInner: null,
			$header: null,
			$control: null,
			$breakCtrl: null,
			$sessionCtrl: null,
			$piston: null,
			$playPause: null
		};
	paraJack.method.run = function(){
		data.isOn = true;	//现在开始进入计时状态
		data.oldTime = Date.now();	//记录当前时间

		nodes.$piston.fadeOut(1000); //隐藏球形塞
		nodes.$playPause.removeClass('glyphicon-play').addClass('glyphicon-pause');
		//切换播放图标到暂停图标
		
		paraJack.dom.updateTimeShow(data.timeLeft);	//用当前数据更新时长显示

		data.timerId = setInterval(function(){
			//每隔1s更新以此时间数据和页面显示
			
			var now = Date.now(),	//此刻时间
				total = (data.isInSession?data.sessionTime:data.breakTime)*60;	
				//当前倒计时时间段总时长
			data.timeSpend += now - data.oldTime;
			//此刻相对上次更新时刻经历时长，累加记录
			data.oldTime = now;	//存储现在的时刻
			data.timeLeft = Math.ceil(total - data.timeSpend/1000);	//剩余时长
			paraJack.dom.updateTimeShow(data.timeLeft);	//更具剩余时长显示
			if(data.timeLeft<=0){
				//当前倒计时时间段已倒计时完成
				//需要切换倒计时时间段、重置界面，开始新的倒计时
				//(当前间歇调用仍有效，所以只需重置数据与界面)
				data.isInSession = !data.isInSession;
				paraJack.dom.reset();
			}
		},1000);
	};

	paraJack.method.pause = function(){
		clearInterval(data.timerId);	//取消倒计时间歇调用
		data.isOn = false;	//退出倒计时状态

		var now = Date.now(), //此刻时间
			total = (data.isInSession?data.sessionTime:data.breakTime)*60;	
			//当前倒计时时间段总时长
		data.timeSpend += now - data.oldTime;
		data.timeLeft = Math.ceil(total - data.timeSpend/1000);

		nodes.$piston.fadeIn(1000);
		nodes.$playPause.removeClass('glyphicon-pause').addClass('glyphicon-play');
	};

	paraJack.method.fomateTimeStr = function(timeLeft){
		//将以秒为单位的时间转为xx:xx:xx形式显示的字符串
		if(typeof timeLeft === 'number' && timeLeft>= 0){
			var hour = ('0'+Math.floor(timeLeft/3600)).slice(-2),
				min = ('0'+Math.floor(timeLeft%3600/60)).slice(-2),
				sec = ('0'+Math.floor(timeLeft%60)).slice(-2);
			return (hour!=='00') ? 
					hour + ':' + min + ':' + sec : 
					min + ':' + sec;
		}else{
			return '00:00';
		}
	};

	paraJack.dom.getDomNodes = function(){
		//取得要程序中要使用的一些文档节点
		nodes.$timeShow = $('.time-show');
		nodes.$left = nodes.$timeShow.find('.left');
		nodes.$topInner = nodes.$timeShow.find('.top .inner');
		nodes.$botInner = nodes.$timeShow.find('.bot .inner');
		nodes.$header = $('header');
		nodes.$control = $('.control');
		nodes.$breakCtrl = nodes.$control.find('.break');
		nodes.$sessionCtrl = nodes.$control.find('.session');
		nodes.$piston = nodes.$timeShow.find('.piston');
		nodes.$playPause = nodes.$timeShow.find('.switch');
	};

	paraJack.dom.updateTimeShow = function(){
		//根据当前数据模型显示当前剩余时间文本及图形
		var total = (data.isInSession?data.sessionTime:data.breakTime)*60,
			topRatioStr = 100*data.timeLeft/total + '%',
			botRatioStr = (100-100*data.timeLeft/total) + '%';
		var timeLeft = paraJack.method.fomateTimeStr(data.timeLeft);
		nodes.$left.html(timeLeft);
		nodes.$topInner.css({
			height: topRatioStr
		});
		nodes.$botInner.css({
			height: botRatioStr
		});
	};

	paraJack.dom.reset = function(){
		//新的时间段倒计时前的数据和页面初始化
		
		//重置数据
		data.timeOld = Date.now();
		data.timeSpend = 0;
		data.timeLeft = 60*(data.isInSession?data.sessionTime:data.breakTime);

		nodes.$breakCtrl.find('.time-len').html(data.breakTime);
		nodes.$sessionCtrl.find('.time-len').html(data.sessionTime);		
		nodes.$left.html(paraJack.method.fomateTimeStr(data.timeLeft));
		nodes.$topInner.css({
			//上方液体满格状态
			height:'100%'
		});
		nodes.$botInner.css({
			//下方液体
			height: '0%'
		});

		//突出显示当前倒计时的时间段
		if(!!data.isInSession){
			nodes.$breakCtrl.removeClass('active');
			nodes.$sessionCtrl.addClass('active');
		}else{
			nodes.$breakCtrl.addClass('active');
			nodes.$sessionCtrl.removeClass('active');			
		}
	};

	paraJack.dom.setEvent = function(){
		nodes.$control.on('click','.break .add',function(){
			if(!data.isOn){
				data.breakTime += 1;
				paraJack.dom.reset();				
			}
		});
		nodes.$control.on('click','.break .minus',function(){
			if(!data.isOn){
				data.breakTime -= (data.breakTime>1?1:0);
				paraJack.dom.reset();
			}
		});
		nodes.$control.on('click','.session .add',function(){
			if(!data.isOn){
				data.sessionTime += 1;
				paraJack.dom.reset();				
			}
		});
		nodes.$control.on('click','.session .minus',function(){
			if(!data.isOn){
				data.sessionTime -= (data.breakTime>1?1:0);
				paraJack.dom.reset();
			}
		});
		nodes.$control.on('click','.swap',function(){
			if(!data.isOn){
				data.isInSession = !data.isInSession; 
				paraJack.dom.reset();				
			}
		});
		nodes.$timeShow.on('click','.switch',function(){
			if(data.isOn){
				paraJack.method.pause();			
			}else{
				paraJack.method.run();
			}
		});
	};
})();

$(document).ready(function(){
	paraJack.dom.getDomNodes();
	paraJack.dom.setEvent();
	paraJack.dom.reset();
});