/**
 * pick - Creates an object composed of the picked object properties:
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to pick
 * @returns {object} - returns the new object
 */
export const pick = (obj, ...fields) => {
  const result = {};
  const keys = Object.keys(obj);
  fields.forEach( field => {
    if (keys.includes(field)) {
      result[field] = obj[field];
    }
  });
  return result;
};
