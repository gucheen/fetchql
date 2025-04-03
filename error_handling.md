# Error Handling in FetchQL

FetchQL provides various ways to handle errors that may occur during GraphQL operations. This guide will cover how to catch and process GraphQL errors, network errors, and how to use the error information returned by the library.

## Types of Errors

When using FetchQL, you may encounter two main types of errors:

1. GraphQL Errors: These are errors returned by the GraphQL server in the response.
2. Network Errors: These occur when there's a problem with the network request itself.

## Handling GraphQL Errors

GraphQL errors are returned in the `errors` array of the response object. These errors are typically related to the query execution on the server side.

### Example of handling GraphQL errors:

```javascript
const fetchQL = new FetchQL({ url: 'https://api.example.com/graphql' });

fetchQL.query({
  operationName: 'GetUser',
  query: `
    query GetUser($id: ID!) {
      user(id: $id) {
        name
        email
      }
    }
  `,
  variables: { id: '123' }
})
.then(({ data, errors }) => {
  if (errors) {
    console.error('GraphQL Errors:', errors);
    // Handle GraphQL errors
  } else {
    // Process the data
    console.log('User data:', data.user);
  }
})
.catch(error => {
  console.error('Network Error:', error);
  // Handle network errors
});
```

In this example, GraphQL errors are checked in the `then` block by examining the `errors` property of the response.

## Handling Network Errors

Network errors are caught in the `catch` block of the Promise chain. These can occur due to various reasons such as network connectivity issues, CORS problems, or server unavailability.

### Example of handling network errors:

```javascript
fetchQL.query({
  operationName: 'GetPosts',
  query: `
    query GetPosts {
      posts {
        id
        title
      }
    }
  `
})
.then(({ data, errors }) => {
  // Process successful response
})
.catch(error => {
  console.error('Network Error:', error);
  // Handle network error (e.g., show error message to user)
});
```

## Using FetchQL's Error Information

FetchQL provides detailed error information in case of request failures. When a request fails due to a network error, FetchQL returns a custom error object with the following structure:

```javascript
{
  errors: [{
    message: res.statusText,
    stack: res,
  }]
}
```

You can access this information in the `catch` block:

```javascript
fetchQL.query({
  // ... query options
})
.catch(error => {
  if (error.errors && error.errors.length > 0) {
    console.error('Error message:', error.errors[0].message);
    console.error('Error details:', error.errors[0].stack);
  }
});
```

## Handling Empty or Null Data

FetchQL also handles cases where the data returned is empty or null. In such cases, it will reject the promise:

```javascript
fetchQL.query({
  // ... query options
})
.then(({ data, errors }) => {
  // This block will only be executed if data is not null and not empty
})
.catch(errors => {
  if (errors) {
    console.error('Query returned null or empty data:', errors);
  }
});
```

## Using Interceptors for Error Handling

FetchQL allows you to add interceptors that can be used for global error handling. This is particularly useful for handling common error scenarios across multiple queries.

```javascript
const errorInterceptor = {
  response: function (response) {
    if (response.errors) {
      // Log errors or perform any global error handling
      console.error('GraphQL Errors:', response.errors);
    }
    return response;
  },
  responseError: function (error) {
    // Handle network errors
    console.error('Network Error:', error);
    return Promise.reject(error);
  }
};

fetchQL.addInterceptors(errorInterceptor);
```

By implementing these error handling strategies, you can ensure that your application gracefully handles both GraphQL and network errors when using FetchQL.