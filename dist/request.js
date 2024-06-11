/*
 * @Author: diaochan
 * @Date: 2024-06-11 16:28:57
 * @LastEditors: rueen
 * @LastEditTime: 2024-06-11 16:39:14
 * @Description: 
 */
import axios from 'axios';

const get = async ({
  url,
  params = {}
}) => {
  const res = await axios({
    method: 'get',
    url,
    params,
    timeout: 25000,
  });
  if(res.status !== 200){
    alert(res.message || '出错啦！')
  }
  return res.data;
}

export {get}