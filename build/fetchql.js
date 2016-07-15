'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchInterceptor = function () {
  function FetchInterceptor() {
    var _this = this;

    _classCallCheck(this, FetchInterceptor);

    this.interceptors = new Set();

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

      if (Array.isArray(interceptors)) {
        interceptors.map(function (interceptor) {
          return _this2.interceptors.add(interceptor);
        });
      } else if (interceptors instanceof Object) {
        this.interceptors.add(interceptors);
      }

      this.updateInterceptors();

      return function () {
        return _this2.removeInterceptors(interceptors);
      };
    }
  }, {
    key: 'removeInterceptors',
    value: function removeInterceptors(interceptors) {
      var _this3 = this;

      if (Array.isArray(interceptors)) {
        interceptors.map(function (interceptor) {
          return _this3.interceptors.delete(interceptor);
        });
      } else if (interceptors instanceof Object) {
        this.interceptors.delete(interceptors);
      }

      this.updateInterceptors();
    }
  }, {
    key: 'updateInterceptors',
    value: function updateInterceptors() {
      this.reversedInterceptors = Array.from(this.interceptors).reduce(function (array, interceptor) {
        return [interceptor].concat(array);
      }, []);
    }

    /**
     * remove all interceptors
     */

  }, {
    key: 'clearInterceptors',
    value: function clearInterceptors() {
      this.interceptors.clear();

      this.updateInterceptors();
    }
  }, {
    key: 'interceptorWrapper',
    value: function interceptorWrapper(fetch) {
      for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var promise = Promise.resolve(args);

      this.reversedInterceptors.forEach(function (_ref) {
        var request = _ref.request;
        var requestError = _ref.requestError;

        if (request || requestError) {
          promise = promise.then(function (args) {
            return request.apply(undefined, _toConsumableArray(args));
          }, requestError);
        }
      });

      promise = promise.then(function (args) {
        return fetch.apply(undefined, _toConsumableArray(args));
      });

      this.reversedInterceptors.forEach(function (_ref2) {
        var response = _ref2.response;
        var responseError = _ref2.responseError;

        if (response || responseError) {
          promise = promise.then(response, responseError);
        }
      });

      return promise;
    }
  }]);

  return FetchInterceptor;
}();

var FetchQL = function (_FetchInterceptor) {
  _inherits(FetchQL, _FetchInterceptor);

  /**
   * FetchQL Class
   * @param {String} url - the server address of GraphQL
   * @param {(Object|Object[])=} interceptors
   * @param {{}=} headers - request headers
   */

  function FetchQL(_ref3) {
    var url = _ref3.url;
    var interceptors = _ref3.interceptors;
    var headers = _ref3.headers;

    _classCallCheck(this, FetchQL);

    var _this4 = _possibleConstructorReturn(this, Object.getPrototypeOf(FetchQL).call(this));

    _this4.requestObject = {
      method: 'POST',
      headers: Object.assign({}, {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }, headers),
      credentials: 'same-origin'
    };

    _this4.url = url;

    // using for caching enums' type
    _this4.EnumMap = {};

    _this4.addInterceptors(interceptors);
    return _this4;
  }

  /**
   * operate an query
   * @param {String} operationName
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */


  _createClass(FetchQL, [{
    key: 'query',
    value: function query(_ref4) {
      var operationName = _ref4.operationName;
      var _query = _ref4.query;
      var variables = _ref4.variables;

      var options = Object.assign({}, this.requestObject);
      var body = {
        operationName: operationName,
        query: _query,
        variables: JSON.stringify(variables)
      };
      options.body = JSON.stringify(body);

      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          // return an custom error stack if request error
          return {
            errors: [{
              message: res.statusText,
              stack: res
            }]
          };
        }
      }).then(function (_ref5) {
        var data = _ref5.data;
        var errors = _ref5.errors;
        return new Promise(function (resolve, reject) {
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
     */

  }, {
    key: 'getUrl',
    value: function getUrl() {
      return this.url;
    }

    /**
     * setting a new server address
     * @param {String} url
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
     */

  }, {
    key: 'getEnumTypes',
    value: function getEnumTypes(EnumNameList) {
      var _this5 = this;

      var fullData = {};

      // check cache status
      var unCachedEnumList = EnumNameList.filter(function (element) {
        if (_this5.EnumMap[element]) {
          // enum has been cached
          fullData[element] = _this5.EnumMap[element];
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
      return this.fetch(this.url, options).then(function (res) {
        if (res.ok) {
          return res.json();
        } else {
          // return an custom error stack if request error
          return {
            errors: [{
              message: res.statusText,
              stack: res
            }]
          };
        }
      }).then(function (_ref6) {
        var data = _ref6.data;
        var errors = _ref6.errors;
        return new Promise(function (resolve, reject) {
          // if data in response is 'null' and have any errors
          if (!data) {
            return reject(errors || [{}]);
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
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              _this5.EnumMap[key] = data[key];
            }
          }
          resolve({ data: passData, errors: errors });
        });
      });
    }
  }]);

  return FetchQL;
}(FetchInterceptor);

exports.default = FetchQL;
