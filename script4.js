const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 500;
canvas.height = 500;

let circle = {
  x: 100,
  y: 100,
  radius: 50,
  color: 'blue',
  isDragging: false
};

let rect = {
  x: 300,
  y: 100,
  width: 100,
  height: 60,
  radius: 30,
  color: 'green',
  isDragging: false
};

// Adding roundRect method to the CanvasRenderingContext2D prototype
CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
  this.beginPath();
  this.moveTo(x + radius, y);
  this.lineTo(x + width - radius, y);
  this.quadraticCurveTo(x + width, y, x + width, y + radius);
  this.lineTo(x + width, y + height - radius);
  this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  this.lineTo(x + radius, y + height);
  this.quadraticCurveTo(x, y + height, x, y + height - radius);
  this.lineTo(x, y + radius);
  this.quadraticCurveTo(x, y, x + radius, y);
  this.closePath();
};

function drawCircle() {
  ctx.beginPath();
  ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = circle.color;
  ctx.fill();
  ctx.closePath();
}

function drawRoundRect() {
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, rect.radius);
  ctx.fillStyle = rect.color;
  ctx.fill();
}

function checkCollision() {
    // Calculate the closest point to the circle within the rectangle
    let closestX = clamp(circle.x, rect.x, rect.x + rect.width);
    let closestY = clamp(circle.y, rect.y, rect.y + rect.height);
  
    // Calculate the distance between the circle's center and this closest point
    let distanceX = circle.x - closestX;
    let distanceY = circle.y - closestY;
  
    // If the distance is less than the circle's radius, there's a collision
    let distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);
    if (distanceSquared < (circle.radius * circle.radius)) {
      circle.color = 'red';
      rect.color = 'red';
    } else {
      circle.color = 'blue';
      rect.color = 'green';
    }
  }
  
  // Helper function to clamp a value between a min and max
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCircle();
  drawRoundRect();
  checkCollision();
  requestAnimationFrame(draw);
}

function mouseDownHandler(e) {
  let rectBounds = canvas.getBoundingClientRect();
  let mouseX = e.clientX - rectBounds.left;
  let mouseY = e.clientY - rectBounds.top;

  if (Math.pow(mouseX - circle.x, 2) + Math.pow(mouseY - circle.y, 2) <= Math.pow(circle.radius, 2)) {
    circle.isDragging = true;
  }

  if (mouseX > rect.x && mouseX < rect.x + rect.width && mouseY > rect.y && mouseY < rect.y + rect.height) {
    rect.isDragging = true;
  }
}

function mouseMoveHandler(e) {
  if (circle.isDragging || rect.isDragging) {
    let rectBounds = canvas.getBoundingClientRect();
    let mouseX = e.clientX - rectBounds.left;
    let mouseY = e.clientY - rectBounds.top;

    if (circle.isDragging) {
      circle.x = mouseX;
      circle.y = mouseY;
    }

    if (rect.isDragging) {
      rect.x = mouseX - rect.width / 2;
      rect.y = mouseY - rect.height / 2;
    }
  }
}

function mouseUpHandler() {
  circle.isDragging = false;
  rect.isDragging = false;
}

canvas.addEventListener('mousedown', mouseDownHandler);
canvas.addEventListener('mousemove', mouseMoveHandler);
canvas.addEventListener('mouseup', mouseUpHandler);

draw();
