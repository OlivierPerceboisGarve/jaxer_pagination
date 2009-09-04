

//	parseUri 1.2.1, 	(c) 2007 Steven Levithan <stevenlevithan.com>, 	MIT License
//  http://blog.stevenlevithan.com/archives/parseuri
//  jquery-ized by paul irish

// usage:
// $.parseUri('http://www.foo.com/bar?arg1=yup#anch')   // returns object representing given url
// $.parseUri()                                         // returns object of the current url
$.parseUri = function(url){
  function parseUri(str){
  	var o=parseUri.options,m=o.parser[o.strictMode?"strict":"loose"].exec(str),uri={},i=14;
	while(i--)uri[o.key[i]]=m[i]||"";uri[o.q.name]={};uri[o.key[12]].replace(o.q.parser,function($0,$1,$2){if($1)uri[o.q.name][$1]=$2});return uri};parseUri.options={strictMode:false,key:["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],q:{name:"queryKey",parser:/(?:^|&)([^&=]*)=?([^&]*)/g},parser:{strict:/^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,loose:/^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/}};

  if (typeof url === 'string') return parseUri(url);
  return parseUri(document.location.href);
}


//applies decodeURIComponent on a whole array, key and values
$.decodeURIComponentArray = function(queryKey){
	var out = {};
	$.each(queryKey, function(k,v){
		out[decodeURIComponent(k)] = decodeURIComponent(v);
	});
	return out;
}
