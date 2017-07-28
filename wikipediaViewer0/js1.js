var paraJack = {
	wikiItemBaseUrl: 'https://en.wikipedia.org/wiki/',
	resultNum: 12
}

$(document).ready(function(){
	setEventHandler();
});

function setEventHandler(){
	//点击搜索图标，动画展开搜索栏
	$('div.input-box-wrap').on('click','.collpased',function(event){
		expandSearchInput();
	});

	//点击输入框末尾的叉，动画折叠搜索栏为搜索图标
	//注意：接受点击的是覆盖在有形叉上的一个30*30的透明方块.shrink
	$('div.input-box-wrap').on('click','.shrink',function(event){
		shrinkSearchInput();
	});

	//提交搜索文本，利用wikipedia的API进行搜索，展示结果
	$('form').on('submit',function(event){
		event.preventDefault();

		var $search = $('#search'),
			searchStr = $search.find('input').val();	//输入的搜索文本

		//将搜索栏移动到顶部，隐藏'点击搜索图标'提示文本
		$search.animate({
			marginTop: '0px'
		},200);
		$('form>p').hide();

		//根据输入文本发出搜索请求，在回调函数中展示结果
		$.getJSON('https://en.wikipedia.org/w/api.php?action=query&titles=' + encodeURIComponent(searchStr) + '&action=query&format=json&list=search&srsearch=' + encodeURIComponent(searchStr) + '&srlimit=' + paraJack.resultNum + '&srprop=snippet&callback=?',function(data){
				genResultDom(paraJack.resultNum);
				//根据需要的结果数量填充dom结构
				
				var $anchors = $('#result a');
				$.each(data.query.search,function(index,val){
					//根据结果修改Dom
					
					var $theAnchor = $anchors.eq(index),
						$p = $theAnchor.find('p'),
						$h2 = $theAnchor.find('h3'),
						title = val.title,	//结果项标题
						snippet = val.snippet;	//结果项内容提要
					$h2.html(title);
					$p.html(snippet);
					$theAnchor.attr({
						href: paraJack.wikiItemBaseUrl + title
						//用结果项标题生成URL
					});
				});
				$('#result').show();	//显示结果
		});
	});
}

function genResultDom(resultNum){
	if(typeof resultNum === 'number'){
		var $result = $('#result'),
			$ul = $result.html('<ul></ul>').find('ul');
		for(var i = 0; i<resultNum; i++){
			$ul.append($('<li><a href="" target="_blank"><h3></h3><p></p></a></li>'));
		}
	}
}

function expandSearchInput(){
//点击搜索图标，动画展开搜索栏

	var $result = $('#result'),
		$form = $('form'),
		$inputBoxWrap = $form.find('div.input-box-wrap'),
		$inputBox = $inputBoxWrap.find('div.input-box'),
		$tail = $inputBoxWrap.find('div.tail'),
		$up = $inputBox.find('div.up'),
		$down = $inputBox.find('div.down'),
		$shrink = $inputBox.find('div.shrink'),	
		//$shrink是覆盖在搜索框末尾'关闭叉'上的30*30的方块，用于接受关闭点击事件
		$input = $inputBox.find('input');

	$tail
	.animate({
		width: '0px'	//缩短搜索图标尾巴到0
	},200,function(){
		//水平展开输入框包含块
		$inputBox.animate({
			width: '200px',
			padding: '0px 45px 0px 15px'
		},200,function(){
			//将输入框包含块末尾的叉滑入输入框内（原来的位置$inputBox之外，而$inputBox的overflow属性设置为了hidden）
			$up.animate({
				top: '15px',
				right: '15px'
			},200);
			$down.animate({
				top: '15px',
				right: '15px'
			},200,function(){
				//显示输入框本身并获取焦点，
				//将输入框包含块设置为collapse类（在有该类的输入框包含块中点击才会触发收缩动画，因此在展开动画进行到此位置之前是不可能通过点击'关闭叉'上透明方块来运行收缩动画的）
				$input.show().focus();
				$inputBox.removeClass('collpased');
				$shrink.show();	
				//显示用于接受'折叠搜索栏'点击的'关闭叉'上的透明方块			
			});
		});
	});
	// $tail
	// .animate({
	// 	width: '0px'
	// },2000)
	// .queue(function(next){
	// 	$inputBox.animate({
	// 		width: '200px',
	// 		padding: '0px 45px 0px 15px'
	// 	},2000);
	// 	next();
	// })
	// .queue(function(next){
	// 	$up.animate({
	// 		top: '15px',
	// 		right: '15px'
	// 	},1000);
	// 	$down.animate({
	// 		top: '15px',
	// 		right: '15px'
	// 	},1000);
	// 	$input.show().focus();
	// 	$inputBox.removeClass('collpased');
	// 	$shrink.show();
	// 	next();
	// });	

	// $tail
	// .queue([
	// 	function(){
	// 		$tail.animate({
	// 			width: '0px'
	// 		},2000)
	// 	},
	// 	function(){
	// 		$inputBox.animate({
	// 			width: '200px',
	// 			padding: '0px 45px 0px 15px'
	// 		},2000);
	// 	},
	// 	function(){
	// 		$up.animate({
	// 			top: '15px',
	// 			right: '15px'
	// 		},1000);
	// 		$down.animate({
	// 			top: '15px',
	// 			right: '15px'
	// 		},1000);
	// 		$input.show().focus();
	// 		$inputBox.removeClass('collpased');
	// 		$shrink.show();			
	// 	}	
	// ]);
	// console.log($tail.queue());


	// //方法1：可以ABC动画依次执行
	// $A.animate({},time,function(){
	// 	$B.animate({},time,function(){
	// 		$C.animate({},time);
	// 	});
	// });

	// //方法2：A执行后，BC一起执行
	// $A
	// .animate({},time)
	// .queue(function(next){
	// 	$B.animate({},time);
	// 	next();
	// })
	// .queue(function(next){
	// 	$C.animate({},time);
	// 	next();
	// });

	// //无反应
	// $A.queue([
	// 	function(){
	// 		$A.animate({},time);
	// 	},
	// 	function(){
	// 		$B.animate({},time);
	// 	},
	// 	function(){
	// 		$C.animate({},time);
	// 	}
	// ]);	
}

function shrinkSearchInput(){
//点击输入框末尾的叉，动画折叠搜索栏为搜索图标

	var $result = $('#result'),
		$form = $('form'),
		$p = $('form>p'),
		$inputBoxWrap = $form.find('div.input-box-wrap'),
		$inputBox = $inputBoxWrap.find('div.input-box'),
		$tail = $inputBoxWrap.find('div.tail'),
		$up = $inputBox.find('div.up'),
		$down = $inputBox.find('div.down'),
		$shrink = $inputBox.find('div.shrink'),
		$input = $inputBox.find('input');

	//清空输入框内容，显示点击提示文本，隐藏之前的搜索结果
	$input.val('');
	$p.show();
	$result.hide();

	$('#search').animate({
		marginTop: '200px'
	},200);

	$up.animate({
			top: '-10px',
			right: '-10px'
		},200);

	$down.animate({
		top: '40px',
		right: '-10px'
	},200,function(){
		$inputBox.animate({
			width: '30px',
			padding: '0px'
		},200,function(){
			$tail.animate({
				width: '30px'
			},200);
			$input.hide();	//隐藏搜索框
			$inputBox.addClass('collpased');
			$shrink.hide();	//隐藏接受‘收缩搜索栏’点击的透明块
		});
	});
}
