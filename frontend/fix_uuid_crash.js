const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const sIdx = code.indexOf("const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];");
if (sIdx !== -1) {
  const replacement = `const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const userIds = [...new Set(ordersData.map(o => o.user_id).filter(id => id && uuidRegex.test(id)))];
        let usersData = [];
        if (userIds.length > 0) {
          const { data: uData } = await supabase.from('users').select('id, first_name, username, phone_number, full_name, telegram_id').in('id', userIds);
          if (uData) usersData = uData;
        }
        // Also fetch old string IDs if needed, or just fetch all users to be safe
        const { data: allUData } = await supabase.from('users').select('id, first_name, username, phone_number, full_name, telegram_id');
        if (allUData) {
          allUData.forEach(u => {
            if (!usersData.find(existing => existing.id === u.id)) usersData.push(u);
          });
        }`;
  
  const oldChunk = `const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];
        let usersData = [];
        if (userIds.length > 0) {
          const { data: uData } = await supabase.from('users').select('id, first_name, username, phone_number, full_name, telegram_id').in('id', userIds);
          if (uData) usersData = uData;
        }`;
        
  code = code.replace(oldChunk, replacement);
  fs.writeFileSync('src/app/page.js', code);
  console.log('Fixed loadAllOrders user fetching crash');
}
