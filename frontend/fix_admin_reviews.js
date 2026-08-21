const fs = require('fs');
let code = fs.readFileSync('src/app/page.js', 'utf8');

const oldLoadAllReviews = code.match(/const loadAllReviews = async \(\) => \{[\s\S]*?if\(data\) setAllReviews\(data\);\s*\};/);
if (oldLoadAllReviews) {
  const newLoadAllReviews = `const loadAllReviews = async () => {
    setProfileView('all_reviews');
    try {
      const { data: revData } = await supabase.from('reviews').select('*, products(title, image_url)').not('product_id', 'is', null).order('created_at', { ascending: false });
      if (revData) {
        const userIds = [...new Set(revData.map(r => r.user_id).filter(Boolean))];
        let usersData = [];
        if (userIds.length > 0) {
          // Some old user_ids might be strings (telegram_id), but since we fixed it to UUID, we filter properly
          // Let's just fetch all users for safety or skip user merge if it fails
          const { data: uData } = await supabase.from('users').select('id, first_name, username');
          if (uData) usersData = uData;
        }
        const merged = revData.map(r => ({ ...r, users: usersData.find(u => u.id === r.user_id || u.telegram_id?.toString() === r.user_id?.toString()) || null }));
        setAllReviews(merged);
      }
    } catch(e) {}
  };`;
  code = code.replace(oldLoadAllReviews[0], newLoadAllReviews);
}

const oldLoadAllMessages = code.match(/const loadAllMessages = async \(\) => \{[\s\S]*?if\(data\) setAllMessages\(data\);\s*\};/);
if (oldLoadAllMessages) {
  const newLoadAllMessages = `const loadAllMessages = async () => {
    setProfileView('all_messages');
    try {
      const { data: msgData } = await supabase.from('reviews').select('*').is('product_id', null).order('created_at', { ascending: false });
      if (msgData) {
        const { data: uData } = await supabase.from('users').select('id, first_name, username');
        const merged = msgData.map(r => ({ ...r, users: uData?.find(u => u.id === r.user_id || u.telegram_id?.toString() === r.user_id?.toString()) || null }));
        setAllMessages(merged);
      }
    } catch(e) {}
  };`;
  code = code.replace(oldLoadAllMessages[0], newLoadAllMessages);
}

fs.writeFileSync('src/app/page.js', code);
console.log('Fixed reviews and messages');
