RouteMap.js
===========

URL Mapping Library for client-side and server-side JS

See [JSDoc documentation](http://opengamma.github.com/RouteMap "RouteMap.js Documentation").

RouteMap maps URL patterns to methods. In the browser, the typical use case is for mapping URL fragments
(`window.location.hash`) to JavaScript methods. By default, `RouteMap.handler` is not associated with any event. If the
environment it will be used in supports a window `onhashchange` event, then binding `RouteMap.handler` to it will work
out of the box. If not, a simple URL polling function can be used instead. Similarly, if the environment supports
the HTML5 `history` API, the `onpopstate` event can be bound.

In a server-side setting like Node.js, RouteMap can be imported using `require`:

    var routemap = require('path_to/routemap').RouteMap;
    routemap.get = function () {
        /* this function needs to be overwritten in a server-side setting(see docs) */
    };


&copy; 2011 OpenGamma Inc. and the OpenGamma group of companies