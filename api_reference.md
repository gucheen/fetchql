# FetchQL API Reference

FetchQL is a GraphQL client built on top of the Fetch API. It provides an easy-to-use interface for making GraphQL queries and managing request interceptors.

## Table of Contents

1. [Constructor](#constructor)
2. [Methods](#methods)
   - [query](#query)
   - [getEnumTypes](#getenumtypes)
   - [getUrl](#geturl)
   - [setUrl](#seturl)
   - [addInterceptors](#addinterceptors)
   - [removeInterceptors](#removeinterceptors)
   - [clearInterceptors](#clearinterceptors)

## Constructor

### `new FetchQL(options)`

Creates a new FetchQL instance.

#### Parameters

- `options` (Object):
  - `url` (String): The server address of GraphQL.
  - `interceptors` (Object | Object[]): Optional. Request interceptors.
  - `headers` (Object): Optional. Request headers.
  - `onStart` (Function): Optional. Callback function when a new request queue starts.
  - `onEnd` (Function): Optional. Callback function when a request queue finishes.
  - `omitEmptyVariables` (Boolean): Optional. Remove null props (null or '') from the variables. Default is `false`.
  - `requestOptions` (Object): Optional. Additional options for fetch requests.

#### Example

```javascript
const client = new FetchQL({
  url: 'https://api.example.com/graphql',
  headers: {
    'Authorization': 'Bearer token123'
  },
  omitEmptyVariables: true
});
```

## Methods

### query

`query(options): Promise<FetchQLQueryResult>`

Executes a GraphQL query.

#### Parameters

- `options` (Object):
  - `operationName` (String): Name of the GraphQL operation.
  - `query` (String): GraphQL query string.
  - `variables` (Object): Optional. Variables for the query.
  - `opts` (Object): Optional. Additional options.
    - `omitEmptyVariables` (Boolean): Remove null props from variables.
  - `requestOptions` (Object): Optional. Additional options for fetch request.

#### Returns

A Promise that resolves to a `FetchQLQueryResult` object containing `data` and optional `errors`.

#### Example

```javascript
client.query({
  operationName: 'GetUser',
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        name
        email
      }
    }
  `,
  variables: { id: '123' }
}).then(result => {
  console.log(result.data);
}).catch(error => {
  console.error(error);
});
```

### getEnumTypes

`getEnumTypes(EnumNameList): Promise<FetchQLEnumResult>`

Retrieves information about enum types.

#### Parameters

- `EnumNameList` (String[]): Array of enum names to fetch.

#### Returns

A Promise that resolves to a `FetchQLEnumResult` object containing enum information.

#### Example

```javascript
client.getEnumTypes(['UserRole', 'OrderStatus']).then(result => {
  console.log(result.data);
}).catch(error => {
  console.error(error);
});
```

### getUrl

`getUrl(): string`

Gets the current server address.

#### Returns

The current GraphQL server URL.

#### Example

```javascript
const currentUrl = client.getUrl();
console.log(currentUrl);
```

### setUrl

`setUrl(url: string): void`

Sets a new server address.

#### Parameters

- `url` (String): The new GraphQL server URL.

#### Example

```javascript
client.setUrl('https://new-api.example.com/graphql');
```

### addInterceptors

`addInterceptors(interceptors: FetchQLInterceptor | FetchQLInterceptor[]): () => void`

Adds new interceptors to the FetchQL instance.

#### Parameters

- `interceptors` (Object | Object[]): Interceptor object(s) with optional methods:
  - `request`: Function called before a request is sent.
  - `requestError`: Function called when a request encounters an error.
  - `response`: Function called after a response is received.
  - `responseError`: Function called when a response encounters an error.

#### Returns

A function that, when called, removes the added interceptors.

#### Example

```javascript
const removeInterceptors = client.addInterceptors({
  request: (url, config) => {
    console.log('Request intercepted:', url);
    return [url, config];
  },
  response: (response) => {
    console.log('Response intercepted:', response);
    return response;
  }
});

// Later, to remove the interceptors:
removeInterceptors();
```

### removeInterceptors

`removeInterceptors(indexes: number[]): void`

Removes interceptors by their indexes.

#### Parameters

- `indexes` (number[]): Array of interceptor indexes to remove.

#### Example

```javascript
client.removeInterceptors([0, 2]); // Removes the first and third interceptors
```

### clearInterceptors

`clearInterceptors(): void`

Removes all interceptors.

#### Example

```javascript
client.clearInterceptors();
```