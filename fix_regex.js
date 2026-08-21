const fs = require('fs');
let code = fs.readFileSync('bot/index.js', 'utf8');
code = code.replace('bot.onText(/\\\\/start/, async (msg) => {', 'bot.onText(/\\/start/, async (msg) => {');
fs.writeFileSync('bot/index.js', code);
console.log('Fixed regex');
