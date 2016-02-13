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
	            console.error(result.data);
	            throw new Error(result.data);
	        }
	        else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZjc0ZmUzOWJmMDNhY2FhYTE0NDAiLCJ3ZWJwYWNrOi8vLy4vbW9jay9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9tb2NrL21vY2sudHMiLCJ3ZWJwYWNrOi8vLy4vbW9jay9iYWNrZW5kLnRzIiwid2VicGFjazovLy8uL21vY2svcmVzcG9uc2UudHMiLCJ3ZWJwYWNrOi8vLy4vbW9jay91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsdUJBQWU7QUFDZjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7OztBQ3RDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFhO0FBQ2IsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLEVBQUM7QUFDRDs7Ozs7OztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7Ozs7Ozs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsWUFBWTtBQUNuQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixZQUFZO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZGlzdC9tb2NrLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG5cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGV4cG9ydHM6IHt9LFxuIFx0XHRcdGlkOiBtb2R1bGVJZCxcbiBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oMCk7XG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL2Jvb3RzdHJhcCBmNzRmZTM5YmYwM2FjYWFhMTQ0MFxuICoqLyIsImZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5fX2V4cG9ydChyZXF1aXJlKCcuL21vY2snKSk7XG5fX2V4cG9ydChyZXF1aXJlKCcuL2JhY2tlbmQnKSk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbW9jay9pbmRleC50c1xuICoqIG1vZHVsZSBpZCA9IDBcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBiYWNrZW5kXzEgPSByZXF1aXJlKCcuL2JhY2tlbmQnKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZSgnLi91dGlscycpO1xuZXhwb3J0cy5mZXRjaFN0YWNrID0ge307XG5leHBvcnRzLnBhcnNlT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIGlmICh0eXBlb2Ygb2JqID09PSAnc3RyaW5nJykge1xuICAgICAgICBvYmogPSBKU09OLnBhcnNlKG9iaik7XG4gICAgfVxuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICB1dGlsc18xLmZvckVhY2gob2JqLCBmdW5jdGlvbiAoZWxlbWVudCwga2V5KSB7XG4gICAgICAgIGlmIChlbGVtZW50ICYmIHR5cGVvZiBlbGVtZW50ID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgcmVzdWx0ICs9IGtleSArIGV4cG9ydHMucGFyc2VPYmplY3QoZWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQgKz0ga2V5ICsgZWxlbWVudDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xudmFyIGNvbnRleHQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IGdsb2JhbDtcbmNvbnRleHRbJ2ZldGNoJ10gPSBmdW5jdGlvbiAodXJpLCBvcHRpb25zKSB7XG4gICAgdmFyIG1ldGhvZCA9IG9wdGlvbnMubWV0aG9kID8gb3B0aW9ucy5tZXRob2QudG9Mb3dlckNhc2UoKSA6ICcnO1xuICAgIGlmIChtZXRob2QgIT09ICdvcHRpb25zJykge1xuICAgICAgICB2YXIgZGF0YVBhdGggPSBvcHRpb25zLmJvZHkgPyBleHBvcnRzLnBhcnNlT2JqZWN0KG9wdGlvbnMuYm9keSkgOiAnJztcbiAgICAgICAgdmFyIHJlc3VsdCA9IGV4cG9ydHMuZmV0Y2hTdGFja1t1cmkgKyBtZXRob2QgKyBkYXRhUGF0aF07XG4gICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0LnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICB2YXIgcHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICBpZiAoYmFja2VuZF8xLmZsdXNoU3RhdGUuZmx1c2hlZCkge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHQuZmx1c2hRdWV1ZS5wdXNoKFtyZXNvbHZlLCByZXN1bHRdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBwcm9taXNlO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCAmJiByZXN1bHQuc3RhdHVzKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHJlc3VsdC5kYXRhKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihyZXN1bHQuZGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdub3RoaW5nIGV4cGVjdCByZXR1cm4gZnJvbSBzZXJ2ZXInKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignbm90aGluZyBleHBlY3QgcmV0dXJuIGZyb20gc2VydmVyJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL21vY2svbW9jay50c1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciByZXNwb25zZV8xID0gcmVxdWlyZSgnLi9yZXNwb25zZScpO1xudmFyIG1vY2tfMSA9IHJlcXVpcmUoJy4vbW9jaycpO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG5leHBvcnRzLmZsdXNoU3RhdGUgPSB7XG4gICAgZmx1c2hlZDogZmFsc2Vcbn07XG52YXIgQmFja2VuZCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gQmFja2VuZCgpIHtcbiAgICAgICAgZXhwb3J0cy5mbHVzaFN0YXRlLmZsdXNoZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgQmFja2VuZC5wcm90b3R5cGUud2hlbkdFVCA9IGZ1bmN0aW9uICh1cmkpIHtcbiAgICAgICAgcmV0dXJuIG5ldyByZXNwb25zZV8xLkh0dHBSZXNwb25zZSh1cmksICdnZXQnKTtcbiAgICB9O1xuICAgIEJhY2tlbmQucHJvdG90eXBlLndoZW5QVVQgPSBmdW5jdGlvbiAodXJpLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBuZXcgcmVzcG9uc2VfMS5IdHRwUmVzcG9uc2UodXJpLCAncHV0JywgZGF0YSk7XG4gICAgfTtcbiAgICBCYWNrZW5kLnByb3RvdHlwZS53aGVuUE9TVCA9IGZ1bmN0aW9uICh1cmksIGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIG5ldyByZXNwb25zZV8xLkh0dHBSZXNwb25zZSh1cmksICdwb3N0JywgZGF0YSk7XG4gICAgfTtcbiAgICBCYWNrZW5kLnByb3RvdHlwZS53aGVuREVMRVRFID0gZnVuY3Rpb24gKHVyaSkge1xuICAgICAgICByZXR1cm4gbmV3IHJlc3BvbnNlXzEuSHR0cFJlc3BvbnNlKHVyaSwgJ2RlbGV0ZScpO1xuICAgIH07XG4gICAgQmFja2VuZC5wcm90b3R5cGUuZmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHV0aWxzXzEuZm9yRWFjaChtb2NrXzEuZmV0Y2hTdGFjaywgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgICAgIHV0aWxzXzEuZm9yRWFjaCh2YWx1ZS5mbHVzaFF1ZXVlLCBmdW5jdGlvbiAocmVzb2x2ZXMpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlc1swXShyZXNvbHZlc1sxXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGV4cG9ydHMuZmx1c2hTdGF0ZS5mbHVzaGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHJldHVybiBCYWNrZW5kO1xufSkoKTtcbmV4cG9ydHMuQmFja2VuZCA9IEJhY2tlbmQ7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbW9jay9iYWNrZW5kLnRzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG1vY2tfMSA9IHJlcXVpcmUoJy4vbW9jaycpO1xudmFyIEh0dHBSZXNwb25zZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gSHR0cFJlc3BvbnNlKHVyaSwgbWV0aG9kLCBkYXRhKSB7XG4gICAgICAgIHZhciBkYXRhUGF0aDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGFQYXRoID0gZGF0YSA/IG1vY2tfMS5wYXJzZU9iamVjdChkYXRhKSA6ICcnO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgbWV0aG9kID0gbWV0aG9kID8gbWV0aG9kLnRvTG93ZXJDYXNlKCkgOiAnJztcbiAgICAgICAgdGhpcy5uYW1lc3BhY2UgPSB1cmkgKyBtZXRob2QgKyBkYXRhUGF0aDtcbiAgICB9XG4gICAgSHR0cFJlc3BvbnNlLnByb3RvdHlwZS5yZXNwb25kID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgbW9ja18xLmZldGNoU3RhY2tbdGhpcy5uYW1lc3BhY2VdID0ge1xuICAgICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgICBmbHVzaFF1ZXVlOiBbXSxcbiAgICAgICAgICAgIGpzb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIEh0dHBSZXNwb25zZS5wcm90b3R5cGUuZXJyb3IgPSBmdW5jdGlvbiAobWVzc2FnZSwgc3RhdHVzKSB7XG4gICAgICAgIG1vY2tfMS5mZXRjaFN0YWNrW3RoaXMubmFtZXNwYWNlXSA9IHtcbiAgICAgICAgICAgIHN0YXR1czogc3RhdHVzLFxuICAgICAgICAgICAgZGF0YTogbWVzc2FnZSxcbiAgICAgICAgICAgIGpzb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVzc2FnZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHJldHVybiBIdHRwUmVzcG9uc2U7XG59KSgpO1xuZXhwb3J0cy5IdHRwUmVzcG9uc2UgPSBIdHRwUmVzcG9uc2U7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vbW9jay9yZXNwb25zZS50c1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImV4cG9ydHMuZm9yRWFjaCA9IGZ1bmN0aW9uICh0YXJnZXQsIGVhY2hGdW5jKSB7XG4gICAgdmFyIGxlbmd0aDtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgbGVuZ3RoID0gdGFyZ2V0Lmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZWFjaEZ1bmModGFyZ2V0W2ldLCBpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpO1xuICAgICAgICB2YXIga2V5O1xuICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICAgIGVhY2hGdW5jKHRhcmdldFtrZXldLCBrZXkpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9tb2NrL3V0aWxzLnRzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==