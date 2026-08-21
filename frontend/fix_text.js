const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

code = code.replace(
  /\\n\\n\[ ⚙️ Admin Paneldan ko'rish \]/g,
  "\\n\\n✅ Buyurtma profilingizdagi 'Barcha Mijozlar Buyurtmalari' bo'limiga tushdi."
);

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed text');
