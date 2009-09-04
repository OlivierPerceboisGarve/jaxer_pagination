$.increment = function (){
	var me = arguments.callee;	
	if (!me.count) me.count = 0;
	return ++me.count;		
}

$.domToSelector = function (jq, options){
	var selectors = [], i = 0; defaults = {}, opts = $.extend(defaults,options);
	$(jq).each(function(){	
		var $node = $(this);	
		if ($node.attr('id')){
			selectors[i] = '#'+$(this).attr('id');		
		}
		else{
			 var customId = ''+new Date; 
			 customId = customId.replace(/ /g, '').replace(/:/g, '').replace(/\+/g, '');
			 customId = customId+'_'+$.increment();
			 if (opts.prefix)  customId = opts.prefix+customId;
			 $node.attr('id', customId);
			 selectors[i] = '#'+customId;		 
		}
		i++;	
	});
	if (selectors.length == 1) selectors = selectors[0];	
	return selectors;
}