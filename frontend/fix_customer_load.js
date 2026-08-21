const fs = require('fs');

let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

// FIX 1: loadMyOrders to use correct UUID
const oldLoadMyOrders = `const loadMyOrders = async () => {
    setProfileView('orders');
    if (!tgUser) return;
    try {
      const { data } = await supabase.from('orders').select('*, products(title, image_url)').eq('user_id', tgUser.id.toString()).order('created_at', { ascending: false });
      if (data) setMyOrders(data);
    } catch (e) {
      console.error(e);
    }
  };`;

const newLoadMyOrders = `const loadMyOrders = async () => {
    setProfileView('orders');
    if (!tgUser) return;
    try {
      // First get the user's UUID from the 'users' table using their telegram_id
      const { data: userRow } = await supabase.from('users').select('id').eq('telegram_id', tgUser.id).single();
      if (userRow) {
        const { data } = await supabase.from('orders').select('*, products(title, image_url)').eq('user_id', userRow.id).order('created_at', { ascending: false });
        if (data) setMyOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };`;
pageContent = pageContent.replace(oldLoadMyOrders, newLoadMyOrders);
if(pageContent.includes(newLoadMyOrders)) console.log("Replaced loadMyOrders");


// FIX 2: Inputs for Checkout styling
// We want inputs to clearly be black text on white background (light mode) and white text on dark background (dark mode).
// I will replace `className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none"` or similar
pageContent = pageContent.replace(/className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"/g, 
'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

// And phone numbers
pageContent = pageContent.replace(/className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"/g,
'className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"');

// If there are generic inputs
pageContent = pageContent.replace(/className="w-full border p-2 rounded"/g, 'className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded"');


// FIX 3: In the previous step, I replaced handleFinalCheckout with the script replace but did it work?
// The user says "menga bot orqali kelsin". Wait, I DID add fetch to Telegram in submitCheckout via my previous script `fix_customer_orders.js` but wait... the previous script replaced `setCart([]); setCheckoutStep(0); ...` 
// Did it replace it? Let's check if the Telegram fetch is in handleFinalCheckout.
const hasTelegramBot = pageContent.includes('https://api.telegram.org/bot');
console.log("Has telegram bot call:", hasTelegramBot);

fs.writeFileSync('src/app/page.js', pageContent);
