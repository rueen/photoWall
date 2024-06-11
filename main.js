/*
 * @Author: diaochan
 * @Date: 2024-06-07 21:18:42
 * @LastEditors: rueen
 * @LastEditTime: 2024-06-11 17:11:44
 * @Description: 
 */
import DATA from './data';
import { debounce, isItemOrChild } from './public/lib';
import { get } from './public/request';

const existedPosition = []; // 已存在的坐标
const positionSize = 30; // 坐标距离 避免重叠
const baseSpeed = 100; // 速度 px/s
const delay = 2500; // ms
let pendingList = []; // 等待的列表
let createItemTimer = null;
let modalVisible = false; // 是否打开弹窗
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let itemSize = parseInt(Math.min(screenWidth, screenHeight)/ 8); // 粒子尺寸 px
let duration= Math.ceil(screenWidth / baseSpeed) * 1000;
let isPause = false; // 页面是否已暂停
// 调整布局
const resize = () => {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  itemSize = parseInt(Math.min(screenWidth, screenHeight)/ 8); // 粒子尺寸 px
  duration= Math.ceil(screenWidth / baseSpeed) * 1000;
}

// 获取随机坐标
const getRandomPosition = (position = {}) => {
  let x;
  let y;
  let i = 0;
  const fun = () => {
    let randomX = Math.floor(Math.random() * (screenWidth - itemSize));
    if(position.x != null){
      randomX = position.x;
    }
    let randomY = Math.floor(Math.random() * (screenHeight - itemSize));
    if(position.y != null){
      randomY = Math.floor(Math.random() * (screenHeight - itemSize));
    }
    const existed = existedPosition.filter(item => {
      return Math.abs(item.x - randomX) < positionSize && Math.abs(item.y - randomY) < positionSize;
    });
    if(existed.length > 0 && i < 3 && (position.x != null && position.y != null)){
      // 坐标重合
      console.log('坐标重合', existed, randomX, randomY);
      i += 1;
      fun();
    } else {
      if(position.x != null){
        x = position.x;
      } else {
        x = randomX;
      }
      if(position.y != null){
        y = position.y;
      } else {
        y = randomY;
      }
    }
  }
  fun();
  return {
    x, y
  };
}

// 获取圆心
const getItemCenter = (id) => {
  const itemElem = document.getElementById(`item_${id}`);
  const rect = itemElem.getBoundingClientRect();
  const x = parseInt(rect.left + itemSize/2);
  const y = parseInt(rect.top + itemSize/2);
  return {x,y}
}

// 画线
const drawLine = ({
  x1, y1, x2, y2, id1, id2, relatedLine
}) => {
  const svg = document.getElementById('svg');
  if(!svg.getElementById(`${id1}_${id2}`)){
    const elem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    elem.setAttribute('x1', x1);
    elem.setAttribute('y1', y1);
    elem.setAttribute('x2', x2);
    elem.setAttribute('y2', y2);
    elem.setAttribute('id', `${id1}_${id2}`)
    svg.appendChild(elem);
  }
}

// 创建连接线
const createLine = (item) => {
  const itemPosition = getItemCenter(item.id);
  const relatedLine = [];
  item.relatedIds.forEach(id => {
    const elm = document.getElementById(`item_${id}`);
    if(elm){
      const relatedPosition = getItemCenter(id);
      relatedLine.push(`${item.id}_${id}`);
      drawLine({
        x1: itemPosition.x,
        y1: itemPosition.y,
        x2: relatedPosition.x,
        y2: relatedPosition.y,
        id1: item.id,
        id2: id,
        relatedLine
      });
    }
  })
  const allItemElm = document.querySelectorAll('.item');
  allItemElm.forEach(function(elm) {
    if([...item.relatedIds, item.id].indexOf(elm.idKey) < 0){
      elm.classList.add('blur');
    }
  });
}

const clearSVG = () => {
  const svg = document.getElementById('svg');
  const lines = svg.querySelectorAll('line');
  lines.forEach(function(line) {
    line.remove(); // 删除每个line元素
  });
  var elms = document.querySelectorAll('.blur');
  elms.forEach(function(elm) {
    elm.classList.remove('blur');
  });
}

// 弹窗简介
const showModal = (item) => {
  const describe = item.describe;
  if(!describe || modalVisible){
    return;
  }
  showRelation(item)
  modalVisible = true;
  const html = `
    <div class="popup">
      <div class="close" id="modalClose">
      <svg t="1718097053116" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4255" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M573.021091 512.512l330.938182 330.938182-60.346182 60.346182-330.938182-330.938182L179.525818 906.007273l-60.509091-60.532364 333.125818-333.149091L119.179636 179.362909l60.346182-60.369454 332.986182 332.986181L845.474909 118.993455l60.509091 60.532363-332.962909 332.986182z" fill="#333333" p-id="4256"></path></svg>
      </div>
      <div class="title" id="modalTitle">${describe.title}</div>
      <div class="description" id="modalDes">${describe.content}</div>
    </div>`;
  const modalElm = document.getElementById('modal');
  if(!modalElm){
    let modal = document.createElement('div');
    modal.id = 'modal';
    modal.classList.add('about');
    modal.classList.add('visible');
    modal.innerHTML = html;
    document.body.appendChild(modal);
    modal.addEventListener('click', function(event) {
      if(event.target.id === 'modalClose' || event.target.parentNode.id === 'modalClose'){
        modalVisible = false;
        modal.classList.remove('visible');
        play();
        clearSVG();
      }
    });    
  } else {
    modalElm.classList.add('visible');
    const titleElm = document.getElementById('modalTitle');
    const desElm = document.getElementById('modalDes');
    titleElm.innerHTML = `${describe.title}`;
    desElm.innerHTML = `${describe.content}`;
  }
}

// 显示关系
const showRelation = (item) => {
  let _delay = 0;
  const relatedIds = item.relatedIds;
  relatedIds.forEach(id => {
    const elm = document.getElementById(`item_${id}`);
    // 如果元素不在画布内 立即创建
    if(!elm){
      createItem(id);
      _delay += 350;
    } else {
      const rect = elm.getBoundingClientRect();
      // 如果元素即将移出屏幕(已移出元素直径的1/4) 重新创建
      if(screenWidth - rect.right < itemSize/4){
        const _item = DATA.find(i => i.id === id);
        requeue(_item);
        createItem(id);
        _delay += 350;
      }
    }
  })
  setTimeout(() => {
    pause();
    createLine(item);
  }, _delay)
}

const restartTimer = () => {
  if(createItemTimer){
    clearInterval(createItemTimer);
  }
  createItemTimer = setInterval(() => {
    if(pendingList.length){
      createItem();
    }
  }, delay);
}

// 暂停所有动画
const pause = () => {
  isPause = true;
  const items = document.querySelectorAll('.item');
  items.forEach(function(item) {
    // 检查元素是否正在播放动画
    if (getComputedStyle(item).animationName !== 'none') {
      // 如果正在播放动画，设置animation-play-state为'paused'
      item.style.animationPlayState = 'paused';
    }
  });
  if(createItemTimer){
    clearInterval(createItemTimer);
  }
}

// 启动所有动画
const play = () => {
  isPause = false;
  const items = document.querySelectorAll('.item');
  items.forEach(function(item) {
    item.style.animationPlayState = 'running';
  });
  restartTimer();
}

// 移出屏幕 重新排队
const requeue = (item) => {
  const currentItemElm = document.getElementById(`item_${item.id}`);
  const parentNode = currentItemElm.parentNode;
  parentNode.removeChild(currentItemElm);
  pendingList.push(item);
}

const createItem = (id = null) => {
  let firstInLine;
  const elm = document.getElementById(id);
  if(elm){
    return;
  }
  if(id != null && pendingList.find(item => item.id === id)){
    firstInLine = pendingList.find(item => item.id === id);
    pendingList = pendingList.filter(item => item.id != id);
  } else {
    firstInLine = pendingList.shift();
  }
  const position = getRandomPosition();
  existedPosition.push({
    id: firstInLine.id,
    ...position
  })
  const listElm = document.getElementById('list');
  const itemElm = document.createElement('div');
  itemElm.id = `item_${firstInLine.id}`;
  itemElm.idKey = firstInLine.id;
  itemElm.style.width = `${itemSize}px`;
  itemElm.style.height = `${itemSize}px`;
  itemElm.style.top = `${position.y}px`;
  itemElm.classList.add('item');
  itemElm.style.animation = `scaleUp .3s linear forwards, scrollRight ${duration / 1000}s linear .3s forwards`; // 触发动画
  itemElm.innerHTML = `
    <div class="avatar" style="background-image: url(${firstInLine.avatar})"></div>
      <div class="mask mask_${firstInLine.roleType}"></div>
    <div class="name">${firstInLine.name}</div>`;
  itemElm.addEventListener('animationend', function(e) {
    const {animationName} = e;
    if(animationName === 'scrollRight'){
      // 动画结束 移出屏幕 重新排队
      requeue(firstInLine);
    }
  });
  itemElm.addEventListener('mouseenter', function() {
    // 鼠标进入事件触发
    if(!modalVisible){
      showRelation(firstInLine)
    }
  });
  itemElm.addEventListener('mouseleave', function() {
    // 鼠标离开事件触发
    if(!modalVisible){
      play();
      clearSVG();
    }
  });
  itemElm.addEventListener('click', function() {
    // 点击元素
    showModal(firstInLine)
  });
  listElm.appendChild(itemElm);
  restartTimer();
}
const getData = async () => {
  const res = await get({
    url: '/ws/api/hallList',
  });
  pendingList = [...res];
  createItem();
}

const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --blur: ${itemSize/10}px; /* 这里定义了模糊效果的强度 */
    }
  `;
  document.head.appendChild(style);
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    // 进入全屏
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) { /* Firefox */
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) { /* IE/Edge */
      document.documentElement.msRequestFullscreen();
    }
  } else {
    // 退出全屏
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.mozCancelFullScreen) { /* Firefox */
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) { /* Chrome, Safari and Opera */
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE/Edge */
      document.msExitFullscreen();
    }
  }
}
document.addEventListener('DOMContentLoaded', () => {
  addStyle();
  getData();
});
document.addEventListener("visibilitychange", function() {
  if (document.hidden) {
    // 页面不可见时
    pause();
  } else {
    // 页面可见时
    play();
  }
});
const fullscreenBtn = document.getElementById('fullscreen');
fullscreenBtn.addEventListener('click', toggleFullScreen);
document.addEventListener('fullscreenchange', function(event) {
  resize();
});
window.addEventListener('resize', debounce(function(event) {
  resize();
}, 1000));
// document.body.addEventListener('mousemove', function(event) {
//   const target = event.target;
//   if (!isItemOrChild(target, 'item')) {
//     if(!modalVisible && isPause){
//       console.log(isPause, '---');
//       play();
//       clearSVG();
//     }
//   }
// });
