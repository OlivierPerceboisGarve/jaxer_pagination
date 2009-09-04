			//quick crappy debug function
			$.bug = function (val){
					var out = '';
					out = 'typeof val : '+(typeof val)+' -- <br>';
					if (typeof val == 'string') out += '{string} '+val+'</br>';
					else if (typeof val == 'number') out += '{number} '+val+'</br>';
					else if (typeof val == 'undefined') out += '{undefined} </br> ';
					else $.each(val, function(k,v){
						out += ' - key : '+k+' - value : '+v+' | <br>';
						/*if (typeof v == 'object'){
							$.each(v, function(k2, v2){
									out += ' --- sub ---  key : '+k2+' - value : '+v2+' | <br>';
							});		
						}*/
					});
					$('body').append('<div style="border: 1px solid grey;">'+out+'</div>');
				
			}
			
			$.randomText = function(params){
				var defaults = {language: ''};
				var data = $.extend(defaults, params);
				var page = Jaxer.Web.post('http://randomtextgenerator.com', data);
				return $('#generatedtext', page).val();			
			}

			$.insertRandomTextIntoPostTable = function(Post, numberOfentries, params){
				var defaults = { title: 15, text: 500};
				var p = $.extend(defaults, params);	
				for (i=0; i <= numberOfentries;){
					
					var txt = $.randomText();
					var numberOfChunks = Math.floor(txt.length/p.text);
					for (j=0; j <= numberOfChunks; j++ ){	
						var title = txt;
						title = title.substring(p.title*j , p.title+(p.title*j)); 
						var text = txt;
						text = text.substring(p.text*j , p.text+(p.text*j)); 
						Post.create({'title': title, 'text': text});
					}
					
					i = i+numberOfChunks;
				}
				
			}
			
			$.addOtherLinks = function(qs){
				//$('body').append('<br>window.location : '+window.location.href);
				var fragment = $.toQso(window.location.href.split('?')[1]);
				var hrefQsObject = $.decodeURIComponentArray($.parseQuery(qs));
				//hrefQsObject = 
				//$('body').append('<br>hrefQsObject : '+$.toQs(hrefQsObject));
				//$('body').append('<br>fragment 1 : '+typeof fragment+' - '+$.toQs(fragment));
				fragment = decodeURIComponent($.toQs(fragment));
				//$('body').append('<br>fragment 2 : '+typeof fragment+' - '+fragment);
				var qso = $.mergeQsParams(hrefQsObject, $.toQso(fragment));
				var newQs = $.toQs(qso);	
				return window.location.hash.split('?')[0]+'?'+newQs;
			}
			
			$.fn.addOtherLinks = function(){
				//$('body').append('<br>'+$(this).attr('id')+'<br>$.fn.addOtherLinks 1 href : '+$(this).attr('href'));
				$(this).each(function(){
					if ($(this).is('a')) $(this).attr('href', $.addOtherLinks($(this).attr('href').split('?').reverse()[0]));				
				});
				//$('body').append('<br>$.fn.addOtherLinks 2 href : '+$(this).attr('href')+'<br>');
				return $(this);
			}
			
			$.fn.removeParam = function(param){
				
				$(this).each(function(){
					//$('body').append('<br>removeParamsByKey 1 : '+$(this).attr('href')+'<br>');
					var hrefQs = $.toQso($(this).attr('href').split('?').reverse()[0]);
					//$('body').append('<br>removeParamsByKey hrefQs 1 : '+$.toQs(hrefQs)+'<br>');
					delete hrefQs[param];
					hrefQs = decodeURIComponent($.toQs(hrefQs));
					//$('body').append('<br>removeParamsByKey hrefQs hrefQs : '+hrefQs+'<br>');
					
					$(this).attr('href', $(this).attr('href').split('?')[0]+'?'+hrefQs);
					//$('body').append('<br>removeParamsByKey 2 href : '+$(this).attr('href')+'<br>');
					 // $.toQs(hrefQs);
				});
				
				return $(this);
			}
			
			$.fn.addParam = function(param){
				$(this).each(function(){
					var hrefQs = $(this).attr('href').split('?').reverse()[0];
					hrefQs = $.mergeQsParams($.toQso(hrefQs), $.toQso(param));
					$(this).attr('href', $(this).attr('href').split('?')[0]+'?'+$.toQs(hrefQs));
				});
				return $(this);
			}
			
			
			$.fn.serverPagination = function(options){
				
				var $tpl_pager_default = $('<div class="pagination">default'
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
				//defaults.definition = {'tableName': 'posts', 'fieldDefinition': { title: '', text: ''} };	// 
				defaults.randomText = {};	
				defaults.randomText.language = '';
				defaults.randomText.params = { title: 15, text: 500};	



				
				$(this).each(function(){
					var opts = $.extend(defaults, options);	
					var definition = opts.definition;
					
					var id = $(this).attr('id'); //todo cast...;
					var $this = $(this);
					$this.addClass('ui-paginated');
					//guessing db table definition using the dom provided - to be extended in a function ...
					//if (typeof options !== 'undefined'){
						if ($(this).is('ul')){
							opts.definition = {'tableName': id, 'fieldDefinition': {} };
							$('li:first>*', this).each(function(i){
								var klass = $(this).attr('class').split(' ').slice(-1);
								if (klass != 'id' && klass != 'i' ) opts.definition.fieldDefinition[klass] = '';	
							});
						}
					//}	
					
					//cooking data				
					ActiveRecord.connect(ActiveRecord.Adapters.JaxerMySQL);	
					Jaxer.Log.info('opts.definition.tableName'+opts.definition.tableName.toSource());
					Jaxer.Log.info('opts.definition.fieldDefinition'+opts.definition.fieldDefinition.toSource());		
					var Post = ActiveRecord.define(opts.definition.tableName, opts.definition.fieldDefinition);
					//var Post = ActiveRecord.define('books', {author:""});
					Jaxer.Log.info('Post'+Post.toSource());
						
/*
					window[id] = function(){
						ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite);
						var Post = ActiveRecord.define('posts',{title: '',text: ''});
						Post.belongsTo('users');
						return Post.find({all: true, order: 'id DESC', offset: offset, limit: limit });
					}
					window[id].proxy = true;
					window[id+'byId'] = function(){
						ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite);
						var Post = ActiveRecord.define('posts',{title: '',text: ''});
						return  Post.find({ all: true, where: {id: postId} });
					}
					window[id+'byId'].proxy = true;

			function posts(offset, limit){
				//Jaxer.load('../latest/active.js');	
				ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite);
				var Post = ActiveRecord.define('posts',{title: '',text: ''});
				Post.belongsTo('users');
				return Post.find({all: true, order: 'id DESC', offset: offset, limit: limit });
			}
			
			function postById(postId){	
				ActiveRecord.connect(ActiveRecord.Adapters.JaxerSQLite);
				var Post = ActiveRecord.define('posts',{title: '',text: ''});
				return  Post.find({ all: true, where: {id: postId} });
			}*/


	
					//quick experimental stuff to insert some random text in the db
					if (opts.randomText) {
						var posts = Post.find({ all: true, order: 'id DESC', limit: 10});  
						Jaxer.Log.info('------- posts ---------  '+posts.toSource());
						if ($.objectLength(posts) == 3) {
							Jaxer.Log.info('insertRandomTextIntoPostTable'+posts.toSource());
							//Jaxer.Log.info(Post.getErrors());
							//$.insertRandomTextIntoPostTable(Post, 50, opts.randomText.params); //is there a way to guess the params ?
						}
					}
					//Post.belongsTo('users');			
					var postcount = Post.count();
					
					//pager stuff
					//var pagers = opts.pagers || '.ui-pager';				
					//if (typeof pagers == 'string') 	var $pagers = $(pagers, $(this).next('.ui-paginated-nav'));
					//else if (pagers instanceof jQuery) var $pagers = pagers;  //todo define relation between pagers and their masters (list or item)
					//if (!$pagers) var pagers = $tpl_pager_default;	
					var $navs = $(this).next('.ui-paginated-nav');
					var $pagers = $('.ui-pager', $navs);
					
					//passed data	
					var offset = 0, limit = 10, postId = false;
					if (typeof Jaxer.request.data[id+'~offset'] != 'undefined') offset = parseInt(Jaxer.request.data[id+'~offset']);
					if (typeof Jaxer.request.data[id+'~limit'] != 'undefined') limit = parseInt(Jaxer.request.data[id+'~limit']);
					if (typeof Jaxer.request.data[id+'~postId'] != 'undefined') postId = parseInt(Jaxer.request.data[id+'~postId']);

					var posts = (postId) ? Post.find({ all: true, where: {id: postId} }) : Post.find({all: true, order: 'id DESC', offset: offset, limit: limit });
					
					//page construction
					display.call($this, posts, opts);
					updatePagers.call($navs, id, offset, limit, postcount, postId, opts);
				});
				
				function updatePagers(id, offset, limit, postcount, postId, opts){
					var $navs = $(this);		
					$navs.each(function(){
						$nav = $(this);
						$pagers = $('.ui-pager', $nav);
						$('.count', $pagers).html(postcount);
						
						var action = {}, llimit = id+'~limit', loffset = id+'~offset';
						action[llimit] = limit;
						var querystringObject = $.decodeURIComponentArray($.parseUri()['queryKey']);
						//$('body').append('postid : '+postId+' - '+typeof postId);
						if (postId) {
							$pagers.hide();			
						//if (typeof history[history.length-2] != 'undefined' && history[history.length-2] != '') var backParam = history[history.length-2];
						//else{
							var backParam = {};
							backParam[id+'~limit'] =  limit;
							backParam[id+'~offset'] =  offset;	
						//}
						if ($('.ui-pager-back', $nav).length < 1) $('<a class="ui-pager-back ui-history" href="#">back</a>').addOtherLinks().removeParam(id+'~postId').addParam($.toQs(backParam)).data('action', $.toQs(backParam)).hide().appendTo($nav);//todo switch to transitions
						//console.log('updatenav - if postId - ', $('.ui-pager-back', $nav), $('.ui-pager-back', $nav).css('display'));
						$('.ui-pager-back', $nav).show();
						} else {
							$pagers.show();
							$('.ui-pager-back', $nav).hide();
						}	
						

						//startpoints and endpoints (not sure of the vocabulary I'm using here) - I mean direct access to each chunk of paginated content
						var startpoints = opts.startpoints || 0; 

						var startpoint=[];		
						var chunks = Math.ceil(postcount/limit);
						if (typeof opts['allpoints'] != 'undefined') startpoints = chunks; //allpoints means that a full bar  of links should be there. so lets ask for as much startpoints as chunks and call it allpoints.
						if (startpoints > chunks) startpoints = chunks;
						for (var i=0; i<startpoints; i++){
							startpoint[i] =  (limit*i >= postcount) ? false : limit*i;
						}
						
						var $startpointsHolder = (opts.allpoints)? $('.allpoints', $pagers) : $('.startpoints', $pagers);
						var startpointshtml = '';	
						
						for (var i=0; i<startpoints; i++){
						 	action[loffset] = startpoint[i];	
							if (startpoint[i] == offset) startpointshtml += '<span class="ui-paginated-current">'+(i+1)+'</span>';
							else startpointshtml +=  '<a href="?'+$.toQs(action)+'">'+(i+1)+'</a>';	
						}
						
						var $startpoints = $(startpointshtml);
						$startpoints.each(function(i,o){
							$(this).addClass('ui-history').addOtherLinks();	
						});
						
						if ($startpoints.get(0) != document && $startpoints.length) $startpointsHolder.empty().append($startpoints);						
						
						var endpoints = opts.endpoints, endpoint=[];		
						var lastChunkSize = postcount - Math.floor(postcount/limit)*limit;
						if (endpoints > (chunks-startpoints)) endpoints = (chunks-startpoints);//excludes endpoints already referenced as startpoints
						for (var i=0; i<endpoints; i++){
							endpoint[i] =  (limit*(i-1) >= postcount-lastChunkSize) ? false : (postcount-lastChunkSize) - limit*i;
						}
						
						var endpointshtml = '';	
						var remainingChunks = chunks;
						for (var i=0; i<endpoints; i++){
							action[loffset] = endpoint[i];
							if (endpoint[i] == offset)	endpointshtml = '<span class="ui-paginated-current">'+remainingChunks+'</span>'+endpointshtml;
							else endpointshtml = '<a href="?'+$.toQs(action)+'">'+remainingChunks+'</a>'+endpointshtml;
							remainingChunks--;	
						}			
						var $endpoints = $(endpointshtml);
						$endpoints.each(function(i,o){
							$(this).addClass('ui-history').addOtherLinks();					
						});
						$('.endpoints', $pagers).empty();				
						if ($endpoints.get(0) != document) $('.endpoints', $pagers).empty().append($endpoints);//append only real nodes
						
						var previous = (offset > 0) ? offset-limit+'' : false;
						if (previous < 0) previous = 0;
						if (previous) {
							action[loffset] = previous;
							$('a.previous', $pagers).attr('href', '?'+$.toQs($.mergeQsParams(action, querystringObject)));
						}
						else $(' a.previous', $pagers).remove();
						
										
						var next = (offset+limit >= postcount) ? false : offset+limit+'';
						if (next) {
							action[loffset] = next;
							$('a.next', $pagers).attr('href', '?'+$.toQs($.mergeQsParams(action, querystringObject)));
						}
						else $('a.next', $pagers).remove();				
						
						
						if (typeof offset != 'undefined') action[loffset] = offset;
						else delete action[loffset];

						$('.limit a', $pagers).each(function(){
							var hrefQs =  $(this).attr('href').split('?')[1] || '';
							var hrefQsObject = $.decodeURIComponentArray($.parseQuery(hrefQs));		
							$(this).attr('href', '?'+$.toQs($.mergeQsParams( hrefQsObject, action, querystringObject)));
						});							
					});
						
				}
				
				function display(posts, opts){
					var $tpl_post = $(	'<ul id="posts">'
						+'<li>'
							+'<h2>&nbsp;</h2>'
							+'<span class="text">&nbsp;</span>'
						+'</li>'
					+'</ul>');
					
					var $posts = $(this).clone(), id = $posts.attr('id'), i = 0;
					$tpl_post = $posts.clone();
					$posts = $posts.empty();
					$.each(posts, function(k, v){
						var $tpl = $('li:first', $tpl_post).clone();
						i++;
						$.each(opts.definition.fieldDefinition, function(key, val){
							$('.'+key, $tpl).html(v[key]);
						});
						$('<a href="index.html?'+id+'~postId=' + v.id + '">more</a>').addOtherLinks().insertAfter($('*:last', $tpl));
						$('.id', $tpl).html(v.id);
						$('.i', $tpl).html(i);

						$posts = $posts.append($tpl);
					});
					$(this).replaceWith($posts);
	
				}		
			}
			
			//mmmhh ? not working
			//$.fn.pagination.runat = "client";
			
		