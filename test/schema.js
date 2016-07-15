const typeDefinitions = `
enum TestEnum {
  ALPHA
  BETA
}
type Query {
  testString: String
  headerCheck: Boolean
}
schema {
  query: Query
}`;

export default [typeDefinitions];