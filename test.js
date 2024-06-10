/*
 * @Author: diaochan
 * @Date: 2024-06-07 21:18:42
 * @LastEditors: diaochan
 * @LastEditTime: 2024-06-08 10:31:13
 * @Description: 
 */
// 创建一个canvas元素并设置其样式
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = 0;
canvas.style.left = 0;
canvas.style.zIndex = -1; // 确保canvas在其他内容下方
document.body.appendChild(canvas);
 
const ctx = canvas.getContext('2d');
const width = window.innerWidth;
const height = window.innerHeight;
const particles = [];
 
canvas.width = width;
canvas.height = height;
 
// 创建一个表示粒子的类
class Particle {
  constructor() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.size = 50;
    this.speedX = (Math.random() - 0.5) * 2;
    this.speedY = (Math.random() - 0.5) * 2;
    this.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
  }
 
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
 
    if (this.x > width || this.x < 0) {
      this.speedX *= -1;
    }
    if (this.y > height || this.y < 0) {
      this.speedY *= -1;
    }
  }
 
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}
 
// 创建一定数量的粒子
for (let i = 0; i < 100; i++) {
  particles.push(new Particle());
}
 
// 动画循环
function animate() {
  ctx.clearRect(0, 0, width, height);
 
  particles.forEach((particle) => {
    // particle.update();
    particle.draw();
  });
 
  requestAnimationFrame(animate);
}
 
animate(); // 开始动画循环