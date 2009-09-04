
jQuery.fn.allData = function() {
    var $this = $(this),intID = jQuery.data(this.get(0));
    var ret = (jQuery.cache[intID]);
	return ret;
};

jQuery.fn.setData = function(allData) {
	var allData = $.cleanData(allData);
	$(this).each(function(){
		$.each(allData, function(k, v){
			if (k != 'fxqueue') $(this).data(k, v);
		});
	});	
	return 	$(this);	
};

//done: replace clicked with triggerElement
//options: event, state, $clicked, $toReplace, $replacement
/****
options param for the replace method:

@state {String} 
- 'start'  --> occurs typically when a button is clicked,but it could be triggered through another event
- 'ready'  --> when the subsequent ajax request has finished the replace method is called again with this param

@toReplace {String} its a string identifying the the dom node to be replaced 

@$replacement {jquery object} its the object that will replace the dom node selected with toReplace.
***/

$.transition = {	
	replace: function(options){
		if (typeof options.$replacement != 'undefined') {
			var stuff = jQuery.data( $(options.toReplace).get(0) );
			var data = jQuery.cache[ stuff ];
			options.$replacement.setData(data);		
		}
		if ((typeof options.transition != 'undefined') && (typeof $.transition[options.transition] != 'undefined')) {
			$.transition[options.transition].replace(options);
		}
		else{
		$.transition.defaults.replace(options);	
		}	 
	}	
}

$.transition.reversed = {	
	mostRecentTrigger : false,
	replace : function(options){
		var  defaults = {}, opts = $.extend(defaults, options);
		if (opts.state == 'start'){
			this.mostRecentTrigger = opts.trigger || false;
			$(opts.trigger).css({backgroundColor: '#f0b0c0'});		
			var toReplace = opts.toReplace.substr(1); //todo cast... // still used ??
			if ($(document.body).data('events')) $.each($(document.body).data('events'), function(i, event){
			    $.each(event, function(j, handler){
			        console.log(j, i, this, event, handler.toString() );
			    });
			});
			//listen to the event corresponding to this action. If the event has been fired, it means that 'ready' has been called for the same action.
			//it confirms that everything worked. Then the listner is being removed.
			var ev = 'replaced_'+toReplace+'_action_'+opts.action;
			if (!($.exists($(document.body).data('events'), ev))) $(document.body).bind(ev, function (e, name){				
				$(opts.trigger).css({backgroundColor: '#ffffff'});
				$(document.body).unbind(ev);
			});		
		}
		else if (opts.state == 'ready'){
			var listLength = $(opts.toReplace+'>*').length;
			var current = 0;	
						
			//animOut starts first, calls itself until all items are done(hide them), then calls switchIt. 
			//switchIt replaces the old content with the new one hidden, and then calls animIn which will recursively show the new items		
			function switchIt(){
				//console.log('opts.toReplace', opts.toReplace);				
				//if ($(opts.toReplace+':has([id])')) $(opts.toReplace).hide().removeAttr('id');
				var listLength = $('>*', opts.$replacement).length;
				$('>*', opts.$replacement).hide();
				opts.$replacement.replaceAll($(opts.toReplace));
				animIn();
				function animIn(){
					var that = arguments.callee;	
					if (!that.count) that.count = 0;
					if (that.count < listLength) $('>*', opts.$replacement).eq(that.count).fadeIn('fast', animIn);
					else {
						//fire a event corresponding to this action. The listener set in 'start' should catch it and delete it.
						$(document.body).trigger('replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action);							
						if ($(document.body).data('events')){
							$.each($(document.body).data('events'), function(i, event){
							    $.each(event, function(j, handler){
							        console.log('Registered Listeners : ', j, i, this, event, handler.toString() );
							    });
							});
						}
					}
					++that.count;								
				}				
			}			
			
			function animOut(){
				if (current < listLength) $(opts.toReplace+'>*').eq(current).fadeOut('fast', animOut);
				else switchIt();
				current++;
			}
			animOut();					
		} 							
	}			
}

$.transition.defaults = {	
	mostRecentTrigger : false,
	replace : function(options){
		var  defaults = {}, opts = $.extend(defaults, options);
		if (opts.state == 'start'){
			this.mostRecentTrigger = opts.trigger || false;
			$(opts.trigger).css({backgroundColor: '#f0b0c0'});				
			
			if ($(document.body).data('events')) $.each($(document.body).data('events'), function(i, event){
			    $.each(event, function(j, handler){
			        console.log(j, i, this, event, handler.toString() );
			    });
			});
			//listen to the event corresponding to this action. If the event has been fired, it means that 'ready' has been called for the same action.
			//it confirms that everything worked. Then the listner is being removed.
			var ev = 'replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action;
			console.warn('to catch replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action, ' - ev to catch : ', ev);
			if (!($.exists($(document.body).data('events'), ev))) $(document.body).bind(ev, function (e, name){
				console.warn('catched replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action, '- e : ', e ,' - name : ', name);				
				$(opts.trigger).css({backgroundColor: '#ffffff'});
				$(document.body).unbind(ev);
			});			
		}
		else if (opts.state == 'ready'){
			console.info('transition - case ready ');
			$(opts.toReplace).fadeOut('slow', function(){
				opts.$replacement.hide().replaceAll($(this)).stop().fadeIn('slow', function(){
					console.log('fired replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action);
					//fire a event corresponding to this action. The listener set in 'start' should catch it and delete it.
					$(document.body).trigger('replaced_'+opts.toReplace.substr(1)+'_action_'+opts.action);						
					if ($(document.body).data('events')){
						$.each($(document.body).data('events'), function(i, event){
							console.log(event);
						    $.each(event, function(j, handler){
						        console.log('Registered Listeners : ', j, i, this, event, handler.toString() );
						    });
						});
					}	
				});							
			});					
		}							
	}			
}