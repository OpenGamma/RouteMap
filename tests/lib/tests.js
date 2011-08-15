(function (pub, namespace) {
    pub[namespace] = function (qunit, routes) {
        var is_syntax_error = function (error) {return error instanceof SyntaxError;},
            has = 'hasOwnProperty',
            is_equal = function (a, b) { // not true equality, but close enough for these tests (these objects are flat)
                for (var key in a) if (a[has](key) && a[key] !== b[key]) return false;
                return true;
            };
        qunit.module('RouteMap');
        qunit.test('initialization', function () {
            qunit.ok(routes, 'RouteMap exists');
        });
        qunit.test('#add / #remove', function () {
            var rule, str, add_rule = function () {routes.add(rule);};
            rule = {route: '/foo/:bar/baz:', method: 'foo'}, str = JSON.stringify(rule);
            // add a rule (returns nothing, just checking to make sure no errors thrown)
            qunit.ok(typeof routes.add(rule) === 'undefined', 'addition of rule: ' + str);
            // no duplicate rules
            qunit.raises(add_rule, null, 'duplicate rules fail: ' + str);
            // remove a rule
            qunit.ok(typeof routes.remove(rule) === 'undefined', 'removal of rule: ' + str);
            // bad rule removal fails [1]
            qunit.raises(function () {routes.remove({});}, null, 'non-rule param to remove fails [1]');
            // bad rule removal fails [2]
            qunit.raises(function () {routes.remove('foo');}, null, 'non-rule param to remove fails [2]');
            // bad rule removal fails [3]
            qunit.raises(function () {routes.remove({route: '/foo'});}, null, 'non-rule param to remove fails [3]');
            // bad rule removal fails [4]
            qunit.raises(function () {routes.remove({method: 'foo'});}, null, 'non-rule param to remove fails [4]');
            // no duplicate params [1]
            rule = {route: '/foo/:bar/:bar', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'duplicate param throws SyntaxError [1]: ' + str);
            // no duplicate params [2]
            rule = {route: '/foo/:bar/bar:', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'duplicate param throws SyntaxError [2]: ' + str);
            // no required unnamed after optional unnamed
            rule = {route: '/foo/:bar?/:baz', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'required unnamed + optional unnamed throws SyntaxError: ' + str);
            // no params after * [1]
            rule = {route: '/foo/*/:bar', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'any param after * throws SyntaxError [1]: ' + str);
            // no params after * [2]
            rule = {route: '/*/:foo', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'any param after * throws SyntaxError [2]:' + str);
            // no params after * [3]
            rule = {route: '/foo:*/:bar', method: 'foo'}, str = JSON.stringify(rule);;
            qunit.raises(add_rule, is_syntax_error, 'any param after * throws SyntaxError [3]: ' + str);
        });
        qunit.test('#context', function () {
            var methods = {foo: function () {}};
            qunit.equal(methods, routes.context(methods), 'RouteMap context overwrite works [set]');
            qunit.equal(methods, routes.context(), 'RouteMap context overwrite works [get]');
        });
        qunit.test('#hash', function () {
            var rule, hash, params;
            // hash with one required param: unnamed
            rule = {route: '/foo/:bar', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with one required param: named
            rule = {route: '/foo/bar:', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/bar=abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with one optional param: unnamed
            rule = {route: '/foo/:bar?', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with one optional param: named
            rule = {route: '/foo/bar:?', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/bar=abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with one optional param: unnamed
            rule = {route: '/foo/:bar?', method: 'foo'}, params = {}, hash = '/foo/';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with one optional param: named
            rule = {route: '/foo/bar:?', method: 'foo'}, params = {}, hash = '/foo/';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: required unnamed
            rule = {route: '/foo/:bar/:baz', method: 'foo'}, params = {bar: 'abc', baz: 'def'}, hash = '/foo/abc/def';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: required named
            rule = {route: '/foo/bar:/baz:', method: 'foo'};
            params = {bar: 'abc', baz: 'def'}, hash = '/foo/bar=abc/baz=def';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: optional unnamed
            rule = {route: '/foo/:bar/:baz?', method: 'foo'}, params = {bar: 'abc', baz: 'def'}, hash = '/foo/abc/def';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: optional named
            rule = {route: '/foo/:bar/baz:?', method: 'foo'};
            params = {bar: 'abc', baz: 'def'}, hash = '/foo/abc/baz=def';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: optional unnamed
            rule = {route: '/foo/:bar/:baz?', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
            // hash with multiple params: optional named
            rule = {route: '/foo/:bar/baz:?', method: 'foo'}, params = {bar: 'abc'}, hash = '/foo/abc';
            qunit.equal(hash, routes.hash(rule, params), 'hash test for: ' + hash);
        });
        qunit.test('#parse', function () {
            var rule, hash, params, str;
            // calling parse on a hash that does not match any added routes fails
            hash = '/foo/';
            qunit.raises(function () {routes.parse(hash);}, is_syntax_error, 'route must be added for parse to work');
            // hash with one required param: unnamed
            rule = {route: '/foo/:bar', method: 'foo'}, params = {bar: 'abc'};
            hash = '/foo/abc';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with one required param: named
            rule = {route: '/foo/bar:', method: 'foo'}, params = {bar: 'abc'};
            hash = '/foo/bar=abc';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with one optional param: unnamed [1]
            rule = {route: '/foo/:bar?', method: 'foo'}, params = {bar: 'abc'};
            hash = '/foo/abc';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with one optional param: named [1]
            rule = {route: '/foo/bar:?', method: 'foo'}, params = {bar: 'abc'};
            hash = '/foo/bar=abc';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with one optional param: unnamed [2]
            rule = {route: '/foo/:bar?', method: 'foo'}, params = {};
            hash = '/foo/';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with multiple params: [1]
            rule = {route: '/foo/:bar/:baz', method: 'foo'}, params = {bar: 'abc', baz: 'def'};
            hash = '/foo/abc/def';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with multiple params: [2]
            rule = {route: '/foo/bar:/:baz', method: 'foo'}, params = {bar: 'abc', baz: 'def'};
            hash = '/foo/def/bar=abc';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with multiple params: [3]
            rule = {route: '/foo/:bar/baz:/qux:', method: 'foo'}, params = {bar: 'abc', baz: 'def', qux: 'ghi'};
            hash = '/foo/abc/baz=def/qux=ghi';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with multiple params: [4]
            rule = {route: '/foo/:bar?/baz:/qux:?', method: 'foo'}, params = {bar: 'abc', baz: 'def', qux: 'ghi'};
            hash = '/foo/abc/baz=def/qux=ghi';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with *: [1]
            rule = {route: '/foo/*', method: 'foo'}, params = {'*': 'abc/def/ghi'};
            hash = '/foo/abc/def/ghi';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with *: [2]
            rule = {route: '/foo/bar:*', method: 'foo'}, params = {bar: 'abc/def/ghi'};
            hash = '/foo/abc/def/ghi';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
            // hash with *: [3]
            rule = {route: '/foo/:bar/baz:*', method: 'foo'}, params = {bar: 'abc', baz: 'def/ghi'};
            hash = '/foo/abc/def/ghi';
            str = 'parse for hash: ' + hash + '  rule: ' + JSON.stringify(rule) + ' returns: ' + JSON.stringify(params);
            routes.add(rule);
            qunit.ok(is_equal(params, routes.parse(hash).args), str);
            routes.remove(rule);
        });
        qunit.test('#prefix', function () {
            var old_prefix = routes.prefix(), new_prefix = 'FOO';
            qunit.equal(new_prefix, routes.prefix(new_prefix), 'RouteMap prefix overwrite works [set]');
            qunit.equal(new_prefix, routes.prefix(), 'RouteMap prefix overwrite works [get]');
            routes.prefix(old_prefix);
        });
    };
})(typeof exports === 'undefined' ? window : exports, 'RouteMapTests');