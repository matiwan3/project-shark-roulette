let balance = 1000;
let chosenColor = null;
let chosenBet = 0;
let previousBet = 0;
let highestBalance = 0;
let highestWinPrice = 0;
let session_username = prompt("Please enter your username:");
if (!session_username) {
  session_username = generateRandomUsername();
}

function generateRandomUsername() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPassword = '';
  for (let i = 0; i < 10; i++) {
    randomPassword += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomPassword;
}

// Update the current balance at page load
const usernameElement = document.getElementById('username');
usernameElement.innerHTML = `Playing as: <strong> ${session_username}</strong>`;
refreshBalance();

const updateRanking = async (session_username, score) => {
  try {
    const response = await fetch('http://192.168.1.16:3000/update-ranking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: session_username, score: score })
    });

    const rankings = await response.json();

    // Update the ranking table in index.html
    for (let i = 0; i < rankings.length; i++) {
      const rankElement = document.getElementById(`rank${i + 1}`);
      const usernameElement = document.getElementById(`username${i + 1}`);
      const balanceElement = document.getElementById(`balance${i + 1}`);

      rankElement.textContent = i + 1;
      usernameElement.innerHTML = rankings[i].name;
      balanceElement.textContent = rankings[i].score;
    }
  } catch (err) {
    console.error('Error updating ranking:', err);
  }
};

updateRanking(session_username, balance);

// Create an audio element for the sound effect
const soundEffect = new Audio('../audio/cash-register-sound.mp3');
const spinningEffect = new Audio('../audio/spin.mp3');
const loseEffect = new Audio("../audio/losebet.mp3");

// Add the "Highest Balance" div to the game history
const historyContainer = document.getElementById('historyContainer');
const highestBalanceDiv = document.createElement('div');
highestBalanceDiv.id = 'highestBalance';
highestBalanceDiv.innerHTML = `Highest Balance: <strong>$${highestBalance.toLocaleString()}</strong>`;
historyContainer.appendChild(highestBalanceDiv);

// Add the "Highest Win Price" div to the game history
const highestWinPriceDiv = document.createElement('div');
highestWinPriceDiv.id = 'highestWinPrice';
highestWinPriceDiv.innerHTML = `Highest Win Price: <strong>$${highestWinPrice.toLocaleString()}</strong>`;
historyContainer.appendChild(highestWinPriceDiv);

// Add CSS to center the highest balance and highest win price divs
highestBalanceDiv.style.display = 'flex';
highestBalanceDiv.style.justifyContent = 'center';
highestWinPriceDiv.style.display = 'flex';
highestWinPriceDiv.style.justifyContent = 'center';

function refreshBalance() {
  document.getElementById('balance').innerHTML = `Your current balance is <strong><span style="color: gold">$${balance.toLocaleString()}</span></strong> 💰`;
}

function refreshChosenBet() {
  document.getElementById('chosenBet').innerHTML = `Chosen bet: <strong>$${chosenBet.toLocaleString()}</strong>`;
}

function buttonsDisabled(flag = true) {
  document.getElementById('placeBetButton').disabled = flag;
  if (flag) {
    document.getElementById('placeBetButton').style.backgroundColor = 'gray';
  } else {
    document.getElementById('placeBetButton').style.backgroundColor = 'rgb(11, 186, 230)';
  }
  document.getElementById('btn-bet50').disabled = flag;
  document.getElementById('btn-bet100').disabled = flag;
  document.getElementById('btn-bet10%').disabled = flag;
  document.getElementById('btn-doublebet').disabled = flag;
  document.getElementById('btn-allin').disabled = flag;
  document.getElementById('btn-red').disabled = flag;
  document.getElementById('btn-black').disabled = flag;
  document.getElementById('btn-red').disabled = flag;
}
function chooseColor(color) {
  chosenColor = color;
  if (chosenColor === 'green') {
    document.getElementById('chosenColor').innerHTML = `Chosen color: <strong style="color: ${color}">🟢</strong>`;
  } else if (chosenColor === 'red') {
    document.getElementById('chosenColor').innerHTML = `Chosen color: <strong style="color: ${color}">🔴</strong>`;
  } else if (chosenColor === 'black') {
    document.getElementById('chosenColor').innerHTML = `Chosen color: <strong style="color: ${color}">⚫</strong>`;
  }
}

function chooseBet(bet) {
  console.log('balance', balance)
  if (balance == 0) {
    console.log('reloading the page');
    location.reload();
  }
  if (bet > balance) {
    alert('You do not have enough balance for this bet.');
    return;
  }
  chosenBet = bet;
  refreshChosenBet();
  refreshBalance();
}

function doublePreviousBet() {
  let bet = previousBet * 2;

  if (bet > balance) {
    alert('You do not have enough balance for this bet.');
    return;
  }
  chosenBet = bet;
  refreshChosenBet();
}

function play() {
  if (balance === 0) {
    location.reload();
    return;
  }
  if (chosenBet === 0) {
    alert('Please choose a bet amount.');
    return;
  }
  if (!chosenColor) {
    alert('Please choose a color.');
    return;
  }
  if (chosenBet > balance) {
    alert('You do not have enough balance for this bet.');
    return;
  }
  
  balance -= chosenBet;
  refreshBalance();

  // Disable all buttons
  buttonsDisabled(true);

  spin().then(result => {
    let resultText = `The ball landed on ${result.color} ${result.number}.`;
    let winAmount = 0;

    if (result.color === chosenColor) {
      if (chosenColor === 'green') {
        winAmount = chosenBet * 33;
      } else if (chosenColor === 'red') {
        winAmount = chosenBet * 2;
      } else {
        winAmount = chosenBet * 2.5;
      }

      balance += winAmount;
      resultText += ` <span class="win-text" style="color: ${result.color}">You win!</span>`;
      // Play the sound effect when winning
      soundEffect.play();

      // Update the highest bet win price if necessary
      if (winAmount > highestWinPrice) {
        highestWinPrice = winAmount;
        document.getElementById('highestWinPrice').innerHTML = `Highest Win Price: <strong>$${highestWinPrice.toLocaleString()}</strong>`;
      }
    } else {
      loseEffect.play();
      resultText += ' You lose!';
    }

    previousBet = chosenBet;
    updateHistory(result.color, previousBet, balance, winAmount, chosenColor);

    refreshBalance();
    refreshChosenBet();

    if (balance > highestBalance) {
      highestBalance = balance;
      document.getElementById('highestBalance').innerHTML = `Highest Balance: <strong>$${highestBalance.toLocaleString()}</strong>`;
    }

    if (balance <= 0) {
      refreshBalance();
      document.querySelector('button').disabled = true;
    }

  }).catch(error => {
    console.error(error);
  }).finally(() => {
    // Update the ranking
    updateRanking(session_username, balance);
    // Enable all buttons
    buttonsDisabled(false);
  });
}

function updateHistory(resultColor, bet, balance, winAmount, chosenColor) {
  const historyContainer = document.getElementById('historyContainer');
  const historyItems = historyContainer.getElementsByClassName('history-item');

  // Remove the oldest history item if there are already 10 items
  if (historyItems.length >= 10) {
    historyContainer.removeChild(historyItems[0]);
  }

  const historyItem = document.createElement('div');

  historyItem.className = 'history-item';
  historyItem.innerHTML = `
    <div class="history-ball" style="background-color: ${resultColor}"></div>
    <p>Bet: $${bet.toLocaleString()} | Won: $${winAmount.toLocaleString()} | Balance: <strong style="color: ${resultColor === chosenColor ? 'green' : 'red'}">${balance > 0 ? '$' + balance.toLocaleString() : '<span style="color: red">$' + Math.abs(balance).toLocaleString() + '</span>'}</strong></p>
  `;

  // Append the new history item
  historyContainer.appendChild(historyItem);
}

(function (loader) {
  document.addEventListener("DOMContentLoaded", loader[0], false);
})([function (eventLoadedPage) {
  "use strict";

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  var wrap;
  var pallete = [
    "r18", "b8", "r19", "g2", "r20", "r21", "b9", "r10",
    "g3", "r11", "b4", "r12", "b5", "r13", "b6",
    "r14", "g0", "r15", "b7", "r16", "g1", "r17"
  ];

  var bets = {
    "green": [2, 3, 0, 1],
    "red": [18, 19, 20, 21, 10, 11, 12, 13, 14, 15, 16, 17],
    "black": [8, 9, 4, 5, 6, 7]
  }

  var width = 80;
  wrap = document.querySelector('.roulette-container .wrap');

  function spin_promise(color, number) {
    spinningEffect.play();
    return new Promise((resolve, reject) => {
      if (
        (color === "green" || color === "g") && (number >= 0 && number <= 3) ||
        (color === "black" || color === "b") && (number >= 4 && number <= 9) ||
        (color === "red" || color === "r") && (number >= 10 && number <= 21)
      ) {
        let index, pixels, circles, pixelsStart;

        color = color[0];
        index = pallete.indexOf(color + "" + number);
        pixels = width * (index + 1);
        circles = 1760 * 15;

        pixels -= 80;
        pixels = rand(pixels + 2, pixels + 79);
        pixelsStart = pixels;
        pixels += circles;
        pixels *= -1;
        wrap.style.backgroundPosition = ((pixels + (wrap.offsetWidth / 2)) + "") + "px";
        setTimeout(() => {
          wrap.style.transition = "none";
          let pos = (((pixels * -1) - circles) * -1) + (wrap.offsetWidth / 2);
          wrap.style.backgroundPosition = String(pos) + "px";
          setTimeout(() => {
            wrap.style.transition = "background-position 2s";
            resolve();
          }, 210);

        }, 2000);
      } else {
        reject("Invalid color or number");
      }
    });
  }

  function spin() {
    return new Promise((resolve, reject) => {
      let color;
      let r = rand(1, 1000);
      if (1 <= r && r < 30) color = "green"; // 1-29 / 1000 => 3% chance of winning
      else if (30 <= r && r < 530) color = "red"; // 30-529 / 1000 => 50% chance of winning
      else if (530 <= r && r < 1000) color = "black"; // 530-999 / 1000 => 47% chance of winning
      let bet = bets[color][rand(0, bets[color].length)];
      spin_promise(color, bet).then(() => {
        console.log("[Spin ended]");
        resolve({ color: color, number: bet });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  // Expose the spin function to the global scope so it can be triggered manually
  window.spin = spin;
}]);