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

	__webpack_require__(1);
	module.exports = __webpack_require__(2);


/***/ },
/* 1 */
/***/ function(module, exports) {

	(function() {
	  'use strict';
	
	  if (self.fetch) {
	    return
	  }
	
	  function normalizeName(name) {
	    if (typeof name !== 'string') {
	      name = String(name)
	    }
	    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
	      throw new TypeError('Invalid character in header field name')
	    }
	    return name.toLowerCase()
	  }
	
	  function normalizeValue(value) {
	    if (typeof value !== 'string') {
	      value = String(value)
	    }
	    return value
	  }
	
	  function Headers(headers) {
	    this.map = {}
	
	    if (headers instanceof Headers) {
	      headers.forEach(function(value, name) {
	        this.append(name, value)
	      }, this)
	
	    } else if (headers) {
	      Object.getOwnPropertyNames(headers).forEach(function(name) {
	        this.append(name, headers[name])
	      }, this)
	    }
	  }
	
	  Headers.prototype.append = function(name, value) {
	    name = normalizeName(name)
	    value = normalizeValue(value)
	    var list = this.map[name]
	    if (!list) {
	      list = []
	      this.map[name] = list
	    }
	    list.push(value)
	  }
	
	  Headers.prototype['delete'] = function(name) {
	    delete this.map[normalizeName(name)]
	  }
	
	  Headers.prototype.get = function(name) {
	    var values = this.map[normalizeName(name)]
	    return values ? values[0] : null
	  }
	
	  Headers.prototype.getAll = function(name) {
	    return this.map[normalizeName(name)] || []
	  }
	
	  Headers.prototype.has = function(name) {
	    return this.map.hasOwnProperty(normalizeName(name))
	  }
	
	  Headers.prototype.set = function(name, value) {
	    this.map[normalizeName(name)] = [normalizeValue(value)]
	  }
	
	  Headers.prototype.forEach = function(callback, thisArg) {
	    Object.getOwnPropertyNames(this.map).forEach(function(name) {
	      this.map[name].forEach(function(value) {
	        callback.call(thisArg, value, name, this)
	      }, this)
	    }, this)
	  }
	
	  function consumed(body) {
	    if (body.bodyUsed) {
	      return Promise.reject(new TypeError('Already read'))
	    }
	    body.bodyUsed = true
	  }
	
	  function fileReaderReady(reader) {
	    return new Promise(function(resolve, reject) {
	      reader.onload = function() {
	        resolve(reader.result)
	      }
	      reader.onerror = function() {
	        reject(reader.error)
	      }
	    })
	  }
	
	  function readBlobAsArrayBuffer(blob) {
	    var reader = new FileReader()
	    reader.readAsArrayBuffer(blob)
	    return fileReaderReady(reader)
	  }
	
	  function readBlobAsText(blob) {
	    var reader = new FileReader()
	    reader.readAsText(blob)
	    return fileReaderReady(reader)
	  }
	
	  var support = {
	    blob: 'FileReader' in self && 'Blob' in self && (function() {
	      try {
	        new Blob();
	        return true
	      } catch(e) {
	        return false
	      }
	    })(),
	    formData: 'FormData' in self,
	    arrayBuffer: 'ArrayBuffer' in self
	  }
	
	  function Body() {
	    this.bodyUsed = false
	
	
	    this._initBody = function(body) {
	      this._bodyInit = body
	      if (typeof body === 'string') {
	        this._bodyText = body
	      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
	        this._bodyBlob = body
	      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
	        this._bodyFormData = body
	      } else if (!body) {
	        this._bodyText = ''
	      } else if (support.arrayBuffer && ArrayBuffer.prototype.isPrototypeOf(body)) {
	        // Only support ArrayBuffers for POST method.
	        // Receiving ArrayBuffers happens via Blobs, instead.
	      } else {
	        throw new Error('unsupported BodyInit type')
	      }
	    }
	
	    if (support.blob) {
	      this.blob = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return Promise.resolve(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as blob')
	        } else {
	          return Promise.resolve(new Blob([this._bodyText]))
	        }
	      }
	
	      this.arrayBuffer = function() {
	        return this.blob().then(readBlobAsArrayBuffer)
	      }
	
	      this.text = function() {
	        var rejected = consumed(this)
	        if (rejected) {
	          return rejected
	        }
	
	        if (this._bodyBlob) {
	          return readBlobAsText(this._bodyBlob)
	        } else if (this._bodyFormData) {
	          throw new Error('could not read FormData body as text')
	        } else {
	          return Promise.resolve(this._bodyText)
	        }
	      }
	    } else {
	      this.text = function() {
	        var rejected = consumed(this)
	        return rejected ? rejected : Promise.resolve(this._bodyText)
	      }
	    }
	
	    if (support.formData) {
	      this.formData = function() {
	        return this.text().then(decode)
	      }
	    }
	
	    this.json = function() {
	      return this.text().then(JSON.parse)
	    }
	
	    return this
	  }
	
	  // HTTP methods whose capitalization should be normalized
	  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']
	
	  function normalizeMethod(method) {
	    var upcased = method.toUpperCase()
	    return (methods.indexOf(upcased) > -1) ? upcased : method
	  }
	
	  function Request(input, options) {
	    options = options || {}
	    var body = options.body
	    if (Request.prototype.isPrototypeOf(input)) {
	      if (input.bodyUsed) {
	        throw new TypeError('Already read')
	      }
	      this.url = input.url
	      this.credentials = input.credentials
	      if (!options.headers) {
	        this.headers = new Headers(input.headers)
	      }
	      this.method = input.method
	      this.mode = input.mode
	      if (!body) {
	        body = input._bodyInit
	        input.bodyUsed = true
	      }
	    } else {
	      this.url = input
	    }
	
	    this.credentials = options.credentials || this.credentials || 'omit'
	    if (options.headers || !this.headers) {
	      this.headers = new Headers(options.headers)
	    }
	    this.method = normalizeMethod(options.method || this.method || 'GET')
	    this.mode = options.mode || this.mode || null
	    this.referrer = null
	
	    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
	      throw new TypeError('Body not allowed for GET or HEAD requests')
	    }
	    this._initBody(body)
	  }
	
	  Request.prototype.clone = function() {
	    return new Request(this)
	  }
	
	  function decode(body) {
	    var form = new FormData()
	    body.trim().split('&').forEach(function(bytes) {
	      if (bytes) {
	        var split = bytes.split('=')
	        var name = split.shift().replace(/\+/g, ' ')
	        var value = split.join('=').replace(/\+/g, ' ')
	        form.append(decodeURIComponent(name), decodeURIComponent(value))
	      }
	    })
	    return form
	  }
	
	  function headers(xhr) {
	    var head = new Headers()
	    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
	    pairs.forEach(function(header) {
	      var split = header.trim().split(':')
	      var key = split.shift().trim()
	      var value = split.join(':').trim()
	      head.append(key, value)
	    })
	    return head
	  }
	
	  Body.call(Request.prototype)
	
	  function Response(bodyInit, options) {
	    if (!options) {
	      options = {}
	    }
	
	    this._initBody(bodyInit)
	    this.type = 'default'
	    this.status = options.status
	    this.ok = this.status >= 200 && this.status < 300
	    this.statusText = options.statusText
	    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
	    this.url = options.url || ''
	  }
	
	  Body.call(Response.prototype)
	
	  Response.prototype.clone = function() {
	    return new Response(this._bodyInit, {
	      status: this.status,
	      statusText: this.statusText,
	      headers: new Headers(this.headers),
	      url: this.url
	    })
	  }
	
	  Response.error = function() {
	    var response = new Response(null, {status: 0, statusText: ''})
	    response.type = 'error'
	    return response
	  }
	
	  var redirectStatuses = [301, 302, 303, 307, 308]
	
	  Response.redirect = function(url, status) {
	    if (redirectStatuses.indexOf(status) === -1) {
	      throw new RangeError('Invalid status code')
	    }
	
	    return new Response(null, {status: status, headers: {location: url}})
	  }
	
	  self.Headers = Headers;
	  self.Request = Request;
	  self.Response = Response;
	
	  self.fetch = function(input, init) {
	    return new Promise(function(resolve, reject) {
	      var request
	      if (Request.prototype.isPrototypeOf(input) && !init) {
	        request = input
	      } else {
	        request = new Request(input, init)
	      }
	
	      var xhr = new XMLHttpRequest()
	
	      function responseURL() {
	        if ('responseURL' in xhr) {
	          return xhr.responseURL
	        }
	
	        // Avoid security warnings on getResponseHeader when not allowed by CORS
	        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
	          return xhr.getResponseHeader('X-Request-URL')
	        }
	
	        return;
	      }
	
	      xhr.onload = function() {
	        var status = (xhr.status === 1223) ? 204 : xhr.status
	        if (status < 100 || status > 599) {
	          reject(new TypeError('Network request failed'))
	          return
	        }
	        var options = {
	          status: status,
	          statusText: xhr.statusText,
	          headers: headers(xhr),
	          url: responseURL()
	        }
	        var body = 'response' in xhr ? xhr.response : xhr.responseText;
	        resolve(new Response(body, options))
	      }
	
	      xhr.onerror = function() {
	        reject(new TypeError('Network request failed'))
	      }
	
	      xhr.open(request.method, request.url, true)
	
	      if (request.credentials === 'include') {
	        xhr.withCredentials = true
	      }
	
	      if ('responseType' in xhr && support.blob) {
	        xhr.responseType = 'blob'
	      }
	
	      request.headers.forEach(function(value, name) {
	        xhr.setRequestHeader(name, value)
	      })
	
	      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
	    })
	  }
	  self.fetch.polyfill = true
	})();


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(3));
	__export(__webpack_require__(6));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _1 = __webpack_require__(4);
	var apiHost;
	var apiPath = ['Version', 'Type', 'Id', 'Path1', 'Path2', 'Path3'];
	var Fetch = (function () {
	    function Fetch() {
	        this.opts = {
	            headers: {
	                'Accept': 'application/json',
	                'Content-Type': 'application/json'
	            }
	        };
	        this.opts.credentials = 'include';
	        apiHost = 'https://www.teambition.com/api';
	    }
	    Fetch.prototype.setAPIHost = function (host) {
	        apiHost = host;
	    };
	    Fetch.prototype.setToken = function (token) {
	        delete this.opts.credentials;
	        this.opts.headers.Authorization = "OAuth2 " + token;
	        apiHost = 'https://api.teambition.com';
	    };
	    Fetch.prototype.get = function (paths) {
	        var url = this.buildURI(paths);
	        return fetch(url, _1.assign({
	            method: 'get'
	        }, this.opts))
	            .then(function (data) {
	            return data.json();
	        });
	    };
	    Fetch.prototype.post = function (paths, data) {
	        var url = this.buildURI(paths);
	        return fetch(url, _1.assign({
	            method: 'post',
	            body: JSON.stringify(data)
	        }, this.opts))
	            .then(function (data) {
	            return data.json();
	        });
	    };
	    Fetch.prototype.put = function (paths, data) {
	        var url = this.buildURI(paths);
	        return fetch(url, _1.assign({
	            method: 'put',
	            body: JSON.stringify(data)
	        }, this.opts))
	            .then(function (data) {
	            return data.json();
	        });
	    };
	    Fetch.prototype.delete = function (paths) {
	        var url = this.buildURI(paths);
	        return fetch(url, _1.assign({
	            method: 'delete'
	        }, this.opts))
	            .then(function (data) {
	            return data.json();
	        });
	    };
	    Fetch.prototype.buildURI = function (path) {
	        var uris = [];
	        var querys = [];
	        _1.forEach(path, function (val, key) {
	            var position = apiPath.indexOf(key);
	            if (position !== -1) {
	                uris[position] = val;
	            }
	            else {
	                querys.push(key + "=" + val);
	            }
	        });
	        var url = apiHost + uris.join('/');
	        url = querys.length ? url + '?' + querys.join('&') : url;
	        return url;
	    };
	    return Fetch;
	})();
	exports.tbFetch = new Fetch();


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var schema_1 = __webpack_require__(5);
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
	exports.assign = function (target, origin) {
	    exports.forEach(origin, function (val, key) {
	        target[key] = origin[key];
	    });
	    return target;
	};
	exports.clone = function (origin) {
	    if (typeof origin === 'undefined' || typeof origin !== 'object') {
	        return;
	    }
	    var target;
	    if (origin instanceof Array) {
	        target = new Array();
	    }
	    else {
	        target = Object.create(null);
	    }
	    exports.forEach(origin, function (val, key) {
	        if (typeof val === 'object') {
	            // null
	            if (val) {
	                target[key] = exports.clone(val);
	            }
	            else {
	                target[key] = val;
	            }
	        }
	        target[key] = val;
	    });
	    return target;
	};
	var s4 = function () {
	    return Math.floor((1 + Math.random()) * 0x10000)
	        .toString(16)
	        .substring(1);
	};
	var uuidStack = [];
	exports.uuid = function () {
	    var UUID = s4() + s4();
	    while (uuidStack.indexOf(UUID) !== -1) {
	        UUID = s4() + s4();
	    }
	    uuidStack.push(UUID);
	    return UUID;
	};
	exports.datasToSchemas = function (datas, Schema) {
	    var result = new Array();
	    exports.forEach(datas, function (data, index) {
	        result.push(schema_1.setSchema(Schema, data));
	    });
	    return result;
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var utils_1 = __webpack_require__(4);
	exports.setSchema = function (target, data) {
	    target.$$keys.forEach(function (key) {
	        target[key] = data[key];
	    });
	    target.$$data = data;
	    utils_1.forEach(target, function (value, key) {
	        if (key === '$$data') {
	            Object.defineProperty(target, key, {
	                enumerable: false,
	                configurable: true
	            });
	        }
	        else if (key === '$$keys') {
	            Object.defineProperty(target, key, {
	                enumerable: false,
	                set: function (newVal) {
	                    value = newVal;
	                },
	                get: function () {
	                    return value;
	                }
	            });
	        }
	        else {
	            if (typeof data[key] === 'undefined') {
	                target.$$keys.add(key);
	            }
	            Object.defineProperty(target, key, {
	                get: function () {
	                    if (target.$$data) {
	                        return target.$$data[key];
	                    }
	                },
	                set: function (newVal) {
	                    if (target.$$data) {
	                        target.$$data[key] = newVal;
	                        target.$$keys.delete(key);
	                    }
	                },
	                configurable: true
	            });
	        }
	    });
	    return target;
	};
	var Schema = (function () {
	    function Schema() {
	        this.$$keys = new Set();
	    }
	    return Schema;
	})();
	exports.Schema = Schema;


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	function __export(m) {
	    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	__export(__webpack_require__(7));
	__export(__webpack_require__(13));
	__export(__webpack_require__(17));


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var fetch_1 = __webpack_require__(3);
	var user_model_1 = __webpack_require__(8);
	exports.UserAPI = {
	    getUserMe: function () {
	        var cache = user_model_1.default.get();
	        if (cache) {
	            return new Promise(function (resolve, reject) {
	                resolve(cache);
	            });
	        }
	        else {
	            return fetch_1.tbFetch.get({
	                Type: 'users',
	                Id: 'me'
	            })
	                .then(function (userMe) {
	                return user_model_1.default.set(userMe);
	            });
	        }
	    },
	    update: function (patch) {
	        return fetch_1.tbFetch.put({
	            Type: 'users',
	            Id: 'me'
	        }, patch)
	            .then(function (userMe) {
	            user_model_1.default.update(userMe);
	            return userMe;
	        });
	    },
	    addEmail: function (email) {
	        return fetch_1.tbFetch.post({
	            Type: 'users',
	            Id: 'email'
	        }, {
	            email: email
	        }).then(function (data) {
	            user_model_1.default.updateEmail(data);
	            return data;
	        });
	    },
	    bindPhone: function (phone, vcode) {
	        return fetch_1.tbFetch.put({
	            Type: 'users',
	            Id: 'phone'
	        }, {
	            phone: phone,
	            vcode: vcode
	        }).then(function (data) {
	            user_model_1.default.update({
	                phone: phone
	            });
	        });
	    }
	};


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var model_1 = __webpack_require__(9);
	var UserModel = (function (_super) {
	    __extends(UserModel, _super);
	    function UserModel() {
	        _super.apply(this, arguments);
	        this.namespace = 'user:me';
	    }
	    UserModel.prototype.set = function (data) {
	        return this.setOne(this.namespace, data);
	    };
	    UserModel.prototype.get = function () {
	        return this.getOne(this.namespace);
	    };
	    UserModel.prototype.update = function (patch) {
	        this.updateOne(this.namespace, patch);
	    };
	    UserModel.prototype.updateEmail = function (emails) {
	        this.updateOne(this.namespace, {
	            emails: emails
	        });
	    };
	    return UserModel;
	})(model_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new UserModel();


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var database_1 = __webpack_require__(10);
	var Model = (function () {
	    function Model() {
	    }
	    Model.prototype.setOne = function (namespace, data) {
	        database_1.default.storeOne(namespace, data);
	        return database_1.default.getOne(namespace);
	    };
	    Model.prototype.setCollection = function (namespace, data) {
	        database_1.default.storeCollection(namespace, data);
	        return database_1.default.getOne(namespace);
	    };
	    Model.prototype.getOne = function (namespace) {
	        return database_1.default.getOne(namespace);
	    };
	    Model.prototype.updateOne = function (namespace, patch) {
	        var Cache = database_1.default.getOne(namespace);
	        if (Cache) {
	            database_1.default.updateOne(namespace, patch);
	        }
	    };
	    Model.prototype.removeOne = function (namespace) {
	        return database_1.default.delete(namespace);
	    };
	    return Model;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Model;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var utils_1 = __webpack_require__(4);
	var track_1 = __webpack_require__(11);
	var union_object_1 = __webpack_require__(12);
	var DataBase = (function () {
	    function DataBase() {
	        this.data = {};
	        this.timeoutIndex = {};
	        this.typeIndex = {};
	        this.dataMaps = {};
	        this.collectionIndex = {};
	    }
	    DataBase.prototype.storeOne = function (index, data, expire) {
	        var _this = this;
	        if (expire === void 0) { expire = 0; }
	        if (!this.data[index]) {
	            var result = this.data[index] = data;
	            if (expire && typeof expire === 'number') {
	                var timeoutIndex = window.setTimeout(function () {
	                    delete _this.data[index];
	                }, expire);
	                this.timeoutIndex[index] = {
	                    timer: timeoutIndex,
	                    begin: Date.now(),
	                    expire: expire
	                };
	            }
	            track_1.trackObject(result);
	            this.typeIndex[index] = 'object';
	        }
	    };
	    DataBase.prototype.storeCollection = function (index, collection, expire) {
	        var _this = this;
	        if (expire === void 0) { expire = 0; }
	        var indexes = this.collectionIndex[index] = [];
	        if (!this.data[index]) {
	            var result = [];
	            utils_1.forEach(collection, function (val, key) {
	                var cache = _this.getOne(val._id);
	                if (cache) {
	                    result.push(cache);
	                }
	                else {
	                    result.push(val);
	                    _this.storeOne(val._id, val);
	                }
	                var maps = _this.dataMaps[val._id];
	                if (maps) {
	                    maps.push(index);
	                }
	                else {
	                    _this.dataMaps[val._id] = [index];
	                }
	                indexes.push(val._id);
	            });
	            this.data[index] = result;
	            if (expire && typeof expire === 'number') {
	                var timeoutIndex = window.setTimeout(function () {
	                    delete _this.data[index];
	                }, expire);
	                this.timeoutIndex[index] = {
	                    timer: timeoutIndex,
	                    begin: Date.now(),
	                    expire: expire
	                };
	            }
	            track_1.trackCollection(index, result);
	            this.typeIndex[index] = 'collection';
	        }
	    };
	    DataBase.prototype.updateCollection = function (index, patch) {
	        var _this = this;
	        var cache = this.data[index];
	        if (cache && patch instanceof Array) {
	            var indexs = this.collectionIndex[index];
	            utils_1.forEach(patch, function (val, key) {
	                var oldEle = cache[key];
	                if (oldEle._id === val._id) {
	                    utils_1.assign(oldEle, val);
	                }
	                else {
	                    var targetId = val._id;
	                    if (indexs.indexOf(targetId) === -1) {
	                        cache.splice(key, 0, val);
	                        indexs.splice(key, 0, targetId);
	                        _this.storeOne(val._id, val);
	                    }
	                    else {
	                        var oldIndex = indexs.indexOf(targetId, key);
	                        cache.splice(oldIndex, 1);
	                        indexs.splice(oldIndex, 1);
	                        cache.splice(key, 0, val);
	                        indexs.splice(key, 0, targetId);
	                    }
	                }
	            });
	        }
	    };
	    DataBase.prototype.updateOne = function (index, patch, expire) {
	        var _this = this;
	        if (expire === void 0) { expire = 0; }
	        var _patch = utils_1.clone(patch);
	        var val = this.data[index];
	        if (val) {
	            if (typeof patch === 'object') {
	                val = utils_1.assign(val, _patch);
	                if (expire && typeof expire === 'number') {
	                    var timer = this.timeoutIndex[index].timer;
	                    this.timeoutIndex[index].expire = expire;
	                    this.timeoutIndex[index].begin = Date.now();
	                    window.clearTimeout(timer);
	                    window.setTimeout(function () {
	                        delete _this.data[index];
	                    }, expire);
	                }
	                this.data[index] = val;
	            }
	            else {
	                throw 'Patch target should be Object';
	            }
	        }
	        else {
	            throw 'Data is not existed, can not update';
	        }
	    };
	    DataBase.prototype.getOne = function (index) {
	        var data = this.data[index];
	        var result;
	        if (data) {
	            if (this.typeIndex[index] === 'collection') {
	                result = utils_1.clone(data);
	                track_1.trackOne(result, index);
	            }
	            else {
	                result = new union_object_1.BaseObject(data);
	                track_1.trackOne(result);
	            }
	            return result;
	        }
	        else {
	            return false;
	        }
	    };
	    DataBase.prototype.delete = function (index) {
	        var _this = this;
	        delete this.data[index];
	        var maps = this.dataMaps[index];
	        if (maps && maps.length) {
	            utils_1.forEach(maps, function (collectionIndex) {
	                var indexes = _this.collectionIndex[collectionIndex];
	                var collection = _this.data[collectionIndex];
	                var position = indexes.indexOf(index);
	                indexes.splice(position, 1);
	                collection.splice(position, 1);
	            });
	        }
	    };
	    DataBase.prototype.getExpire = function (index) {
	        var timerIndex = this.timeoutIndex[index];
	        return timerIndex.begin - timerIndex.expire;
	    };
	    return DataBase;
	})();
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new DataBase();


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var _1 = __webpack_require__(4);
	var trackIndex = {};
	exports.trackOne = function (target, index) {
	    var _id = index ? index : target._id;
	    if (_id && trackIndex[_id].indexOf(target) === -1) {
	        trackIndex[_id].push(target);
	    }
	};
	exports.trackObject = function (target) {
	    var _id = target._id;
	    if (_id) {
	        trackIndex[_id] = [];
	        _1.forEach(target, function (val, key) {
	            Object.defineProperty(target, key, {
	                set: function (newValue) {
	                    _1.forEach(trackIndex[_id], function (trackVal) {
	                        trackVal[key] = newValue;
	                    });
	                    val = newValue;
	                },
	                get: function () {
	                    return val;
	                },
	                enumerable: true,
	                configurable: true
	            });
	        });
	    }
	};
	exports.trackCollection = function (index, target) {
	    if (target instanceof Array) {
	        trackIndex[index] = [];
	        var splice = target.splice;
	        var push = target.push;
	        target.splice = function () {
	            _1.forEach(trackIndex[index], function (collection) {
	                splice.apply(collection, arguments);
	            });
	            return splice.apply(target, arguments);
	        };
	        target.push = function () {
	            _1.forEach(trackIndex[index], function (collection) {
	                push.apply(collection, arguments);
	            });
	            return push.apply(target, arguments);
	        };
	    }
	    else {
	        throw new Error('Could not track a none array object');
	    }
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var utils_1 = __webpack_require__(4);
	var $id = 1;
	exports.ObjectIndex = {};
	var BaseObject = (function () {
	    function BaseObject(target) {
	        var _this = this;
	        this.$id = "$" + $id;
	        var data = utils_1.clone(target);
	        var objectIndex = exports.ObjectIndex[("$" + $id)] = {
	            dataKeys: []
	        };
	        utils_1.forEach(data, function (val, key) {
	            objectIndex.dataKeys.push(key);
	            _this[key] = val;
	        });
	        $id++;
	    }
	    return BaseObject;
	})();
	exports.BaseObject = BaseObject;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var fetch_1 = __webpack_require__(3);
	var organization_model_1 = __webpack_require__(14);
	var member_model_1 = __webpack_require__(15);
	exports.OrganizationAPI = {
	    getAll: function () {
	        var cache = organization_model_1.default.getAll();
	        return cache ?
	            new Promise(function (resolve, reject) {
	                resolve(cache);
	            }) :
	            fetch_1.tbFetch.get({
	                Type: 'organizations'
	            }).then(function (organizations) {
	                return organization_model_1.default.setAll(organizations);
	            });
	    },
	    getOne: function (organizationId) {
	        var cache = organization_model_1.default.get(organizationId);
	        return cache ?
	            new Promise(function (resolve, reject) {
	                resolve(cache);
	            }) :
	            fetch_1.tbFetch.get({
	                Type: 'organizations',
	                Id: organizationId
	            })
	                .then(function (organization) {
	                return organization_model_1.default.set(organization);
	            });
	    },
	    getMembers: function (organizationId) {
	        var cache = member_model_1.default.getOrgMember(organizationId);
	        return cache ?
	            new Promise(function (resolve, reject) {
	                resolve(cache);
	            }) :
	            fetch_1.tbFetch.get({
	                Version: 'V2',
	                Type: 'organizations',
	                Id: organizationId,
	                Path1: 'members'
	            }).then(function (members) {
	                return member_model_1.default.setOrgMember(organizationId, members);
	            });
	    }
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var model_1 = __webpack_require__(9);
	var OrganizationModel = (function (_super) {
	    __extends(OrganizationModel, _super);
	    function OrganizationModel() {
	        _super.apply(this, arguments);
	    }
	    OrganizationModel.prototype.getAll = function () {
	        return this.getOne('organization');
	    };
	    OrganizationModel.prototype.get = function (id) {
	        return this.getOne(id);
	    };
	    OrganizationModel.prototype.setAll = function (organizations) {
	        return this.setCollection('organization', organizations);
	    };
	    OrganizationModel.prototype.set = function (data) {
	        return this.setOne(data._id, data);
	    };
	    return OrganizationModel;
	})(model_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new OrganizationModel();


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var model_1 = __webpack_require__(9);
	var utils_1 = __webpack_require__(4);
	var member_schema_1 = __webpack_require__(16);
	var schema_1 = __webpack_require__(5);
	var MemberModel = (function (_super) {
	    __extends(MemberModel, _super);
	    function MemberModel() {
	        _super.apply(this, arguments);
	    }
	    MemberModel.prototype.setProjectMembers = function (projectId, members) {
	        var result = [];
	        utils_1.forEach(members, function (member) {
	            result.push(schema_1.setSchema(new member_schema_1.default(), member));
	        });
	        this.setCollection("members:" + projectId, result);
	        return result;
	    };
	    MemberModel.prototype.getProjectMembers = function (projectId) {
	        return this.getOne("members:" + projectId);
	    };
	    MemberModel.prototype.removeMember = function (memberId) {
	        this.removeOne(memberId);
	    };
	    MemberModel.prototype.setOrgMember = function (organizationId, members) {
	        var result = [];
	        utils_1.forEach(members, function (member) {
	            result.push(schema_1.setSchema(new member_schema_1.default(), member));
	        });
	        this.setCollection("members:" + organizationId, result);
	        return result;
	    };
	    MemberModel.prototype.getOrgMember = function (organizationId) {
	        return this.getOne("members:" + organizationId);
	    };
	    return MemberModel;
	})(model_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new MemberModel();


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var schema_1 = __webpack_require__(5);
	var Member = (function (_super) {
	    __extends(Member, _super);
	    function Member() {
	        _super.apply(this, arguments);
	        this._id = undefined;
	        this._boundToObjectId = undefined;
	        this.boundToObjectType = undefined;
	        this._roleId = undefined;
	        this.visited = undefined;
	        this.joined = undefined;
	        this.pushStatus = undefined;
	        this.nickname = undefined;
	        this.nicknamePy = undefined;
	        this.nicknamePinyin = undefined;
	        this.hasVisited = undefined;
	        this._memberId = undefined;
	        this.phone = undefined;
	        this.location = undefined;
	        this.website = undefined;
	        this.latestActived = undefined;
	        this.isActive = undefined;
	        this.email = undefined;
	        this.name = undefined;
	        this.avatarUrl = undefined;
	        this.title = undefined;
	        this.pinyin = undefined;
	        this.py = undefined;
	    }
	    return Member;
	})(schema_1.Schema);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Member;


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var fetch_1 = __webpack_require__(3);
	var member_model_1 = __webpack_require__(15);
	var project_model_1 = __webpack_require__(18);
	exports.ProjectAPI = {
	    getMembers: function (projectId) {
	        var cache = member_model_1.default.getProjectMembers(projectId);
	        return cache ?
	            new Promise(function (resolve, reject) {
	                resolve(cache);
	            }) :
	            fetch_1.tbFetch.get({
	                Type: 'projects',
	                Id: projectId,
	                Path1: 'members'
	            })
	                .then(function (members) {
	                return member_model_1.default.setProjectMembers(projectId, members);
	            });
	    },
	    deleteMember: function (memberId) {
	        return fetch_1.tbFetch.delete({
	            Type: 'members',
	            Id: memberId
	        })
	            .then(function () {
	            member_model_1.default.removeMember(memberId);
	        });
	    },
	    getAll: function () {
	        var cache = project_model_1.default.getProjects();
	        return cache ?
	            new Promise(function (resolve, reject) {
	                resolve(cache);
	            }) :
	            fetch_1.tbFetch.get({
	                Type: 'projects'
	            })
	                .then(function (projects) {
	                return project_model_1.default.setProjects(projects);
	            });
	    }
	};


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var model_1 = __webpack_require__(9);
	var utils_1 = __webpack_require__(4);
	var project_schema_1 = __webpack_require__(19);
	var ProjectModel = (function (_super) {
	    __extends(ProjectModel, _super);
	    function ProjectModel() {
	        _super.apply(this, arguments);
	    }
	    ProjectModel.prototype.setProjects = function (projects) {
	        var result = utils_1.datasToSchemas(projects, new project_schema_1.default());
	        this.setCollection("projects", result);
	        return result;
	    };
	    ProjectModel.prototype.getProjects = function () {
	        return this.getOne('projects');
	    };
	    return ProjectModel;
	})(model_1.default);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = new ProjectModel();


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var schema_1 = __webpack_require__(5);
	var Project = (function (_super) {
	    __extends(Project, _super);
	    function Project() {
	        _super.apply(this, arguments);
	        this._id = undefined;
	        this.name = undefined;
	        this._creatorId = undefined;
	        this.logo = undefined;
	        this.py = undefined;
	        this.pinyin = undefined;
	        this.description = undefined;
	        this.category = undefined;
	        this._organizationId = undefined;
	        this.navigation = undefined;
	        this.visibility = undefined;
	        this.created = undefined;
	        this.updated = undefined;
	        this.isArchived = undefined;
	        this.inviteLink = undefined;
	        this.isStar = undefined;
	        this.hasRight = undefined;
	        this.hasOrgRight = undefined;
	        this.organization = undefined;
	        this.forksCount = undefined;
	        this.tasksCount = undefined;
	        this.postsCount = undefined;
	        this.eventsCount = undefined;
	        this.worksCount = undefined;
	        this.tagsCount = undefined;
	        this._defaultRoleId = undefined;
	        this.creator = undefined;
	        this.unreadCount = undefined;
	        this.unreadMessageCount = undefined;
	        this.pushStatus = undefined;
	        this.canQuit = undefined;
	        this.canDelete = undefined;
	        this.canArchive = undefined;
	        this.canTransfer = undefined;
	        this._roleId = undefined;
	        this.link = undefined;
	        this.mobileInviteLink = undefined;
	        this.signCode = undefined;
	        this.starsCount = undefined;
	        this._rootCollectionId = undefined;
	        this._defaultCollectionId = undefined;
	        this.shortLink = undefined;
	        this.calLink = undefined;
	        this.taskCalLink = undefined;
	        this._orgRoleId = undefined;
	    }
	    return Project;
	})(schema_1.Schema);
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.default = Project;


/***/ }
/******/ ]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAgZGI0YzJlYmZkZjgyYjcwMGFlMWIiLCJ3ZWJwYWNrOi8vLy4vfi93aGF0d2ctZmV0Y2gvZmV0Y2guanMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwcC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvdXRpbHMvZmV0Y2gudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL3V0aWxzL2luZGV4LnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL3NjaGVtYS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy91c2VyX2FwaS50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kZWxzL3VzZXJfbW9kZWwudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZGVscy9tb2RlbC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kZWxzL2RhdGFiYXNlLnRzIiwid2VicGFjazovLy8uL3NyYy91dGlscy90cmFjay50cyIsIndlYnBhY2s6Ly8vLi9zcmMvbW9kZWxzL3VuaW9uX29iamVjdC50cyIsIndlYnBhY2s6Ly8vLi9zcmMvYXBpcy9vcmdhbml6YXRpb25fYXBpLnRzIiwid2VicGFjazovLy8uL3NyYy9tb2RlbHMvb3JnYW5pemF0aW9uX21vZGVsLnRzIiwid2VicGFjazovLy8uL3NyYy9tb2RlbHMvbWVtYmVyX21vZGVsLnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL21lbWJlcl9zY2hlbWEudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2FwaXMvcHJvamVjdF9hcGkudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL21vZGVscy9wcm9qZWN0X21vZGVsLnRzIiwid2VicGFjazovLy8uL3NyYy9zY2hlbWFzL3Byb2plY3Rfc2NoZW1hLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7QUN0Q0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQU87O0FBRVAsTUFBSztBQUNMO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1AsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBTztBQUNQO0FBQ0EsUUFBTztBQUNQO0FBQ0EsUUFBTztBQUNQO0FBQ0EsUUFBTztBQUNQO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7O0FBRUE7QUFDQSx3Q0FBdUMsMEJBQTBCO0FBQ2pFO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQ0FBK0IsMEJBQTBCLGVBQWU7QUFDeEU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsUUFBTzs7QUFFUDtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsRUFBQzs7Ozs7OztBQzVYRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEOzs7Ozs7O0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF1QixZQUFZO0FBQ25DO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXVCLFlBQVk7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBO0FBQ0EsY0FBYTtBQUNiLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsVUFBUztBQUNULE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYTtBQUNiO0FBQ0E7QUFDQSxjQUFhO0FBQ2I7QUFDQTtBQUNBLGNBQWE7QUFDYjtBQUNBOzs7Ozs7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFtQixzQkFBc0I7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0QsK0NBQThDLGNBQWM7QUFDNUQ7Ozs7Ozs7QUN6QkE7QUFDQTtBQUNBO0FBQ0Esb0JBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0QsK0NBQThDLGNBQWM7QUFDNUQiLCJmaWxlIjoiZGlzdC90YnNkay5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKVxuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRleHBvcnRzOiB7fSxcbiBcdFx0XHRpZDogbW9kdWxlSWQsXG4gXHRcdFx0bG9hZGVkOiBmYWxzZVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogd2VicGFjay9ib290c3RyYXAgZGI0YzJlYmZkZjgyYjcwMGFlMWJcbiAqKi8iLCIoZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICBpZiAoc2VsZi5mZXRjaCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplTmFtZShuYW1lKSB7XG4gICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgbmFtZSA9IFN0cmluZyhuYW1lKVxuICAgIH1cbiAgICBpZiAoL1teYS16MC05XFwtIyQlJicqKy5cXF5fYHx+XS9pLnRlc3QobmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgY2hhcmFjdGVyIGluIGhlYWRlciBmaWVsZCBuYW1lJylcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUudG9Mb3dlckNhc2UoKVxuICB9XG5cbiAgZnVuY3Rpb24gbm9ybWFsaXplVmFsdWUodmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJykge1xuICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpXG4gICAgfVxuICAgIHJldHVybiB2YWx1ZVxuICB9XG5cbiAgZnVuY3Rpb24gSGVhZGVycyhoZWFkZXJzKSB7XG4gICAgdGhpcy5tYXAgPSB7fVxuXG4gICAgaWYgKGhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzKSB7XG4gICAgICBoZWFkZXJzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgdmFsdWUpXG4gICAgICB9LCB0aGlzKVxuXG4gICAgfSBlbHNlIGlmIChoZWFkZXJzKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhoZWFkZXJzKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5hcHBlbmQobmFtZSwgaGVhZGVyc1tuYW1lXSlcbiAgICAgIH0sIHRoaXMpXG4gICAgfVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuYXBwZW5kID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gbm9ybWFsaXplTmFtZShuYW1lKVxuICAgIHZhbHVlID0gbm9ybWFsaXplVmFsdWUodmFsdWUpXG4gICAgdmFyIGxpc3QgPSB0aGlzLm1hcFtuYW1lXVxuICAgIGlmICghbGlzdCkge1xuICAgICAgbGlzdCA9IFtdXG4gICAgICB0aGlzLm1hcFtuYW1lXSA9IGxpc3RcbiAgICB9XG4gICAgbGlzdC5wdXNoKHZhbHVlKVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGVbJ2RlbGV0ZSddID0gZnVuY3Rpb24obmFtZSkge1xuICAgIGRlbGV0ZSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICB9XG5cbiAgSGVhZGVycy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciB2YWx1ZXMgPSB0aGlzLm1hcFtub3JtYWxpemVOYW1lKG5hbWUpXVxuICAgIHJldHVybiB2YWx1ZXMgPyB2YWx1ZXNbMF0gOiBudWxsXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5nZXRBbGwgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldIHx8IFtdXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMubWFwLmhhc093blByb3BlcnR5KG5vcm1hbGl6ZU5hbWUobmFtZSkpXG4gIH1cblxuICBIZWFkZXJzLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIHRoaXMubWFwW25vcm1hbGl6ZU5hbWUobmFtZSldID0gW25vcm1hbGl6ZVZhbHVlKHZhbHVlKV1cbiAgfVxuXG4gIEhlYWRlcnMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihjYWxsYmFjaywgdGhpc0FyZykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRoaXMubWFwKS5mb3JFYWNoKGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHRoaXMubWFwW25hbWVdLmZvckVhY2goZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgY2FsbGJhY2suY2FsbCh0aGlzQXJnLCB2YWx1ZSwgbmFtZSwgdGhpcylcbiAgICAgIH0sIHRoaXMpXG4gICAgfSwgdGhpcylcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbnN1bWVkKGJvZHkpIHtcbiAgICBpZiAoYm9keS5ib2R5VXNlZCkge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBUeXBlRXJyb3IoJ0FscmVhZHkgcmVhZCcpKVxuICAgIH1cbiAgICBib2R5LmJvZHlVc2VkID0gdHJ1ZVxuICB9XG5cbiAgZnVuY3Rpb24gZmlsZVJlYWRlclJlYWR5KHJlYWRlcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzb2x2ZShyZWFkZXIucmVzdWx0KVxuICAgICAgfVxuICAgICAgcmVhZGVyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVqZWN0KHJlYWRlci5lcnJvcilcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc0FycmF5QnVmZmVyKGJsb2IpIHtcbiAgICB2YXIgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKVxuICAgIHJlYWRlci5yZWFkQXNBcnJheUJ1ZmZlcihibG9iKVxuICAgIHJldHVybiBmaWxlUmVhZGVyUmVhZHkocmVhZGVyKVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZEJsb2JBc1RleHQoYmxvYikge1xuICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpXG4gICAgcmVhZGVyLnJlYWRBc1RleHQoYmxvYilcbiAgICByZXR1cm4gZmlsZVJlYWRlclJlYWR5KHJlYWRlcilcbiAgfVxuXG4gIHZhciBzdXBwb3J0ID0ge1xuICAgIGJsb2I6ICdGaWxlUmVhZGVyJyBpbiBzZWxmICYmICdCbG9iJyBpbiBzZWxmICYmIChmdW5jdGlvbigpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIG5ldyBCbG9iKCk7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSkoKSxcbiAgICBmb3JtRGF0YTogJ0Zvcm1EYXRhJyBpbiBzZWxmLFxuICAgIGFycmF5QnVmZmVyOiAnQXJyYXlCdWZmZXInIGluIHNlbGZcbiAgfVxuXG4gIGZ1bmN0aW9uIEJvZHkoKSB7XG4gICAgdGhpcy5ib2R5VXNlZCA9IGZhbHNlXG5cblxuICAgIHRoaXMuX2luaXRCb2R5ID0gZnVuY3Rpb24oYm9keSkge1xuICAgICAgdGhpcy5fYm9keUluaXQgPSBib2R5XG4gICAgICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gYm9keVxuICAgICAgfSBlbHNlIGlmIChzdXBwb3J0LmJsb2IgJiYgQmxvYi5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5QmxvYiA9IGJvZHlcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5mb3JtRGF0YSAmJiBGb3JtRGF0YS5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICB0aGlzLl9ib2R5Rm9ybURhdGEgPSBib2R5XG4gICAgICB9IGVsc2UgaWYgKCFib2R5KSB7XG4gICAgICAgIHRoaXMuX2JvZHlUZXh0ID0gJydcbiAgICAgIH0gZWxzZSBpZiAoc3VwcG9ydC5hcnJheUJ1ZmZlciAmJiBBcnJheUJ1ZmZlci5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihib2R5KSkge1xuICAgICAgICAvLyBPbmx5IHN1cHBvcnQgQXJyYXlCdWZmZXJzIGZvciBQT1NUIG1ldGhvZC5cbiAgICAgICAgLy8gUmVjZWl2aW5nIEFycmF5QnVmZmVycyBoYXBwZW5zIHZpYSBCbG9icywgaW5zdGVhZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcigndW5zdXBwb3J0ZWQgQm9keUluaXQgdHlwZScpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHN1cHBvcnQuYmxvYikge1xuICAgICAgdGhpcy5ibG9iID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5QmxvYilcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLl9ib2R5Rm9ybURhdGEpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvdWxkIG5vdCByZWFkIEZvcm1EYXRhIGJvZHkgYXMgYmxvYicpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShuZXcgQmxvYihbdGhpcy5fYm9keVRleHRdKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLmFycmF5QnVmZmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2IoKS50aGVuKHJlYWRCbG9iQXNBcnJheUJ1ZmZlcilcbiAgICAgIH1cblxuICAgICAgdGhpcy50ZXh0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciByZWplY3RlZCA9IGNvbnN1bWVkKHRoaXMpXG4gICAgICAgIGlmIChyZWplY3RlZCkge1xuICAgICAgICAgIHJldHVybiByZWplY3RlZFxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2JvZHlCbG9iKSB7XG4gICAgICAgICAgcmV0dXJuIHJlYWRCbG9iQXNUZXh0KHRoaXMuX2JvZHlCbG9iKVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuX2JvZHlGb3JtRGF0YSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY291bGQgbm90IHJlYWQgRm9ybURhdGEgYm9keSBhcyB0ZXh0JylcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMuX2JvZHlUZXh0KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcmVqZWN0ZWQgPSBjb25zdW1lZCh0aGlzKVxuICAgICAgICByZXR1cm4gcmVqZWN0ZWQgPyByZWplY3RlZCA6IFByb21pc2UucmVzb2x2ZSh0aGlzLl9ib2R5VGV4dClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc3VwcG9ydC5mb3JtRGF0YSkge1xuICAgICAgdGhpcy5mb3JtRGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihkZWNvZGUpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5qc29uID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy50ZXh0KCkudGhlbihKU09OLnBhcnNlKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvLyBIVFRQIG1ldGhvZHMgd2hvc2UgY2FwaXRhbGl6YXRpb24gc2hvdWxkIGJlIG5vcm1hbGl6ZWRcbiAgdmFyIG1ldGhvZHMgPSBbJ0RFTEVURScsICdHRVQnLCAnSEVBRCcsICdPUFRJT05TJywgJ1BPU1QnLCAnUFVUJ11cblxuICBmdW5jdGlvbiBub3JtYWxpemVNZXRob2QobWV0aG9kKSB7XG4gICAgdmFyIHVwY2FzZWQgPSBtZXRob2QudG9VcHBlckNhc2UoKVxuICAgIHJldHVybiAobWV0aG9kcy5pbmRleE9mKHVwY2FzZWQpID4gLTEpID8gdXBjYXNlZCA6IG1ldGhvZFxuICB9XG5cbiAgZnVuY3Rpb24gUmVxdWVzdChpbnB1dCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9XG4gICAgdmFyIGJvZHkgPSBvcHRpb25zLmJvZHlcbiAgICBpZiAoUmVxdWVzdC5wcm90b3R5cGUuaXNQcm90b3R5cGVPZihpbnB1dCkpIHtcbiAgICAgIGlmIChpbnB1dC5ib2R5VXNlZCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBbHJlYWR5IHJlYWQnKVxuICAgICAgfVxuICAgICAgdGhpcy51cmwgPSBpbnB1dC51cmxcbiAgICAgIHRoaXMuY3JlZGVudGlhbHMgPSBpbnB1dC5jcmVkZW50aWFsc1xuICAgICAgaWYgKCFvcHRpb25zLmhlYWRlcnMpIHtcbiAgICAgICAgdGhpcy5oZWFkZXJzID0gbmV3IEhlYWRlcnMoaW5wdXQuaGVhZGVycylcbiAgICAgIH1cbiAgICAgIHRoaXMubWV0aG9kID0gaW5wdXQubWV0aG9kXG4gICAgICB0aGlzLm1vZGUgPSBpbnB1dC5tb2RlXG4gICAgICBpZiAoIWJvZHkpIHtcbiAgICAgICAgYm9keSA9IGlucHV0Ll9ib2R5SW5pdFxuICAgICAgICBpbnB1dC5ib2R5VXNlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51cmwgPSBpbnB1dFxuICAgIH1cblxuICAgIHRoaXMuY3JlZGVudGlhbHMgPSBvcHRpb25zLmNyZWRlbnRpYWxzIHx8IHRoaXMuY3JlZGVudGlhbHMgfHwgJ29taXQnXG4gICAgaWYgKG9wdGlvbnMuaGVhZGVycyB8fCAhdGhpcy5oZWFkZXJzKSB7XG4gICAgICB0aGlzLmhlYWRlcnMgPSBuZXcgSGVhZGVycyhvcHRpb25zLmhlYWRlcnMpXG4gICAgfVxuICAgIHRoaXMubWV0aG9kID0gbm9ybWFsaXplTWV0aG9kKG9wdGlvbnMubWV0aG9kIHx8IHRoaXMubWV0aG9kIHx8ICdHRVQnKVxuICAgIHRoaXMubW9kZSA9IG9wdGlvbnMubW9kZSB8fCB0aGlzLm1vZGUgfHwgbnVsbFxuICAgIHRoaXMucmVmZXJyZXIgPSBudWxsXG5cbiAgICBpZiAoKHRoaXMubWV0aG9kID09PSAnR0VUJyB8fCB0aGlzLm1ldGhvZCA9PT0gJ0hFQUQnKSAmJiBib2R5KSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCb2R5IG5vdCBhbGxvd2VkIGZvciBHRVQgb3IgSEVBRCByZXF1ZXN0cycpXG4gICAgfVxuICAgIHRoaXMuX2luaXRCb2R5KGJvZHkpXG4gIH1cblxuICBSZXF1ZXN0LnByb3RvdHlwZS5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgUmVxdWVzdCh0aGlzKVxuICB9XG5cbiAgZnVuY3Rpb24gZGVjb2RlKGJvZHkpIHtcbiAgICB2YXIgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgYm9keS50cmltKCkuc3BsaXQoJyYnKS5mb3JFYWNoKGZ1bmN0aW9uKGJ5dGVzKSB7XG4gICAgICBpZiAoYnl0ZXMpIHtcbiAgICAgICAgdmFyIHNwbGl0ID0gYnl0ZXMuc3BsaXQoJz0nKVxuICAgICAgICB2YXIgbmFtZSA9IHNwbGl0LnNoaWZ0KCkucmVwbGFjZSgvXFwrL2csICcgJylcbiAgICAgICAgdmFyIHZhbHVlID0gc3BsaXQuam9pbignPScpLnJlcGxhY2UoL1xcKy9nLCAnICcpXG4gICAgICAgIGZvcm0uYXBwZW5kKGRlY29kZVVSSUNvbXBvbmVudChuYW1lKSwgZGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlKSlcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBmb3JtXG4gIH1cblxuICBmdW5jdGlvbiBoZWFkZXJzKHhocikge1xuICAgIHZhciBoZWFkID0gbmV3IEhlYWRlcnMoKVxuICAgIHZhciBwYWlycyA9IHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKS50cmltKCkuc3BsaXQoJ1xcbicpXG4gICAgcGFpcnMuZm9yRWFjaChmdW5jdGlvbihoZWFkZXIpIHtcbiAgICAgIHZhciBzcGxpdCA9IGhlYWRlci50cmltKCkuc3BsaXQoJzonKVxuICAgICAgdmFyIGtleSA9IHNwbGl0LnNoaWZ0KCkudHJpbSgpXG4gICAgICB2YXIgdmFsdWUgPSBzcGxpdC5qb2luKCc6JykudHJpbSgpXG4gICAgICBoZWFkLmFwcGVuZChrZXksIHZhbHVlKVxuICAgIH0pXG4gICAgcmV0dXJuIGhlYWRcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXF1ZXN0LnByb3RvdHlwZSlcblxuICBmdW5jdGlvbiBSZXNwb25zZShib2R5SW5pdCwgb3B0aW9ucykge1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgb3B0aW9ucyA9IHt9XG4gICAgfVxuXG4gICAgdGhpcy5faW5pdEJvZHkoYm9keUluaXQpXG4gICAgdGhpcy50eXBlID0gJ2RlZmF1bHQnXG4gICAgdGhpcy5zdGF0dXMgPSBvcHRpb25zLnN0YXR1c1xuICAgIHRoaXMub2sgPSB0aGlzLnN0YXR1cyA+PSAyMDAgJiYgdGhpcy5zdGF0dXMgPCAzMDBcbiAgICB0aGlzLnN0YXR1c1RleHQgPSBvcHRpb25zLnN0YXR1c1RleHRcbiAgICB0aGlzLmhlYWRlcnMgPSBvcHRpb25zLmhlYWRlcnMgaW5zdGFuY2VvZiBIZWFkZXJzID8gb3B0aW9ucy5oZWFkZXJzIDogbmV3IEhlYWRlcnMob3B0aW9ucy5oZWFkZXJzKVxuICAgIHRoaXMudXJsID0gb3B0aW9ucy51cmwgfHwgJydcbiAgfVxuXG4gIEJvZHkuY2FsbChSZXNwb25zZS5wcm90b3R5cGUpXG5cbiAgUmVzcG9uc2UucHJvdG90eXBlLmNsb25lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBSZXNwb25zZSh0aGlzLl9ib2R5SW5pdCwge1xuICAgICAgc3RhdHVzOiB0aGlzLnN0YXR1cyxcbiAgICAgIHN0YXR1c1RleHQ6IHRoaXMuc3RhdHVzVGV4dCxcbiAgICAgIGhlYWRlcnM6IG5ldyBIZWFkZXJzKHRoaXMuaGVhZGVycyksXG4gICAgICB1cmw6IHRoaXMudXJsXG4gICAgfSlcbiAgfVxuXG4gIFJlc3BvbnNlLmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlc3BvbnNlID0gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IDAsIHN0YXR1c1RleHQ6ICcnfSlcbiAgICByZXNwb25zZS50eXBlID0gJ2Vycm9yJ1xuICAgIHJldHVybiByZXNwb25zZVxuICB9XG5cbiAgdmFyIHJlZGlyZWN0U3RhdHVzZXMgPSBbMzAxLCAzMDIsIDMwMywgMzA3LCAzMDhdXG5cbiAgUmVzcG9uc2UucmVkaXJlY3QgPSBmdW5jdGlvbih1cmwsIHN0YXR1cykge1xuICAgIGlmIChyZWRpcmVjdFN0YXR1c2VzLmluZGV4T2Yoc3RhdHVzKSA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHN0YXR1cyBjb2RlJylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFJlc3BvbnNlKG51bGwsIHtzdGF0dXM6IHN0YXR1cywgaGVhZGVyczoge2xvY2F0aW9uOiB1cmx9fSlcbiAgfVxuXG4gIHNlbGYuSGVhZGVycyA9IEhlYWRlcnM7XG4gIHNlbGYuUmVxdWVzdCA9IFJlcXVlc3Q7XG4gIHNlbGYuUmVzcG9uc2UgPSBSZXNwb25zZTtcblxuICBzZWxmLmZldGNoID0gZnVuY3Rpb24oaW5wdXQsIGluaXQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB2YXIgcmVxdWVzdFxuICAgICAgaWYgKFJlcXVlc3QucHJvdG90eXBlLmlzUHJvdG90eXBlT2YoaW5wdXQpICYmICFpbml0KSB7XG4gICAgICAgIHJlcXVlc3QgPSBpbnB1dFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGlucHV0LCBpbml0KVxuICAgICAgfVxuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KClcblxuICAgICAgZnVuY3Rpb24gcmVzcG9uc2VVUkwoKSB7XG4gICAgICAgIGlmICgncmVzcG9uc2VVUkwnIGluIHhocikge1xuICAgICAgICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkxcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEF2b2lkIHNlY3VyaXR5IHdhcm5pbmdzIG9uIGdldFJlc3BvbnNlSGVhZGVyIHdoZW4gbm90IGFsbG93ZWQgYnkgQ09SU1xuICAgICAgICBpZiAoL15YLVJlcXVlc3QtVVJMOi9tLnRlc3QoeGhyLmdldEFsbFJlc3BvbnNlSGVhZGVycygpKSkge1xuICAgICAgICAgIHJldHVybiB4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ1gtUmVxdWVzdC1VUkwnKVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB4aHIub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdGF0dXMgPSAoeGhyLnN0YXR1cyA9PT0gMTIyMykgPyAyMDQgOiB4aHIuc3RhdHVzXG4gICAgICAgIGlmIChzdGF0dXMgPCAxMDAgfHwgc3RhdHVzID4gNTk5KSB7XG4gICAgICAgICAgcmVqZWN0KG5ldyBUeXBlRXJyb3IoJ05ldHdvcmsgcmVxdWVzdCBmYWlsZWQnKSlcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICBzdGF0dXM6IHN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiB4aHIuc3RhdHVzVGV4dCxcbiAgICAgICAgICBoZWFkZXJzOiBoZWFkZXJzKHhociksXG4gICAgICAgICAgdXJsOiByZXNwb25zZVVSTCgpXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJvZHkgPSAncmVzcG9uc2UnIGluIHhociA/IHhoci5yZXNwb25zZSA6IHhoci5yZXNwb25zZVRleHQ7XG4gICAgICAgIHJlc29sdmUobmV3IFJlc3BvbnNlKGJvZHksIG9wdGlvbnMpKVxuICAgICAgfVxuXG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZWplY3QobmV3IFR5cGVFcnJvcignTmV0d29yayByZXF1ZXN0IGZhaWxlZCcpKVxuICAgICAgfVxuXG4gICAgICB4aHIub3BlbihyZXF1ZXN0Lm1ldGhvZCwgcmVxdWVzdC51cmwsIHRydWUpXG5cbiAgICAgIGlmIChyZXF1ZXN0LmNyZWRlbnRpYWxzID09PSAnaW5jbHVkZScpIHtcbiAgICAgICAgeGhyLndpdGhDcmVkZW50aWFscyA9IHRydWVcbiAgICAgIH1cblxuICAgICAgaWYgKCdyZXNwb25zZVR5cGUnIGluIHhociAmJiBzdXBwb3J0LmJsb2IpIHtcbiAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdibG9iJ1xuICAgICAgfVxuXG4gICAgICByZXF1ZXN0LmhlYWRlcnMuZm9yRWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSlcbiAgICAgIH0pXG5cbiAgICAgIHhoci5zZW5kKHR5cGVvZiByZXF1ZXN0Ll9ib2R5SW5pdCA9PT0gJ3VuZGVmaW5lZCcgPyBudWxsIDogcmVxdWVzdC5fYm9keUluaXQpXG4gICAgfSlcbiAgfVxuICBzZWxmLmZldGNoLnBvbHlmaWxsID0gdHJ1ZVxufSkoKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3doYXR3Zy1mZXRjaC9mZXRjaC5qc1xuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsImZ1bmN0aW9uIF9fZXhwb3J0KG0pIHtcbiAgICBmb3IgKHZhciBwIGluIG0pIGlmICghZXhwb3J0cy5oYXNPd25Qcm9wZXJ0eShwKSkgZXhwb3J0c1twXSA9IG1bcF07XG59XG5fX2V4cG9ydChyZXF1aXJlKCcuL3V0aWxzL2ZldGNoJykpO1xuX19leHBvcnQocmVxdWlyZSgnLi9hcGlzJykpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9hcHAudHNcbiAqKiBtb2R1bGUgaWQgPSAyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgXzEgPSByZXF1aXJlKCcuLycpO1xudmFyIGFwaUhvc3Q7XG52YXIgYXBpUGF0aCA9IFsnVmVyc2lvbicsICdUeXBlJywgJ0lkJywgJ1BhdGgxJywgJ1BhdGgyJywgJ1BhdGgzJ107XG52YXIgRmV0Y2ggPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEZldGNoKCkge1xuICAgICAgICB0aGlzLm9wdHMgPSB7XG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMub3B0cy5jcmVkZW50aWFscyA9ICdpbmNsdWRlJztcbiAgICAgICAgYXBpSG9zdCA9ICdodHRwczovL3d3dy50ZWFtYml0aW9uLmNvbS9hcGknO1xuICAgIH1cbiAgICBGZXRjaC5wcm90b3R5cGUuc2V0QVBJSG9zdCA9IGZ1bmN0aW9uIChob3N0KSB7XG4gICAgICAgIGFwaUhvc3QgPSBob3N0O1xuICAgIH07XG4gICAgRmV0Y2gucHJvdG90eXBlLnNldFRva2VuID0gZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm9wdHMuY3JlZGVudGlhbHM7XG4gICAgICAgIHRoaXMub3B0cy5oZWFkZXJzLkF1dGhvcml6YXRpb24gPSBcIk9BdXRoMiBcIiArIHRva2VuO1xuICAgICAgICBhcGlIb3N0ID0gJ2h0dHBzOi8vYXBpLnRlYW1iaXRpb24uY29tJztcbiAgICB9O1xuICAgIEZldGNoLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocGF0aHMpIHtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuYnVpbGRVUkkocGF0aHMpO1xuICAgICAgICByZXR1cm4gZmV0Y2godXJsLCBfMS5hc3NpZ24oe1xuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0J1xuICAgICAgICB9LCB0aGlzLm9wdHMpKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBGZXRjaC5wcm90b3R5cGUucG9zdCA9IGZ1bmN0aW9uIChwYXRocywgZGF0YSkge1xuICAgICAgICB2YXIgdXJsID0gdGhpcy5idWlsZFVSSShwYXRocyk7XG4gICAgICAgIHJldHVybiBmZXRjaCh1cmwsIF8xLmFzc2lnbih7XG4gICAgICAgICAgICBtZXRob2Q6ICdwb3N0JyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICAgIH0sIHRoaXMub3B0cykpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuanNvbigpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEZldGNoLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbiAocGF0aHMsIGRhdGEpIHtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuYnVpbGRVUkkocGF0aHMpO1xuICAgICAgICByZXR1cm4gZmV0Y2godXJsLCBfMS5hc3NpZ24oe1xuICAgICAgICAgICAgbWV0aG9kOiAncHV0JyxcbiAgICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpXG4gICAgICAgIH0sIHRoaXMub3B0cykpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEuanNvbigpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIEZldGNoLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAocGF0aHMpIHtcbiAgICAgICAgdmFyIHVybCA9IHRoaXMuYnVpbGRVUkkocGF0aHMpO1xuICAgICAgICByZXR1cm4gZmV0Y2godXJsLCBfMS5hc3NpZ24oe1xuICAgICAgICAgICAgbWV0aG9kOiAnZGVsZXRlJ1xuICAgICAgICB9LCB0aGlzLm9wdHMpKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLmpzb24oKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBGZXRjaC5wcm90b3R5cGUuYnVpbGRVUkkgPSBmdW5jdGlvbiAocGF0aCkge1xuICAgICAgICB2YXIgdXJpcyA9IFtdO1xuICAgICAgICB2YXIgcXVlcnlzID0gW107XG4gICAgICAgIF8xLmZvckVhY2gocGF0aCwgZnVuY3Rpb24gKHZhbCwga2V5KSB7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSBhcGlQYXRoLmluZGV4T2Yoa2V5KTtcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICB1cmlzW3Bvc2l0aW9uXSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXJ5cy5wdXNoKGtleSArIFwiPVwiICsgdmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB1cmwgPSBhcGlIb3N0ICsgdXJpcy5qb2luKCcvJyk7XG4gICAgICAgIHVybCA9IHF1ZXJ5cy5sZW5ndGggPyB1cmwgKyAnPycgKyBxdWVyeXMuam9pbignJicpIDogdXJsO1xuICAgICAgICByZXR1cm4gdXJsO1xuICAgIH07XG4gICAgcmV0dXJuIEZldGNoO1xufSkoKTtcbmV4cG9ydHMudGJGZXRjaCA9IG5ldyBGZXRjaCgpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy91dGlscy9mZXRjaC50c1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBzY2hlbWFfMSA9IHJlcXVpcmUoJy4uL3NjaGVtYXMvc2NoZW1hJyk7XG5leHBvcnRzLmZvckVhY2ggPSBmdW5jdGlvbiAodGFyZ2V0LCBlYWNoRnVuYykge1xuICAgIHZhciBsZW5ndGg7XG4gICAgaWYgKHRhcmdldCBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGxlbmd0aCA9IHRhcmdldC5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGVhY2hGdW5jKHRhcmdldFtpXSwgaSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXModGFyZ2V0KTtcbiAgICAgICAgdmFyIGtleTtcbiAgICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgICBlYWNoRnVuYyh0YXJnZXRba2V5XSwga2V5KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5leHBvcnRzLmFzc2lnbiA9IGZ1bmN0aW9uICh0YXJnZXQsIG9yaWdpbikge1xuICAgIGV4cG9ydHMuZm9yRWFjaChvcmlnaW4sIGZ1bmN0aW9uICh2YWwsIGtleSkge1xuICAgICAgICB0YXJnZXRba2V5XSA9IG9yaWdpbltrZXldO1xuICAgIH0pO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xuZXhwb3J0cy5jbG9uZSA9IGZ1bmN0aW9uIChvcmlnaW4pIHtcbiAgICBpZiAodHlwZW9mIG9yaWdpbiA9PT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIG9yaWdpbiAhPT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGFyZ2V0O1xuICAgIGlmIChvcmlnaW4gaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICB0YXJnZXQgPSBuZXcgQXJyYXkoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRhcmdldCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgfVxuICAgIGV4cG9ydHMuZm9yRWFjaChvcmlnaW4sIGZ1bmN0aW9uICh2YWwsIGtleSkge1xuICAgICAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIC8vIG51bGxcbiAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRba2V5XSA9IGV4cG9ydHMuY2xvbmUodmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRhcmdldFtrZXldID0gdmFsO1xuICAgIH0pO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xudmFyIHM0ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKVxuICAgICAgICAudG9TdHJpbmcoMTYpXG4gICAgICAgIC5zdWJzdHJpbmcoMSk7XG59O1xudmFyIHV1aWRTdGFjayA9IFtdO1xuZXhwb3J0cy51dWlkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBVVUlEID0gczQoKSArIHM0KCk7XG4gICAgd2hpbGUgKHV1aWRTdGFjay5pbmRleE9mKFVVSUQpICE9PSAtMSkge1xuICAgICAgICBVVUlEID0gczQoKSArIHM0KCk7XG4gICAgfVxuICAgIHV1aWRTdGFjay5wdXNoKFVVSUQpO1xuICAgIHJldHVybiBVVUlEO1xufTtcbmV4cG9ydHMuZGF0YXNUb1NjaGVtYXMgPSBmdW5jdGlvbiAoZGF0YXMsIFNjaGVtYSkge1xuICAgIHZhciByZXN1bHQgPSBuZXcgQXJyYXkoKTtcbiAgICBleHBvcnRzLmZvckVhY2goZGF0YXMsIGZ1bmN0aW9uIChkYXRhLCBpbmRleCkge1xuICAgICAgICByZXN1bHQucHVzaChzY2hlbWFfMS5zZXRTY2hlbWEoU2NoZW1hLCBkYXRhKSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL3V0aWxzL2luZGV4LnRzXG4gKiogbW9kdWxlIGlkID0gNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKCcuLi91dGlscycpO1xuZXhwb3J0cy5zZXRTY2hlbWEgPSBmdW5jdGlvbiAodGFyZ2V0LCBkYXRhKSB7XG4gICAgdGFyZ2V0LiQka2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgdGFyZ2V0W2tleV0gPSBkYXRhW2tleV07XG4gICAgfSk7XG4gICAgdGFyZ2V0LiQkZGF0YSA9IGRhdGE7XG4gICAgdXRpbHNfMS5mb3JFYWNoKHRhcmdldCwgZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJyQkZGF0YScpIHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwge1xuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnJCRrZXlzJykge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YVtrZXldID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHRhcmdldC4kJGtleXMuYWRkKGtleSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRhcmdldC4kJGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXJnZXQuJCRkYXRhW2tleV07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKG5ld1ZhbCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGFyZ2V0LiQkZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LiQkZGF0YVtrZXldID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0LiQka2V5cy5kZWxldGUoa2V5KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0YXJnZXQ7XG59O1xudmFyIFNjaGVtYSA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gU2NoZW1hKCkge1xuICAgICAgICB0aGlzLiQka2V5cyA9IG5ldyBTZXQoKTtcbiAgICB9XG4gICAgcmV0dXJuIFNjaGVtYTtcbn0pKCk7XG5leHBvcnRzLlNjaGVtYSA9IFNjaGVtYTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvc2NoZW1hcy9zY2hlbWEudHNcbiAqKiBtb2R1bGUgaWQgPSA1XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCJmdW5jdGlvbiBfX2V4cG9ydChtKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAoIWV4cG9ydHMuaGFzT3duUHJvcGVydHkocCkpIGV4cG9ydHNbcF0gPSBtW3BdO1xufVxuX19leHBvcnQocmVxdWlyZSgnLi91c2VyX2FwaScpKTtcbl9fZXhwb3J0KHJlcXVpcmUoJy4vb3JnYW5pemF0aW9uX2FwaScpKTtcbl9fZXhwb3J0KHJlcXVpcmUoJy4vcHJvamVjdF9hcGknKSk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL2FwaXMvaW5kZXgudHNcbiAqKiBtb2R1bGUgaWQgPSA2XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgZmV0Y2hfMSA9IHJlcXVpcmUoJy4uL3V0aWxzL2ZldGNoJyk7XG52YXIgdXNlcl9tb2RlbF8xID0gcmVxdWlyZSgnLi4vbW9kZWxzL3VzZXJfbW9kZWwnKTtcbmV4cG9ydHMuVXNlckFQSSA9IHtcbiAgICBnZXRVc2VyTWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gdXNlcl9tb2RlbF8xLmRlZmF1bHQuZ2V0KCk7XG4gICAgICAgIGlmIChjYWNoZSkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNhY2hlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIGZldGNoXzEudGJGZXRjaC5nZXQoe1xuICAgICAgICAgICAgICAgIFR5cGU6ICd1c2VycycsXG4gICAgICAgICAgICAgICAgSWQ6ICdtZSdcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXJNZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1c2VyX21vZGVsXzEuZGVmYXVsdC5zZXQodXNlck1lKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSxcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChwYXRjaCkge1xuICAgICAgICByZXR1cm4gZmV0Y2hfMS50YkZldGNoLnB1dCh7XG4gICAgICAgICAgICBUeXBlOiAndXNlcnMnLFxuICAgICAgICAgICAgSWQ6ICdtZSdcbiAgICAgICAgfSwgcGF0Y2gpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlck1lKSB7XG4gICAgICAgICAgICB1c2VyX21vZGVsXzEuZGVmYXVsdC51cGRhdGUodXNlck1lKTtcbiAgICAgICAgICAgIHJldHVybiB1c2VyTWU7XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgYWRkRW1haWw6IGZ1bmN0aW9uIChlbWFpbCkge1xuICAgICAgICByZXR1cm4gZmV0Y2hfMS50YkZldGNoLnBvc3Qoe1xuICAgICAgICAgICAgVHlwZTogJ3VzZXJzJyxcbiAgICAgICAgICAgIElkOiAnZW1haWwnXG4gICAgICAgIH0sIHtcbiAgICAgICAgICAgIGVtYWlsOiBlbWFpbFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICB1c2VyX21vZGVsXzEuZGVmYXVsdC51cGRhdGVFbWFpbChkYXRhKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9KTtcbiAgICB9LFxuICAgIGJpbmRQaG9uZTogZnVuY3Rpb24gKHBob25lLCB2Y29kZSkge1xuICAgICAgICByZXR1cm4gZmV0Y2hfMS50YkZldGNoLnB1dCh7XG4gICAgICAgICAgICBUeXBlOiAndXNlcnMnLFxuICAgICAgICAgICAgSWQ6ICdwaG9uZSdcbiAgICAgICAgfSwge1xuICAgICAgICAgICAgcGhvbmU6IHBob25lLFxuICAgICAgICAgICAgdmNvZGU6IHZjb2RlXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHVzZXJfbW9kZWxfMS5kZWZhdWx0LnVwZGF0ZSh7XG4gICAgICAgICAgICAgICAgcGhvbmU6IHBob25lXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvYXBpcy91c2VyX2FwaS50c1xuICoqIG1vZHVsZSBpZCA9IDdcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xudmFyIG1vZGVsXzEgPSByZXF1aXJlKCcuL21vZGVsJyk7XG52YXIgVXNlck1vZGVsID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoVXNlck1vZGVsLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIFVzZXJNb2RlbCgpIHtcbiAgICAgICAgX3N1cGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIHRoaXMubmFtZXNwYWNlID0gJ3VzZXI6bWUnO1xuICAgIH1cbiAgICBVc2VyTW9kZWwucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldE9uZSh0aGlzLm5hbWVzcGFjZSwgZGF0YSk7XG4gICAgfTtcbiAgICBVc2VyTW9kZWwucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25lKHRoaXMubmFtZXNwYWNlKTtcbiAgICB9O1xuICAgIFVzZXJNb2RlbC5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gKHBhdGNoKSB7XG4gICAgICAgIHRoaXMudXBkYXRlT25lKHRoaXMubmFtZXNwYWNlLCBwYXRjaCk7XG4gICAgfTtcbiAgICBVc2VyTW9kZWwucHJvdG90eXBlLnVwZGF0ZUVtYWlsID0gZnVuY3Rpb24gKGVtYWlscykge1xuICAgICAgICB0aGlzLnVwZGF0ZU9uZSh0aGlzLm5hbWVzcGFjZSwge1xuICAgICAgICAgICAgZW1haWxzOiBlbWFpbHNcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICByZXR1cm4gVXNlck1vZGVsO1xufSkobW9kZWxfMS5kZWZhdWx0KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG5ldyBVc2VyTW9kZWwoKTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvbW9kZWxzL3VzZXJfbW9kZWwudHNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgZGF0YWJhc2VfMSA9IHJlcXVpcmUoJy4vZGF0YWJhc2UnKTtcbnZhciBNb2RlbCA9IChmdW5jdGlvbiAoKSB7XG4gICAgZnVuY3Rpb24gTW9kZWwoKSB7XG4gICAgfVxuICAgIE1vZGVsLnByb3RvdHlwZS5zZXRPbmUgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBkYXRhKSB7XG4gICAgICAgIGRhdGFiYXNlXzEuZGVmYXVsdC5zdG9yZU9uZShuYW1lc3BhY2UsIGRhdGEpO1xuICAgICAgICByZXR1cm4gZGF0YWJhc2VfMS5kZWZhdWx0LmdldE9uZShuYW1lc3BhY2UpO1xuICAgIH07XG4gICAgTW9kZWwucHJvdG90eXBlLnNldENvbGxlY3Rpb24gPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBkYXRhKSB7XG4gICAgICAgIGRhdGFiYXNlXzEuZGVmYXVsdC5zdG9yZUNvbGxlY3Rpb24obmFtZXNwYWNlLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuIGRhdGFiYXNlXzEuZGVmYXVsdC5nZXRPbmUobmFtZXNwYWNlKTtcbiAgICB9O1xuICAgIE1vZGVsLnByb3RvdHlwZS5nZXRPbmUgPSBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiBkYXRhYmFzZV8xLmRlZmF1bHQuZ2V0T25lKG5hbWVzcGFjZSk7XG4gICAgfTtcbiAgICBNb2RlbC5wcm90b3R5cGUudXBkYXRlT25lID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgcGF0Y2gpIHtcbiAgICAgICAgdmFyIENhY2hlID0gZGF0YWJhc2VfMS5kZWZhdWx0LmdldE9uZShuYW1lc3BhY2UpO1xuICAgICAgICBpZiAoQ2FjaGUpIHtcbiAgICAgICAgICAgIGRhdGFiYXNlXzEuZGVmYXVsdC51cGRhdGVPbmUobmFtZXNwYWNlLCBwYXRjaCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIE1vZGVsLnByb3RvdHlwZS5yZW1vdmVPbmUgPSBmdW5jdGlvbiAobmFtZXNwYWNlKSB7XG4gICAgICAgIHJldHVybiBkYXRhYmFzZV8xLmRlZmF1bHQuZGVsZXRlKG5hbWVzcGFjZSk7XG4gICAgfTtcbiAgICByZXR1cm4gTW9kZWw7XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gTW9kZWw7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL21vZGVscy9tb2RlbC50c1xuICoqIG1vZHVsZSBpZCA9IDlcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciB1dGlsc18xID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciB0cmFja18xID0gcmVxdWlyZSgnLi4vdXRpbHMvdHJhY2snKTtcbnZhciB1bmlvbl9vYmplY3RfMSA9IHJlcXVpcmUoJy4vdW5pb25fb2JqZWN0Jyk7XG52YXIgRGF0YUJhc2UgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIERhdGFCYXNlKCkge1xuICAgICAgICB0aGlzLmRhdGEgPSB7fTtcbiAgICAgICAgdGhpcy50aW1lb3V0SW5kZXggPSB7fTtcbiAgICAgICAgdGhpcy50eXBlSW5kZXggPSB7fTtcbiAgICAgICAgdGhpcy5kYXRhTWFwcyA9IHt9O1xuICAgICAgICB0aGlzLmNvbGxlY3Rpb25JbmRleCA9IHt9O1xuICAgIH1cbiAgICBEYXRhQmFzZS5wcm90b3R5cGUuc3RvcmVPbmUgPSBmdW5jdGlvbiAoaW5kZXgsIGRhdGEsIGV4cGlyZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoZXhwaXJlID09PSB2b2lkIDApIHsgZXhwaXJlID0gMDsgfVxuICAgICAgICBpZiAoIXRoaXMuZGF0YVtpbmRleF0pIHtcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSB0aGlzLmRhdGFbaW5kZXhdID0gZGF0YTtcbiAgICAgICAgICAgIGlmIChleHBpcmUgJiYgdHlwZW9mIGV4cGlyZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGltZW91dEluZGV4ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgX3RoaXMuZGF0YVtpbmRleF07XG4gICAgICAgICAgICAgICAgfSwgZXhwaXJlKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVvdXRJbmRleFtpbmRleF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIHRpbWVyOiB0aW1lb3V0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGJlZ2luOiBEYXRlLm5vdygpLFxuICAgICAgICAgICAgICAgICAgICBleHBpcmU6IGV4cGlyZVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0cmFja18xLnRyYWNrT2JqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLnR5cGVJbmRleFtpbmRleF0gPSAnb2JqZWN0JztcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0YUJhc2UucHJvdG90eXBlLnN0b3JlQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIChpbmRleCwgY29sbGVjdGlvbiwgZXhwaXJlKSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIGlmIChleHBpcmUgPT09IHZvaWQgMCkgeyBleHBpcmUgPSAwOyB9XG4gICAgICAgIHZhciBpbmRleGVzID0gdGhpcy5jb2xsZWN0aW9uSW5kZXhbaW5kZXhdID0gW107XG4gICAgICAgIGlmICghdGhpcy5kYXRhW2luZGV4XSkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICAgICAgdXRpbHNfMS5mb3JFYWNoKGNvbGxlY3Rpb24sIGZ1bmN0aW9uICh2YWwsIGtleSkge1xuICAgICAgICAgICAgICAgIHZhciBjYWNoZSA9IF90aGlzLmdldE9uZSh2YWwuX2lkKTtcbiAgICAgICAgICAgICAgICBpZiAoY2FjaGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goY2FjaGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsKTtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3RvcmVPbmUodmFsLl9pZCwgdmFsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG1hcHMgPSBfdGhpcy5kYXRhTWFwc1t2YWwuX2lkXTtcbiAgICAgICAgICAgICAgICBpZiAobWFwcykge1xuICAgICAgICAgICAgICAgICAgICBtYXBzLnB1c2goaW5kZXgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuZGF0YU1hcHNbdmFsLl9pZF0gPSBbaW5kZXhdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbmRleGVzLnB1c2godmFsLl9pZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMuZGF0YVtpbmRleF0gPSByZXN1bHQ7XG4gICAgICAgICAgICBpZiAoZXhwaXJlICYmIHR5cGVvZiBleHBpcmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWVvdXRJbmRleCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIF90aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICAgICAgICAgIH0sIGV4cGlyZSk7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0SW5kZXhbaW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICB0aW1lcjogdGltZW91dEluZGV4LFxuICAgICAgICAgICAgICAgICAgICBiZWdpbjogRGF0ZS5ub3coKSxcbiAgICAgICAgICAgICAgICAgICAgZXhwaXJlOiBleHBpcmVcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdHJhY2tfMS50cmFja0NvbGxlY3Rpb24oaW5kZXgsIHJlc3VsdCk7XG4gICAgICAgICAgICB0aGlzLnR5cGVJbmRleFtpbmRleF0gPSAnY29sbGVjdGlvbic7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERhdGFCYXNlLnByb3RvdHlwZS51cGRhdGVDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGluZGV4LCBwYXRjaCkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICB2YXIgY2FjaGUgPSB0aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICBpZiAoY2FjaGUgJiYgcGF0Y2ggaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgICAgdmFyIGluZGV4cyA9IHRoaXMuY29sbGVjdGlvbkluZGV4W2luZGV4XTtcbiAgICAgICAgICAgIHV0aWxzXzEuZm9yRWFjaChwYXRjaCwgZnVuY3Rpb24gKHZhbCwga2V5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZEVsZSA9IGNhY2hlW2tleV07XG4gICAgICAgICAgICAgICAgaWYgKG9sZEVsZS5faWQgPT09IHZhbC5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdXRpbHNfMS5hc3NpZ24ob2xkRWxlLCB2YWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhcmdldElkID0gdmFsLl9pZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4cy5pbmRleE9mKHRhcmdldElkKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhY2hlLnNwbGljZShrZXksIDAsIHZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleHMuc3BsaWNlKGtleSwgMCwgdGFyZ2V0SWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc3RvcmVPbmUodmFsLl9pZCwgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvbGRJbmRleCA9IGluZGV4cy5pbmRleE9mKHRhcmdldElkLCBrZXkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuc3BsaWNlKG9sZEluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4cy5zcGxpY2Uob2xkSW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FjaGUuc3BsaWNlKGtleSwgMCwgdmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4cy5zcGxpY2Uoa2V5LCAwLCB0YXJnZXRJZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgRGF0YUJhc2UucHJvdG90eXBlLnVwZGF0ZU9uZSA9IGZ1bmN0aW9uIChpbmRleCwgcGF0Y2gsIGV4cGlyZSkge1xuICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICBpZiAoZXhwaXJlID09PSB2b2lkIDApIHsgZXhwaXJlID0gMDsgfVxuICAgICAgICB2YXIgX3BhdGNoID0gdXRpbHNfMS5jbG9uZShwYXRjaCk7XG4gICAgICAgIHZhciB2YWwgPSB0aGlzLmRhdGFbaW5kZXhdO1xuICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHBhdGNoID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgIHZhbCA9IHV0aWxzXzEuYXNzaWduKHZhbCwgX3BhdGNoKTtcbiAgICAgICAgICAgICAgICBpZiAoZXhwaXJlICYmIHR5cGVvZiBleHBpcmUgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0aW1lciA9IHRoaXMudGltZW91dEluZGV4W2luZGV4XS50aW1lcjtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0SW5kZXhbaW5kZXhdLmV4cGlyZSA9IGV4cGlyZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50aW1lb3V0SW5kZXhbaW5kZXhdLmJlZ2luID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgICAgICAgICAgICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSBfdGhpcy5kYXRhW2luZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfSwgZXhwaXJlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhW2luZGV4XSA9IHZhbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93ICdQYXRjaCB0YXJnZXQgc2hvdWxkIGJlIE9iamVjdCc7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyAnRGF0YSBpcyBub3QgZXhpc3RlZCwgY2FuIG5vdCB1cGRhdGUnO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBEYXRhQmFzZS5wcm90b3R5cGUuZ2V0T25lID0gZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgIHZhciBkYXRhID0gdGhpcy5kYXRhW2luZGV4XTtcbiAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGVJbmRleFtpbmRleF0gPT09ICdjb2xsZWN0aW9uJykge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHV0aWxzXzEuY2xvbmUoZGF0YSk7XG4gICAgICAgICAgICAgICAgdHJhY2tfMS50cmFja09uZShyZXN1bHQsIGluZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IG5ldyB1bmlvbl9vYmplY3RfMS5CYXNlT2JqZWN0KGRhdGEpO1xuICAgICAgICAgICAgICAgIHRyYWNrXzEudHJhY2tPbmUocmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERhdGFCYXNlLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgZGVsZXRlIHRoaXMuZGF0YVtpbmRleF07XG4gICAgICAgIHZhciBtYXBzID0gdGhpcy5kYXRhTWFwc1tpbmRleF07XG4gICAgICAgIGlmIChtYXBzICYmIG1hcHMubGVuZ3RoKSB7XG4gICAgICAgICAgICB1dGlsc18xLmZvckVhY2gobWFwcywgZnVuY3Rpb24gKGNvbGxlY3Rpb25JbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBpbmRleGVzID0gX3RoaXMuY29sbGVjdGlvbkluZGV4W2NvbGxlY3Rpb25JbmRleF07XG4gICAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBfdGhpcy5kYXRhW2NvbGxlY3Rpb25JbmRleF07XG4gICAgICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0gaW5kZXhlcy5pbmRleE9mKGluZGV4KTtcbiAgICAgICAgICAgICAgICBpbmRleGVzLnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgICAgICAgICAgICAgY29sbGVjdGlvbi5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIERhdGFCYXNlLnByb3RvdHlwZS5nZXRFeHBpcmUgPSBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgdmFyIHRpbWVySW5kZXggPSB0aGlzLnRpbWVvdXRJbmRleFtpbmRleF07XG4gICAgICAgIHJldHVybiB0aW1lckluZGV4LmJlZ2luIC0gdGltZXJJbmRleC5leHBpcmU7XG4gICAgfTtcbiAgICByZXR1cm4gRGF0YUJhc2U7XG59KSgpO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gbmV3IERhdGFCYXNlKCk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL21vZGVscy9kYXRhYmFzZS50c1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgXzEgPSByZXF1aXJlKCcuLycpO1xudmFyIHRyYWNrSW5kZXggPSB7fTtcbmV4cG9ydHMudHJhY2tPbmUgPSBmdW5jdGlvbiAodGFyZ2V0LCBpbmRleCkge1xuICAgIHZhciBfaWQgPSBpbmRleCA/IGluZGV4IDogdGFyZ2V0Ll9pZDtcbiAgICBpZiAoX2lkICYmIHRyYWNrSW5kZXhbX2lkXS5pbmRleE9mKHRhcmdldCkgPT09IC0xKSB7XG4gICAgICAgIHRyYWNrSW5kZXhbX2lkXS5wdXNoKHRhcmdldCk7XG4gICAgfVxufTtcbmV4cG9ydHMudHJhY2tPYmplY3QgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgdmFyIF9pZCA9IHRhcmdldC5faWQ7XG4gICAgaWYgKF9pZCkge1xuICAgICAgICB0cmFja0luZGV4W19pZF0gPSBbXTtcbiAgICAgICAgXzEuZm9yRWFjaCh0YXJnZXQsIGZ1bmN0aW9uICh2YWwsIGtleSkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwga2V5LCB7XG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgXzEuZm9yRWFjaCh0cmFja0luZGV4W19pZF0sIGZ1bmN0aW9uICh0cmFja1ZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2tWYWxba2V5XSA9IG5ld1ZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgdmFsID0gbmV3VmFsdWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbDtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcbmV4cG9ydHMudHJhY2tDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGluZGV4LCB0YXJnZXQpIHtcbiAgICBpZiAodGFyZ2V0IGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICAgICAgdHJhY2tJbmRleFtpbmRleF0gPSBbXTtcbiAgICAgICAgdmFyIHNwbGljZSA9IHRhcmdldC5zcGxpY2U7XG4gICAgICAgIHZhciBwdXNoID0gdGFyZ2V0LnB1c2g7XG4gICAgICAgIHRhcmdldC5zcGxpY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfMS5mb3JFYWNoKHRyYWNrSW5kZXhbaW5kZXhdLCBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHNwbGljZS5hcHBseShjb2xsZWN0aW9uLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm4gc3BsaWNlLmFwcGx5KHRhcmdldCwgYXJndW1lbnRzKTtcbiAgICAgICAgfTtcbiAgICAgICAgdGFyZ2V0LnB1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBfMS5mb3JFYWNoKHRyYWNrSW5kZXhbaW5kZXhdLCBmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHB1c2guYXBwbHkoY29sbGVjdGlvbiwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHB1c2guYXBwbHkodGFyZ2V0LCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgdHJhY2sgYSBub25lIGFycmF5IG9iamVjdCcpO1xuICAgIH1cbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL3V0aWxzL3RyYWNrLnRzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciB1dGlsc18xID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciAkaWQgPSAxO1xuZXhwb3J0cy5PYmplY3RJbmRleCA9IHt9O1xudmFyIEJhc2VPYmplY3QgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIEJhc2VPYmplY3QodGFyZ2V0KSB7XG4gICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgIHRoaXMuJGlkID0gXCIkXCIgKyAkaWQ7XG4gICAgICAgIHZhciBkYXRhID0gdXRpbHNfMS5jbG9uZSh0YXJnZXQpO1xuICAgICAgICB2YXIgb2JqZWN0SW5kZXggPSBleHBvcnRzLk9iamVjdEluZGV4WyhcIiRcIiArICRpZCldID0ge1xuICAgICAgICAgICAgZGF0YUtleXM6IFtdXG4gICAgICAgIH07XG4gICAgICAgIHV0aWxzXzEuZm9yRWFjaChkYXRhLCBmdW5jdGlvbiAodmFsLCBrZXkpIHtcbiAgICAgICAgICAgIG9iamVjdEluZGV4LmRhdGFLZXlzLnB1c2goa2V5KTtcbiAgICAgICAgICAgIF90aGlzW2tleV0gPSB2YWw7XG4gICAgICAgIH0pO1xuICAgICAgICAkaWQrKztcbiAgICB9XG4gICAgcmV0dXJuIEJhc2VPYmplY3Q7XG59KSgpO1xuZXhwb3J0cy5CYXNlT2JqZWN0ID0gQmFzZU9iamVjdDtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvbW9kZWxzL3VuaW9uX29iamVjdC50c1xuICoqIG1vZHVsZSBpZCA9IDEyXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIndXNlIHN0cmljdCc7XG52YXIgZmV0Y2hfMSA9IHJlcXVpcmUoJy4uL3V0aWxzL2ZldGNoJyk7XG52YXIgb3JnYW5pemF0aW9uX21vZGVsXzEgPSByZXF1aXJlKCcuLi9tb2RlbHMvb3JnYW5pemF0aW9uX21vZGVsJyk7XG52YXIgbWVtYmVyX21vZGVsXzEgPSByZXF1aXJlKCcuLi9tb2RlbHMvbWVtYmVyX21vZGVsJyk7XG5leHBvcnRzLk9yZ2FuaXphdGlvbkFQSSA9IHtcbiAgICBnZXRBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gb3JnYW5pemF0aW9uX21vZGVsXzEuZGVmYXVsdC5nZXRBbGwoKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlID9cbiAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNhY2hlKTtcbiAgICAgICAgICAgIH0pIDpcbiAgICAgICAgICAgIGZldGNoXzEudGJGZXRjaC5nZXQoe1xuICAgICAgICAgICAgICAgIFR5cGU6ICdvcmdhbml6YXRpb25zJ1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAob3JnYW5pemF0aW9ucykge1xuICAgICAgICAgICAgICAgIHJldHVybiBvcmdhbml6YXRpb25fbW9kZWxfMS5kZWZhdWx0LnNldEFsbChvcmdhbml6YXRpb25zKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0T25lOiBmdW5jdGlvbiAob3JnYW5pemF0aW9uSWQpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gb3JnYW5pemF0aW9uX21vZGVsXzEuZGVmYXVsdC5nZXQob3JnYW5pemF0aW9uSWQpO1xuICAgICAgICByZXR1cm4gY2FjaGUgP1xuICAgICAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY2FjaGUpO1xuICAgICAgICAgICAgfSkgOlxuICAgICAgICAgICAgZmV0Y2hfMS50YkZldGNoLmdldCh7XG4gICAgICAgICAgICAgICAgVHlwZTogJ29yZ2FuaXphdGlvbnMnLFxuICAgICAgICAgICAgICAgIElkOiBvcmdhbml6YXRpb25JZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAob3JnYW5pemF0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9yZ2FuaXphdGlvbl9tb2RlbF8xLmRlZmF1bHQuc2V0KG9yZ2FuaXphdGlvbik7XG4gICAgICAgICAgICB9KTtcbiAgICB9LFxuICAgIGdldE1lbWJlcnM6IGZ1bmN0aW9uIChvcmdhbml6YXRpb25JZCkge1xuICAgICAgICB2YXIgY2FjaGUgPSBtZW1iZXJfbW9kZWxfMS5kZWZhdWx0LmdldE9yZ01lbWJlcihvcmdhbml6YXRpb25JZCk7XG4gICAgICAgIHJldHVybiBjYWNoZSA/XG4gICAgICAgICAgICBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShjYWNoZSk7XG4gICAgICAgICAgICB9KSA6XG4gICAgICAgICAgICBmZXRjaF8xLnRiRmV0Y2guZ2V0KHtcbiAgICAgICAgICAgICAgICBWZXJzaW9uOiAnVjInLFxuICAgICAgICAgICAgICAgIFR5cGU6ICdvcmdhbml6YXRpb25zJyxcbiAgICAgICAgICAgICAgICBJZDogb3JnYW5pemF0aW9uSWQsXG4gICAgICAgICAgICAgICAgUGF0aDE6ICdtZW1iZXJzJ1xuICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAobWVtYmVycykge1xuICAgICAgICAgICAgICAgIHJldHVybiBtZW1iZXJfbW9kZWxfMS5kZWZhdWx0LnNldE9yZ01lbWJlcihvcmdhbml6YXRpb25JZCwgbWVtYmVycyk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9hcGlzL29yZ2FuaXphdGlvbl9hcGkudHNcbiAqKiBtb2R1bGUgaWQgPSAxM1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbn07XG52YXIgbW9kZWxfMSA9IHJlcXVpcmUoJy4vbW9kZWwnKTtcbnZhciBPcmdhbml6YXRpb25Nb2RlbCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKE9yZ2FuaXphdGlvbk1vZGVsLCBfc3VwZXIpO1xuICAgIGZ1bmN0aW9uIE9yZ2FuaXphdGlvbk1vZGVsKCkge1xuICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gICAgT3JnYW5pemF0aW9uTW9kZWwucHJvdG90eXBlLmdldEFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25lKCdvcmdhbml6YXRpb24nKTtcbiAgICB9O1xuICAgIE9yZ2FuaXphdGlvbk1vZGVsLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25lKGlkKTtcbiAgICB9O1xuICAgIE9yZ2FuaXphdGlvbk1vZGVsLnByb3RvdHlwZS5zZXRBbGwgPSBmdW5jdGlvbiAob3JnYW5pemF0aW9ucykge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRDb2xsZWN0aW9uKCdvcmdhbml6YXRpb24nLCBvcmdhbml6YXRpb25zKTtcbiAgICB9O1xuICAgIE9yZ2FuaXphdGlvbk1vZGVsLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRPbmUoZGF0YS5faWQsIGRhdGEpO1xuICAgIH07XG4gICAgcmV0dXJuIE9yZ2FuaXphdGlvbk1vZGVsO1xufSkobW9kZWxfMS5kZWZhdWx0KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG5ldyBPcmdhbml6YXRpb25Nb2RlbCgpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9tb2RlbHMvb3JnYW5pemF0aW9uX21vZGVsLnRzXG4gKiogbW9kdWxlIGlkID0gMTRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xudmFyIG1vZGVsXzEgPSByZXF1aXJlKCcuL21vZGVsJyk7XG52YXIgdXRpbHNfMSA9IHJlcXVpcmUoJy4uL3V0aWxzJyk7XG52YXIgbWVtYmVyX3NjaGVtYV8xID0gcmVxdWlyZSgnLi4vc2NoZW1hcy9tZW1iZXJfc2NoZW1hJyk7XG52YXIgc2NoZW1hXzEgPSByZXF1aXJlKCcuLi9zY2hlbWFzL3NjaGVtYScpO1xudmFyIE1lbWJlck1vZGVsID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoTWVtYmVyTW9kZWwsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTWVtYmVyTW9kZWwoKSB7XG4gICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBNZW1iZXJNb2RlbC5wcm90b3R5cGUuc2V0UHJvamVjdE1lbWJlcnMgPSBmdW5jdGlvbiAocHJvamVjdElkLCBtZW1iZXJzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgdXRpbHNfMS5mb3JFYWNoKG1lbWJlcnMsIGZ1bmN0aW9uIChtZW1iZXIpIHtcbiAgICAgICAgICAgIHJlc3VsdC5wdXNoKHNjaGVtYV8xLnNldFNjaGVtYShuZXcgbWVtYmVyX3NjaGVtYV8xLmRlZmF1bHQoKSwgbWVtYmVyKSk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnNldENvbGxlY3Rpb24oXCJtZW1iZXJzOlwiICsgcHJvamVjdElkLCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgTWVtYmVyTW9kZWwucHJvdG90eXBlLmdldFByb2plY3RNZW1iZXJzID0gZnVuY3Rpb24gKHByb2plY3RJZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRPbmUoXCJtZW1iZXJzOlwiICsgcHJvamVjdElkKTtcbiAgICB9O1xuICAgIE1lbWJlck1vZGVsLnByb3RvdHlwZS5yZW1vdmVNZW1iZXIgPSBmdW5jdGlvbiAobWVtYmVySWQpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVPbmUobWVtYmVySWQpO1xuICAgIH07XG4gICAgTWVtYmVyTW9kZWwucHJvdG90eXBlLnNldE9yZ01lbWJlciA9IGZ1bmN0aW9uIChvcmdhbml6YXRpb25JZCwgbWVtYmVycykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIHV0aWxzXzEuZm9yRWFjaChtZW1iZXJzLCBmdW5jdGlvbiAobWVtYmVyKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChzY2hlbWFfMS5zZXRTY2hlbWEobmV3IG1lbWJlcl9zY2hlbWFfMS5kZWZhdWx0KCksIG1lbWJlcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zZXRDb2xsZWN0aW9uKFwibWVtYmVyczpcIiArIG9yZ2FuaXphdGlvbklkLCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgTWVtYmVyTW9kZWwucHJvdG90eXBlLmdldE9yZ01lbWJlciA9IGZ1bmN0aW9uIChvcmdhbml6YXRpb25JZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRPbmUoXCJtZW1iZXJzOlwiICsgb3JnYW5pemF0aW9uSWQpO1xuICAgIH07XG4gICAgcmV0dXJuIE1lbWJlck1vZGVsO1xufSkobW9kZWxfMS5kZWZhdWx0KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IG5ldyBNZW1iZXJNb2RlbCgpO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL3NyYy9tb2RlbHMvbWVtYmVyX21vZGVsLnRzXG4gKiogbW9kdWxlIGlkID0gMTVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xudmFyIHNjaGVtYV8xID0gcmVxdWlyZSgnLi9zY2hlbWEnKTtcbnZhciBNZW1iZXIgPSAoZnVuY3Rpb24gKF9zdXBlcikge1xuICAgIF9fZXh0ZW5kcyhNZW1iZXIsIF9zdXBlcik7XG4gICAgZnVuY3Rpb24gTWVtYmVyKCkge1xuICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5faWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuX2JvdW5kVG9PYmplY3RJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5ib3VuZFRvT2JqZWN0VHlwZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fcm9sZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnZpc2l0ZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuam9pbmVkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnB1c2hTdGF0dXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubmlja25hbWUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubmlja25hbWVQeSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5uaWNrbmFtZVBpbnlpbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5oYXNWaXNpdGVkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9tZW1iZXJJZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5waG9uZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5sb2NhdGlvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy53ZWJzaXRlID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxhdGVzdEFjdGl2ZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaXNBY3RpdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuZW1haWwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5hdmF0YXJVcmwgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGl0bGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMucGlueWluID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnB5ID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gTWVtYmVyO1xufSkoc2NoZW1hXzEuU2NoZW1hKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IE1lbWJlcjtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9zcmMvc2NoZW1hcy9tZW1iZXJfc2NoZW1hLnRzXG4gKiogbW9kdWxlIGlkID0gMTZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBmZXRjaF8xID0gcmVxdWlyZSgnLi4vdXRpbHMvZmV0Y2gnKTtcbnZhciBtZW1iZXJfbW9kZWxfMSA9IHJlcXVpcmUoJy4uL21vZGVscy9tZW1iZXJfbW9kZWwnKTtcbnZhciBwcm9qZWN0X21vZGVsXzEgPSByZXF1aXJlKCcuLi9tb2RlbHMvcHJvamVjdF9tb2RlbCcpO1xuZXhwb3J0cy5Qcm9qZWN0QVBJID0ge1xuICAgIGdldE1lbWJlcnM6IGZ1bmN0aW9uIChwcm9qZWN0SWQpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gbWVtYmVyX21vZGVsXzEuZGVmYXVsdC5nZXRQcm9qZWN0TWVtYmVycyhwcm9qZWN0SWQpO1xuICAgICAgICByZXR1cm4gY2FjaGUgP1xuICAgICAgICAgICAgbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoY2FjaGUpO1xuICAgICAgICAgICAgfSkgOlxuICAgICAgICAgICAgZmV0Y2hfMS50YkZldGNoLmdldCh7XG4gICAgICAgICAgICAgICAgVHlwZTogJ3Byb2plY3RzJyxcbiAgICAgICAgICAgICAgICBJZDogcHJvamVjdElkLFxuICAgICAgICAgICAgICAgIFBhdGgxOiAnbWVtYmVycydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKG1lbWJlcnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVtYmVyX21vZGVsXzEuZGVmYXVsdC5zZXRQcm9qZWN0TWVtYmVycyhwcm9qZWN0SWQsIG1lbWJlcnMpO1xuICAgICAgICAgICAgfSk7XG4gICAgfSxcbiAgICBkZWxldGVNZW1iZXI6IGZ1bmN0aW9uIChtZW1iZXJJZCkge1xuICAgICAgICByZXR1cm4gZmV0Y2hfMS50YkZldGNoLmRlbGV0ZSh7XG4gICAgICAgICAgICBUeXBlOiAnbWVtYmVycycsXG4gICAgICAgICAgICBJZDogbWVtYmVySWRcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIG1lbWJlcl9tb2RlbF8xLmRlZmF1bHQucmVtb3ZlTWVtYmVyKG1lbWJlcklkKTtcbiAgICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRBbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGNhY2hlID0gcHJvamVjdF9tb2RlbF8xLmRlZmF1bHQuZ2V0UHJvamVjdHMoKTtcbiAgICAgICAgcmV0dXJuIGNhY2hlID9cbiAgICAgICAgICAgIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGNhY2hlKTtcbiAgICAgICAgICAgIH0pIDpcbiAgICAgICAgICAgIGZldGNoXzEudGJGZXRjaC5nZXQoe1xuICAgICAgICAgICAgICAgIFR5cGU6ICdwcm9qZWN0cydcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHByb2plY3RzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2plY3RfbW9kZWxfMS5kZWZhdWx0LnNldFByb2plY3RzKHByb2plY3RzKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL2FwaXMvcHJvamVjdF9hcGkudHNcbiAqKiBtb2R1bGUgaWQgPSAxN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiJ3VzZSBzdHJpY3QnO1xudmFyIF9fZXh0ZW5kcyA9ICh0aGlzICYmIHRoaXMuX19leHRlbmRzKSB8fCBmdW5jdGlvbiAoZCwgYikge1xuICAgIGZvciAodmFyIHAgaW4gYikgaWYgKGIuaGFzT3duUHJvcGVydHkocCkpIGRbcF0gPSBiW3BdO1xuICAgIGZ1bmN0aW9uIF9fKCkgeyB0aGlzLmNvbnN0cnVjdG9yID0gZDsgfVxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcbn07XG52YXIgbW9kZWxfMSA9IHJlcXVpcmUoJy4vbW9kZWwnKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZSgnLi4vdXRpbHMnKTtcbnZhciBwcm9qZWN0X3NjaGVtYV8xID0gcmVxdWlyZSgnLi4vc2NoZW1hcy9wcm9qZWN0X3NjaGVtYScpO1xudmFyIFByb2plY3RNb2RlbCA9IChmdW5jdGlvbiAoX3N1cGVyKSB7XG4gICAgX19leHRlbmRzKFByb2plY3RNb2RlbCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBQcm9qZWN0TW9kZWwoKSB7XG4gICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgICBQcm9qZWN0TW9kZWwucHJvdG90eXBlLnNldFByb2plY3RzID0gZnVuY3Rpb24gKHByb2plY3RzKSB7XG4gICAgICAgIHZhciByZXN1bHQgPSB1dGlsc18xLmRhdGFzVG9TY2hlbWFzKHByb2plY3RzLCBuZXcgcHJvamVjdF9zY2hlbWFfMS5kZWZhdWx0KCkpO1xuICAgICAgICB0aGlzLnNldENvbGxlY3Rpb24oXCJwcm9qZWN0c1wiLCByZXN1bHQpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gICAgUHJvamVjdE1vZGVsLnByb3RvdHlwZS5nZXRQcm9qZWN0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0T25lKCdwcm9qZWN0cycpO1xuICAgIH07XG4gICAgcmV0dXJuIFByb2plY3RNb2RlbDtcbn0pKG1vZGVsXzEuZGVmYXVsdCk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5leHBvcnRzLmRlZmF1bHQgPSBuZXcgUHJvamVjdE1vZGVsKCk7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL21vZGVscy9wcm9qZWN0X21vZGVsLnRzXG4gKiogbW9kdWxlIGlkID0gMThcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIid1c2Ugc3RyaWN0JztcbnZhciBfX2V4dGVuZHMgPSAodGhpcyAmJiB0aGlzLl9fZXh0ZW5kcykgfHwgZnVuY3Rpb24gKGQsIGIpIHtcbiAgICBmb3IgKHZhciBwIGluIGIpIGlmIChiLmhhc093blByb3BlcnR5KHApKSBkW3BdID0gYltwXTtcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cbiAgICBkLnByb3RvdHlwZSA9IGIgPT09IG51bGwgPyBPYmplY3QuY3JlYXRlKGIpIDogKF9fLnByb3RvdHlwZSA9IGIucHJvdG90eXBlLCBuZXcgX18oKSk7XG59O1xudmFyIHNjaGVtYV8xID0gcmVxdWlyZSgnLi9zY2hlbWEnKTtcbnZhciBQcm9qZWN0ID0gKGZ1bmN0aW9uIChfc3VwZXIpIHtcbiAgICBfX2V4dGVuZHMoUHJvamVjdCwgX3N1cGVyKTtcbiAgICBmdW5jdGlvbiBQcm9qZWN0KCkge1xuICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgdGhpcy5faWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fY3JlYXRvcklkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxvZ28gPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMucHkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMucGlueWluID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmRlc2NyaXB0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNhdGVnb3J5ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9vcmdhbml6YXRpb25JZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5uYXZpZ2F0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnZpc2liaWxpdHkgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY3JlYXRlZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy51cGRhdGVkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmlzQXJjaGl2ZWQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaW52aXRlTGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5pc1N0YXIgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaGFzUmlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuaGFzT3JnUmlnaHQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMub3JnYW5pemF0aW9uID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmZvcmtzQ291bnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGFza3NDb3VudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5wb3N0c0NvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmV2ZW50c0NvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLndvcmtzQ291bnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudGFnc0NvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9kZWZhdWx0Um9sZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmNyZWF0b3IgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudW5yZWFkQ291bnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMudW5yZWFkTWVzc2FnZUNvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnB1c2hTdGF0dXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY2FuUXVpdCA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jYW5EZWxldGUgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMuY2FuQXJjaGl2ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jYW5UcmFuc2ZlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5fcm9sZUlkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmxpbmsgPSB1bmRlZmluZWQ7XG4gICAgICAgIHRoaXMubW9iaWxlSW52aXRlTGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zaWduQ29kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5zdGFyc0NvdW50ID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9yb290Q29sbGVjdGlvbklkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9kZWZhdWx0Q29sbGVjdGlvbklkID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnNob3J0TGluayA9IHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5jYWxMaW5rID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLnRhc2tDYWxMaW5rID0gdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLl9vcmdSb2xlSWQgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHJldHVybiBQcm9qZWN0O1xufSkoc2NoZW1hXzEuU2NoZW1hKTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuZGVmYXVsdCA9IFByb2plY3Q7XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vc3JjL3NjaGVtYXMvcHJvamVjdF9zY2hlbWEudHNcbiAqKiBtb2R1bGUgaWQgPSAxOVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIl0sInNvdXJjZVJvb3QiOiIifQ==