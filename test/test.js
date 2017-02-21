/**
 * Created by gucheng on 5/18/16.
 */
require('babel-register');
const expect = require('chai').expect;
global.fetch = require('node-fetch');
const FetchQL = require('../src/index').default;

require('./server');

const testQuery = `
  query Query {
    testString
  }
`;

const testUrl = 'http://127.0.0.1:4321/graphql';
const testQueryParams = {
  operationName: 'Query',
  query: testQuery,
  variables: {},
};

let startTrack = false;
let endTrack = false;
let queueLength;

const testQL = new FetchQL({
  url: testUrl,
  headers: {
    'test-header': 'test-header',
  },
  interceptors: [{
    request(url, config) {
      return [url, config];
    },
  }],
  onStart(requestQueueLength) {
    startTrack = true;
    queueLength = requestQueueLength;
  },
  onEnd(requestQueueLength) {
    endTrack = true;
    queueLength = requestQueueLength;
  },
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
    const currentUrl = testQL.getUrl();
    it(`should return url "${testUrl}"`, () => {
      expect(currentUrl).to.be.a('string');
      expect(currentUrl).to.eql(testUrl);
    });
  });

  describe('#query()', () => {
    const call = testQL.query(testQueryParams);
    it('should return a Promise', () => {
      expect(call).to.be.a('promise');
    });

    it('should pass response data and "testString" should be "It works!"', () => {
      return call
        .then(response => {
          expect(response.data).to.be.a('object');
          expect(response.data.testString).to.equal('It works!');
        })
        .catch(error => expect(error).to.be.a('error'));
    });
  });

  describe('#getEnumTypes(["TestEnum"])', () => {
    const call = testQL.getEnumTypes(['TestEnum']);
    it('should return a Promise', () => {
      expect(call).to.be.a('promise');
    });

    it('should pass an Object cotains GraphQL enum type for "TestEnum" in promise', () => {
      return call
        .then(response => {
          expect(response).to.be.a('object');
          expect(response.data).to.have.property('TestEnum');
          expect(response.data.TextEnum).to.have.all.keys('description', 'kind', 'enumValues');
        })
        .catch(error => {
          expect(error).to.be.a('error');
        });
    });

    it('should get enum from cache', () => {
      return testQL.getEnumTypes(['TestEnum'])
        .then(response => {
          expect(response).to.be.a('object');
          expect(response.data).to.have.property('TestEnum');
          expect(response.data.TextEnum).to.have.all.keys('description', 'kind', 'enumValues');
        })
        .catch(error => {
          expect(error).to.be.a('error');
        });
    });
  });

  describe('Customized headers', () => {
    it('should add customized headers to request', () => {
      return testQL.query({
          operationName: 'Query',
          query: `
        query Query {
          headerCheck
        }`,
        })
        .then(({
          data
        }) => {
          expect(data.headerCheck).to.be.true;
        });
    });
  });

  let requestIntercepted = false;
  let responseIntercepted = false;
  let removeInterceptors;

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
        },
      });
      it('should return a function', () => {
        expect(removeInterceptors).to.be.a('function');
      });
    });

    describe('#interceptors', () => {
      it('should intercept fetch calls', () => {
        const call = testQL.query(testQueryParams);

        return call.then(() => {
          expect(requestIntercepted).to.be.true;
          expect(responseIntercepted).to.be.true;
        });
      });
    });

    describe('#removeInterceptors', () => {
      it('should remove the added interceptors', () => {
        removeInterceptors();

        expect(testQL.interceptors.length).to.equal(1);
      });
    });

    describe('#clearInterceptors', () => {
      it('should remove the added interceptors', () => {
        testQL.clearInterceptors();

        expect(testQL.interceptors.length).to.equal(0);
      });
    });
  });

  describe('OmitEmptyVariables', () => {
    describe('global setting in init pramaters', () => {
      const omitQLTest = new FetchQL({
        url: testUrl,
        omitEmptyVariables: true,
        interceptors: [{
          request(url, config) {
            const variables = JSON.parse(JSON.parse(config.body).variables);
            expect(variables).to.have.property('ignore');
            expect(variables.ignore.emptyString).to.be.undefined;
            expect(variables.ignore.nullProp).to.be.undefined;
            expect(variables).to.have.property('keepProp');
            return [url, config];
          },
        }, ],
      });
      it('should remove null or empty string in variables of query struct', (done) => {
        omitQLTest.query({
            operationName: 'Query',
            query: testQuery,
            variables: {
              keepProp: 'keep',
              ignore: {
                emptyString: '',
                nullProp: null,
              },
            },
          })
          .then(() => {
            done();
          })
          .catch((errors) => {
            done(errors);
          });
      });
    });
    describe('options of query({opts})', () => {
      const omitQLTest = new FetchQL({
        url: testUrl,
        interceptors: [{
          request(url, config) {
            const variables = JSON.parse(JSON.parse(config.body).variables);
            expect(variables).to.have.property('ignore');
            expect(variables.ignore.emptyString).to.be.undefined;
            expect(variables.ignore.nullProp).to.be.undefined;
            expect(variables).to.have.property('keepProp');
            return [url, config];
          },
        }, ],
      });
      it('should remove null or empty string in variables of query struct', (done) => {
        omitQLTest.query({
            operationName: 'Query',
            query: testQuery,
            variables: {
              keepProp: 'keep',
              ignore: {
                emptyString: '',
                nullProp: null,
              },
            },
            opts: {
              omitEmptyVariables: true,
            },
          })
          .then(() => {
            done();
          })
          .catch((errors) => {
            done(errors);
          });
      });
    });
  });

  describe('Callbacks', () => {
    describe('#onStart()', () => {
      it('should call onStart when new request queue created', () => {
        expect(startTrack).to.be.true;
      });
      it('should have a paramemter of the request queue\'s length', () => {
        expect(queueLength).to.be.a('number');
      });
    });
    describe('#onEnd()', () => {
      it('should call onEnd when all reqests finished', () => {
        expect(endTrack).to.be.true;
      });
      it('should have a paramemter of the request queue\'s length', () => {
        expect(queueLength).to.be.a('number');
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
