# CHANGELOG

## 2.0.1

  - fix: omitEmptyVariables haven’t remove properties correctly.
  - update: now reject errors will have a default error message, if server-side doesn’t throw any errors.

## 2.0.0

  - breaking changes: Source code has been moved into `./src` and distributed file goes to `./lib`;
  - breaking changes: Distributed file(`./lib/fetchql.js`) is unminified now. 
  - feature: remove empty string(`''`) or `null` values in query variables. 

## 1.6.2

  - fix: spelling of property name in typescript declaration file.
  - add: code coverage reports

## 1.6.1

  - fix: missing update of production file

## 1.6.0

  - breaking change: replace Set with Array in the implement of interceptors

## 1.5.1

  - update: add polyfills of Array.from and Object.assign for improving compatibility

## 1.5.0

  - feature: callbacks of request queue changed