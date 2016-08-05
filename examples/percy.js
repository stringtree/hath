module.exports = function(s) {
  if (s.length > 6) throw new Error('buffer overrun!');
  return 'hello ' + s;
};