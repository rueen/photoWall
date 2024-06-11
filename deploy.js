/*
 * @Author: diaochan
 * @Date: 2024-06-11 09:12:30
 * @LastEditors: rueen
 * @LastEditTime: 2024-06-11 10:18:42
 * @Description: 
 */
import ghpages from 'gh-pages';

ghpages.publish('dist', {
  repo: 'https://github.com/rueen/photoWall.git',
  // src: '/photoWall/dist',
  nojekyll: true
}, function(err) {});