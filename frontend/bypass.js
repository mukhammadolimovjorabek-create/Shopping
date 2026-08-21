const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// Replace the specific check with unconditional true
code = code.replace(/if\s*\(user\s*&&\s*ADMIN_IDS\.includes\(user\.id\.toString\(\)\)\)\s*{\s*setIsAdmin\(true\);\s*}/, 'setIsAdmin(true);');

fs.writeFileSync('src/app/page.js', code);
console.log('Replaced');
