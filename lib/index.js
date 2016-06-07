class FetchInterceptor {
  constructor() {
    this.interceptors = new Set();

    this.fetch = (...args) => {
      return this.interceptorWrapper(fetch, ...args);
    };
  }

  /**
   * add new interceptors
   * @param {(Object|Object[])} interceptors
   */
  addInterceptors(interceptors) {
    if (Array.isArray(interceptors)) {
      interceptors.map(interceptor => {
        this.interceptors.add(interceptor);
      });
    } else if (interceptors instanceof Object) {
      this.interceptors.add(interceptors);
    }

    this.updateInterceptors();

    return () => {
      return this.removeInterceptors(interceptors);
    };
  }

  removeInterceptors(interceptors) {
    if (Array.isArray(interceptors)) {
      interceptors.map(interceptor => {
        this.interceptors.delete(interceptor);
      });
    } else if (interceptors instanceof Object) {
      this.interceptors.delete(interceptors);
    }

    this.updateInterceptors();
  }

  updateInterceptors() {
    this.reversedInterceptors = Array.from(this.interceptors)
      .reduce((array, interceptor) => [interceptor].concat(array), []);
  }

  /**
   * remove all interceptors
   */
  clearInterceptors() {
    this.interceptors.clear();

    this.updateInterceptors();
  }

  interceptorWrapper(fetch, ...args) {
    let promise = Promise.resolve(args);

    this.reversedInterceptors.forEach(({ request, requestError }) => {
      if (request || requestError) {
        promise = promise.then(args => request(...args), requestError);
      }
    });

    promise = promise.then(args => fetch(...args));

    this.reversedInterceptors.forEach(({ response, responseError }) => {
      if (response || responseError) {
        promise = promise.then(response, responseError);
      }
    });

    return promise;
  }
}

class FetchQL extends FetchInterceptor {
  /**
   * FetchQL Class
   * @param {String} url - the server address of GraphQL
   * @param {Object|Object[]=} interceptors
   */
  constructor({ url, interceptors }) {
    super();

    this.requestObject = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    };

    this._url = url;

    // using for caching enums' type
    this.EnumMap = {};

    this.addInterceptors(interceptors);
  }

  /**
   * operate an query
   * @param {String} operationName
   * @param {String} query
   * @param {Object} variables
   * @returns {Promise}
   */
  query({ operationName, query, variables }) {
    let options = Object.assign({}, this.requestObject);
    let body = {
      operationName,
      query,
      variables: JSON.stringify(variables)
    };
    options.body = JSON.stringify(body);

    return this.fetch(this._url, options)
      .then(res => {
        if (res.status >= 400) {
          var error = new Error(res.statusText);
          error.response = res;
          throw error;
        } else {
          return res.json();
        }
      })
      .then(response => (
        new Promise((resolve, reject) => {
          // if data in response is 'null'
          if (!response.data) {
            return reject(response.errors);
          }
          // if all properties of data is 'null'
          let allDataKeyEmpty = Object.keys(response.data).every(key => !response.data[key]);
          if (allDataKeyEmpty) {
            return reject(response.errors);
          }
          resolve(response);
        })
      ));
  }

  /**
   * get current server address
   * @returns {String}
   */
  getUrl() {
    return this._url;
  }

  /**
   * setting a new server address
   * @param {String} url
   */
  setUrl(url) {
    this._url = url;
  }

  /**
   * get information of enum type
   * @param {String[]} EnumNameList - array of enums' name
   * @returns {Promise}
   */
  getEnumTypes(EnumNameList) {
    var fullData = {};

    // check cache status
    let unCachedEnumList = EnumNameList.filter(element => {
      if (this.EnumMap[element]) {
        // enum has been cached
        fullData[element] = this.EnumMap[element];
        return false;
      }
      return true;
    });

    // immediately return the data if all enums have been cached
    if (!unCachedEnumList.length) {
      return new Promise((resolve) => {
        resolve({ data: fullData });
      });
    }

    // build query string for uncached enums
    let EnumTypeQuery = unCachedEnumList.map(type => (
      `${type}: __type(name: "${type}") {
        ...EnumFragment
      }`
    ));

    let query = `
      query {
        ${EnumTypeQuery.join('\n')}
      }
      
      fragment EnumFragment on __Type {
        kind
        description
        enumValues {
          name
          description
        }
      }`;

    let options = Object.assign({}, this.requestObject);
    options.body = JSON.stringify({ query });
    return this.fetch(this._url, options)
      .then(res => {
        if (res.status >= 400) {
          var error = new Error(res.statusText);
          error.response = res;
          throw error;
        } else {
          return res.json();
        }
      })
      .then(({ data, errors }) => (
        new Promise((resolve, reject) => {
          // if data in response is 'null'
          if (!data) {
            return reject(errors);
          }
          // if all properties of data is 'null'
          let allDataKeyEmpty = Object.keys(data).every(key => !data[key]);
          if (allDataKeyEmpty) {
            return reject(errors);
          }
          // merge enums' data
          let passData = Object.assign(fullData, data);
          // cache new enums' data
          for (var key in data) {
            if (data.hasOwnProperty(key)) {
              this.EnumMap[key] = data[key];
            }
          }
          resolve({ data: passData, errors });
        })
      ));
  }
}

export default FetchQL;
