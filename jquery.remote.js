//applies decodeURIComponent on a whole array, key and values //still used ?
$.decodeURIComponentArray = function(queryKey){
	var out = {};
	$.each(queryKey, function(k,v){
		out[k] = decodeURIComponent(v);
	});
	return out;
}

//applies encodeURIComponent on a whole array, key and values
$.encodeURIComponentArray = function(queryKey){
	var out = {};
	$.each(queryKey, function(k,v){
		out[encodeURIComponent(k)] = encodeURIComponent(v);
	});
	return out;
}

//return all ids referenced in a querystring 
$.idsInQs = function(qs){
	if (typeof qs == 'string') qs = $.toQso(qs);	
	var id = '', ids = [];	
	$.each(qs, function(k, v){
		if (k != ''){
			id = k.split('~')[0];
			if ($.inArray(id, ids) == -1) ids.push(id);			
		}

	});
	return ids;	
}


//returns out of a questring the params belonging to a specific paginated element identified by the param id;
//if no id is defined, returns all the params found
$.paramsById = function(querystringObj, id){
	var params = {}, key = '';
	if (typeof querystringObj == 'string') querystringObj = $.toQso(querystringObj);
	$.each(querystringObj, function(k, v){
		key = k.split('~')[0];
		 if (key == id) params[k] = v;
	});
	return params;
}

$.objectDiff = function(o1, o2){
	var objectDiff = {};
	if (typeof o1 == 'string') o1 = $.toQso(o1);
	if (typeof o2 == 'string') o2 = $.toQso(o2);
	$.each(o1, function(k,v){
		if (o1[k] != o2[k]) objectDiff[k] = v;
	});
	return objectDiff;	
}

$.array_diff = function() {
    // http://kevin.vanzonneveld.net
    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Sanjoy Roy
    // +    revised by: Brett Zamir (http://brettz9.blogspot.com)
    // *     example 1: array_diff(['Kevin', 'van', 'Zonneveld'], ['van', 'Zonneveld']);
    // *     returns 1: ['Kevin']
 
    var arr1 = arguments[0], retArr = {};
    var k1 = '', i = 1, k = '', arr = {};
 
    arr1keys:
    for (k1 in arr1) {
        for (i = 1; i < arguments.length; i++) {
            arr = arguments[i];
            for (k in arr) {
                if (arr[k] === arr1[k1]) {
                    // If it reaches here, it was found in at least one array, so try next value
                    continue arr1keys; 
                }
            }
            retArr[k1] = arr1[k1];
        }
    }
 
    return retArr;
}


/*
$.removeParam = function(qso, param){
	if (typeof qso == 'string') qso = $.toQso(qso);
	$('body').append('<br>removeParamsByKey $.removeParamsByKey 1 : '+$.toQs(qso)+' - param :'+param+'+<br>');
	$('body').append('<br>removeParamsByKey $.removeParamsByKey 2 : param '+key+'<br>');
	for (var i in qso) {
		$('body').append('<br>removeParamsByKey $.removeParamsByKey 2 : qso[i] '+qso[i]+'<br>');
		if(typeof qso[i] != 'undefined'){	
			if (qso[i] == param) delete qso[i];						
		}
		
	}
	$('body').append('<br>removeParamsByKey $.removeParamsByKey end : '+$.toQs(qso)+'<br>');
	return qso;	
}



$.removeParamsByKeys = function(){
	$('body').append('<br>args :'+typeof args+args);
	var qs = arguments[0], args = arguments;
	if (typeof args == 'undefined') args = [];
	$('body').append('<br>args :'+typeof args+args);
	args.reverse().pop();
	var keys  = args.reverse();
	for (var i in qs) {
		var param = qs[i];
		var key = param.split('~')[0];
		for (var j in keys){
			if (key == keys[j]) delete qs[i];
		}		
	}
	return qs;	
}
*/

$.mergeQsParams = function(){
	var out = '', args = arguments, length = args.length;	
	for (var i = 0; i < length; i++){
		if (typeof args[i] == 'string') args[i] = $.toQso(args[i]);
		if (i+1 < length){
			for (var j in args[i]){
				if (j != '' && typeof args[i][j] != 'undefined') args[i+1][j] = args[i][j];
			}
		}		
	}
	return args[length-1];
}

//this function should not exist at all. its a workaround jquery's issues at copying all of the data stored in an element.
$.cleanData = function(qs){
	if (typeof qs == 'undefined') qs = {};
	else if (typeof qs == 'string') qs = $.toQso(qs);	
	
	$.each(qs, function(k, v){
		if (k.substring(0,6) == 'jQuery') {
			delete qs[k];
		}
		if (typeof v == 'object'){
			$.each(v, function(k2, v2){
				if (typeof k2 == 'string' && k2.substring(0,6) == 'jQuery'){		
					delete qs[k][k2];
				}
			});					
		}
	});	
	return qs;	
}

$.usableQs = function(qs){
	var qsA = qs.split('?'); 
	if (qsA.length > 1) qs = qsA[1];
	qsA = qs.split('#');
}

//convert an object representing a querystring to a querystring string
$.toQs = function(querystringObject, delimiter){
		if (typeof querystringObject == 'undefined' || typeof querystringObject == 'string' ) var querystringObject = {};
		if (typeof querystringObject == 'string' ) return delimiter+querystringObject; //((var querystringObject = $.toQso(querystringObject);
		if (!delimiter) var delimiter = '';	
		var newQuerystring = '', keys = [], j = 0;
		$.each(querystringObject, function(k, v){
			if (k != '?' && k != '#' && k != '' && k.substring(0,6) != 'jQuery') {
				keys[j] = k;
				j++;
			}
		});	
		keys.sort();
		var i = 0;
		$.each(keys, function(){
			i++;
			newQuerystring += (i == 1) ?  this+'='+querystringObject[this] : '&'+this+'='+querystringObject[this];	
		});		
		if (newQuerystring == '') delimiter = '';
		return delimiter+newQuerystring;
}

//convert a querystring string to an object
$.toQso = function(querystring){
	var out = {};
	if (typeof querystring == 'object') return querystring;
	if (typeof querystring == 'undefined') return {};
	if (querystring.charAt(0) == '#' || querystring.charAt(0) == '?'){
		querystring = querystring.substring(1);
	}	
	querystring = querystring.split('&');
	var row = [];
	for (i in querystring){
		row = querystring[i].split('=');
		out[row[0]] = row[1];
	}
	return out;
}

$.objectIsEmpty = function(o) {
    for(var i in o) {
        if(o.hasOwnProperty(i))
            return false;
    }
    return true;
}

//return the number of vars contained in a js object
$.objectLength = function(o){
	var j = 0;
	for (i in o){
		j++;
	}
	return j;	
}
			
			
