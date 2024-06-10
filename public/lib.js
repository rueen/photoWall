/*
 * @Author: diaochan
 * @Date: 2024-06-09 21:19:51
 * @LastEditors: diaochan
 * @LastEditTime: 2024-06-09 21:21:47
 * @Description: 
 */
export const debounce = (func, wait) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

export default {
  debounce
}