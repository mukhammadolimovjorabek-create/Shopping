const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

// Replace loadAllOrders
const oldLoadAllOrders = code.match(/const loadAllOrders = async \(\) => \{[\s\S]*?if\(data\) setAllOrders\(data\);\s*\};/);
if (oldLoadAllOrders) {
  const newLoadAllOrders = `const loadAllOrders = async () => {
    setProfileView('all_orders');
    try {
      const { data: ordersData, error } = await supabase.from('orders').select('*, products(title, image_url)').order('created_at', { ascending: false });
      if (error) {
        console.error("Orders Error:", error);
        alert("Buyurtmalarni yuklashda xato: " + error.message);
        return;
      }
      if (ordersData) {
        const userIds = [...new Set(ordersData.map(o => o.user_id).filter(Boolean))];
        let usersData = [];
        if (userIds.length > 0) {
          const { data: uData } = await supabase.from('users').select('id, first_name, username, phone_number, full_name').in('id', userIds);
          if (uData) usersData = uData;
        }
        const merged = ordersData.map(o => ({ ...o, users: usersData.find(u => u.id === o.user_id) || null }));
        setAllOrders(merged);
      }
    } catch(e) {
      console.error(e);
    }
  };`;
  code = code.replace(oldLoadAllOrders[0], newLoadAllOrders);
}

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed loadAllOrders without FK join');
