/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(1));
	__export(__webpack_require__(2));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	var backend_1 = __webpack_require__(2);
	var utils_1 = __webpack_require__(4);
	exports.fetchStack = {};
	exports.parseObject = function (obj) {
	    if (typeof obj === 'string') {
	        obj = JSON.parse(obj);
	    }
	    var result = '';
	    utils_1.forEach(obj, function (element, key) {
	        if (element && typeof element === 'object') {
	            result += key + exports.parseObject(element);
	        }
	        else {
	            result += key + element;
	        }
	    });
	    return result;
	};
	var context = typeof window !== 'undefined' ? window : global;
	context['fetch'] = function (uri, options) {
	    var method = options.method ? options.method.toLowerCase() : '';
	    if (method !== 'options') {
	        var dataPath = options.body ? exports.parseObject(options.body) : '';
	        var result = exports.fetchStack[uri + method + dataPath];
	        // console.log(uri + method + dataPath, fetchStack)
	        if (result && result.status === 200) {
	            var promise = new Promise(function (resolve, reject) {
	                if (backend_1.flushState.flushed) {
	                    resolve(result);
	                }
	                else {
	                    result.flushQueue.push([resolve, result]);
	                }
	            });
	            return promise;
	        }
	        else if (result && result.status) {
	            /* istanbul ignore if */
	            console.error(result.data);
	            throw new Error(result.data);
	        }
	        else {
	            /* istanbul ignore if */
	            console.error('nothing expect return from server');
	            throw new Error('nothing expect return from server');
	        }
	    }
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var response_1 = __webpack_require__(3);
	var mock_1 = __webpack_require__(1);
	var utils_1 = __webpack_require__(4);
	exports.flushState = {
	    flushed: false
	};
	var Backend = (function () {
	    function Backend() {
	        exports.flushState.flushed = false;
	    }
	    Backend.prototype.whenGET = function (uri) {
	        return new response_1.HttpResponse(uri, 'get');
	    };
	    Backend.prototype.whenPUT = function (uri, data) {
	        return new response_1.HttpResponse(uri, 'put', data);
	    };
	    Backend.prototype.whenPOST = function (uri, data) {
	        return new response_1.HttpResponse(uri, 'post', data);
	    };
	    Backend.prototype.whenDELETE = function (uri) {
	        return new response_1.HttpResponse(uri, 'delete');
	    };
	    Backend.prototype.flush = function () {
	        utils_1.forEach(mock_1.fetchStack, function (value, key) {
	            utils_1.forEach(value.flushQueue, function (resolves) {
	                resolves[0](resolves[1]);
	            });
	        });
	        exports.flushState.flushed = true;
	    };
	    return Backend;
	})();
	exports.Backend = Backend;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var mock_1 = __webpack_require__(1);
	var HttpResponse = (function () {
	    function HttpResponse(uri, method, data) {
	        var dataPath;
	        try {
	            dataPath = data ? mock_1.parseObject(data) : '';
	        }
	        catch (error) {
	            throw error;
	        }
	        method = method ? method.toLowerCase() : '';
	        this.namespace = uri + method + dataPath;
	    }
	    HttpResponse.prototype.respond = function (data) {
	        mock_1.fetchStack[this.namespace] = {
	            status: 200,
	            flushQueue: [],
	            json: function () {
	                return data;
	            }
	        };
	    };
	    HttpResponse.prototype.error = function (message, status) {
	        mock_1.fetchStack[this.namespace] = {
	            status: status,
	            data: message,
	            json: function () {
	                return message;
	            }
	        };
	    };
	    return HttpResponse;
	})();
	exports.HttpResponse = HttpResponse;


/***/ },
/* 4 */
/***/ function(module, exports) {

	exports.forEach = function (target, eachFunc) {
	    var length;
	    if (target instanceof Array) {
	        length = target.length;
	        for (var i = 0; i < length; i++) {
	            eachFunc(target[i], i);
	        }
	    }
	    else {
	        var keys = Object.keys(target);
	        var key;
	        length = keys.length;
	        for (var i = 0; i < length; i++) {
	            key = keys[i];
	            eachFunc(target[key], key);
	        }
	    }
	};


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgN2NiMTkzNDYzNzYzYzgxNzA3ZDQiLCJ3ZWJwYWNrOi8vLy4vbW9jay9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9tb2NrL21vY2sudHMiLCJ3ZWJwYWNrOi8vLy4vbW9jay9iYWNrZW5kLnRzIiwid2VicGFjazovLy8uL21vY2svcmVzcG9uc2UudHMiLCJ3ZWJwYWNrOi8vLy4vbW9jay91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDs7Ozs7OztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7Ozs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsWUFBWTtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixZQUFZO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoibW9jay5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgN2NiMTkzNDYzNzYzYzgxNzA3ZDRcbiAqKi8iLCJmdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuX19leHBvcnQocmVxdWlyZSgnLi9tb2NrJykpO1xuX19leHBvcnQocmVxdWlyZSgnLi9iYWNrZW5kJykpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL21vY2svaW5kZXgudHNcbiAqKiBtb2R1bGUgaWQgPSAwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgYmFja2VuZF8xID0gcmVxdWlyZSgnLi9iYWNrZW5kJyk7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcbmV4cG9ydHMuZmV0Y2hTdGFjayA9IHt9O1xuZXhwb3J0cy5wYXJzZU9iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAodHlwZW9mIG9iaiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb2JqID0gSlNPTi5wYXJzZShvYmopO1xuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gJyc7XG4gICAgdXRpbHNfMS5mb3JFYWNoKG9iaiwgZnVuY3Rpb24gKGVsZW1lbnQsIGtleSkge1xuICAgICAgICBpZiAoZWxlbWVudCAmJiB0eXBlb2YgZWxlbWVudCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIHJlc3VsdCArPSBrZXkgKyBleHBvcnRzLnBhcnNlT2JqZWN0KGVsZW1lbnQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGtleSArIGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciBjb250ZXh0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBnbG9iYWw7XG5jb250ZXh0WydmZXRjaCddID0gZnVuY3Rpb24gKHVyaSwgb3B0aW9ucykge1xuICAgIHZhciBtZXRob2QgPSBvcHRpb25zLm1ldGhvZCA/IG9wdGlvbnMubWV0aG9kLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgICBpZiAobWV0aG9kICE9PSAnb3B0aW9ucycpIHtcbiAgICAgICAgdmFyIGRhdGFQYXRoID0gb3B0aW9ucy5ib2R5ID8gZXhwb3J0cy5wYXJzZU9iamVjdChvcHRpb25zLmJvZHkpIDogJyc7XG4gICAgICAgIHZhciByZXN1bHQgPSBleHBvcnRzLmZldGNoU3RhY2tbdXJpICsgbWV0aG9kICsgZGF0YVBhdGhdO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyh1cmkgKyBtZXRob2QgKyBkYXRhUGF0aCwgZmV0Y2hTdGFjaylcbiAgICAgICAgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHZhciBwcm9taXNlID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIGlmIChiYWNrZW5kXzEuZmx1c2hTdGF0ZS5mbHVzaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdC5mbHVzaFF1ZXVlLnB1c2goW3Jlc29sdmUsIHJlc3VsdF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHByb21pc2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocmVzdWx0ICYmIHJlc3VsdC5zdGF0dXMpIHtcbiAgICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihyZXN1bHQuZGF0YSk7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzdWx0LmRhdGEpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdub3RoaW5nIGV4cGVjdCByZXR1cm4gZnJvbSBzZXJ2ZXInKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90aGluZyBleHBlY3QgcmV0dXJuIGZyb20gc2VydmVyJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL21vY2svbW9jay50c1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciByZXNwb25zZV8xID0gcmVxdWlyZSgnLi9yZXNwb25zZScpO1xudmFyIG1vY2tfMSA9IHJlcXVpcmUoJy4vbW9jaycpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5leHBvcnRzLmZsdXNoU3RhdGUgPSB7XG4gICAgZmx1c2hlZDogZmFsc2Vcbn07XG52YXIgQmFja2VuZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQmFja2VuZCgpIHtcbiAgICAgICAgZXhwb3J0cy5mbHVzaFN0YXRlLmZsdXNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgQmFja2VuZC5wcm90b3R5cGUud2hlbkdFVCA9IGZ1bmN0aW9uICh1cmkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyByZXNwb25zZV8xLkh0dHBSZXNwb25zZSh1cmksICdnZXQnKTtcbiAgICB9O1xuICAgIEJhY2tlbmQucHJvdG90eXBlLndoZW5QVVQgPSBmdW5jdGlvbiAodXJpLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgcmVzcG9uc2VfMS5IdHRwUmVzcG9uc2UodXJpLCAncHV0JywgZGF0YSk7XG4gICAgfTtcbiAgICBCYWNrZW5kLnByb3RvdHlwZS53aGVuUE9TVCA9IGZ1bmN0aW9uICh1cmksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG5ldyByZXNwb25zZV8xLkh0dHBSZXNwb25zZSh1cmksICdwb3N0JywgZGF0YSk7XG4gICAgfTtcbiAgICBCYWNrZW5kLnByb3RvdHlwZS53aGVuREVMRVRFID0gZnVuY3Rpb24gKHVyaSkge1xuICAgICAgICByZXR1cm4gbmV3IHJlc3BvbnNlXzEuSHR0cFJlc3BvbnNlKHVyaSwgJ2RlbGV0ZScpO1xuICAgIH07XG4gICAgQmFja2VuZC5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHV0aWxzXzEuZm9yRWFjaChtb2NrXzEuZmV0Y2hTdGFjaywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHV0aWxzXzEuZm9yRWFjaCh2YWx1ZS5mbHVzaFF1ZXVlLCBmdW5jdGlvbiAocmVzb2x2ZXMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlc1swXShyZXNvbHZlc1sxXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGV4cG9ydHMuZmx1c2hTdGF0ZS5mbHVzaGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHJldHVybiBCYWNrZW5kO1xufSkoKTtcbmV4cG9ydHMuQmFja2VuZCA9IEJhY2tlbmQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbW9jay9iYWNrZW5kLnRzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG1vY2tfMSA9IHJlcXVpcmUoJy4vbW9jaycpO1xudmFyIEh0dHBSZXNwb25zZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSHR0cFJlc3BvbnNlKHVyaSwgbWV0aG9kLCBkYXRhKSB7XG4gICAgICAgIHZhciBkYXRhUGF0aDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGFQYXRoID0gZGF0YSA/IG1vY2tfMS5wYXJzZU9iamVjdChkYXRhKSA6ICcnO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgbWV0aG9kID0gbWV0aG9kID8gbWV0aG9kLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSB1cmkgKyBtZXRob2QgKyBkYXRhUGF0aDtcbiAgICB9XG4gICAgSHR0cFJlc3BvbnNlLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgbW9ja18xLmZldGNoU3RhY2tbdGhpcy5uYW1lc3BhY2VdID0ge1xuICAgICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgICBmbHVzaFF1ZXVlOiBbXSxcbiAgICAgICAgICAgIGpzb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIEh0dHBSZXNwb25zZS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSwgc3RhdHVzKSB7XG4gICAgICAgIG1vY2tfMS5mZXRjaFN0YWNrW3RoaXMubmFtZXNwYWNlXSA9IHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgICAgZGF0YTogbWVzc2FnZSxcbiAgICAgICAgICAgIGpzb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBIdHRwUmVzcG9uc2U7XG59KSgpO1xuZXhwb3J0cy5IdHRwUmVzcG9uc2UgPSBIdHRwUmVzcG9uc2U7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbW9jay9yZXNwb25zZS50c1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydHMuZm9yRWFjaCA9IGZ1bmN0aW9uICh0YXJnZXQsIGVhY2hGdW5jKSB7XG4gICAgdmFyIGxlbmd0aDtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgbGVuZ3RoID0gdGFyZ2V0Lmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZWFjaEZ1bmModGFyZ2V0W2ldLCBpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIGVhY2hGdW5jKHRhcmdldFtrZXldLCBrZXkpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9tb2NrL3V0aWxzLnRzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==