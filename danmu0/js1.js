var data = {
	body: document.body,
	container: document.getElementById("danmu"),
	topStep: 40,	//danmu element's top position step
	danmuHeight: "25px",
	rightPosMax: "120",	//%
	lastDanmuPos: 9,
	//last danmu position(from top to bottom, the pos is from 0 to 9)
	content: new Array(300),	//to store the last 300 danmu content
	contentLen: 0, 
	contentLenMax: 300,
	divs: new Array(300)	//to store the reference to the danmu divs
};

window.onload = function(){
	activateDanmu();
};
function activateDanmu(){
	//get relavent elements
	var tempStr = "abcdefghijklmnopqrstuvwxyz",
		tosay = document.getElementById("tosay"),
		submit = document.getElementById("submit"),
		clear = document.getElementById("clear");

	//open the default danmu
	for(var i = 0;i < 26; i++){
		pushContent(tempStr.slice(i));
	}
	var timerId = setTimeout(function(){
		var order = getRandomInt(0,Math.abs(data.contentLen-1)),
			content = data.content[order];
		showOneDanmu(content,getRandomColorStr());
		timerId = setTimeout(arguments.callee,2000);
	},0);

	//send a danmu
	submit.onclick = function(){
		if(!!tosay.value){
			showOneDanmu(tosay.value,getRandomColorStr());
			tosay.value = "";
			if(!timerId){
				//if the default danmu is closed, open it agian
				timerId = setTimeout(function(){
					var order = getRandomInt(0,Math.abs(data.contentLen-1)),
						content = data.content[order];
					showOneDanmu(content,getRandomColorStr());
					timerId = setTimeout(arguments.callee,2000);
				},2000);
			}
		}
	};

	//clear the window
	clear.onclick = function(){
		clearTimeout(timerId);
		timerId = null;
		for(var i = 0; i<data.divs.length; i++){
			var div = data.divs[i];
			if(!!div){
				if(div.parentNode){
					div.parentNode.removeChild(div);
				}
				data.divs[i] = null;
			}
		}
	};
}
function showOneDanmu(content,color){
	if(typeof content === "string" 
		&& typeof color === "string"){
		content = htmlEscape(content);
		pushContent(content);
		var div = addDiv(content,color);
		if(div !== null){
			var index = pushDanmuDiv(div);
			moveDivAt(index);		
		}		
	}else{
		console.log("wrong parameter type in function showOneDanmu");
	}
}
function addDiv(content,color){
	if(typeof content === "string" 
		&& typeof color === "string" 
		&& content.length > 0){
		var div = document.createElement("div");
		div.innerHTML = content;	//这儿可能这对输入html实体字符的情况做一下处理
		div.style.textAlign = "right";
		div.style.position = "absolute";
		div.style.right = "0";
		div.style.whiteSpace = "nowrap"
		div.style.lineHeight = data.danmuHeight;	
		div.style.height = data.danmuHeight;
		div.style.color = color;
		div.style.fontWeight = "bold";
		div.style.top = (data.lastDanmuPos = (data.lastDanmuPos+3)%10) 
		* data.topStep + "px";
		data.container.appendChild(div);
		return div;	
	}else{
		console.log("wrong parameter in function addDiv");
		return null;
	}
}
function moveDivAt(index){
	if(typeof index === "number"){
		var div = data.divs[index],
			currentPos = 0,
			step = 0.05,	//move step
			stepMax = 0.2,	//max moving step
			stepIncrease = 0.0001*Math.max(
				Math.max(0,5-Math.ceil(div.innerHTML.length/5)),1);
			//the rate to increase step(to move faster)
		setTimeout(function(){
			div.style.right = (currentPos += step) + "%";
			step = (step+stepIncrease>=stepMax)?
					stepMax:
					(step+stepIncrease);
			if(currentPos < data.rightPosMax && !!div.parentNode){
				setTimeout(arguments.callee,10);
			}else if(!!div.parentNode){
				//div is still in the document
				//it can be already removed 
				//because data.divs is full to load new div
				div.parentNode.removeChild(div);
				data.divs[index] = null;
			}
		},10);
	}else{
		console.log("wrong parameter type in function moveDivAt");
	}
}
function pushContent(content){
	if(data.contentLen < data.contentLenMax){
		data.content[data.contentLen++] = content;
	}else{
		data.content.shift();
		data.content.length = data.contentLen = data.contentLenMax;
		data.content[data.content.length-1] = content; 
	}
}
function pushDanmuDiv(div){
	var index = 0,
		i = 0;
	while(i<data.divs.length && (!!data.divs[i])){
		i++;
	}
	if(i === data.divs.length){
		//no empty space in the divs array
		//remove the first div
		data.container.removeChild(data.divs[0]);
		data.divs[0] = null;	//dereference

		data.divs.shift();
		data.divs[i-1] = div;
		index = i - 1;
	}else{
		//find an empty space in the divs array
		data.divs[i] = div;
		index = i;
	}
	return index;
}
function getRandomInt(minNum,maxNum){
	if(typeof minNum === "number" && typeof maxNum === "number"){
		var min = parseInt(minNum),
			max = parseInt(maxNum);
		return Math.floor(Math.random()*(max-min+1)) + min;
	}
}
function getRandomColorStr(){
	var str = "000000"+getRandomInt(0,0xffffff).toString(16);
	return "#" + str.slice(str.length-6);
}
function htmlEscape(str){
	if(typeof str === "string"){
		return str
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
	}
}