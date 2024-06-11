/*
 * @Author: diaochan
 * @Date: 2024-06-09 21:19:51
 * @LastEditors: rueen
 * @LastEditTime: 2024-06-10 20:54:07
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

// 定义递归函数，检查元素是否是具有类名'item'的元素或其子元素
export const isItemOrChild = (element, className) => {
  return element.classList.contains(className) || (element.parentElement && isItemOrChild(element.parentElement, className));
}

export default {
  debounce,
  isItemOrChild
}