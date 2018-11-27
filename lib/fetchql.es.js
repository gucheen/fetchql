var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/** Class to realize fetch interceptors */
var FetchInterceptor = function () {
  function FetchInterceptor() {
    var _this = this;

    _classCallCheck(this, FetchInterceptor);

    this.interceptors = [];

    /* global fetch */
    this.fetch = function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _this.interceptorWrapper.apply(_this, [fetch].concat(args));
    };
  }

  /**
   * add new interceptors
   * @param {(Object|Object[])} interceptors
   */


  _createClass(FetchInterceptor, [{
    key: 'addInterceptors',
    value: function addInterceptors(interceptors) {
      var _this2 = this;

      var removeIndex = [];

      if (Array.isArray(interceptors)) {
        interceptors.map(function (interceptor) {
          removeIndex.push(_this2.interceptors.length);
          return _this2.interceptors.push(interceptor);
        });
      } else if (interceptors instanceof Object) {
        removeIndex.push(this.interceptors.length);
        this.interceptors.push(interceptors);
      }

      this.updateInterceptors();

      return function () {
        return _this2.removeInterceptors(removeIndex);
      };
    }

    /**
     * remove interceptors by indexes
     * @param {number[]} indexes
     */

  }, {
    key: 'removeInterceptors',
    value: function removeInterceptors(indexes) {
      var _this3 = this;

      if (Array.isArray(indexes)) {
        indexes.map(function (index) {
          return _this3.interceptors.splice(index, 1);
        });
        this.updateInterceptors();
      }
    }

    /**
     * @private
     */

  }, {
    key: 'updateInterceptors',
    value: function updateInterceptors() {
      this.reversedInterceptors = this.interceptors.reduce(function (array, interceptor) {
        return [interceptor].concat(array);
      }, []);
    }

    /**
     * remove all interceptors
     */

  }, {
    key: 'clearInterceptors',
    value: function clearInterceptors() {
      this.interceptors = [];

      this.updateInterceptors();
    }

    /**
     * @private
     */

  }, {
    key: 'interceptorWrapper',
    value: function interceptorWrapper(fetch) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var promise = Promise.resolve(args);

      this.reversedInterceptors.forEach(function (_ref) {
        var request = _ref.request,
            requestError = _ref.requestError;

        if (request || requestError) {
          promise = promise.then(function () {
            return request.apply(undefined, args);
          }, requestError);
        }
      });

      promise = promise.then(function () {
        return fetch.apply(undefined, args);
      });

      this.reversedInterceptors.forEach(function (_ref2) {
        var response = _ref2.response,
            responseError = _ref2.responseError;

        if (response || responseError) {
          promise = promise.then(response, responseError);
        }
      });

      return promise;
    }
  }]);

  return FetchInterceptor;
}();

/**
 * GraphQL client with fetch api.
 * @extends FetchInterceptor
 */


var FetchQL = function (_FetchInterceptor) {
  _inherits(FetchQL, _FetchInterceptor);

  /**
   * Create a FetchQL instance.
   * @param {Object} options
   * @param {String} options.url - the server address of GraphQL
   * @param {(Object|Object[])=} options.interceptors
   * @param {{}=} options.headers - request headers
   * @param {FetchQL~requestQueueChanged=} options.onStart - callback function of a new request queue
   * @param {FetchQL~requestQueueChanged=} options.onEnd - callback function of request queue finished
   * @param {Boolean=} options.omitEmptyVariables - remove null props(null or '') from the variables
   * @param {Object=} options.requestOptions - addition options to fetch request(refer to fetch api)
   */
  function FetchQL(_ref3) {
    var url = _ref3.url,
        interceptors = _ref3.interceptors,
        headers = _ref3.headers,
        onStart = _ref3.onStart,
        onEnd = _ref3.onEnd,
        _ref3$omitEmptyVariab = _ref3.omitEmptyVariables,
        omitEmptyVariables = _ref3$omitEmptyVariab === undefined ? false : _ref3$omitEmptyVariab,
        _ref3$requestOptions = _ref3.requestOptions,
        requestOptions = _ref3$requestOptions === undefined ? {} : _ref3$requestOptions;

    _classCallCheck(this, FetchQL);

    var _this4 = _possibleConstructorReturn(this, (FetchQL.__proto__ || Object.getPrototypeOf(FetchQL)).call(this));

    _this4.requestObject = Object.assign({}, {
      method: 'POST',
      headers: Object.assign({}, {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }, headers),
      credentials: 'same-origin'
    }, requestOptions);

    _this4.url = url;

    _this4.omitEmptyVariables = omitEmptyVariables;

    // marker for request queue
    _this4.requestQueueLength = 0;

    // using for caching enums' type
    _this4.EnumMap = {};

    _this4.callbacks = {
      onStart: onStart,
      onEnd: onEnd
    };

    _this4.addInterceptors(interceptors);
    return _this4;
  }

  /**
   * operate a query
   * @param {Object} options
   * @param {String} options.operationName
   * @param {String} options.query
   * @param {Object=} options.variables
   * @param {Object=} options.opts - addition options(will not be passed to server)
   * @param {Boolean=} options.opts.omitEmptyVariables - remove null props(null or '') from the variables
   * @param {Object=} options.requestOptions - addition options to fetch request(refer to fetch api)
   * @returns {Promise}
   * @memberOf FetchQL
   */


  _createClass(FetchQL, [{
    key: 'query',
    value: function query(_ref4) {
      var _this5 = this;

      var operationName = _ref4.operationName,
          _query = _ref4.query,
          variables = _ref4.variables,
          _ref4$opts = _ref4.opts,
          opts = _ref4$opts === undefined ? {} : _ref4$opts,
          _ref4$requestOptions = _ref4.requestOptions,
          requestOptions = _ref4$requestOptions === undefined ? {} : _ref4$requestOptions;

      var options = Object.assign({}, this.requestObject, requestOptions);
      var vars = void 0;
      if (this.omitEmptyVariables || opts.omitEmptyVariables) {
        vars = this.doOmitEmptyVariables(variables);
      } else {
        vars = variables;
      }
      var body = {
        operationName: operationName,
        query: _query,
        variables: vars
      };
      options.body = JSON.stringify(body);

      this.onStart();

      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        }
        // return an custom error stack if request error
        return {
          errors: [{
            message: res.statusText,
            stack: res
          }]
        };
      }).then(function (_ref5) {
        var data = _ref5.data,
            errors = _ref5.errors;
        return new Promise(function (resolve, reject) {
          _this5.onEnd();

          // if data in response is 'null'
          if (!data) {
            return reject(errors || [{}]);
          }
          // if all properties of data is 'null'
          var allDataKeyEmpty = Object.keys(data).every(function (key) {
            return !data[key];
          });
          if (allDataKeyEmpty) {
            return reject(errors);
          }
          return resolve({ data: data, errors: errors });
        });
      });
    }

    /**
     * get current server address
     * @returns {String}
     * @memberOf FetchQL
     */

  }, {
    key: 'getUrl',
    value: function getUrl() {
      return this.url;
    }

    /**
     * setting a new server address
     * @param {String} url
     * @memberOf FetchQL
     */

  }, {
    key: 'setUrl',
    value: function setUrl(url) {
      this.url = url;
    }

    /**
     * get information of enum type
     * @param {String[]} EnumNameList - array of enums' name
     * @returns {Promise}
     * @memberOf FetchQL
     */

  }, {
    key: 'getEnumTypes',
    value: function getEnumTypes(EnumNameList) {
      var _this6 = this;

      var fullData = {};

      // check cache status
      var unCachedEnumList = EnumNameList.filter(function (element) {
        if (_this6.EnumMap[element]) {
          // enum has been cached
          fullData[element] = _this6.EnumMap[element];
          return false;
        }
        return true;
      });

      // immediately return the data if all enums have been cached
      if (!unCachedEnumList.length) {
        return new Promise(function (resolve) {
          resolve({ data: fullData });
        });
      }

      // build query string for uncached enums
      var EnumTypeQuery = unCachedEnumList.map(function (type) {
        return type + ': __type(name: "' + type + '") {\n        ...EnumFragment\n      }';
      });

      var query = '\n      query {\n        ' + EnumTypeQuery.join('\n') + '\n      }\n      \n      fragment EnumFragment on __Type {\n        kind\n        description\n        enumValues {\n          name\n          description\n        }\n      }';

      var options = Object.assign({}, this.requestObject);
      options.body = JSON.stringify({ query: query });

      this.onStart();

      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        }
        // return an custom error stack if request error
        return {
          errors: [{
            message: res.statusText,
            stack: res
          }]
        };
      }).then(function (_ref6) {
        var data = _ref6.data,
            errors = _ref6.errors;
        return new Promise(function (resolve, reject) {
          _this6.onEnd();

          // if data in response is 'null' and have any errors
          if (!data) {
            return reject(errors || [{ message: 'Do not get any data.' }]);
          }
          // if all properties of data is 'null'
          var allDataKeyEmpty = Object.keys(data).every(function (key) {
            return !data[key];
          });
          if (allDataKeyEmpty && errors && errors.length) {
            return reject(errors);
          }
          // merge enums' data
          var passData = Object.assign(fullData, data);
          // cache new enums' data
          Object.keys(data).map(function (key) {
            _this6.EnumMap[key] = data[key];
            return key;
          });
          return resolve({ data: passData, errors: errors });
        });
      });
    }

    /**
     * calling on a request starting
     * if the request belong to a new queue, call the 'onStart' method
     */

  }, {
    key: 'onStart',
    value: function onStart() {
      this.requestQueueLength++;
      if (this.requestQueueLength > 1 || !this.callbacks.onStart) {
        return;
      }
      this.callbacks.onStart(this.requestQueueLength);
    }

    /**
     * calling on a request ending
     * if current queue finished, calling the 'onEnd' method
     */

  }, {
    key: 'onEnd',
    value: function onEnd() {
      this.requestQueueLength--;
      if (this.requestQueueLength || !this.callbacks.onEnd) {
        return;
      }
      this.callbacks.onEnd(this.requestQueueLength);
    }

    /**
     * Callback of requests queue changes.(e.g. new queue or queue finished)
     * @callback FetchQL~requestQueueChanged
     * @param {number} queueLength - length of current request queue
     */

    /**
     * remove empty props(null or '') from object
     * @param {Object} input
     * @returns {Object}
     * @memberOf FetchQL
     * @private
     */

  }, {
    key: 'doOmitEmptyVariables',
    value: function doOmitEmptyVariables(input) {
      var _this7 = this;

      var nonEmptyObj = {};
      Object.keys(input).map(function (key) {
        var value = input[key];
        if (typeof value === 'string' && value.length === 0 || value === null || value === undefined) {
          return key;
        } else if (value instanceof Object) {
          nonEmptyObj[key] = _this7.doOmitEmptyVariables(value);
        } else {
          nonEmptyObj[key] = value;
        }
        return key;
      });
      return nonEmptyObj;
    }
  }]);

  return FetchQL;
}(FetchInterceptor);

export default FetchQL;
