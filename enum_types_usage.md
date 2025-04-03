# Using getEnumTypes in FetchQL

This guide explains how to use the `getEnumTypes` method in FetchQL, including its purpose, how to call it, and how to work with the returned enum type information.

## Purpose

The `getEnumTypes` method allows you to retrieve information about enum types from your GraphQL server. This is particularly useful when you need to dynamically populate UI elements (such as dropdowns) with enum values, or when you need to validate input against a set of allowed enum values.

## How to Call getEnumTypes

To use the `getEnumTypes` method, you first need to create a FetchQL instance:

```javascript
import FetchQL from 'fetchql';

const fetchQL = new FetchQL({
  url: 'https://your-graphql-server.com/graphql'
});
```

Then, you can call the `getEnumTypes` method with an array of enum type names:

```javascript
fetchQL.getEnumTypes(['EnumType1', 'EnumType2'])
  .then(({ data, errors }) => {
    if (errors) {
      console.error('Errors:', errors);
    } else {
      console.log('Enum types:', data);
    }
  })
  .catch(error => {
    console.error('Error fetching enum types:', error);
  });
```

## Working with Returned Enum Type Information

The `getEnumTypes` method returns a Promise that resolves to an object containing the requested enum type information. Here's an example of what the returned data might look like:

```javascript
{
  EnumType1: {
    name: 'EnumType1',
    kind: 'ENUM',
    description: 'Description of EnumType1',
    enumValues: [
      {
        name: 'VALUE1',
        description: 'Description of VALUE1'
      },
      {
        name: 'VALUE2',
        description: 'Description of VALUE2'
      }
    ]
  },
  EnumType2: {
    // ... similar structure for EnumType2
  }
}
```

You can use this information in various ways:

1. Populating UI elements:

```javascript
function populateDropdown(enumType) {
  const dropdown = document.getElementById('myDropdown');
  enumType.enumValues.forEach(value => {
    const option = document.createElement('option');
    option.value = value.name;
    option.textContent = value.description || value.name;
    dropdown.appendChild(option);
  });
}

fetchQL.getEnumTypes(['MyEnumType'])
  .then(({ data }) => {
    populateDropdown(data.MyEnumType);
  });
```

2. Validating input:

```javascript
function validateEnumInput(input, enumType) {
  const validValues = enumType.enumValues.map(v => v.name);
  return validValues.includes(input);
}

fetchQL.getEnumTypes(['MyEnumType'])
  .then(({ data }) => {
    const isValid = validateEnumInput('SOME_VALUE', data.MyEnumType);
    console.log('Input is valid:', isValid);
  });
```

## Caching

The `getEnumTypes` method includes built-in caching. After the first query for a specific enum type, subsequent requests for the same enum type will be served from the cache, improving performance and reducing unnecessary network requests.

## Error Handling

When using `getEnumTypes`, it's important to handle potential errors:

```javascript
fetchQL.getEnumTypes(['NonExistentEnum'])
  .then(({ data, errors }) => {
    if (errors) {
      console.error('GraphQL errors:', errors);
    } else if (!data) {
      console.error('No data returned');
    } else {
      console.log('Enum types:', data);
    }
  })
  .catch(error => {
    console.error('Network or other error:', error);
  });
```

By properly handling errors, you can ensure your application gracefully manages situations where enum types might not be available or when network issues occur.

## Conclusion

The `getEnumTypes` method in FetchQL provides a convenient way to retrieve and work with enum type information from your GraphQL server. By leveraging this feature, you can create more dynamic and type-safe applications that adapt to changes in your GraphQL schema.