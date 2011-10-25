RouteMap.js
===========

URL Mapping Library for client-side and server-side JS

See [JSDoc documentation](http://opengamma.github.com/RouteMap "RouteMap.js Documentation").

`RouteMap` maps URL patterns to methods. It is written in "plain old" JavaScript and can be used in conjunction with any
other libraries. It does, however, require JavaScript 1.8 Array methods (such as `map`, `filter`, `reduce`, etc.). If
these methods do not exist, it will throw an error.
[Reference implementations](https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/array/) of these errors
can be added to any environment to back-port these functions if they don't already exist.

In the browser, the typical use case is for mapping URL fragments (`window.location.hash`) to JavaScript methods. By
default, `RouteMap.handler` is not associated with any event. If the environment it will be used in supports a window
`onhashchange` event, then binding `RouteMap.handler` to it will work out of the box. If not, a simple URL polling
function can be used instead. Similarly, if the environment supports the HTML5 `history` API, the `onpopstate` event can
be bound.

Hashbang (#!)
---------------

The URL patterns `RouteMap` uses are based on a file-system path analogy, so all patterns must begin with a `'/'`
character. In order to support the
[hashbang convention](http://code.google.com/web/ajaxcrawling/docs/specification.html), even though all URL patterns
must begin with `'/'`, a prefix can be specified. The default prefix value is `'#'` but if you want your site to be
indexed, you can switch the prefix to be `'#!'`:

    RouteMap.prefix('#!');

Directives
----------

Routes added to `RouteMap` can be static URLs, or they can have dynamic components that get parsed and passed into their
respective methods inside an arguments dictionary. There are three basic types of directives:

### (a) unnamed ###
Consider the rule:

    RouteMap.add({route: '/users/:id', method: 'users.get'});

`:id` can be any scalar value as long as it does not contain a `'/'` character. So for example, the URL: `/users/45`
would cause `users.get` to be invoked with one argument: `{id: '45'}`

An unnamed token can be followed by a `'?'` character to indicate it is optional, but no other unnamed parameter can
follow an optional unnamed parameter, because that would lead to ambiguous URLs:

    RouteMap.add({route: '/users/:id/:fave?',           method: 'users.get'}); // works
    RouteMap.add({route: '/users/:id/:fave?/:other',    method: 'users.get'}); // throws an error
    RouteMap.add({route: '/users/:id?/:fave?/:other',   method: 'users.get'}); // also throws an error

### (b) named ###
Named tokens of rule expressions are different from unnamed tokens in that they can appear anywhere in a URL. Because
they are key/value pairs, their order can be arbitrary. Here is an example:

    RouteMap.add({route: '/users/id:', method: 'users.get'});

Notice that the colon comes *after* the token name `id`. A matching URL for this rule would look like: `/users/id=45`

`RouteMap` will automatically URL encode/decode values when generating URLs and parsing them.

### (c) star ###
Star directives act like a sieve. Normally, if a URL matches a pattern but has extraneous parameters, then it is not
considered a match and `RouteMap` will not fire that pattern's handler. But if a star directive exists at the end of the
rule, like in these examples:

    RouteMap.add({route: '/users/id:/*',        method: 'users.get'});
    RouteMap.add({route: '/users/id:/extras:*', method: 'users.get_two'});

Then URLs with extraneous information like `/users/45/something_else/goes=here` will still match. In the case of the
rules above, the following function calls will fire:

    users.get({id: '45', '*': '/something_else/goes=here'});
    users.get_two({id: '45', extras: '/something_else/goes=here'});

However, star directives are not exactly wildcards, they may not preserve the order of the extraneous items in a URL.
They will always put all of the unnamed extra pieces of a URL *before* the named pieces. So if the URL
`/users/45/goes=here/something_else` is accessed, the arguments will still be exactly as they are above.

Client-Side Sample
------------------
In a browser environment `RouteMap` can be used as is. Here are some samples:

    <script type="text/javascript" src="/path/to/jquery.js"></script>
    <script type="text/javascript" src="/path/to/routemap.js"></script>
    // assumes jQuery exists and we are using a modern(ish) browser that supports onhashchange
    // but jQuery is not necessary to use RouteMap, just shown here for event handling
    $(function () {
        var routes = window.RouteMap, rules, rule;
        // add some rules
        rules = {
            load_main:      {route: '/',        method: 'load'},
            load_foo_main:  {route: '/foo',     method: 'load_foo_main'},
            load_foo:       {route: '/foo/:id', method: 'load_foo'}
        };
        for (rule in rules) if (rules.hasOwnProperty(rule)) routes.add(rules[rule]);
        // set up window listener and initial fire
        $(window).bind('hashchange', routes.handler);
        $(routes.handler); // in addition to binding hash change events to window, also fire it onload
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
        // set up window listener and initial fire
        $(window).bind('hashchange', routes.handler);
        $(routes.handler); // in addition to binding hash change events to window, also fire it onload
    });

The `method` attribute of each rule can drill down arbitrarily deep (e.g., `'foo.bar.baz'`) into the `context` object
and as long as that index exists, `RouteMap` will fire the correct function when a URL matching that pattern is called.

Server-Side Sample
------------------
In a server-side setting like Node.js, `RouteMap` can be imported using `require`. Because the client-side functionality
does not distinguish between different HTTP requests (`GET`, `POST`, `HEAD`, etc.), the server-side version will likely
need a dispatcher function if you need to distinguish between different request types. The example below shows a server
that will answer `GET` requests to `/` and `/bar/ + {an ID string}` and `POST` requests to `/foo`. It will return a
not-found message to all other requests (by overwriting `RouteMap.default_handler`). Note that the `RouteMap.handler`
function is passed the `request` and `response` objects, which means they get passed into each listener as additional
parameters after the `args` object.

    var http = require('http'), routemap = require('./routemap').RouteMap, PORT = 8124;
    (function () {
        var listeners, dispatch, rules, rule;
        listeners = {
            main: {
                get: function (args, request, response) {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('GET / happened\n');
                }
            },
            foo: {
                post: function (args, request, response) {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('POST /foo happened\n');
                }
            },
            bar: {
                get: function (args, request, response) {
                    response.writeHead(200, {'Content-Type': 'text/plain'});
                    response.write('here is bar[' + args.id + ']\n');
                }
            }
        };
        dispatch = function (listener) {
            return function (args, request, response) {
                var method = request.method.toLowerCase();
                if (listeners[listener] && listeners[listener][method])
                    listeners[listener][method](args, request, response);
                else
                    routemap.default_handler(request.url, request, response);
            };
        };
        rules = {
            main:   {route: '/',        method: 'main.handler', handler: dispatch('main')},
            foo:    {route: '/foo',     method: 'foo.handler',  handler: dispatch('foo')},
            bar:    {route: '/bar/:id', method: 'bar.handler',  handler: dispatch('bar')}
        };
        // set up routemap
        routemap.context(rules); // where routemap looks for the methods specified
        for (rule in rules) routemap.add(rules[rule]);
        routemap.default_handler = function (url, request, response) {
            response.writeHead(404, {'Content-Type': 'text/plain'});
            response.write('Sorry!\n' + request.method + ' ' + request.url + ' does not work');
        };
    })();
    http.createServer(function (request, response) {
        routemap.get = function () {return request.url;};
        routemap.handler(request, response);
        response.end();
    }).listen(PORT, '127.0.0.1');
    console.log('HTTP listening on port ' + PORT + '\nCTRL-C to bail');

Tests
-----
To run the tests in a browser, open: `./tests/tests-browser.html`

To run the tests in node, run: `node ./tests/tests-node.js`

&copy; 2011 OpenGamma Inc. and the OpenGamma group of companies