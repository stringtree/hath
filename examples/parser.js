module.exports = function parser(s) {
  if (null == s) return null; // note use of == to match both null and undefined
  s = s.trim();
  if (0 === s.length) return null;

  var first = s.charAt(0);
  switch(first) {
  case '0': case '1': case '2': case '3': case '4': case '5':
  case '6': case '7': case '8': case '9': case '-':
    return parseInt(s);
  case '"':
    if (s.endsWith('"')) return s.slice(1, -1);
    throw new Error('invalid string');
  case 't':
    return true;
  case 'f':
    return false;
  case 'n':
    return null;
  }
};