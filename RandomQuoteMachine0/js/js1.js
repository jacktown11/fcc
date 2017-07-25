var paraJack = {
	quotes: [
		{
			content: 'I feel the need - the need for speed!',
			author: 'Top Gun'
		},
		{
			content: 'Not everything that can be counted counts, and not everything that counts can be counted.',
			author: 'Albert Einstein'
		},
		{
			content: 'How wrong it is for a woman to expect the man to build the world she wants, rather than to create it herself.',
			author: 'Anais Nin'
		},
		{
			content: 'They call me Mister Tibbs!',
			author: 'In the Heat of the Night'
		},
		{
			content: 'Whether you think that you can, or that you can\'t, you are usually right.',
			author: 'Henry Ford'
		},
		{
			content: 'He is one of those people who would be enormously improved by death.',
			author: 'H. H. Munro'
		},
		{
			content: 'Made it, Ma! Top of the world!',
			author: 'White Heat'
		},
		{
			content: 'If you can\'t get rid of the skeleton in your closet, you\'d best teach it to dance.',
			author: 'George Bernard Shaw'
		},
		{
			content: 'I shall not waste my days in trying to prolong them.',
			author: 'Ian L. Fleming'
		}
	],
	colors: ['#27AE60','#BDBB99','#73A857','#16A085','#77B1A9','#E74C3C','#472E32','#342224']
};

$(document).ready(function(){
	$('#link button').click(function(){
		var num = [getRandomInt(0,paraJack.quotes.length-1),
				getRandomInt(0,paraJack.colors.length-1)],
			quote = paraJack.quotes[num[0]],
			color = paraJack.colors[num[1]];
		$('#quote p.content span').html(quote.content);
		$('#quote p.author').html('- ' + quote.author);
		$('.background-toggle').animate({
			backgroundColor: color
		},1000);
		$('.color-toggle').animate({
			color: color
		},1000);
	});
});

function getRandomInt(low,high){
	if(typeof low === 'number' && 
		typeof high === 'number'){
		low = Math.floor(low);
		high = Math.floor(high);
		return Math.floor(low + (high - low + 1) * Math.random())
	}else{
		return undefined;
	}
}