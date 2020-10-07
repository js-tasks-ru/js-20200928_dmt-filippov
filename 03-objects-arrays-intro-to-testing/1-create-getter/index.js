/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const pathArr = path.split('.');

  // тесты проходит, но мне кажется не лучший способ
  return function (obj) {
    let result = obj;
    for (const pathstr of pathArr) {
      if(Object.keys(result).includes(pathstr)) {
        result = result[pathstr];
      } else {
        result = undefined;
        break;
      }
    }
    return result;
  }
}
