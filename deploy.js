/*
 * @Author: diaochan
 * @Date: 2024-06-11 09:12:30
 * @LastEditors: rueen
 * @LastEditTime: 2024-06-11 16:52:46
 * @Description: 
 */
import ghpages from 'gh-pages';

ghpages.publish('dist', {
  repo: 'https://github.com/rueen/photoWall.git',
  nojekyll: true,
  message: 'Updates1'
}, function(err) {});