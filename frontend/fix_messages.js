const fs = require('fs');

// --- 1. Fix src/app/page.js (submitSupport) ---
let pageContent = fs.readFileSync('src/app/page.js', 'utf8');

const oldSubmitSupport = `await supabase.from('messages').insert([{
          user_id: tgUser?.id?.toString() || 'anonymous',
          user_name: profileName || 'Mijoz',
          text: supportText
        }]);`;

const newSubmitSupport = `await supabase.from('reviews').insert([{
          product_id: null,
          user_id: tgUser?.id?.toString() || 'anonymous',
          user_name: profileName || 'Mijoz',
          text: supportText,
          likes: 0
        }]);`;

pageContent = pageContent.replace(oldSubmitSupport, newSubmitSupport);
fs.writeFileSync('src/app/page.js', pageContent);


// --- 2. Fix src/app/admin/page.js (fetch reviews/messages, and submitReply) ---
let adminContent = fs.readFileSync('src/app/admin/page.js', 'utf8');

// Fetch reviews (product_id is not null)
const oldFetchReviews = `const { data } = await supabase.from('reviews').select('*, products(title)').order('created_at', { ascending: false });
        if (data) setReviews(data);`;
const newFetchReviews = `const { data } = await supabase.from('reviews').select('*, products(title)').not('product_id', 'is', null).order('created_at', { ascending: false });
        if (data) setReviews(data);`;
adminContent = adminContent.replace(oldFetchReviews, newFetchReviews);

// Fetch messages (product_id is null)
const oldFetchMessages = `const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
        if (data) setMessages(data);`;
const newFetchMessages = `const { data } = await supabase.from('reviews').select('*').is('product_id', null).order('created_at', { ascending: false });
        if (data) setMessages(data);`;
adminContent = adminContent.replace(oldFetchMessages, newFetchMessages);

// Fix submitReply to use Telegram API
const oldSubmitReply = `const submitReply = async (table, id) => {
    const text = replyText[id];
    if (!text) return;
    try {
      await supabase.from(table).update({ admin_reply: text }).eq('id', id);
      alert("Javob saqlandi!");
      if (table === 'reviews') fetchReviews();
      if (table === 'messages') fetchMessages();
    } catch(e) {
      alert("SQL Xatoligi (admin_reply kolonkasi yo'q bo'lishi mumkin): " + e.message);
    }
  };`;

const newSubmitReply = `const submitReply = async (type, id, userId) => {
    const text = replyText[id];
    if (!text || !userId) return alert("Xatolik: Xabar yoki mijoz ID si yo'q!");
    try {
      const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
      const replyMsg = \`👨‍💻 <b>Admin javob berdi:</b>\\n\\n\${text}\`;
      const res = await fetch(\`https://api.telegram.org/bot\${BOT_TOKEN}/sendMessage\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: userId, text: replyMsg, parse_mode: 'HTML' })
      });
      if (res.ok) {
        alert("Javob mijozga Telegram orqali yuborildi!");
        setReplyText({ ...replyText, [id]: '' });
      } else {
        alert("Xatolik! Mijoz botni bloklagan bo'lishi mumkin.");
      }
    } catch(e) {
      alert("Xatolik yuz berdi: " + e.message);
    }
  };`;
adminContent = adminContent.replace(oldSubmitReply, newSubmitReply);

// Update button calls for submitReply in reviews
const oldReviewBtn = `<button onClick={() => submitReply('reviews', r.id)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold">Javob berish</button>`;
const newReviewBtn = `<button onClick={() => submitReply('reviews', r.id, r.user_id)} className="bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold">Javob yuborish</button>`;
adminContent = adminContent.replace(oldReviewBtn, newReviewBtn);

// Update button calls for submitReply in messages
const oldMessageBtn = `<button onClick={() => submitReply('messages', m.id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Javob berish</button>`;
const newMessageBtn = `<button onClick={() => submitReply('messages', m.id, m.user_id)} className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold">Javob yuborish</button>`;
adminContent = adminContent.replace(oldMessageBtn, newMessageBtn);

// Since 'admin_reply' isn't saved in DB anymore, we should remove reading from it
adminContent = adminContent.replace(/\|\| r\.admin_reply /g, "");
adminContent = adminContent.replace(/\|\| m\.admin_reply /g, "");

fs.writeFileSync('src/app/admin/page.js', adminContent);
console.log("Messages and Replies fixed successfully!");
