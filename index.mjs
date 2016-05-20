try {
  var fetch = require('node-fetch');
} catch(error) {
  throw('Current environment doesn\'t supoort Fetch method');
}

class FetchQL {
  /**
   *
   * @param {String} url - API 地址
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
          if (response.errors && response.errors.length) {
            reject(response);
          }
          resolve(response);
        })
      ));
  }

  /**
   * 获取当前的 url
   * @returns {String}
   */
  getUrl() {
    return this._url;
  }

  /**
   * 设置新的 url
   * @param {String} url
   */
  setUrl(url) {
    this._url = url;
  }

  /**
   * 获取 ENUM 类型的 type 对象
   * @param EnumNameList - ENUM 对象 name 数组
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
    
    // return data when all enums have been cached
    if (!unCachedEnumList.length) {
      return new Promise((resolve) => {
        resolve({ data: fullData });
      });
    }

    // build query string for uncached enums
    let EnumTypeQuery = unCachedEnumList.map(type => (
      `${type}: __type(name: "${type}") {
          kind
          description
          enumValues {
            name
            description
          }
        }`
    ));
    let query = `
      query {
        ${EnumTypeQuery.join('\n')}
      }
    `;
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
