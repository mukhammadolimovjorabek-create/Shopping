const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// Replace the old checkout message
code = code.replace(
  /const message = `🛍.*?`;/s,
  `const message = \`🚨 <b>Yangi Buyurtma!</b>\\n👤 Mijoz: \${checkoutName} \${tgUser?.username ? '(@' + tgUser.username + ')' : ''}\\n📞 Tel: \${combinedPhone}\\n🛍 Tovar: \\n\${orderDetailsStr}\\n💰 50% To'lov: \${formatPrice(totalPrice)}\\n🖼 Chek rasmi biriktirilgan\\n\\n[ ⚙️ Admin Paneldan ko'rish ]\`;`
);

fs.writeFileSync('src/app/page.js', code);
console.log('Bot message format fixed');
