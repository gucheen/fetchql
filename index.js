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
    let EnumTypeQuery = EnumNameList.map(type => (
      `${type}: __type(name: "${type}") {
          kind
          description
          enumValues{
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
      .then(response => (
        new Promise((resolve, reject) => {
          if (response.errors && response.errors.length) {
            reject(response);
          }
          resolve(response);
        })
      ));
  }
}

export default FetchQL;
