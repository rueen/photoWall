// 接收来自主线程的消息

this.onmessage = function(e) {
  const {position, screenWidth, screenHeight, existedPosition, positionSize, size} = e.data;
  
  // 计算不重叠的位置
  // 1. 如果有指定位置，优先使用指定位置
  // 2. 否则在屏幕上随机生成位置，并确保不与现有元素重叠
  
  // 是否是重新入队的元素
  const isRequeued = position.requeued === true;
  
  // 如果指定了 x 或 y，优先使用
  let randomX = position.x != null ? position.x : Math.floor(Math.random() * (screenWidth - size));
  let randomY = position.y != null ? position.y : Math.floor(Math.random() * (screenHeight - size));
  
  // 每次尝试搜索时，使用更分散的起始位置
  if (position.x == null && existedPosition.length > 0) {
    // 将屏幕分成网格，尝试找到人少的区域
    const gridSize = Math.max(positionSize * 2, 100);
    const gridCols = Math.floor(screenWidth / gridSize);
    const gridRows = Math.floor(screenHeight / gridSize);
    
    // 计算每个网格区域中的元素数量
    const grid = Array(gridRows).fill().map(() => Array(gridCols).fill(0));
    
    existedPosition.forEach(pos => {
      const col = Math.floor(pos.x / gridSize);
      const row = Math.floor(pos.y / gridSize);
      if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
        grid[row][col]++;
      }
    });
    
    // 找到元素最少的区域
    let minCount = Infinity;
    let bestRow = 0;
    let bestCol = 0;
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        if (grid[row][col] < minCount) {
          minCount = grid[row][col];
          bestRow = row;
          bestCol = col;
        }
      }
    }
    
    // 如果是重新入队的元素，尝试找一个与原来位置差异较大的区域
    if (isRequeued) {
      // 使用屏幕的其他区域
      bestCol = Math.floor(Math.random() * gridCols);
      bestRow = Math.floor(Math.random() * gridRows);
    }
    
    // 在网格区域内随机选择位置
    randomX = bestCol * gridSize + Math.floor(Math.random() * (gridSize - size));
    randomY = bestRow * gridSize + Math.floor(Math.random() * (gridSize - size));
  }
  
  // 检查是否与现有元素重叠
  let existed = existedPosition.filter(item => {
    return Math.abs(item.x - randomX) < positionSize && Math.abs(item.y - randomY) < positionSize;
  });
  
  // 最多尝试找不重叠的位置
  let attempts = 0;
  const maxAttempts = isRequeued ? 20 : 15; // 为重新入队的元素增加尝试次数
  
  while (existed.length > 0 && attempts < maxAttempts) {
    // 随机生成新位置
    randomX = Math.floor(Math.random() * (screenWidth - size));
    randomY = Math.floor(Math.random() * (screenHeight - size));
    
    // 如果是重新入队的元素，考虑使用更极端的位置
    if (isRequeued && attempts > 10) {
      // 尝试使用边缘位置
      randomX = Math.random() > 0.5 ? size : screenWidth - size * 2;
      randomY = Math.random() > 0.5 ? size : screenHeight - size * 2;
    }
    
    // 越到后面，距离要求越宽松
    const adjustedPositionSize = positionSize * (1 - attempts / maxAttempts * 0.6);
    
    existed = existedPosition.filter(p => {
      return Math.abs(p.x - randomX) < adjustedPositionSize && Math.abs(p.y - randomY) < adjustedPositionSize;
    });
    
    attempts++;
  }
  
  // 如果指定了位置，最终还是使用指定位置
  const x = position.x != null ? position.x : randomX;
  const y = position.y != null ? position.y : randomY;
  
  this.postMessage({
    x, y
  });
};