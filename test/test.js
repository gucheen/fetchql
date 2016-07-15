/**
 * Created by gucheng on 5/18/16.
 */
require("babel-register");
var expect = require('chai').expect;
global.fetch = require('node-fetch');
var FetchQL = require('../lib/index').default;

var app = require('./server');

const testQuery = `
  query Query {
    testString
  }
`;

const testUrl = 'http://127.0.0.1:4321/graphql';
const testQueryParams = {
  operationName: 'Query',
  query: testQuery,
  variables: {}
};

var testQL = new FetchQL({
  url: testUrl,
  headers: {
    'test-header': 'test-header'
  }
});

describe('FetchQL', () => {
  describe('#constructor', () => {
    it('should return an Object', () => {
      expect(testQL).to.be.a('object');
    });
  });

  describe('#methods', () => {
    const methods = ['query', 'getUrl', 'setUrl', 'getEnumTypes'];
    methods.map((method) => {
      it(`${method}() should be a function`, () => {
        expect(testQL[method]).to.be.a('function');
      })
    })
  });

  describe('#getUrl()', () => {
    let currentUrl = testQL.getUrl();
    it(`should return url "${testUrl}"`, () => {
      expect(currentUrl).to.be.a('string');
      expect(currentUrl).to.eql(testUrl);
    });
  });

  describe('#query()', () => {
    let call = testQL.query(testQueryParams);
    it('should return a Promise', () => {
      expect(call).to.be.a('promise');
    });

    it('should pass response data and "testString" should be "It works!"', () => {
      return call
        .then(response => {
          expect(response.data).to.be.a('object');
          expect(response.data.testString).to.equal('It works!');
        })
        .catch(error => expect(error).to.be.a('object'))
    });
  });

  describe('#getEnumTypes(["TestEnum"])', () => {
    let call = testQL.getEnumTypes(['TestEnum']);
    it('should return a Promise', () => {
      expect(call).to.be.a('promise');
    });

    it('should pass an Object cotains GraphQL enum type for "TestEnum" in promise', () => {
      return call
        .then(response => {
          expect(response).to.be.a('object');
          expect(response).to.have.property('TestEnum');
          expect(response.UserType).to.have.all.keys('name', 'kind', 'enumValues');
        })
        .catch(error => {
          expect(error).to.be.a('object');
        })
    })
  });

  describe('Customized headers', () => {
    it('should add customized headers to request', () => {
      return testQL.query({
        operationName: 'Query',
        query: `
        query Query {
          headerCheck
        }`
      })
        .then(({ data }) => {
          expect(data.headerCheck).to.be.true;
        });
    });
  });

  let requestIntercepted = false;
  let responseIntercepted = false;
  var removeInterceptors;

  describe('Interceptor', () => {
    describe('#addInterceptors()', () => {
      removeInterceptors = testQL.addInterceptors({
        request: function(url, config) {
          requestIntercepted = true;
          return [url, config];
        },
        response: function(response) {
          responseIntercepted = true;
          return response;
        }
      });
      it('should return a function', () => {
        expect(removeInterceptors).to.be.a('function');
      });
    });

    describe('#interceptors', () => {
      it('should intercept fetch calls', () => {
        let call = testQL.query(testQueryParams);

        return call.then(() => {
          expect(requestIntercepted).to.be.true;
          expect(responseIntercepted).to.be.true;
        });
      });
    });

    describe('#removeInterceptors', () => {
      it('should remove the added interceptors', () => {
        removeInterceptors();

        expect(testQL.interceptors.size).to.equal(0);
      });
    });
  });

  const newUrl = 'http://127.0.0.1:4321/another';
  describe(`#setUrl("${newUrl}")`, () => {
    it(`should set url to "${newUrl}"`, () => {
      testQL.setUrl(newUrl);
      expect(testQL.getUrl()).to.equal(newUrl);
    });
  });
});
