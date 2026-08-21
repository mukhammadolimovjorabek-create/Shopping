const fs = require('fs');

let adminCode = fs.readFileSync('src/app/admin/page.js', 'utf8');

adminCode = adminCode.replace(
  /<p>Qoldiq: <span className="text-green-400 font-bold">\{p.stock_count\}<\/span><\/p>/g,
  '<p>Qoldiq: <span className="text-green-400 font-bold">{p.stock_count} / {p.original_stock || p.stock_count}</span></p>'
);

fs.writeFileSync('src/app/admin/page.js', adminCode);
console.log('Fixed admin list display');
