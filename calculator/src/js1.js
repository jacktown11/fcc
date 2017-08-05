var paraJack = {
	method: {
		getData: null,
		//获取当前算式相关数据副本
		pushChar: null,	
		//输入一个字符
		popChar: null,	
		//删除最后一个加入字符串数组(data.strArr)的数字、小数点或操作符字符对应的字符串
		removeResult: null,
		//清空计算结果，回退为未计算状态
		clearStr: null,	
		//清空输入字符数组(data.strArr)
		isStrLegal: null, 
		//检查输入字符数组(data.strArr)构成的算式是否有效(可计算)
		calculate: null
		//根据当前得到的输入字符数组(data.strArr)计算结果并返回
		
	},
	dom: {
		setEvent: null, //设定页面点击事件
		handleInput: null,	//用户点击一个输入钮时的事件处理程序
		update: null	//根据当前得到的输入字符数组(data.strArr)，更新页面输出
	}
};

(function(){
	var data = {
		isCalculated: false,
		//当前算式是否已按下'='完成计算，为true时，data.result应已包含计算结果
		result: '',	
		//计算结果字符串，用户还未要求计算前为空字符串
		currentStr: '', 
		//存储当前输入的操作数的字符串
		//如果下一个输入的字符是数字或小数点
		//那么它可能需要和当前保存的操作数合并为新操作数作为数组最后一项
		//最后一个输入是操作符，那么该项为空字符串，
		//因为下一输入字符绝不会与这个操作符合并成一个操作数或操作符
		strArr: [],	
		//存储到当前为止所有输入的操作数或操作符
		//其每一项可取值：'&minus;','+','&times;','&divide;','%','.',无符号浮点数字符串
		//如果currentStr非空，那么数组最后一个元素等于currentStr
		isStrLegal: true

		//关于strArr和currentStr的举例说明：
		//如果当前以此输入3*2+5-2.3/2.
		//strArr为['3','&times;','2','+','5','&minus','2.3','&divide','2.']
		//currentStr为'2.'
	};

	paraJack.method.getData = function(){
		//获取data对象副本
		
		var dataCopy = {};
		dataCopy.isCalculated = data.isCalculated;
		dataCopy.result = data.result;
		dataCopy.currentStr = data.currentStr;
		dataCopy.strArr = data.strArr.concat();
		dataCopy.isStrLegal = data.isStrLegal;

		return dataCopy;
	};

	paraJack.method.pushChar = function(str){
		//输入一个字符,str是代表字符的字符串，如对于字符串‘-’是‘&minus;’
		if(typeof str === 'string'){
			if(data.isCalculated){
				//当前有计算结果，把这个结果作为第一个操作数
				data.strArr = [data.result];
				data.currentStr = data.result;
				data.result = '';
				data.isCalculated = false;
			}
			switch(str){
				case '&minus;':
				case '+':
				case '&times;':
				case '&divide;':
				case '%':
				//操作符
					data.strArr.push(str);
					data.currentStr = '';
					return true;
				case '.':
				//小数点
					if(!!data.currentStr){
						//当前数组尾项是操作数
						if(data.currentStr.indexOf('.') >= 0){
							//该操作数中有小数点
							data.currentStr = str;
							data.strArr.push(data.currentStr);
						}else{
							//该操作数中无小数点
							data.currentStr += str;
							data.strArr[data.strArr.length-1] = data.currentStr;
						}
					}else{
						//当前数组尾项是操作符
						data.currentStr = str;						
						data.strArr.push(data.currentStr);
					}
					return true;
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				//数字
					if(!!data.currentStr){
						//当前数组尾项是操作数
						data.currentStr += str;
						data.strArr[data.strArr.length-1] = data.currentStr;
					}else{
						//当前数组尾项是操作符
						data.currentStr += str;
						data.strArr.push(data.currentStr);
					}
					return true;
				default: 
				//其他非法字符
					return false;
			}
		}else{
			return false;
		}
	};

	paraJack.method.popChar = function(){
		//删除最后一个加入字符串数组(data.strArr)的数字、小数点或操作符字符对应的字符串
		
		var str = '',
			len = data.strArr.length,
			lastWord = '',
			lastChar = '';
		if(!data.isCalculated){
			//还未计算显示结果

			//取得最后保存在字符串数组中的字符串，保存到str中，
			//并将其从数组中删除
			//(删除最后一个元素或最后一个元素的字符)
			if(len > 0){
				//算式字符串数组非空
				lastWord = data.strArr[len-1];	//数组最后一个字符串
				lastChar = lastWord.charAt(lastWord.length-1);	//最后一个字符
				if(lastChar.search(/[0-9]|\./)===0){
					//最后一个字符是数字或小数点
					//那么这个字符就是最后被压入的字符串
					str = lastChar;
					lastWord = lastWord.substr(0,lastWord.length-1);
					//将最后数组最后一个元素(字符串)删掉最后一个字符后更新
					if(!!lastWord){
						data.strArr[len-1] = lastWord;
					}else{
						data.strArr.pop();
					}
				}else{
					//最后一个字符串是加减乘除取模五种运算之一对应的字符串
					str = lastWord;
					data.strArr.pop();
				}
			}

			//更新data.currentStr的值
			len = data.strArr.length;	//取得更新后字符串数组的长度
			if(len > 0){
				lastWord = data.strArr[len-1];
				if(lastWord === '+' || 
					lastWord === '&minus;' || 
					lastWord === '&times;' || 
					lastWord === '&divide;' || 
					lastWord === '%'){
					data.currentStr = '';
				}else{
					data.currentStr = lastWord;
				}
			}else{
				data.currentStr = '';
			}
		}else{
			data.isCalculated = false;
			data.result = '';
		}

		return str;
	};

	paraJack.method.removeResult = function(){
		data.result = '';
		data.isCalculated = false;
	};

	paraJack.method.clearStr = function(){
		//清空输入字符数组(data.strArr)
		if(data.strArr.length > 0){
			data.strArr = [];
			data.currentStr = '';
			data.isCalculated = false;
			data.result = '';
			return true;
		}else{
			return false;
		}
	};

	paraJack.method.isStrLegal = function(isComplete){
		//检测当前算式是否有错误
		//isComplete表示当前算式是否已经输入完毕，将会用于立即计算
		//其值为false时，表示当前算式只是输入过程中；
		//显然要根据其值采用不同的检验策略

		var strArrTemp = data.strArr.concat(),
			len = strArrTemp.length;
		strArrTemp = strArrTemp.map(function(item,index,arr){
			switch(item){
				//将所有字符串分类为四个类型
				case '+':
				case '&minus;':
					//加减符号
					return 'operator1';
				case '&times;':
				case '%':
				case '&divide;':
					//乘除和取模
					return 'operator2';
				case '.':
					//单独的小数点
					return 'point';
				default: 
					//数字
					return 'number';
			}
		});
		if(isComplete === false && len > 0){
			//当前算式非空且不会马上用于计算
			//如果这个算式目前还没有问题，那么将这个算式做下列处理后，
			//得到的算式必定可以马上用于计算
			var last = strArrTemp[len-1];
			if(last === 'operator1' || last === 'operator2'){
				//最后一项是操作符，那么再向数组末尾增加一个操作数类型
				strArrTemp.push('number');
			}else{
				//最后一项不是操作符,将其修改为一个操作数类型
				strArrTemp[len-1] = 'number';
			}
		}

		//检验算式用于计算的合法性
		len = strArrTemp.length;
		switch(len){
			case 0:
				return true;
			case 1:
				//由一个数构成的式子
				return strArrTemp[0] === 'number';
			case 2:
				//一个正负号和一个数构成的式子
				return strArrTemp[0] === 'operator1' && strArrTemp[1] === 'number';
			default:
				if(strArrTemp[0] === 'operator1' || strArrTemp[0] === 'number'){
					//首项必须是数或正负号
					return strArrTemp.every(function(item,index,arr){
						switch(index){
							case len-1: 
								//最后一项必须是操作数
								return item === 'number';
							case 0:
								//第一项必须是正负号或操作数
								//且能满足操作数和操作符相间
								return item === ((len%2 === 0)?'operator1':'number');
							default:
								//中间项必须是操作符和操作数相间出现
								if((len-1-index)%2 === 0){
									return item === 'number';
								}else{
									return item === 'operator1' || item === 'operator2';
								}
						}
					});
				}else{
					return false;
				}
				break;
		}
	};

	paraJack.method.calculate = function(){
		var strArr = paraJack.method.getData().strArr, //操作数与操作符数组
			strArrPow = strArr;	//记录操作数的小数位数
			lenOrigin = strArr.length,
			len = lenOrigin,
			i = 1,
			operater = '',
			isStrLegal = paraJack.method.isStrLegal();
		var toIntFormat = function(str){
			var pPos = str.indexOf('.'),
				ePos = str.indexOf('e'),
				pow = 0,
				formatStr = {};
			if(ePos > 0){
				if(pPos >= 0){
					pow = ePos - pPos - parseInt(str.slice(ePos+1));
				}else{
					pow = -parseInt(str.slice(ePos+1),10)
				}
			}else{
				if(pPos >= 0){
					pow = str.length - 1 - pPos;
				}
			}
			if(pow > 0){
				formatStr.pow = pow;
				formatStr.str = (parseFloat(str) * Math.pow(10,pow)).toString();
			}else{
				formatStr.pow = 0;
				formatStr.str = str;
			}
			return formatStr;
		};

		if(isStrLegal){
			if(lenOrigin > 0 && strArr[0] === '+' || strArr[0] === '&minus;'){
				//算式以正负号开头，在前面添加一个操作数0
				strArr.unshift('0');
			}

			//去掉所有操作数的小数点，并保存其需要除以10的幂次数
			strArrPow = strArr.map(function(item,index,arr){
				var formatStr = toIntFormat(item);
				arr[index] = formatStr.str;
				return formatStr.pow;
			});

			//计算具有较高优先级的乘、除、取模
			while(i < strArr.length){
				//按操作符从左往右计算
				operator = strArr[i];
				var pow1 = strArrPow[i-1],
					pow2 = strArrPow[i+1],
					//两个操作数的小数位数

					max = Math.max(pow1,pow2),

					num1 = parseFloat(strArr[i-1],10)*Math.pow(10,max-pow1),
					num2 = parseFloat(strArr[i+1],10)*Math.pow(10,max-pow2);
					//转化整数后的两个操作数
				switch(operator){
					case '&times;':
						//计算操作符两边的数运算后的结果
						//更新算式字符串数组
						temp = num1 * num2 / Math.pow(10,max*2);
						strArr.splice(i-1,3,toIntFormat(String(temp)).str);
						strArrPow.splice(i-1,3,toIntFormat(String(temp)).pow);
						break;
					case '&divide;':
						//计算操作符两边的数运算后的结果
						//更新算式字符串数组
						temp = num1 / num2;
						strArr.splice(i-1,3,toIntFormat(String(temp)).str);
						strArrPow.splice(i-1,3,toIntFormat(String(temp)).pow);
						break;
					case '%':
						//计算操作符两边的数运算后的结果
						//更新算式字符串数组
						temp = (num1 % num2) / Math.pow(10,max);
						strArr.splice(i-1,3,toIntFormat(String(temp)).str);
						strArrPow.splice(i-1,3,toIntFormat(String(temp)).pow);
						break;
					default:
						i += 2;
				}
			}

			//加减运算
			i = 1;
			while(i < strArr.length){
				//按操作符从左往右计算
				operator = strArr[i];
				var pow1 = strArrPow[i-1],
					pow2 = strArrPow[i+1],
					max = Math.max(pow1,pow2),
					num1 = parseFloat(strArr[i-1],10)*Math.pow(10,max-pow1),
					num2 = parseFloat(strArr[i+1],10)*Math.pow(10,max-pow2);
				switch(operator){
					case '+':
						//计算操作符两边的数运算后的结果
						//更新算式字符串数组
						temp = (num1 + num2) / Math.pow(10,max);
						strArr.splice(i-1,3,toIntFormat(String(temp)).str);
						strArrPow.splice(i-1,3,toIntFormat(String(temp)).pow);
						break;
					case '&minus;':
						//计算操作符两边的数运算后的结果
						//更新算式字符串数组
						temp = (num1 - num2) / Math.pow(10,max);
						strArr.splice(i-1,3,toIntFormat(String(temp)).str);
						strArrPow.splice(i-1,3,toIntFormat(String(temp)).pow);
						break;
					default:
						i += 2;
				}
			}
		}
		
		if(lenOrigin > 0 && isStrLegal){
			data.isCalculated = true;
			return data.result = String(parseFloat(strArr[0],16)/Math.pow(10,strArrPow[0]));
		}else{
			return '';
		}
	};

	paraJack.dom.setEvent = function(){
		var $table = $('#calculator table');
		$table.on('click','td',function(event){
			var str = $(event.target).attr('data-mask');
			paraJack.dom.handleInput(str);
		});
	};

	paraJack.dom.handleInput = function(str){
		if(typeof str === 'string'){
			switch(str){
				case '0':
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
				case '.':
				case '+':
				case '%':
					paraJack.method.pushChar(str);
					paraJack.dom.update();
					break;
				case 'minus':
				case 'times':
				case 'divide':
					paraJack.method.pushChar('&' + str + ';');
					paraJack.dom.update();
					break;
				case 'clear':
					paraJack.method.clearStr();
					paraJack.dom.update();
					break;
				case 'back':
					paraJack.method.popChar();
					paraJack.dom.update();
					break;
				case '=':
					paraJack.method.calculate();
					paraJack.dom.update();
					break;
				default:
					break;
			}
		}
	};

	paraJack.dom.update = function(){
		var $output = $('div.output span'),
			$alert = $('#calculator p.alert'),
			result = data.result,
			len = result.length,
			strArr = data.strArr.concat();
		if(data.isCalculated){
			//算式已经完成计算
			if(len > 20){
				//最后保留20位有效数字
				$output.html(parseFloat(result).toExponential(20));				
			}else{
				$output.html(result);
			}
		}else{
			//当前在输入过程中，未计算
			if(!!paraJack.method.isStrLegal(data.isCalculated)){
				//算式合法，移出算式显示元素的wrong类，显示为正常				
				$output.removeClass('wrong');
			}else{
				//算式不合法，给算式显示元素添加wrong类，显示为红色
				$output.addClass('wrong');
			}
			//显示算式
			$output.html(strArr.join(''));
		}
	};
})();

$(document).ready(function(){
	paraJack.dom.setEvent();	
});

