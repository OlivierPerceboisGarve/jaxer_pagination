
if (typeof console == "undefined" || typeof console.log == "undefined") {
	var console = {
		log: function(){
			//nitobi.Debug.log.call(arguments);
		},
		warn: function(){
		},
		info: function(){
		},
		error: function(){
		}
	};
}

//addUrlParams() ?
$.addOtherLinks = function(hash){
	var fragment = document.location.hash.split('#').reverse()[0];
	var hrefQsObject = $.toQso(hash);
	var qso = $.mergeQsParams(hrefQsObject, $.toQso(fragment));
	var newHash = $.toQs(qso);	
	return newHash;
}

$.fn.addOtherLinks = function(){
	$(this).each(function(){
		if ($(this).is('a')) $(this).attr('href', '#'+$.addOtherLinks(decodeURIComponent($(this).attr('href').split('#')[1])));				
		if ($(this).is('select')){
			$('option', this).each(function(){
				$ (this).attr('value', '#'+$.addOtherLinks(decodeURIComponent($(this).attr('value').split('#')[1])));	
			});				l
		} 	
	});
	return $(this);
}

$.fn.removeParam = function(param){
	$(this).each(function(){
		var hrefQs = $.toQso($(this).attr('href').split('#').reverse()[0]);
		delete hrefQs[param];
		hrefQs = decodeURIComponent($.toQs(hrefQs));
		$(this).attr('href', $(this).attr('href').split('#')[0]+'#'+hrefQs);
	});	
	return $(this);
}

$.fn.addParam = function(param){
	$(this).each(function(){
		var hrefQs = $(this).attr('href').split('#').reverse()[0];
		hrefQs = $.mergeQsParams($.toQso(hrefQs), $.toQso(param));
		$(this).attr('href', $(this).attr('href').split('#')[0]+'#'+$.toQs(hrefQs));
	});
	return $(this);
}

$.addToOthersLinks = function(action, $excluded){
	var $links = $('.ui-history').not($excluded);
	action = $.toQs(action);
	var id = $.idsInQs(action)[0];
	$.each($links, function(i, o){
			if ($(this).is('a') == true){
				var hrefQs =  $(this).attr('href').split('#').reverse()[0] || (this).attr('href').split('?').reverse()[0] ;
				var hrefQsObject = $.toQso(hrefQs);
				var actionA = action.split('&');
				hrefQs = $.toQs(hrefQsObject);
				var hrefQsA = hrefQs.split('&');
				var hrefQsAi = '', actionAi = '';
				for (i in hrefQsA){
					if (typeof hrefQsA[i] !== undefined) {
						hrefQsAi = hrefQsA[i];
						hrefQsAi = hrefQsAi.split('~')[0];
						if (hrefQsAi == id) delete hrefQsA[i];							
					}
				}				
				hrefQs = hrefQsA.join('&');
				hrefQsObject = $.toQso(hrefQs);
				var qso = $.mergeQsParams( action, hrefQsObject);
				var newHash = $.toQs(qso, '#');	
				$(this).attr('href', newHash);						
			}
			if ($(this).is('select')){
				$('option', this).each(function(){
					var hrefQs =  $(this).val().split('#').reverse()[0];
					var hrefQsObject = $.toQso(hrefQs);
					var actionA = action.split('&');
					hrefQS = $.toQs(hrefQsObject);
					var hrefQsA = hrefQs.split('&');
					var hrefQsAi = '', actionAj = '';
					for (i in hrefQsA){
						if (typeof hrefQsA[i] !== undefined) {
							hrefQsAi = hrefQsA[i];
							hrefQsAi = hrefQsAi.split('~')[0];
							if (hrefQsAi == id) delete hrefQsA[i];								
						}
					}
					hrefQs = hrefQsA.join('&');
					hrefQsObject = $.toQso(hrefQs);
					var qso = $.mergeQsParams( action, hrefQsObject);
					var newHash = $.toQs(qso);	
					$(this).val(newHash);							
				});					
			}
	});		 	
}

var isLoading = false;
$.fn.clientPagination = function(options){			
	var $tpl_pager_default =	$('<div class="pagination">default'
									+'<a href="index.html?previous=true" class="previous">previous</a>'
									+'<span class="pages"></span>'
									+'<a href="index.html?next=true" class="next">next</a>'
									+'<span class="limit">'
										+'<a href="index.html?limit=5">5</a>'
										+'<a href="index.html?limit=10">10</a>'
										+'<a href="index.html?limit=50">50</a>'
										+'<a href="index.html?limit=100">100</a>'
									+'</span>'
									+'total post count<span class="totalCount"></span>'
								+'</div>');	
	var defaults = {};
	defaults.limit = 10; //todo : at init count number of rows provided serverside
	defaults.offset = 0;
	defaults.startpoints = 2;
	defaults.endpoints = 2;
	defaults.transition = 'undefined';

	function updateNav(relevantHash, lastHash){
		var id = $(this).attr('id');
		var opts = $(this).data('opts');		
		var $nav = $('#'+id).next('.ui-paginated-nav');
		var $pagers = $('.ui-pager', $('#'+id).next('.ui-paginated-nav'));	
		var relevantHashObj = $.toQso(relevantHash);	
		//what's the heck here ? it should be based on the relevantHash none of fragment or sfragment are needed anymore
		//var fragment = $.parseQuery(window.location.hash.split('#')[1]);
		//var sfragment = (typeof document.location.href.split('#')[1] == 'undefined')? {} : $.toQso(document.location.href.split('#')[1]);
		var offset = (typeof relevantHashObj[id+'~offset'] !== 'undefined') ? parseInt(relevantHashObj[id+'~offset']) : opts.offset;
		var limit = (typeof relevantHashObj[id+'~limit'] !== 'undefined') ? parseInt(relevantHashObj[id+'~limit']) : opts.limit;		
		var postId = (typeof relevantHashObj[id+'~postId'] !== 'undefined') ? relevantHashObj[id+'~postId']  : false;		
		
		var history = $(this).data('history') || [];
		if (id+'~postId' in relevantHashObj) {
			$pagers.hide();			
			if (typeof history[history.length-2] != 'undefined' && history[history.length-2] != '') var backParam = history[history.length-2];
			else{
				var backParam = {};
				backParam[id+'~limit'] =  opts.limit;
				backParam[id+'~offset'] =  opts.offset;	
			}
			if ($('.ui-pager-back', $nav).length < 1) $('<a class="ui-pager-back ui-history" href="#">back</a>').addOtherLinks().removeParam(id+'~postId').addParam($.toQs(backParam)).data('action', $.toQs(backParam)).hide().appendTo($nav);//todo switch to transitions
			$('.ui-pager-back', $nav).show();			
			$('.ui-pager-back', $nav).click(function(){
				$.history.load($(this).attr('href').split('#')[1]);
				$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
				return false;	
			});
		
		} else {
			$pagers.show();
			$('.ui-pager-back', $nav).hide();
		}		
		
		var postcount = parseInt($('.count', $pagers).html());
		var next = (offset + limit >= postcount) ? null : offset + limit;
		var previous = (offset > 0) ? offset-limit+'' : null;
		if (previous < 0) previous = 0;
		var qsObject = $.decodeURIComponentArray($.parseUri()['queryKey']);
		console.warn('function updateNav - relevantHash', relevantHash, ' - id :', id, ' - offset : ', offset, ' - limit : ', limit, ' - next : ', next, ' - previous : ', previous);
		
		//startpoints and endpoints (not sure of the vocabulary I'm using here)
		var startpoints = opts.startpoints, startpoint=[];		
		var chunks = Math.ceil(postcount/limit);
		if (opts.allpoints) startpoints = chunks; //allpoints means that a full bar  of links should be there. so lets ask for as much startpoints as chunks and call it allpoints.
		if (startpoints > chunks) startpoints = chunks;
		for (var i=0; i<startpoints; i++){
			startpoint[i] =  (limit*i >= postcount) ? false : limit*i;
		}
		
		var endpoints = opts.endpoints, endpoint=[];		
		var lastChunkSize = postcount - Math.floor(postcount/limit)*limit;
		if (endpoints > (chunks-startpoints)) endpoints = (chunks-startpoints);//excludes endpoints already referenced as startpoints
		for (var i=0; i<endpoints; i++){
			endpoint[i] =  (limit*(i-1) >= postcount-lastChunkSize) ? false : (postcount-lastChunkSize) - limit*i;
		}
		
		$pagers.each(function(){
			var $pager = $(this), action = {}, thislimit = id+'~limit', thisoffset = id+'~offset';
			action[thisoffset] = offset;
			action[thislimit] = limit;								
			
			//needs refactoring for more unobtrusive behaviour (i.e let the user provide in the html his own wrappers for the links)
			var $startpointsHolder = (opts.allpoints)? $('.allpoints', $pager) : $('.startpoints', $pager);
			var startpointshtml = '';	
			for (var i=0; i<startpoints; i++){
			 	action[thisoffset] = startpoint[i];	
				if (startpoint[i] == offset) startpointshtml += '<span class="ui-paginated-current">'+(i+1)+'</span>';
				else startpointshtml +=  '<a href="#'+$.toQs(action)+'" class="ui-history">'+(i+1)+'</a>';	
			}
			var $startpoints = $(startpointshtml);
			$startpoints.each(function(i,o){
				action[thisoffset] = startpoint[i];
				if ($(this).is('a')){
					$(this).addClass('ui-history').addOtherLinks().data('action', $.toQs(action)).unbind("click").click( function(){
						$.history.load($(this).attr('href').split('#')[1]);					
						$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
						return false;
					});									
				}
			});
						
			var endpointshtml = '';	
			var remainingChunks = chunks;
			for (var i=0; i<endpoints; i++){
				console.warn('endpoint[i]', endpoint, endpoint[i]);
				action[thisoffset] = endpoint[i];
				if (endpoint[i] == offset)	endpointshtml = '<span class="ui-paginated-current">'+remainingChunks+'</span>'+endpointshtml;
				else endpointshtml = '<a href="#'+$.toQs(action)+'" class="ui-history">'+remainingChunks+'</a>'+endpointshtml;
				remainingChunks--;	
			}			
			var $endpoints = $(endpointshtml);
			if ($endpoints.get(0) != document) {
				$endpoints.each(function(i,o){
					action[thisoffset] = startpoint[i];
					if ($(this).is('a')){
						$(this).addClass('ui-history').addOtherLinks().data('action', $.toQs(action)).unbind("click").click( function(){
							$.history.load($(this).attr('href').split('#')[1], '$endpoints btn');	
							console.log('click endpoint : action : ', $(this).data('action'));						
							$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
							return false;
						});						
					}										
				});						
			}			
			if ($startpoints.length) $startpointsHolder.empty().append($startpoints);
			$('.endpoints', $pager).empty();				
			if ($endpoints.get(0) != document) $('.endpoints', $pager).empty().append($endpoints);//append only real nodes
			
			var $next = $('a.next', $pager);	
			if (next !== null) {			
				if ($('a.next', $pager).length == 0){
					
				$next =  $('<a href="'+window.location.href.split('#')[0]+'" class="next ui-history">next</a>');
				if ($('a.previous', $pager).length) $next.insertAfter($('a.previous', $pager));	
				else $next.prependTo($pager);
				}
				$('a.next:hidden', $pager).show();

				action[thisoffset] = next;
				var hrefQs =  $next.attr('href').split('#')[1] || decodeURIComponent($next.attr('href').split('?')[1]);
				var hrefQsObject = $.decodeURIComponentArray($.parseQuery(hrefQs));
				var newHash = $.toQs($.mergeQsParams( action, hrefQsObject), '#');
	
				$next.addClass('ui-history').attr('href', newHash).data('action', $.toQs(action)).unbind("click").click( function(){
					console.warn('click (1) : $(this).attr(\'href\').split(\'#\')[1]',$(this).attr('href').split('#')[1],'newHash : ', newHash, $(this), ' - document.location.href.split(#)[1] : ', document.location.href.split('#')[1], ' - $.toQs(qsObject).split(?).reverse()[0] : ', $.toQs(qsObject).split('?').reverse()[0], 'qsObject : ', qsObject, '- $.parseUri()[queryKey] : ', $.parseUri()['queryKey'][0], $.parseUri()['queryKey'][1]);
					$.history.load($(this).attr('href').split('#')[1]);						
					$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
					return false;
				});				
	
			}else $next.hide();		
			
			var $previous = $('a.previous', $pager);			
			if (previous !== null) {
				console.warn(') previous', previous, thisoffset);
				if ($('a.previous', $pager).length == 0) {
					$previous = $('<a href="' +decodeURIComponent(window.location.href.split('#')[0])+'#" class="previous ui-history">previous</a>');
					if ($('a.next', $pager).length) $previous.insertBefore($('a.next', $pager));
					else $previous.prependTo($($pager));
				}
				action[thisoffset] = previous;				
				var phrefQs =  $previous.attr('href').split('#')[1] || $previous.attr('href').split('?')[1] || '';				
				var phrefQsObject = $.toQso(phrefQs);											
				var pnewHash = $.toQs($.mergeQsParams( action, phrefQsObject), '#');				

			 	$previous.addClass('ui-history').attr('href', pnewHash).data('action', $.toQs(action)).unbind("click").click( function(e){
					$.history.load($(this).attr('href').split('#')[1], 'previous');
					$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'),  'transition': opts.transition});	//need to pass an identifier linking start and ready states in the same event occurence. hmm toReplace: '#posts' ???
					return false;
				});
				$('a.previous:hidden', $pager).show();

			}else $previous.hide();
			
			if (typeof offset != 'undefined') action[thisoffset] = offset;
			else delete action[thisoffset];	
				
			$('form.limit select option', $pager).each(function(){				
				$(this).each(function(){
					var lvalues =  $(this).attr('value').split('?').reverse()[0];
					lvalues =  lvalues.split('#').reverse()[0];
					var lvalueQsObject = $.decodeURIComponentArray($.parseQuery(lvalues));
					action[thislimit] = lvalueQsObject[thislimit];
					lvalueQsObject[thisoffset] = action[thisoffset];
					$(this).attr('value', $.toQs(lvalueQsObject)).data('action',  $.toQs(action));					
				});
			});

			$('form.limit select', $pager).addClass('ui-history').unbind("change").change(function(){
				console.warn('form.limit select $(this).val()', $(this), $(this).val().split('#').reverse()[0], '$(option:selected, this).data(action)', $('option:selected', this).data('action'), '$.addOtherLinks($(option:selected, this).data(action)', $.addOtherLinks($('option:selected', this).data('action')));
				$.history.load($(this).val().split('#').reverse()[0]);	
				window.location.hash = '#'+$.addOtherLinks($('option:selected', this).attr('value'));
				$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $('option:selected', this).data('action'),  'transition': opts.transition});
				return false;
			});							

			$('.limit a', $pager).each(function(){
				var lhrefQs =  $(this).attr('href').split('#')[1] || decodeURIComponent($(this).attr('href').split('?')[1]);
				var lhrefQsObject = $.decodeURIComponentArray($.parseQuery(lhrefQs));
				action[thislimit] = lhrefQsObject[thislimit];
				$(this).addClass('ui-history').attr('href', '#'+$.toQs(action) ).addOtherLinks().data('action',  $.toQs(action)).unbind("click").click(function(){
					$.history.load($(this).attr('href').split('#').reverse()[0]);	
					$.transition.replace({'state': 'start', 'trigger': $.domToSelector($(this)), 'toReplace': '#'+id, 'action': $(this).data('action'),  'transition': opts.transition});
					return false;
				});
					
			});	
			console.log('END updateNav  : next', next);
			//$('.totalCount', $pager).empty().text(postcount);
		});
	}
	
	function display(posts, action){
		var $paginated = $(this);
		var id = $paginated.attr('id');
		//console.log('display  : posts :;', posts.length, 'action : ', action, '$paginated : ', $paginated, '- toReplace : ', '#'+id);
		var opts = $paginated.data('opts');
		var $newPaginated = $paginated.clone(true), i = 0;
		var $list = $newPaginated.clone(true);
		$newPaginated.html('');
		var $tpl = {};
		var isPost = false;
		var actionObj = $.toQso(action);
		$.each(actionObj, function(k,v){
			console.log('k', k);
			if (k.split('~')[1] == 'postId'){
				isPost = true;
			}
		});
		$.each(posts, function(k, v){		
			$tpl = $('li:first', $list).clone();
			i++;
			$.each(opts.definition.fieldDefinition, function(key, val){
				if (typeof v[key] !== 'undefined'){
					//console.log('- display loop loop - key :', typeof key, key, ' - val :', typeof val, val,  ' - v[key] : ', typeof v[key], v[key]);
					$('.'+key, $tpl).html(v[key]);				
				}				
			});
			$('a', $tpl).remove();
			if (!isPost) $tpl.append('<a href="index.html?'+id+'~postId=' + v.id + '">more</a>');
			$('.id', $tpl).html(v.id);
			$('.i', $tpl).html(i);
			$newPaginated.append($tpl);	
			//console.log('display loop end');			
		});
		$newPaginated.data('opts', opts);
		return $newPaginated;
	}	
	
	//add defaults params of an element if this element is not represented in the string
	function defaultize(qs){
		if (typeof qs == 'string') qs =  $.toQso(qs);
		if (typeof qs == 'undefined' || $.objectIsEmpty(qs) ) qs =  {};
		var allIds = [];
		$('.ui-paginated-enabled').each(function(){
			allIds.push($(this).attr('id'));	
		});
		var referencedIds = $.idsInQs(qs);
		var missingIds = $.array_diff(allIds, referencedIds);
		var opts = {}, newParams = {};
		$.each(missingIds, function(i, id){	
			opts = $('#'+id).data('opts');
			newParams[id+'~offset'] = opts.offset;
			newParams[id+'~limit'] = opts.limit;  
		});
		qs = $.mergeQsParams(qs, newParams);
		return qs;
	}
	
	function onPageLoad(hash, state, pid, init){

	    //console.warn('onPageLoad - START - arguments : ', arguments, 'isLoading',  isLoading, this, arguments.callee, arguments.caller);
		if (state != 'start') if (isLoading) {
				console.warn('KILLED !!!. prevented double loading after a click');
				return; //prevents double loading after a click. dirty workaround. Ihis is a strange behavior from the history plugin.
			}
		isLoading = true;
		var thisFunction = arguments.callee;	
		if (!thisFunction.count) thisFunction.count = 0;
		++thisFunction.count;	
		console.warn('onPageLoad - START - thisFunction.count ', thisFunction.count, 'hash', hash );	
		if (thisFunction.count == 1 && state == 'start' && init == 'init'){
			--thisFunction.count;
			console.log('KILLED !!! - history init - break now');
			isLoading = false;
			return;	
		} 

		var ids = [], id = '';	//	list of the ids of the element to be paginated - we deduce them from the hash, or if there is no hash yet (initial state) then it comes from the params of the history plugin	
		if (typeof hash == 'undefined') var hash = '';	
		var defaultHash = false;
		var hashObj = $.toQso(hash);
		hash = $.toQs(hashObj);		
		var historyLength = $.fn.clientPagination.data.history.length;
		//console.info('onPageLoad - arguments ', arguments, 'this', this, 'historyLength : ', historyLength, '$.fn.clientPagination.data.history[historyLength-1]', $.fn.clientPagination.data.history[historyLength-1], $.fn.clientPagination.data.history);

		var last = $.fn.clientPagination.data.history[historyLength-1] || {'hash':''};
	
		if (thisFunction.count != 1){
			var defaultizedLastHash = defaultize(last.hash);
			var paramsInDLH = {};
			$.each(defaultizedLastHash, function(k,v){
				id = k.split('~')[0];
				if (typeof defaultizedLastHash[id+'~postId'] !== 'undefined') {
					delete defaultizedLastHash[id+'~limit'];
					delete defaultizedLastHash[id+'~offset'];
				}
			});
			var defaultizedHash = defaultize(hash);
			console.log('defaultizedLastHash : ', defaultizedLastHash, $.toQs(defaultizedLastHash), '- defaultizedHash : ', defaultizedHash, $.toQs(defaultizedHash));
			var relevantHashObj = $.objectDiff(defaultizedHash, defaultizedLastHash );
			console.log('relevantHashObj is : ', relevantHashObj, $.toQs(relevantHashObj), 'instead of : ', $.objectDiff(hash, last.hash));
			var idsInQs = $.idsInQs(relevantHashObj);
			$.each(idsInQs, function(i, id){
				if (typeof relevantHashObj[id+'~offset'] != 'undefined' && typeof relevantHashObj[id+'~limit'] == 'undefined'){
					relevantHashObj[id+'~limit'] = defaultizedHash[id+'~limit'];
				}
				if (typeof relevantHashObj[id+'~limit'] != 'undefined' && typeof relevantHashObj[id+'~offset'] == 'undefined'){
					relevantHashObj[id+'~offset'] = defaultizedHash[id+'~offset'];
				}
			});
			console.log('relevantHashObj is : ', relevantHashObj, 'after adding "companion values"');
		} 
		else var relevantHashObj = $.objectDiff(hash, last.hash);
		var relevantHash = $.toQs(relevantHashObj); 

		$.each(relevantHashObj, function(k,v){			
			id = k.split('~')[0];
			if (state == 'start' && pid == id) if ($.inArray(id, ids) == -1) ids[ids.length] = id;
			if (state != 'start') {
				if (state == 'check') if ($.inArray(id, ids) == -1) ids[ids.length] = id;
				if (state == 'load') {
					if ($.inArray(id, ids) == -1) {
						ids[ids.length] = id;	
					}
				}	
				else if  (pid == id)  if ($.inArray(id, ids) == -1) ids[ids.length] = id;
			}	
		});

		var idsLength = ids.length;
		console.log('ids ---.->', ids, ids.length, relevantHash, 'thisFunction.count', thisFunction.count);

		//initial load, lets rewrite links in the pagers
		if (thisFunction.count == 1){
			$('#'+pid).each(function(){		
				$.fn.clientPagination.data.ids.push($(this).attr('id'));
				var id = $(this).attr('id'), $a = $('a', $(this)), $select = $('select', $(this));
				//pas if hash est rien mais si 
				if (hash == ''){
					updateNav.call(this, relevantHash);// $(this).next('.ui-pager'));	
					$a.addClass('ui-history').each(function(){
						var ahref = $(this).attr('href').split('?')[1] || $(this).attr('href').split('#')[1];
						ahref = decodeURIComponent(ahref);						
						$(this).attr('href', '#'+ahref).data('action', ahref).addOtherLinks().unbind("click").click( function(e){
							$.history.load($(this).attr('href').split('#')[1]);
							if ($.transition) $.transition.replace({'state': 'start', 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
							return false;
						});						
					});

					var history = [];
					var action = $.paramsById(defaultize(relevantHashObj), id);
					history.push(action);			
					$(this).data('history', history);					
					console.warn('onPageLoad - END 0 -  isLoading',  isLoading);
					isLoading = false;				
				} 
				else{ 
					console.warn('onPageLoad - NOT END 0 before loadeach ', $(this).attr('id'));
					if (ids.length > 0) loadEachId();
					else {
						var $a = $('a', $(this));
						$a.addClass('ui-history').each(function(){
							var ahref = $(this).attr('href').split('?')[1] || $(this).attr('href').split('#')[1];
							ahref = decodeURIComponent(ahref);							
							$(this).attr('href', '#'+ahref).data('action', ahref).addOtherLinks().unbind("click").click( function(e){
								$.history.load($(this).attr('href').split('#')[1]);
								if ($.transition) $.transition.replace({'state': 'start', 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
								return false;
							});											
						});				
						updateNav.call($(this), relevantHash);	
						$.addToOthersLinks(relevantHash, $('#'+id+' a').add($('select, a',  $('#'+id).next('.ui-paginated-nav')) ) );//$.paramsById(relevantHashObj, id));
					}
					console.warn('onPageLoad - NOT END 0 if (defaultHash) is false ', $(this).attr('id'));
				}				
			});
						
		} 
		else if (ids.length == 0){
			console.warn('onPageLoad - END 1- ids.length == 0  -  isLoading',  isLoading);
			isLoading = false;
		}
		else{	
			loadEachId();			
		}		
		
		function loadEachId(){
			console.info('onPageLoad - 	$.each(ids, function(i, id){ hash', hash, hash.toString(), 'relevantHash', relevantHash, 'ids', ids);			
			$.each(ids, function(i, id){
				var $paginated = $('#'+id);
				var opts = $paginated.data('opts');
				var postcount = parseInt($('.postcount', $paginated).html());
				var postId = hashObj[id+'~postId'] || '';
				var offset = hashObj[id+'~offset'] || 0;
				var limit = hashObj[id+'~limit'] || 10;
				var $toDisplay = '';			
				var action = $.paramsById(relevantHashObj, id);
				var history = $paginated.data('history') || [];				
				$.each(history, function(i){
					history[i] = $.cleanData(this);
				});

				if ($.toQs(action) == $.toQs(history[history.length-1])) {
					isLoading = false;//SAME STATE AS BEFORE, DO NOT LOAD
				}
				else{
					console.warn('DIFFERENT STATE go load it');
					history.push(action);
						if (postId != '') {
							window[id+'ById'].async(function(_return){
								$toDisplay  = display.call($paginated, _return, relevantHash,  $paginated.data('opts'));							
								history[history.length-1] = $.cleanData(history[history.length-1]);
								$toDisplay.data('history', history);	
								var $a = $('a', $toDisplay);

								$a.addClass('ui-history').each(function(){
									var ahref = $(this).attr('href').split('?')[1] || $(this).attr('href').split('#')[1];
									$(this).attr('href', '#'+ahref).data('action', ahref).addOtherLinks().unbind("click").click( function(e){
										$.history.load($(this).attr('href').split('#')[1]);
										if ($.transition) $.transition.replace({'state': 'start', 'toReplace': '#'+id, 'action': $(this).data('action'), 'transition': opts.transition});
										return false;
									});									
								});
								updateNav.call($paginated, relevantHash);
								$.addToOthersLinks(action, $('#'+id+' a, #'+id+' select').add($('select, a',  $('#'+id).next('.ui-paginated-nav')) ));
								if ($.transition) $.transition.replace({'state': 'ready', 'toReplace': '#'+id, '$replacement': $toDisplay, 'action': relevantHash, 'transition': opts.transition});
								//else $paginated.replaceWith($newPaginated);		
								if (i == idsLength - 1) {
									$.fn.clientPagination.data.history.push({'hash': hash, 'relevantHash':relevantHash});
									isLoading = false;								
								}	
							},
							 postId);														
						}
						else {	
							window[id].async(function(_return){
								console.warn('$paginated', $paginated, '_return', _return, 'relevantHash', relevantHash,'$paginated.data(opts)', $paginated.data('opts'));
								$toDisplay = display.call($paginated, _return,  relevantHash, $paginated.data('opts'));
								history[history.length-1] = $.cleanData(history[history.length-1] );
								$toDisplay.data('history', history);
								var $a = $('a', $toDisplay);
								$a.addClass('ui-history').each(function(){
									var ahref = $(this).attr('href').split('?')[1] || $(this).attr('href').split('#')[1];
									$(this).attr('href', '#'+ahref).data('action', ahref).addOtherLinks().unbind("click").click( function(e){
										$.history.load($(this).attr('href').split('#')[1]);
										if ($.transition) $.transition.replace({'state': 'start', 'toReplace': '#'+id, 'action':  $(this).data('action'), 'transition': opts.transition});
										return false;
									});
								});
								updateNav.call($paginated, relevantHash);
								$.addToOthersLinks(action, $('#'+id+' a, #'+id+' select').add($('select, a',  $('#'+id).next('.ui-paginated-nav')) ));//$.paramsById(relevantHashObj, id));
								if (typeof opts != 'undefined'){
									if ($.transition) $.transition.replace({'state': 'ready', 'toReplace': '#'+id, '$replacement': $toDisplay, 'action': relevantHash, 'transition': opts.transition});
									else $paginated.replaceWith($toDisplay);									
								}								
								if (i == idsLength - 1) {
									$.fn.clientPagination.data.history.push({'hash': hash, 'relevantHash':relevantHash});
									isLoading = false;	
								}
								console.warn('onPageLoad - END 2 -  isLoading',  isLoading, ' - i', i, 'id', id, 'idsLength', idsLength,'-  relevantHashObj', $.toQs($.paramsById(relevantHashObj, id)));				
							},
							 offset, limit); 
						}	
				}						
			});
		}
	}

	var thisPlugin = arguments.callee;	//run at initial load of the page
	if (!thisPlugin.count) thisPlugin.count = 0;
	++thisPlugin.count;	
	
	$(this).addClass('ui-paginated').addClass('ui-paginated-enabled');	
	$(this).each(function(){		
		var id = $.domToSelector(this).replace(/#/, '');
	
		if ($(this).attr('id') != id)	$(this).attr('id', id);
		var opts = $.extend(defaults, options);
		
		//todo add code for tables, (and divs, spans, etc)
		if ($(this).is('ul')){
			opts.definition = {'tableName': id, 'fieldDefinition': {} };
			$('li:first>*', this).each(function(i){
				var klass = $(this).attr('class').split(' ').slice(-1);
				if (klass != 'id' && klass != 'i' ) opts.definition.fieldDefinition[klass] = '';	
			});
		}
		
		$(this).data('opts', opts);
		if (thisPlugin.count == 1 && $.history) { //
			console.warn('history inited with $.history.init(onPageLoad)');
			$.history.init(onPageLoad, 'start', $(this).attr('id'));
		}
		
		console.warn('plugin calls onPageLoad- hash : ', document.location.href.split('#')[1], 'state : start - id :', id);
		onPageLoad(document.location.href.split('#')[1], 'start', id);
		
	});
}


$.fn.clientPagination.data = {};
$.fn.clientPagination.data.history = [];
$.fn.clientPagination.data.ids = [];
$.fn.clientPagination.data.pagers = [];
$.fn.clientPagination.data.options = {};
