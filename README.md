# FetchQL

[![npm](https://img.shields.io/npm/v/fetchql.svg?maxAge=2592000)](https://www.npmjs.com/package/fetchql)
[![Build Status](https://travis-ci.org/gucheen/FetchQL.svg?branch=master)](https://travis-ci.org/gucheen/FetchQL)
[![Coverage Status](https://coveralls.io/repos/github/gucheen/FetchQL/badge.svg?branch=master)](https://coveralls.io/github/gucheen/FetchQL?branch=master)

GraphQL query client with Fetch

FetchQL is a query client for GraphQL server works on both browser and Node(need fetch support, eg. node-fetch)

## Breaking Changes(since v2.0.0)

  - Source code has been moved into `./src` and distributed file goes to `./lib`;
  - Distributed file(`./lib/fetchql.js`) is unminified now. 

## Pros:
  * lightweight
  * wrap query methods
  * easily set server-side
  * get enum types by names (with cache)
  * built-in interceptors
  * request state callbacks
  * written in ES2015 and modules

## Usage

  - `FetchQL` will export as ES5(CMD module) by default.
  - If you want to use the ES2015, import or require `fetchql/src/index.js` instead.
  
## Documentation
  * **Class FetchQL**
  
    `var Query = new FetchQL({ url, interceptors, headers, onStart, onEnd, omitEmptyVariables })`
    
      ```javascript
      {
        url: '', // GraphQL server address
        interceptors: [],
        headers: {}, // customized headers of all requests,
        onStart: function (requestQueueLength) {}, // callback of a new request queue
        onEnd: function (requestQueueLength) {} // callback of a request queue finished
        omitEmptyVariables: false, // remove null props(null or '') from the variables
      }
      ```

  * **interceptor**

    `interceptors` is an optional parameter of the class. It can be an Array or an Object.

    ```javascript
    {
      url: '',
      interceptors: [interceptor]
      // or
      // interceptors: interceptor
    }

    // interceptor
    {
      request: function (url, config) {
          // Modify the url or config here
          return [url, config];
      },

      requestError: function (error) {
          // Called when an error occured during another 'request' interceptor call
          return Promise.reject(error);
      },

      response: function (response) {
          // Modify the reponse object
          return response;
      },

      responseError: function (error) {
          // Handle an fetch error
          return Promise.reject(error);
      }
    }
    ```

   - FetchQL.addInterceptors(interceptor[]|interceptor) => function
   
     Add more interceptors. Arguments are same with `interceptors` of class.
   
     It will return a function to remove **added interceptors**.
   
   - FetchQL.clearInterceptors() => void
   
     Remove all interceptors.
    
  * **FetchQL.query()**
  
    `Query.query({operationName: '', query: '', variables: {}, opts: {}})` => Promise
    
    Method for query data from the server. `operationName` **must** be provided.
    
    `query` and `variables` are followed the specification fo GraphQL.
    
    If any errors exist(from query response), will reject the promise.

    * opts - additional options(will not be passed to server)

      - opts.omitEmptyVariables - similar to omitEmptyVariables global settings, remove null props(null or '') from the variables
    
  * **FetchQL.getEnumTypes()**
  
    `Query.getEnumTypes(['array', 'of', 'enum', 'name'])` => Promise
    
    Will get enums' information from the server. Then you can get a following Object in promise:
    
    ```js
    {
      array: {
        name: '',
        kind: '',
        description: '',
        enumValues: {
          name: '',
          description: '',
        }
      },
      of: {...},
      enum: {...},
      name: {...}
    }
    ```
    
    This method currently supports caching. All enum will be cached after first querying.
    
  * **FetchQL.getUrl()**
  
    Return current server address.
    
  * **FetchQL.setUrl()**
  
    `Query.setUrl('')`
    
    Set a new server address.

  * **callback - onStart(requestQueueLength), onEnd(requestQueueLength)**
    
    When FetchQL make a new request, if it is belonged to a new queue(means there are no requests before), will call `onStart()`.

    By this you can know that now there are some network requests within FetchQL.

    When FetchQL finish a request and find that there are no requests any more, will call `onEnd()`.

    By this you can know that all requests within FetchQL have been finished.

    These two callbacks are useful when you want to watch the state of FetchQL's network requesting.
    
    For example, you may have an indicator(loading spinner, loading bar) in your web application, with this feature you can easily manage the indicator's state(display or not);

  * **omitEmptyVariables** - Boolean(default to false) remove null props(null or '') from the variables in query

    Sometimes `null` or `''` could be different meanings in backend logic.
    
    And if you just want the backend to **ignore these variables**, use this option to remove them.

    **Notice**: Only properties those in an object of 'variables', will be removed.

    ```
    { willNotRemove: '', obj: { emptyString: '', nullProp: null } } => { willNotRemove: '', obj: {} } // remove them
    ```
  
## .js or .mjs

* Use `index.js` in any ES2015 environment.
* Use `index.mjs` for Node (version >= 6.0) without babel, because Node doesn't support ES2015 modules natively.

## Develop

`npm install`

`./test/server.js` could be used as a development server.

## LICENSE

 The MIT License (MIT)

Copyright (c) 2016 Cheng Gu

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

