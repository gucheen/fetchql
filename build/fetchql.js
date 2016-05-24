'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FetchQL = function () {
  /**
   * FetchQL Class
   * @param {String} url - the server address of GraphQL
   */

  function FetchQL(_ref) {
    var url = _ref.url;

    _classCallCheck(this, FetchQL);

    this.requestObject = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    };

    this._url = url;

    // using for caching enums' type
    this.EnumMap = {};
  }

  /**
   *
   * @param {String} operationName
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */


  _createClass(FetchQL, [{
    key: 'query',
    value: function query(_ref2) {
      var operationName = _ref2.operationName;
      var _query = _ref2.query;
      var variables = _ref2.variables;

      var options = Object.assign({}, this.requestObject);
      var body = {
        operationName: operationName,
        query: _query,
        variables: JSON.stringify(variables)
      };
      options.body = JSON.stringify(body);
      return fetch(this._url, options).then(function (res) {
        return res.json();
      }).then(function (response) {
        return new Promise(function (resolve, reject) {
          // if any errors, reject the promise
          if (response.errors && response.errors.length) {
            reject(response);
          }
          resolve(response);
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
      return this._url;
    }

    /**
     * setting a new server address
     * @param {String} url
     */

  }, {
    key: 'setUrl',
    value: function setUrl(url) {
      this._url = url;
    }

    /**
     * get information of enum type
     * @param [String]EnumNameList - array of enums' name
     * @returns {Promise}
     */

  }, {
    key: 'getEnumTypes',
    value: function getEnumTypes(EnumNameList) {
      var _this = this;

      var fullData = {};

      // check cache status
      var unCachedEnumList = EnumNameList.filter(function (element) {
        if (_this.EnumMap[element]) {
          // enum has been cached
          fullData[element] = _this.EnumMap[element];
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
      return fetch(this._url, options).then(function (res) {
        return res.json();
      }).then(function (_ref3) {
        var data = _ref3.data;
        var errors = _ref3.errors;
        return new Promise(function (resolve, reject) {
          // merge enums' data
          var passData = Object.assign(fullData, data);
          if (errors && errors.length) {
            reject({ data: passData, errors: errors });
          }
          // cache new enums' data
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              _this.EnumMap[key] = data[key];
            }
          }
          resolve({ data: passData, errors: errors });
        });
      });
    }
  }]);

  return FetchQL;
}();

exports.default = FetchQL;

//# sourceMappingURL=fetchql.js.map