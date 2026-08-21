const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldStr = `<h3 className="font-bold text-lg text-black dark:text-white mb-2">🛍 Mijoz ma'lumotlari</h3>
                        <p className="text-sm text-black dark:text-white">Ism: <b>{order.users?.full_name || order.users?.first_name || 'Noma\\'lum'}</b> {order.users?.username ? \`(@\${order.users.username})\` : ''}</p>
                        <p className="text-sm text-black dark:text-white mt-1">Tel: <b>{order.users?.phone_number || '-'}</b></p>`;
                        
const newStr = `<h3 className="font-bold text-lg text-black dark:text-white mb-2">👤 Mijoz ma'lumotlari</h3>
                        <p className="text-sm text-black dark:text-white">Ism: <b>{order.users?.full_name || order.users?.first_name || 'Noma\\'lum'}</b> {order.users?.username ? \`(@\${order.users.username})\` : ''}</p>
                        <p className="text-sm text-black dark:text-white mt-1">Tel: <b className="text-purple-600 dark:text-purple-400">{order.users?.phone_number || '-'}</b></p>`;

code = code.replace(oldStr, newStr);
fs.writeFileSync('src/app/page.js', code);
console.log('Fixed');
