// const pickQuery = <T extends Record<string, unknown>, k extends keyof T>(obj: T, keys: k[]): Partial<T> => {
//     const finalObj: Partial<T> = {};

//     for (const key of keys) {
//         if (obj && Object.hasOwnProperty.call(obj, key)) {
//             finalObj[key] = obj[key]
//         }
//     }

//     return finalObj;
// }

// export default pickQuery;

const pickQuery = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Partial<T> => {
  const finalObj: Partial<T> = {};
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== "") {
      finalObj[key] = obj[key];
    }
  }
  return finalObj;
};

export default pickQuery;