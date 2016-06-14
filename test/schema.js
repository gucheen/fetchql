const typeDefinitions = `
enum TestEnum {
  ALPHA
  BETA
}
type Query {
  testString: String
}
schema {
  query: Query
}`;

export default [typeDefinitions];