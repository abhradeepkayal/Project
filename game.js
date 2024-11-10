document.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const startBtn = document.getElementById('start-btn');
  const scoreDisplay = document.getElementById('score');
  const timer = document.getElementById('timer');
  const gameOver = document.getElementById('over-screen');
  const final = document.getElementById('final');
  const instructions = document.getElementById('how-to');
  const replayBtn = document.getElementById('replay-btn');
  let score = 0;
  let obstacles = [];
  let shots = [];
  let timeLeft = 60;
  let isPlaying = false;

  const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    r: 20,
    speed: 5
  };
  let keys = {};
  let mouseX = player.x;

  class Obstacle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = -30;
      this.size = 30;
      this.speed = 2 + Math.random() * 2;
    }

    move() {
      this.y += this.speed;
    }

    draw() {
      ctx.fillStyle = '#ff5757';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  class Shot {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = 5;
      this.speed = 7;
    }

    move() {
      this.y -= this.speed;
    }

    draw() {
      ctx.fillStyle = '#00ffcc';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    player.x = canvas.width / 2;
    player.y = canvas.height - 50;
  }

  function start() {
    instructions.style.display = 'none';
    gameOver.style.display = 'none';
    score = 0;
    timeLeft = 60;
    isPlaying = true;
    obstacles = [];
    shots = [];
    scoreDisplay.innerText = 'Score: 0';
    updateTimer(timeLeft);
    resizeCanvas();
    requestAnimationFrame(gameLoop);
    startTimer();
  }

  function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!isPlaying) return;

    if (keys['ArrowLeft']) {
      player.x -= player.speed;
      if (player.x < player.r) player.x = player.r;
    }

    if (keys['ArrowRight']) {
      player.x += player.speed;
      if (player.x > canvas.width - player.r) player.x = canvas.width - player.r;
    }

    player.x = mouseX;

    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
    ctx.fill();

    if (Math.random() < 0.02) {
      obstacles.push(new Obstacle());
    }

    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      obs.move();
      obs.draw();

      if (obs.y > canvas.height) {
        obstacles.splice(i, 1);
        i--;
      }

      for (let j = 0; j < shots.length; j++) {
        const shot = shots[j];
        const dist = Math.hypot(shot.x - obs.x, shot.y - obs.y);
        if (dist < obs.size) {
          obstacles.splice(i, 1);
          shots.splice(j, 1);
          score += 10;
          scoreDisplay.innerText = `Score: ${score}`;
          j--;
        }
      }
    }

    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      shot.move();
      shot.draw();

      if (shot.y < 0) {
        shots.splice(i, 1);
        i--;
      }
    }

    requestAnimationFrame(gameLoop);
  }

  function startTimer() {
    const interval = setInterval(() => {
      if (!isPlaying) {
        clearInterval(interval);
        return;
      }

      timeLeft -= 1;
      updateTimer(timeLeft);

      if (timeLeft <= 10) {
        timer.classList.add('blink');
      }

      if (timeLeft <= 0) {
        clearInterval(interval);
        end();
      }
    }, 1000);
  }

  function updateTimer(time) {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    timer.innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function end() {
    isPlaying = false;
    final.innerText = `Score: ${score}`;
    gameOver.style.display = 'block';
  }

  function shoot() {
    if (isPlaying) {
      shots.push(new Shot(player.x, player.y - player.r));
    }
  }

  window.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === ' ' || event.key === 'Enter') {
      shoot();
    }
  });

  window.addEventListener('keyup', (event) => {
    keys[event.key] = false;
  });

  window.addEventListener('mousemove', (event) => {
    mouseX = event.clientX;
  });

  window.addEventListener('click', shoot);
  window.addEventListener('touchstart', shoot);

  window.addEventListener('resize', resizeCanvas);

  startBtn.addEventListener('click', start);
  replayBtn.addEventListener('click', () => {
    gameOver.style.display = 'none';
    start();
  });

  resizeCanvas();
});
