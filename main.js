/*
 * @Author: diaochan
 * @Date: 2024-06-07 21:18:42
 * @LastEditors: rueen
 * @LastEditTime: 2024-12-05 17:44:05
 * @Description: 
 */
import { debounce, isItemOrChild } from './public/lib';
import { get } from './public/request';

// const existedPosition = []; // 已存在的坐标
let DATA = [];
let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;
let itemSize = parseInt(Math.min(screenWidth, screenHeight)/ 8); // 粒子尺寸 px
const positionSize = itemSize; // 坐标距离 避免重叠
const baseSpeed = 100; // 速度 px/s
const delay = 2500; // ms
let pendingList = []; // 等待的列表
let createItemTimer = null;
let modalVisible = false; // 是否打开弹窗
let duration= Math.ceil(screenWidth / baseSpeed) * 1000;
let isPause = false; // 页面是否已暂停
// 调整布局
const resize = () => {
  screenWidth = window.innerWidth;
  screenHeight = window.innerHeight;
  itemSize = parseInt(Math.min(screenWidth, screenHeight)/ 8); // 粒子尺寸 px
  duration= Math.ceil(screenWidth / baseSpeed) * 1000;
  document.documentElement.style.fontSize = `${parseInt(screenWidth/100)}px`;
}

// 获取元素尺寸
const getItemSize = (item) => {
  let size = itemSize;
  if((item.roleType - 0) === 2){
    size = itemSize * 0.6
  } else if((item.roleType - 0) === 3){
    size = itemSize * 0.8
  }
  return size;
}

// 获取所有已存在元素坐标
const getExistedPosition = () => {
  const allItemElm = document.querySelectorAll('.item');
  let arr = [];

  allItemElm.forEach(item => {
    const rect = item.getBoundingClientRect();
    arr.push({
      x: rect.x,
      y: rect.y
    })
  })
  return arr;
}

// 获取随机坐标
const getRandomPosition = (position = {}, item) => {
  let x;
  let y;
  let israndom = (position.x == null && position.y == null);
  let i = 0;
  let size = getItemSize(item);
  const fun = () => {
    let randomX = Math.floor(Math.random() * (screenWidth - size));
    if(position.x != null){
      randomX = position.x;
    }
    let randomY = Math.floor(Math.random() * (screenHeight - size));
    if(position.y != null){
      randomY = Math.floor(Math.random() * (screenHeight - size));
    }
    const existedPosition = getExistedPosition();
    const existed = existedPosition.filter(item => {
      return Math.abs(item.x - randomX) < positionSize && Math.abs(item.y - randomY) < positionSize;
    });
    // console.log(existed, randomX, randomY, existedPosition)
    if(existed.length > 0 && i < 5){
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
    x,
    y,
    israndom,
    duration: duration + Math.random()*10000
  };
}

// 获取圆心
const getItemCenter = (id) => {
  const itemElem = document.getElementById(`item_${id}`);
  const rect = itemElem.getBoundingClientRect();
  const x = parseInt(rect.left + rect.width/2);
  const y = parseInt(rect.top + rect.width/2);
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
  var elms = document.querySelectorAll('.blur.activeItem');
  elms.forEach(function(elm) {
    elm.classList.remove('blur');
  });
  var bgElms = document.querySelectorAll('.bgItem');
  bgElms.forEach(function(elm) {
    if(!elm.classList.contains('blur')){
      elm.classList.add('blur');
    }
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
      const target = event.target;
      if(target.classList.contains('close') || !!target.closest('.close')){
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
  pause();
  relatedIds.forEach(id => {
    const elm = document.getElementById(`item_${id}`);
    // 如果元素不在画布内 立即创建
    if(!elm){
      createItem(id);
      _delay += 100;
    } else {
      const rect = elm.getBoundingClientRect();
      // 如果元素即将移出屏幕(已移出元素直径的1/4) 重新创建
      if(screenWidth - rect.right < itemSize/4){
        const _item = DATA.find(i => i.id === id);
        requeue(_item);
        createItem(id);
        _delay += 100;
      }
      elm.classList.remove('blur');
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
  createBgItem(item)
}

const createBgItem = (item) => {
  const elm = document.getElementById(item.id);
  if(elm){
    return;
  }
  const position = getRandomPosition({}, item);
  const listElm = document.getElementById('list');
  const itemElm = document.createElement('div');
  itemElm.id = `item_${item.id}`;
  itemElm.idKey = item.id;
  let size = getItemSize(item);
  itemElm.style.width = `${size}px`;
  itemElm.style.height = `${size}px`;
  // let animation = `fadeIn .1s linear forwards`;
  itemElm.style.left = `${position.x}px`;
  itemElm.style.top = `${position.y}px`;
  itemElm.classList.add('item');
  itemElm.classList.add('bgItem');
  itemElm.classList.add('blur');
  // itemElm.style.animation = animation; // 触发动画
  itemElm.innerHTML = `
    <div class="avatar" style="background-image: url(${item.avatar})"></div>
      <div class="mask mask_${item.roleType}"></div>
    <div class="name" style="font-size:${size/8}px">${item.name}</div>`;
  listElm.appendChild(itemElm);
}

const removeBgItem = (item) => {
  const currentItemElm = document.getElementById(`item_${item.id}`);
  const parentNode = currentItemElm.parentNode;
  parentNode.removeChild(currentItemElm);
}

const createItem = (id = null, p = {}) => {
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
  removeBgItem(firstInLine);
  if(id == null){
    p = { x: 0 };
  }
  const position = getRandomPosition(p, firstInLine);
  // existedPosition.push({
  //   id: firstInLine.id,
  //   ...position
  // })
  let animation = `scaleUp .3s linear forwards, scrollRight ${position.duration / 1000}s linear .3s forwards`;
  // console.log(position)
  
  const listElm = document.getElementById('list');
  const itemElm = document.createElement('div');
  itemElm.id = `item_${firstInLine.id}`;
  itemElm.idKey = firstInLine.id;
  let size = getItemSize(firstInLine);
  itemElm.style.width = `${size}px`;
  itemElm.style.height = `${size}px`;
  if(position.israndom){
    animation = `fadeIn .1s linear forwards, scrollRight ${position.duration / 1000}s linear .3s forwards`;
    itemElm.style.left = `${position.x}px`;
  }
  itemElm.style.top = `${position.y}px`;
  itemElm.classList.add('item');
  itemElm.classList.add('activeItem');
  itemElm.style.animation = animation; // 触发动画
  itemElm.innerHTML = `
    <div class="avatar" style="background-image: url(${firstInLine.avatar})"></div>
      <div class="mask mask_${firstInLine.roleType}"></div>
    <div class="name" style="font-size:${size/8}px">${firstInLine.name}</div>`;
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
    url: '/site/api/hallList',
  });
  DATA = [...res.Data];
  pendingList = [...res.Data];
  pendingList.forEach(item => {
    createBgItem(item)
  })
  createItem();
}

const addStyle = () => {
  const style = document.createElement('style');
  style.textContent = `
    :root {
      --blur: ${itemSize/8}px; /* 这里定义了模糊效果的强度 */
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
document.documentElement.style.fontSize = `${parseInt(screenWidth/100)}px`;
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
    if(!modalVisible && isPause){
      play();
    }
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
document.body.addEventListener('mousemove', function(event) {
  const target = event.target;
  if (!isItemOrChild(target, 'item')) {
    if(!modalVisible && isPause){
      play();
      clearSVG();
    }
  }
});
