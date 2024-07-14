/*
 * @Author: diaochan
 * @Date: 2024-06-11 10:18:46
 * @LastEditors: rueen
 * @LastEditTime: 2024-07-14 14:46:55
 * @Description: 
 */
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/photoWall/',
  server: {
    proxy: {
      '/site': {
        target: 'https://unidt.ontheway168.cn', // 目标服务器地址
        changeOrigin: true, // 是否改变源地址
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径
      },
    }
  },
});