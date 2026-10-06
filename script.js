const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const playerScoreEl = document.getElementById('player-score');
const computerScoreEl = document.getElementById('computer-score');

const paddleWidth = 14;
const paddleHeight = 100;
const ballRadius = 10;
const paddleSpeed = 7;
const aiSpeed = 5.5;

const leftPaddle = {
  x: 30,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0
};

const rightPaddle = {
  x: canvas.width - 30 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  dy: 0
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  vx: 5,
  vy: 3
};

let playerScore = 0;
let computerScore = 0;
const keys = {};

function updateScoreboard() {
  playerScoreEl.textContent = playerScore;
  computerScoreEl.textContent = computerScore;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const randomAngle = (Math.random() * Math.PI) / 2 - Math.PI / 4;
  const speed = 5;

  ball.vx = Math.cos(randomAngle) * speed * direction;
  ball.vy = Math.sin(randomAngle) * speed;
}

function movePlayerPaddle() {
  if (keys.ArrowUp) {
    leftPaddle.y -= paddleSpeed;
  }
  if (keys.ArrowDown) {
    leftPaddle.y += paddleSpeed;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, canvas.height - leftPaddle.height);
}

function moveComputerPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  const delta = targetY - rightPaddle.y;

  if (Math.abs(delta) < aiSpeed) {
    rightPaddle.y += delta;
  } else {
    rightPaddle.y += delta > 0 ? aiSpeed : -aiSpeed;
  }

  rightPaddle.y = clamp(rightPaddle.y, 0, canvas.height - rightPaddle.height);
}

function handleBallWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy *= -1;
  }
}

function handlePaddleCollision(paddle) {
  const ballLeft = ball.x - ball.radius;
  const ballRight = ball.x + ball.radius;
  const ballTop = ball.y - ball.radius;
  const ballBottom = ball.y + ball.radius;

  const paddleLeft = paddle.x;
  const paddleRight = paddle.x + paddle.width;
  const paddleTop = paddle.y;
  const paddleBottom = paddle.y + paddle.height;

  const intersects =
    ballRight >= paddleLeft &&
    ballLeft <= paddleRight &&
    ballBottom >= paddleTop &&
    ballTop <= paddleBottom;

  if (!intersects) return;

  const hitPos = (ball.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);
  const angle = hitPos * (Math.PI / 3);
  const speed = Math.hypot(ball.vx, ball.vy) + 0.15;

  const direction = ball.x < canvas.width / 2 ? 1 : -1;
  ball.vx = Math.cos(angle) * speed * direction;
  ball.vy = Math.sin(angle) * speed;

  if (ball.x < canvas.width / 2) {
    ball.x = paddle.x + paddle.width + ball.radius;
  } else {
    ball.x = paddle.x - ball.radius;
  }
}

function updateGame() {
  movePlayerPaddle();
  moveComputerPaddle();

  ball.x += ball.vx;
  ball.y += ball.vy;

  handleBallWallCollision();
  handlePaddleCollision(leftPaddle);
  handlePaddleCollision(rightPaddle);

  if (ball.x - ball.radius <= 0) {
    computerScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= canvas.width) {
    playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();
  ctx.closePath();
}

function drawCenterLine() {
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.strokeStyle = 'rgba(248, 250, 252, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  updateGame();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key] = false;
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const mouseY = event.clientY - rect.top;
  leftPaddle.y = clamp(mouseY - leftPaddle.height / 2, 0, canvas.height - leftPaddle.height);
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);