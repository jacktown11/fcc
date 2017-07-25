$(window).on('resize',function(){
	'use strict';
	var element = document.getElementById('banner'),
		eleHeight = 0,	//banner 高度
		eleTop = 0,	//banner top css属性值
		docHeight = 0,	//文档总高度
		winHeight = 0,	//视口高度
		winScrollCurrent = 0,	//页面高度当前总滚动量
		winScrollBefore = 0,	//页面高度上次总滚动量
		winScrollDiff = 0;	//页面高度滚动量增量
	$(window).on('scroll',function(){
		//向下滚动时表明展示不需要导航条，收起
		//向上滚动时可能要使用导航条，展开
		//接近页面底部时，打开导航条，方便跳转
		
		$('.navbar-collapse').collapse('hide');
		//bootstrap css collapse插件，隐藏部件
		$('.navbar-toggle').addClass('collapsed').blur();

		if($(window).width() <= 768){
			//只作用与窄屏，宽屏在css有相关标识为important的规则，即使if外的语句不会影响它们
			eleHeight = element.offsetHeight;
			docHeight = Math.max(document.documentElement.scrollHeight ||   document.documentElement.clientHeight);
			winHeight = window.innerHeight || 
				document.documentElement.clientHeight || 
				document.body.clientHeight;
			winScrollCurrent = (window.pageYOffset !== undefined)
			 ? window.pageYOffset
			 : (document.documentElement || 
			 	document.body.parentNode || 
			  	document.body).scrollTop;
			winScrollDiff = winScrollBefore - winScrollCurrent;
			eleTop = parseInt(window.getComputedStyle(element).getPropertyValue('top')) + winScrollDiff;

			if(winScrollCurrent <= 0){
				// at the very top
				element.style.top = '0px';
			}else if(winScrollDiff > 0){
				//scroll up
				element.style.top = (eleTop>0? 0 : eleTop) + 'px';
			}else if(winScrollDiff < 0){
				//scroll down
				if(winScrollCurrent + winHeight >= 
					docHeight - eleHeight){
					//已经接近页面底部
					element.style.top = ((eleTop = winScrollCurrent + winHeight -docHeight)<0 ? eleTop : 0) + 'px';
				}else{
					//还未接近页面底部
					element.style.top = (Math.abs(eleTop) > eleHeight ? -eleHeight : eleTop) + 'px';
				}
			}
			winScrollBefore = winScrollCurrent;
		}else{
			//大屏永不隐藏导航栏
			element.style.top = '0px';
		}
	});
}).resize();

//随着页面滚动位置，高亮相应导航项
$('body').scrollspy({target:'.navbar-fixed-top'});

//在点击某个导航链接后，关闭导航条内导航列表
$('.navbar-collapse ul li a').click(function(){
	$('.navbar-collapse').collapse('hide');
});

//点击导航链接时，启用动画跳转到相应位置
//采用了jqeury ease插件，该插件扩展了缓动函数，使用上增加了缓动函数选项的可选字符串而已
$(document).ready(function(){
	$('body').on('click','a.scrollable',function(event){
		var $anchor = $(this);
		$('html, body').stop().animate({scrollTop:$($anchor.attr('href')).offset().top},1500,'easeInOutExpo');
		event.preventDefault();
	});
});

//联系表单效果
$(document).ready(function(){
	$('body')
	.on('input propertychange','.form-item',function(event){
		//这里采用jquery实现了多事件绑定，
		//等效于分别绑定到同一个函数
		//propertychange事件用于低版本ie（8-）兼容
		$(this).toggleClass('form-item-filled',!!$(event.target).val());
	})
	.on('focus','.form-item',function(){
		$(this).addClass('form-item-focused');
	})
	.on('blur','.form-item',function(){
		$(this).removeClass('form-item-focused');
	})
	;
});