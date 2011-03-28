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

In a browser environment RouteMap can be used as is. In a server-side setting like Node.js, RouteMap can be imported
using `require`:

    var routemap = require('path_to/routemap').RouteMap, listeners;
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