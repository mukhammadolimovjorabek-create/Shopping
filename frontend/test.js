const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf("h3 className=\"text-lg text-black dark:text-white font-semibold leading-snug\">{selectedProduct.title}");
console.log(code.substring(sIdx - 500, sIdx + 1000));
