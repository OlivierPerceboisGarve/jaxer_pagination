// Object Utils - v0.91 - 3/28/2009
// http://benalman.com/
// 
// Copyright (c) 2009 "Cowboy" Ben Alman
// Licensed under the MIT license
// http://benalman.com/about/license/
// 
// Note: the setObject, getObject, and exists methods were inspired by Dojo,
// which is Copyright (c) 2005-2009, The Dojo Foundation.

// ========================================================================== //

// Script: Object Utils
//
// Version: 0.91, Date: 3/28/2009
// 
// Tested with jQuery 1.3.2 in Internet Explorer 6-8, Firefox 3, Safari 3-4,
// Chrome, Opera 9.
// 
// Source     - http://benalman.com/code/javascript/jquery/jquery.ba-object.js
// (Minified) - http://benalman.com/code/javascript/jquery/jquery.ba-object.min.js (1.4kb)
// Unit Tests - http://benalman.com/code/javascript/jquery/test/object.html
// 
// 
// About: License
// 
// Copyright (c) 2009 "Cowboy" Ben Alman
// 
// Licensed under the MIT license
// 
// http://benalman.com/about/license/
// 
// * Note: the setObject, getObject, and exists methods were inspired by Dojo, 
// which is Copyright (c) 2005-2009, The Dojo Foundation.
// http://dojofoundation.org/
// 
// Topic: Why this plugin exists
// 
// Long story short.. well, slightly shorter. I had been working on a standalone
// exec_when_exists method to deal with some asynchronous frame loading issues,
// when Peter Higgins (Dojo Project Lead) suggested that I should generalize the
// code and implement it more like Dojo's getObject method. After looking at the
// Dojo code, I realized that he was absolutely right.. and since I clearly have
// some kind of code-generalization OCD, I just couldn't not write this plugin.
// So after much tweaking, many sanity checks (thanks to all the regulars in
// irc.freenode.net #jquery), and a few complete rewrites, this Object Utils
// plugin is what I ended up with.
// 
// Topic: Note for Dojo users
// 
// The setObject, getObject, and exists methods are similar to their Dojo
// counterparts, but different in a few ways. The optional context argument
// is always passed before the name string, not afterwards, as in Dojo. This
// arguably provides a more intuitive interface. Also, exists returns true or
// false based on whether or not a property is defined, not whether it is
// truthy, like Dojo. Finally, getObject can poll for the existence of a
// property and execute a callback when it comes into existence.

(function($) {
  
  // Method: jQuery.setObject
  // 
  // Set a property of an object via dot-delimited name string, creating any
  // ancestor properties that do not already exist.
  // 
  // Usage:
  // 
  //  jQuery.setObject( [ context, ] name, value );                          - -
  // 
  // Arguments:
  // 
  //  context - (Object) Optional context in which to evaluate name. Defaults to
  //    window if omitted.
  //  name - (String) Dot-delimited string representing a property name, for
  //    example: 'document', 'location.href', 'window.open' or 'foo.bar.baz'.
  //  value - (Anything) Any valid javascript expression.
  // 
  // Returns:
  // 
  //  (Anything) The value if set successfully, otherwise undefined.
  
  $.setObject = function() {
    var a = get_args( arguments ),
      prop = a.parts.pop(),
      obj = get_prop( a.context, a.parts, true );
    
    // Only return the value if it is set successfully.
    return obj && typeof obj === 'object' && prop
      ? ( obj[prop] = a.remain )
      : undefined;
  };
  
  
  // Method: jQuery.getObject
  // 
  // Get a property of an object via dot-delimited name string, and optionally
  // create the property and any ancestor properties that do not already exist.
  // 
  // Usage:
  // 
  //  jQuery.getObject( [ context, ] name [ , create ] );                    - -
  // 
  // Arguments:
  // 
  //  context - (Object) Optional context in which to evaluate name. Defaults to
  //    window if omitted.
  //  name - (String) Dot-delimited string representing a property name, for
  //    example: 'document', 'location.href', 'window.open' or 'foo.bar.baz'.
  //  create - (Boolean) Create final and intermediate properties if they don't
  //    exist. Defaults to false.
  // 
  // Returns:
  // 
  //  (Object) An object reference or value on success, otherwise undefined.
  
  // Method: jQuery.getObject (polling)
  // 
  // Get a property of an object via dot-delimited name string, and pass it to
  // callback if it exists, otherwise pass it to callback when it comes into
  // existence. Polling loop may be canceled with <jQuery.getObject (cancel)>.
  // 
  // Usage:
  // 
  //  jQuery.getObject( callback, [ delay, ] [ context, ] name );            - -
  // 
  // Arguments:
  // 
  //  callback - (Function) Will be executed synchronously if property exists,
  //    otherwise a polling loop will be started and callback will be executed
  //    when property comes into existence. Callback executes in the context
  //    scope, and is passed the property as its one argument.
  //  delay - (Number) Optional zero-or-greater numeric polling loop delay in
  //    milliseconds. Defaults to 100 if omitted.
  //  context - (Object) Optional context in which to evaluate name. Defaults to
  //    window if omitted.
  //  name - (String) Dot-delimited string representing a property name, for
  //    example: 'document', 'location.href', 'window.open' or 'foo.bar.baz'.
  // 
  // Returns:
  // 
  //  (Number) A non-zero numeric poll_id if property does not exist and a
  //  polling loop was started, otherwise undefined if property exists and
  //  callback was executed synchronously.
  
  // Method: jQuery.getObject (cancel)
  // 
  // Cancel a running <jQuery.getObject (polling)> polling loop.
  // 
  // Usage:
  // 
  //  jQuery.getObject( poll_id );                                           - -
  // 
  // Arguments:
  // 
  //  poll_id - (Number) Poll id returned by an <jQuery.getObject> call that was
  //    passed a callback and did not execute immediately.
  // 
  // Returns:
  // 
  //  (Boolean) True if polling loop was running and is now stopped, false if
  //  polling loop was already stopped.
  
  $.getObject = function() {
    var a,
      args = arguments;
    
    if ( !args.length || typeof args[0] === 'number' ) {
      
      // Clear the polling loop, if it exists.
      return clear_poll( args[0] );
      
    } else {
      a = get_args( args );
      
      // If callback was passed, start polling if necessary, otherwise return
      // the property if it exists.
      return a.callback
        ? start_poll( a )
        : get_prop( a.context, a.parts, a.remain );
    }
  };
  
  // Store all getObject polling loops so they can be managed.
  
  var polls = [];
  
  // Clear an existing polling loop, if it exists.
  
  function clear_poll( id ) {
    var poll = typeof id === 'number' && polls[id - 1];
    
    if ( poll && poll.timeout_id ) {
      clearTimeout( poll.timeout_id );
      poll.timeout_id = null;
      return true;
    }
    
    return false;
  };
  
  // Start a new polling loop.
  
  function start_poll(a) {
    var result,
      id,
      poll = {};
    
    return (function(){
      result = get_prop( a.context, $.extend([], a.parts) );
      
      if (result === undefined) {
        
        // Property doesn't exist, so check again after a delay.
        poll.timeout_id = setTimeout( arguments.callee, a.delay );
        
        // Return poll id so this polling loop can be managed.
        return id = id || polls.push( poll );
        
      } else {
        
        // Property exists, so clear poll timeout_id and execute callback.
        poll.timeout_id = null;
        a.callback.call( a.context, result );
        
        // Return undefined.
        return;
      }
    })();
  };
  
  // Method: jQuery.exists
  // 
  // Using dot-delimited name string, return whether a property of an object
  // exists.
  // 
  // Usage:
  // 
  //  jQuery.exists( [ context, ] name );                                    - -
  // 
  // Arguments:
  // 
  //  context - (Object) Optional context in which to evaluate name. Defaults to
  //    window if omitted.
  //  name - (String) Dot-delimited string representing a property name, for
  //    example: 'document', 'location.href', 'window.open' or 'foo.bar.baz'.
  // 
  // Returns:
  // 
  //  (Boolean) Whether or not the property exists.
  
  $.exists = function() {
    var a = get_args( arguments );
    
    return get_prop( a.context, a.parts ) !== undefined;
  };
  
  
  // Traverse context object + dot-delimited name string, returning something
  // useful, if possible. Start at obj and drill down, one name part at a time,
  // creating interim objects if necessary.
  
  function get_prop( obj, parts, create ) {
    var p;
    
    while ( obj && parts.length ) {
      p = parts.shift();
      if ( !obj[p] && create ) {
        obj[p] = {};
      }
      obj = obj[p];
    }
    
    return obj;
  };
  
  
  // All Object Utils methods arguments need to be handled in the same way, so
  // call this function as necessary to do the dirty work.
  
  function get_args( args ) {
    var a = {};
    args = Array.prototype.slice.call( args );
    
    // Used only in getObject polling.
    a.callback = $.isFunction( args[0] )
      ? args.shift()
      : null;
    a.delay = a.callback && typeof args[0] === 'number'
      ? Math.max( args.shift(), 0 )
      : 50;
    
    // Used everywhere else!
    a.context = typeof args[0] !== 'string'
      ? args.shift()
      : window;
    a.parts = args.shift().split('.');
    a.remain = args.shift();
    
    return a;
  };
  
  
})(jQuery);
