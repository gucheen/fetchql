const mocks = (bool) => ({
  String: () => 'It works!',
  Boolean: () => bool
});

export default mocks;