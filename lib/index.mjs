try {
  var fetch = require('node-fetch');
} catch(error) {
  throw('Current environment doesn\'t supoort Fetch method');
}

class FetchQL {
  /**
   * FetchQL Class
   * @param {String} url - the server address of GraphQL
   */
  constructor({ url }) {
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
  query({ operationName, query, variables }) {
    let options = Object.assign({}, this.requestObject);
    let body = {
      operationName,
      query,
      variables: JSON.stringify(variables)
    };
    options.body = JSON.stringify(body);
    return fetch(this._url, options)
      .then(res => res.json())
      .then(response => (
        new Promise((resolve, reject) => {
          // if any errors, reject the promise
          if (response.errors && response.errors.length) {
            reject(response);
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
   * @param [String]EnumNameList - array of enums' name
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
    return fetch(this._url, options)
      .then(res => res.json())
      .then(({ data, errors }) => (
        new Promise((resolve, reject) => {
          // merge enums' data
          let passData = Object.assign(fullData, data);
          if (errors && errors.length) {
            reject({ data: passData, errors });
          }
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

module.exports = FetchQL;
