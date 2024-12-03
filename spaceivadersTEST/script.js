const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações do canvas
canvas.width = 1000;
canvas.height = 600;

// Carregando imagens
const playerImg = new Image();
playerImg.src = "spaceship.png";

const bulletImg = new Image();
bulletImg.src = "engine_sprites.png";

const invaderImages = [
  "invader.png", // Imagem para fase 1
  "invader2.png", // Imagem para fase 2
  "invader3.png", // Imagem para fase 3
  "engine.png", // Imagem para fase 4
  "1163.png", // Imagem para o boss na fase 5
];

let currentLevel = 1; // Fase inicial
let levelInProgress = false;
let gameOver = false; // Estado do jogo
let invaderImg = new Image(); // Para armazenar a imagem do invasor atual
let score = 0; // Variável para armazenar a pontuação
let gameStarted = false; // Flag para controlar se o jogo foi iniciado

// Obstáculos da fase 2
let obstacles = [];

// Boss na fase 5
let boss = null;

// Sons do jogo
const shootSound = new Audio('shoot.mp3');
const explosionSound = new Audio('explosion.mp3');
const gameOverSound = new Audio('gameover.mp3');
const nextLevelSound = new Audio('nextlevel.mp3');

const player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 70,
  width: 50,
  height: 50,
  speed: 5,
};

const bullets = [];
const invaderBullets = [];
let invaders = [];
let difficulty = 'normal'; // Define a dificuldade padrão

// Função para selecionar a dificuldade
function selectDifficulty() {
  const difficultyChoice = prompt("Escolha a dificuldade: Fácil (1), Normal (2), Difícil (3)");
  if (difficultyChoice === '1') {
    difficulty = 'easy';
    player.speed = 7; // Jogador mais rápido
  } else if (difficultyChoice === '2') {
    difficulty = 'normal';
    player.speed = 5; // Jogador com velocidade padrão
  } else if (difficultyChoice === '3') {
    difficulty = 'hard';
    player.speed = 4; // Jogador mais devagar
  } else {
    alert("Escolha inválida! Definindo para Normal.");
    difficulty = 'normal';
  }
}

// Atualizar imagem do invasor com base no nível
function updateInvaderImage(level) {
  const imageIndex = Math.min(level - 1, invaderImages.length - 1);
  invaderImg.src = invaderImages[imageIndex];
}

// Criar obstáculos para o nível 2
function createObstacles() {
  obstacles = [
    { x: 200, y: 300, width: 100, height: 20 },
    { x: 600, y: 400, width: 150, height: 20 },
    { x: 400, y: 500, width: 80, height: 20 }
  ];
}

// Criar invasores
function createInvaders(level) {
  invaders = [];
  updateInvaderImage(level);

  const rows = Math.min(5 + level, 10);
  const cols = Math.min(10 + level, 15);
  const speedIncrease = difficulty === 'easy' ? 2 + level * 0.3 : difficulty === 'normal' ? 3 + level * 0.5 : 4 + level * 0.7;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      invaders.push({
        x: j * 60 + 50,
        y: i * 50 + 30,
        width: 40,
        height: 40,
        speed: speedIncrease,
      });
    }
  }
  if (level === 2) createObstacles();
  if (level === 5) createBoss();
}

// Criar Boss
function createBoss() {
  boss = {
    x: canvas.width / 2 - 100,
    y: 50,
    width: 200,
    height: 100,
    health: 200,
    speed: 2
  };
}

createInvaders(currentLevel);

let keys = {};
window.addEventListener('keydown', (e) => (keys[e.key] = true));
window.addEventListener('keyup', (e) => (keys[e.key] = false));

function drawImage(obj, img) {
  ctx.drawImage(img, obj.x, obj.y, obj.width, obj.height);
}

function updatePlayer() {
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
}

function shoot() {
  bullets.push({
    x: player.x + player.width / 4 - 5,
    y: player.y,
    width: 10,
    height: 50,
    speed: 9,
  });
  shootSound.play();
}

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' && !gameOver) shoot();
});

function updateBullets() {
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) bullets.splice(index, 1);
  });

  bullets.forEach((bullet) => drawImage(bullet, bulletImg));
}

function invadersShoot() {
  if (Math.random() < 0.05 + currentLevel * 0.02) {
    const randomInvader = invaders[Math.floor(Math.random() * invaders.length)];
    if (randomInvader) {
      invaderBullets.push({
        x: randomInvader.x + randomInvader.width / 2 - 5,
        y: randomInvader.y + randomInvader.height,
        width: 10,
        height: 20,
        speed: 3 + currentLevel * 0.3,
      });
    }
  }
}

function updateInvaderBullets() {
  invaderBullets.forEach((bullet, index) => {
    bullet.y += bullet.speed;
    if (bullet.y > canvas.height) invaderBullets.splice(index, 1);

    // Colisão com o jogador
    if (
      bullet.x < player.x + player.width &&
      bullet.x + bullet.width > player.x &&
      bullet.y < player.y + player.height &&
      bullet.y + bullet.height > player.y
    ) {
      gameOver = true;
      gameOverSound.play();
      alert(`Você foi atingido! Pontuação final: ${score}`);
      document.location.reload();
    }
  });

  invaderBullets.forEach((bullet) => {
    ctx.fillStyle = "red";
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });
}

function updateInvaders() {
  invaders.forEach((invader) => {
    invader.x += invader.speed;

    if (currentLevel >= 3) {
      invader.y += Math.sin(invader.x / 50) * 0.5;
    }

    if (invader.x + invader.width > canvas.width || invader.x < 0) {
      invader.speed *= -1;
      invader.y += 20;
    }
  });

  invaders.forEach((invader) => drawImage(invader, invaderImg));
}

function detectCollisions() {
  bullets.forEach((bullet, bulletIndex) => {
    invaders.forEach((invader, invaderIndex) => {
      if (
        bullet.x < invader.x + invader.width &&
        bullet.x + bullet.width > invader.x &&
        bullet.y < invader.y + invader.height &&
        bullet.y + bullet.height > invader.y
      ) {
        bullets.splice(bulletIndex, 1);
        invaders.splice(invaderIndex, 1);
        score += 10;
        explosionSound.play();
      }
    });
  });

  if (boss) {
    bullets.forEach((bullet, index) => {
      if (
        bullet.x < boss.x + boss.width &&
        bullet.x + bullet.width > boss.x &&
        bullet.y < boss.y + boss.height &&
        bullet.y + bullet.height > boss.y
      ) {
        bullets.splice(index, 1);
        boss.health -= 10;
        if (boss.health <= 0) {
          boss = null;
          score += 1000;
          alert('Você derrotou o Boss! Parabéns!');
        }
      }
    });
  }
}

function drawBoss() {
  if (boss) {
    drawImage(boss, invaderImg);

    // Barra de vida do boss
    ctx.fillStyle = "red";
    ctx.fillRect(boss.x, boss.y - 10, (boss.health / 200) * boss.width, 5);
  }
}

function checkLevelComplete() {
  if (invaders.length === 0 && !levelInProgress) {
    levelInProgress = true;
    nextLevelSound.play();
    currentLevel++;
    alert(`Fase ${currentLevel}! Prepare-se!`);
    createInvaders(currentLevel);
    levelInProgress = false;
  }
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.fillText(`  Pt: ${score}`, 20, 20);
}

function drawGameOver() {
  ctx.fillStyle = "red"; // Cor do texto
  ctx.font = "bold 60px 'Courier New', monospace"; // Estilo da fonte
  ctx.textAlign = "center"; // Alinhamento horizontal
  ctx.textBaseline = "middle"; // Alinhamento vertical
  ctx.shadowColor = "black"; // Cor da sombra
  ctx.shadowBlur = 10; // Intensidade da sombra
  ctx.shadowOffsetX = 5; // Deslocamento horizontal da sombra
  ctx.shadowOffsetY = 5; // Deslocamento vertical da sombra
  
  // Desenhar o texto "GAME OVER"
  ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 30);

  // Subtexto para pontuação final
  ctx.font = "30px 'Courier New', monospace";
  ctx.fillStyle = "white";
  ctx.shadowBlur = 0; // Remover sombra para subtexto
  ctx.fillText(`Pontuação final: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
}

function drawObstacles() {
  obstacles.forEach((obstacle) => {
    ctx.fillStyle = "gray";
    ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  });
}

function drawStartScreen() {
  ctx.fillStyle = "white"; // Cor do texto
  ctx.font = "20px 'Press Start 2P', monospace"; // Fonte pixelada
  ctx.textAlign = "center"; // Alinhamento horizontal
  ctx.textBaseline = "middle"; // Alinhamento vertical

  // Adicionar sombreamento para destacar
  ctx.shadowColor = "black"; 
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Desenhar o texto de instrução
  ctx.fillText('Pressione "Enter" para iniciar!', canvas.width / 2, canvas.height / 2);
}

function startGame() {
  selectDifficulty(); // Permite selecionar a dificuldade antes de iniciar o jogo
  gameStarted = true;
  gameOver = false;
  score = 0;
  currentLevel = 1;
  createInvaders(currentLevel);
  gameLoop();
}

function gameLoop() {
  if (!gameStarted) {
    drawStartScreen();
    return;
  }

  if (gameOver) {
    drawGameOver();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  updatePlayer();
  drawImage(player, playerImg);
  updateBullets();
  invadersShoot();
  updateInvaderBullets();
  updateInvaders();
  detectCollisions();
  drawObstacles();
  drawBoss();
  checkLevelComplete();
  drawScore();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !gameStarted) startGame();
});

gameLoop();
