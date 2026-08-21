const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf("if (customerTelegramId && (newStatus === 'Qabul qilindi' || newStatus === 'Bekor qilindi')) {");
if (sIdx !== -1) {
  const replacement = `if (customerTelegramId && (newStatus === 'Qabul qilindi' || newStatus === 'Bekor qilindi')) {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      let msg = newStatus === 'Qabul qilindi' ? "✅ Sizning buyurtmangiz tasdiqlandi va qabul qilindi!" : "❌ Kechirasiz, buyurtmangiz bekor qilindi.";
      fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: customerTelegramId, text: msg })
      }).then(res => {
        if(!res.ok) alert("Xabar yuborishda xato: " + res.status);
      }).catch(e => alert("Xabar yuborib bo'lmadi: " + e));
    } else if (!customerTelegramId) {
      alert("Mijozning Telegram ID si topilmadi!");
    }`;

  const eIdx = code.indexOf('}\n    \n    loadAllOrders();', sIdx);
  if (eIdx !== -1) {
    code = code.substring(0, sIdx) + replacement + code.substring(eIdx + 1);
    fs.writeFileSync('src/app/page.js', code);
    console.log('Fixed notification debugging');
  }
}
