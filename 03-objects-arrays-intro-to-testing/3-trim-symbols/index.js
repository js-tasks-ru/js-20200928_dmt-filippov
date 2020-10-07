/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */

export function trimSymbols(string, size) {
  const stringArr = string.split('');
  let result = '';
  let tempStr = '';
  //работаетб но я еще подумаю над этим
  for (const char of stringArr) {
    if ( (tempStr[0] === char)) {
      tempStr += char;
    } else if (tempStr[0] !== char) {
      tempStr = char;
    }
    if (!(tempStr.length > size)) {
      result += char;
    }
  }
  return result;
}
