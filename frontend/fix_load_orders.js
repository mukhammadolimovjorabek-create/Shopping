const fs = require('fs');
let c = fs.readFileSync('src/app/page.js', 'utf8');
const oldFunc = `const loadMyOrders = async () => {
    setProfileView('orders');
    if (!tgUser) return;
    try {
      const { data } = await supabase.from('orders').select('*, products(title, image_url)').eq('user_id', tgUser.id.toString()).order('created_at', { ascending: false });
      if (data) setMyOrders(data);
    } catch(e){}
  };`;
const newFunc = `const loadMyOrders = async () => {
    setProfileView('orders');
    if (!tgUser) return;
    try {
      const { data: userRow } = await supabase.from('users').select('id').eq('telegram_id', tgUser.id).single();
      if (userRow) {
        const { data } = await supabase.from('orders').select('*, products(title, image_url)').eq('user_id', userRow.id).order('created_at', { ascending: false });
        if (data) setMyOrders(data);
      }
    } catch(e){}
  };`;

c = c.replace(oldFunc, newFunc);
fs.writeFileSync('src/app/page.js', c);
console.log('Fixed loadMyOrders');
