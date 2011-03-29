RouteMap.js
===========

URL Mapping Library for client-side and server-side JS

See [JSDoc documentation](http://opengamma.github.com/RouteMap "RouteMap.js Documentation").

RouteMap maps URL patterns to methods. It is written in "plain old" JavaScript and can be used in conjunction with any
other libraries. It does, however, require JavaScript 1.8 Array methods (such as `map`, `filter`, `reduce`, etc.). If
these methods do not exist, it will throw an error.
[Reference implementations](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/) of these errors
can be added to any environment to back-port these functions if they don't already exist.

In the browser, the typical use case is for mapping URL fragments (`window.location.hash`) to JavaScript methods. By
default, `RouteMap.handler` is not associated with any event. If the environment it will be used in supports a window
`onhashchange` event, then binding `RouteMap.handler` to it will work out of the box. If not, a simple URL polling
function can be used instead. Similarly, if the environment supports the HTML5 `history` API, the `onpopstate` event can
be bound.

Client-Side
-----------
In a browser environment RouteMap can be used as is. Here are some samples:

    // assumes jQuery exists and we are using a modern(ish) browser that supports onhashchange
    $(function () {
        var routes = window.RouteMap, rules, rule;
        // set up window listener and initial fire
        $(window).bind('hashchange', routes.handler);
        $(routes.handler); // in addition to binding hash change events to window, also fire it onload
        // add some rules
        rules = {
            load_main:      {route: '/',        method: 'load'},
            load_foo_main:  {route: '/foo',     method: 'load_foo_main'},
            load_foo:       {route: '/foo/:id', method: 'load_foo'}
        };
        for (rule in rules) if (rules.hasOwnProperty(rule)) routes.add(rule);
    });

The previous example assumes that `load_main`, `load_foo_main`, and `load_foo` all exist in the global (`window`)
object:

    window.load_main        = function (args) {
        // do some work (args is an empty object)
    };
    window.load_foo_main    = function (args) {
        // do some work (args is an empty object)
    };
    window.load_foo         = function (args) {
        // do some work (args is an object that has 'id' in it)
    };

Typically, you may not want to pollute the global namespace, so `RouteMap` allows changing the context in which it looks
for rules' methods. The above examples could, for example work like this:
    
    // assumes jQuery exists and we are using a modern(ish) browser that supports onhashchange
    // however, we could be using any other library (or no library!) and we could create a hash polling function, etc.
    $(function () {
        var routes = window.RouteMap, rules, rule;
        // set up window listener and initial fire
        $(window).bind('hashchange', routes.handler);
        $(routes.handler); // in addition to binding hash change events to window, also fire it onload
        // add some rules
        rules = {
            load_main:      {route: '/',        method: 'load_main'},
            load_foo_main:  {route: '/foo',     method: 'load_foo_main'},
            load_foo:       {route: '/foo/:id', method: 'load_foo'}
        };
        routes.context({
            load_main:      function (args) {/* do some work (args is an empty object) */},
            load_foo_main:  function (args) {/* do some work (args is an empty object) */},
            load_foo:       function (args) {/* do some work (args is an object that has 'id' in it) */}
        });
        for (rule in rules) if (rules.hasOwnProperty(rule)) routes.add(rules[rule]);
    });

The `method` attribute of each rule can drill down arbitrarily deep (e.g., `'foo.bar.baz'`) into the `context` object
and as long as that index exists, `RouteMap` will fire the correct function when a URL matching that pattern is called.

Server-Side
-----------
In a server-side setting like Node.js, RouteMap can be imported using `require`:

    var routemap = require('path_to/routemap').RouteMap, listeners, listener;
    routemap.get = function () {
        /*
        this function needs to be overwritten in a server-side setting to receive the path RouteMap will
        try to match
        */
    };
    routemap.go = function () {
        /* 
        this function might not be used at all, but in a server-side setting, it needs to be overwritten 
        to do anything meaningful
        */
    };
    listeners = {
        foo: {route: '/foo', method: 'foo.handler', handler: function () {console.log('foo handler!');}},
        bar: {route: '/bar', method: 'bar.handler', handler: function () {console.log('bar handler!');}}
    };
    routemap.context(listeners);
    for (listener in listeners) if (listeners.hasOwnProperty(listener)) routemap.add(listeners[listener]);


&copy; 2011 OpenGamma Inc. and the OpenGamma group of companies