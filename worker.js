// 接收来自主线程的消息

let i = 0;
this.onmessage = function(e) {
  const {position, screenWidth, screenHeight, existedPosition, positionSize, size} = e.data;
  let randomX = Math.floor(Math.random() * (screenWidth - size));
  if(position.x != null){
    randomX = position.x;
  }
  let randomY = Math.floor(Math.random() * (screenHeight - size));
  if(position.y != null){
    randomY = Math.floor(Math.random() * (screenHeight - size));
  }
  let existed = existedPosition.filter(item => {
    return Math.abs(item.x - randomX) < positionSize && Math.abs(item.y - randomY) < positionSize;
  });
  while (existed.length > 0 && i < 5) {
    console.log('坐标重合', existed, randomX, randomY);
    randomX = Math.floor(Math.random() * (screenWidth - size));
    randomY = Math.floor(Math.random() * (screenHeight - size));
    existed = existedPosition.filter(p => {
      return Math.abs(p.x - randomX) < positionSize && Math.abs(p.y - randomY) < positionSize;
    });
    i += 1;
  }
  
  x = position.x != null ? position.x : randomX;
  y = position.y != null ? position.y : randomY;
  this.postMessage({
    x,y
  })
};