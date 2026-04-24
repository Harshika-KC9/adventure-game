document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    let welcome = document.getElementById("welcome-screen");
    if (welcome) {
      welcome.classList.add("fade-out");
      setTimeout(() => {
        welcome.style.display = "none";
      }, 1000); // wait for fade to finish
    }
  }
});

let playerHP = 100;
let enemyHP = 0;
let currentEnemy = null;

let playerX = 80;
let playerY = 30;
const speed = 15;

let canAttack = true;

// Scoreboard
let playerWins = 0;
let enemyWins = 0;

// Inventory
let inventory = [];

const enemies = [
  { name: "Goblin", hp: 50, img: "goblin.png" },
  { name: "Dark Wolf", hp: 70, img: "wolf.png" },
  { name: "Skeleton", hp: 60, img: "skeleton.png" }
];

window.onload = () => {
  updateHP();
  updateScoreboard();
  setTimeout(() => {
    typeText("Use arrow keys to move. Press SPACE or A to attack. E to explore, T to talk, M to move, S to stop, P to use potion.");
  }, 100);
};

// TEXT
let typingInterval;

function typeText(text) {
  clearInterval(typingInterval);
  let story = document.getElementById("story-text");
  story.innerText = ""; // always clear old text

  let i = 0;
  typingInterval = setInterval(() => {
    if (i < text.length) {
      story.innerText += text[i];
      i++;
    } else {
      clearInterval(typingInterval);
    }
  }, 15);
}

function stopTyping() {
  clearInterval(typingInterval);
}

// HP
function updateHP() {
  document.getElementById("player-hp-fill").style.width = playerHP + "%";

  if (currentEnemy) {
    document.getElementById("enemy-hp").style.display = "block";
    document.getElementById("enemy-name").innerText = currentEnemy.name;
    document.getElementById("enemy-hp-fill").style.width = enemyHP + "%";
  } else {
    document.getElementById("enemy-hp").style.display = "none";
  }
}

// Scoreboard
function updateScoreboard() {
  let box = document.getElementById("scoreboard");
  if (!box) {
    box = document.createElement("div");
    box.id = "scoreboard";
    box.style.position = "absolute";
    box.style.top = "10px";
    box.style.left = "50%";
    box.style.transform = "translateX(-50%)";
    box.style.color = "white";
    box.style.fontSize = "18px";
    box.style.background = "rgba(0,0,0,0.6)";
    box.style.padding = "5px 15px";
    box.style.borderRadius = "8px";
    document.getElementById("game").appendChild(box);
  }
  box.innerText = `🏆 Player Wins: ${playerWins} | 💀 Enemy Wins: ${enemyWins} | 🧪 Potions: ${inventory.filter(i => i === "Potion").length}`;
}

// SPAWN
function spawnEnemy() {
  currentEnemy = enemies[Math.floor(Math.random() * enemies.length)];
  enemyHP = currentEnemy.hp;

  let old = document.getElementById("enemy-sprite");
  if (old) old.remove();

  let img = document.createElement("img");
  img.id = "enemy-sprite";
  img.src = currentEnemy.img;
  img.alt = currentEnemy.name;

  img.style.position = "absolute";
  img.style.left = (window.innerWidth - 250) + "px";
  img.style.bottom = "30px";

  document.getElementById("game").appendChild(img);

  typeText(`A wild ${currentEnemy.name} appears!`);

  // 30% chance to find a potion when exploring
  if (Math.random() < 0.3) {
    inventory.push("Potion");
    typeText(`A wild ${currentEnemy.name} appears! You found a Potion! Press P to use it.`);
  }

  updateHP();
  updateScoreboard();
}

// ACTIONS
function sendChoice(action) {
  if (action === "explore") {
    if (!currentEnemy) spawnEnemy();
    else typeText("Enemy already here!");
  }

  if (action === "attack" && currentEnemy) {
    attackEnemy();
  }

  if (action === "move") {
    typeText("Use arrow keys.");
  }

  if (action === "talk") {
    const talkLines = [
      "Enemy growls menacingly...",
      "The Skeleton whispers: 'I was once a knight of the forgotten kingdom.'",
      "Goblin snarls: 'Treasure lies deep in the forest caves!'",
      "Dark Wolf howls: 'Beware the moonlit ruins...'",
      "Enemy mutters: 'Legends say a hidden sword can slay even the strongest beast.'",
      "Skeleton rattles: 'Do you know the old king’s curse still lingers here?'",
      "Goblin laughs: 'Heroes never return from the mountain pass!'",
      "Wolf snarls: 'The forest spirits are watching you.'",
      "Enemy whispers: 'The ancient temple holds secrets beyond imagination.'",
      "Skeleton sighs: 'I guard the path to the cursed crown.'"
    ];
    const randomLine = talkLines[Math.floor(Math.random() * talkLines.length)];
    typeText(randomLine);
  }

  if (action === "stop") {
    stopTyping();
    typeText("Typing stopped.");
  }
}

// ATTACK
function attackEnemy() {
  if (!canAttack) return;

  let hero = document.getElementById("character");
  let enemy = document.getElementById("enemy-sprite");
  if (!enemy) return;

  canAttack = false;

  hero.style.transform = "translateX(40px)";
  setTimeout(() => hero.style.transform = "translateX(0px)", 150);

  let playerDamage = Math.floor(Math.random() * 20) + 5;
  let enemyDamage = Math.floor(Math.random() * 18) + 5;

  enemyHP -= playerDamage;
  playerHP -= enemyDamage;

  enemy.classList.add("enemy-hit");
  setTimeout(() => enemy.classList.remove("enemy-hit"), 200);

  typeText(`You hit ${playerDamage}! Enemy hits ${enemyDamage}!`);

  if (enemyHP <= 0) {
    playerWins++;
    typeText(`${currentEnemy.name} defeated! You win!`);
    enemy.remove();
    currentEnemy = null;
    resetBattle(true);
  } else if (playerHP <= 0) {
    enemyWins++;
    typeText("You died! Enemy wins!");
    if (enemy) enemy.remove();
    currentEnemy = null;
    resetBattle(false);
  }

  updateHP();
  updateScoreboard();
  setTimeout(() => canAttack = true, 700);
}

// Reset battle
function resetBattle(victory) {
  playerHP = 100;
  enemyHP = 0;
  updateHP();
  updateScoreboard();

  setTimeout(() => {
    typeText("Explore again to find a new enemy!");
  }, 2000);
}

// Use potion
function usePotion() {
  if (inventory.includes("Potion")) {
    playerHP = Math.min(playerHP + 30, 100); // heal 30 HP
    inventory.splice(inventory.indexOf("Potion"), 1); // remove one potion
    typeText("You drink a Potion and restore 30 HP!");
    updateHP();
    updateScoreboard();
  } else {
    typeText("No potions left!");
  }
}

// MOVEMENT + ATTACK KEY
document.addEventListener("keydown", (e) => {
  let character = document.getElementById("character");

  if (e.key === "ArrowRight") playerX += speed;
  if (e.key === "ArrowLeft") playerX -= speed;
  if (e.key === "ArrowUp") playerY += speed;
  if (e.key === "ArrowDown") playerY -= speed;

  // Spacebar or A = Attack
  if ((e.code === "Space" || e.key.toLowerCase() === "a") && currentEnemy) {
    attackEnemy();
  }

  // E = Explore
  if (e.key.toLowerCase() === "e") {
    sendChoice("explore");
  }

  // T = Talk
  if (e.key.toLowerCase() === "t") {
    sendChoice("talk");
  }

  // M = Move
  if (e.key.toLowerCase() === "m") {
    sendChoice("move");
  }

  // S = Stop
  if (e.key.toLowerCase() === "s") {
    sendChoice("stop");
  }

  // P = Potion
  if (e.key.toLowerCase() === "p") {
    usePotion();
  }

  character.style.left = playerX + "px";
  character.style.bottom = playerY + "px";
});

// ENEMY FOLLOW
// ENEMY FOLLOW
setInterval(() => {
  let enemy = document.getElementById("enemy-sprite");
  if (!enemy) return;

  let enemyX = enemy.offsetLeft;
  let enemyY = parseInt(enemy.style.bottom || 30);

  if (enemyX > playerX) enemy.style.left = (enemyX - 2) + "px";
  else enemy.style.left = (enemyX + 2) + "px";

  if (enemyY > playerY) enemy.style.bottom = (enemyY - 2) + "px";
  else enemy.style.bottom = (enemyY + 2) + "px";
}, 40);
function exitGame() {
  let exit = document.getElementById("exit-screen");
  if (exit) {
    exit.classList.add("show");
    // Optionally stop game logic
    stopTyping();
    currentEnemy = null;
    document.getElementById("game").style.display = "none";
  }
}

