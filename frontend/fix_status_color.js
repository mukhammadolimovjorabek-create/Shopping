const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldStatusDisplay = code.match(/<span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900\/50 text-purple-700 dark:text-purple-300">[\s\S]*?<\/span>/);

if (oldStatusDisplay) {
  const newStatusDisplay = `<span className={\`text-xs font-bold px-3 py-1.5 rounded-lg \${order.status === 'Qabul qilindi' || order.status === '1. Qabul qilindi' ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'}\`}>
                              {order.status === 'Tekshirilmoqda' ? '1. To\\'lov tekshirilmoqda' : order.status}
                            </span>`;
  code = code.replace(oldStatusDisplay[0], newStatusDisplay);
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed status display');
} else {
  console.log('Could not find status display');
}
