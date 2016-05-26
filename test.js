/**
 * Created by gucheng on 5/18/16.
 */
var expect = require('chai').expect;
var fetch = require('node-fetch');
var FetchQL = require('./index');

const testQuery = `
  query Query {
    user(username: "BlinkTunnel") {
      name
      id
    }
  }
`;

const testUrl = 'http://127.0.0.1:3000/another';
const testQueryParams = {
  operationName: 'Query',
  query: testQuery,
  variables: {}
};

var testQL = new FetchQL({
  url: testUrl
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
    
    it('should pass an object of response data in promise', () => {  
      return call
        .then(response => expect(response).to.be.a('object'))
        .catch(error => expect(error).to.be.a('object'))
    });
  });
  
  describe('#getEnumTypes(["UserType"])', () => {
    let call = testQL.getEnumTypes(['UserType']);
    it('should return a Promise', () => {
      expect(call).to.be.a('promise');
    });
    
    it('should pass an Object cotains GraphQL enum type for "UserType" in promise', () => {
      return call
        .then(response => {
          expect(response).to.be.a('object');
          expect(response).to.have.property('UserType');
          expect(response.UserType).to.have.all.keys('name', 'kinde', 'enumValues');
        })
        .catch(error => {
          expect(error).to.be.a('object');
        })
    })
  });

  const newUrl = 'http://127.0.0.1:3000/graphql';
  describe(`#setUrl("${newUrl}")`, () => {
    it(`should set url to "${newUrl}"`, () => {
      testQL.setUrl(newUrl);
      expect(testQL.getUrl()).to.equal(newUrl);
    });
  });
});
