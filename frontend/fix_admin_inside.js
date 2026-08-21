const fs = require('fs');
let code = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Fix fetchOrders
code = code.replace(
  "const { data } = await supabase.from('orders').select('*, users(full_name, phone_number), products(title)').order('created_at', { ascending: false });\n      if (data) setOrders(data);",
  `const { data: oData } = await supabase.from('orders').select('*, products(title)').order('created_at', { ascending: false });
      if (oData) {
        const uIds = [...new Set(oData.map(o => o.user_id).filter(id => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))];
        let usersData = [];
        if (uIds.length > 0) {
          const { data: uData } = await supabase.from('users').select('id, full_name, phone_number').in('id', uIds);
          if (uData) usersData = uData;
        }
        const combined = oData.map(o => {
          const u = usersData.find(user => user.id === o.user_id);
          return { ...o, user_name: u?.full_name || 'Noma\\'lum', phone: u?.phone_number || '-' };
        });
        setOrders(combined);
      }`
);

// Fix fetchReviews
code = code.replace(
  "const { data } = await supabase.from('reviews').select('*, products(title)').order('created_at', { ascending: false });",
  "const { data } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });"
);

fs.writeFileSync('src/app/admin/page.js', code);
console.log('Fixed admin/page.js Supabase FK issues');
