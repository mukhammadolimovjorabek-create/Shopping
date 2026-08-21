require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token) {
    console.error("❌ XATOLIK: TELEGRAM_BOT_TOKEN topilmadi!");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseKey || 'mock-key');

const adminIds = (process.env.ADMIN_IDS || "").split(',').map(id => id.trim());
const userStates = {};

bot.onText(/\\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const fullName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
    
    try {
        await supabase.from('bot_users').upsert({
            id: chatId.toString(),
            first_name: msg.from.first_name,
            username: msg.from.username || ''
        }, { onConflict: 'id' });
    } catch (err) {
        console.error("Foydalanuvchini saqlashda xatolik:", err);
    }

    const webAppUrl = \`https://shopping-gry5.onrender.com?v=\${Date.now()}\`;

    // Only give the admin the broadcast keyboard, regular users get the inline button exactly as it was
    if (adminIds.includes(chatId.toString())) {
        bot.sendMessage(chatId, \`Assalomu alaykum, \${fullName}!\\n\\nDo'konimizga xush kelibsiz. Pastdagi tugmani bosib xaridlarni boshlang:\`, {
            reply_markup: {
                keyboard: [
                    [{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl } }],
                    [{ text: "📢 Xabar yuborish (Hammaga)" }]
                ],
                resize_keyboard: true
            }
        });
    } else {
        bot.sendMessage(chatId, \`Assalomu alaykum, \${fullName}!\\n\\nDo'konimizga xush kelibsiz. Pastdagi tugmani bosib xaridlarni boshlang:\`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "🛍 Do'konni ochish",
                            web_app: { url: webAppUrl }
                        }
                    ]
                ]
            }
        });
    }
});

bot.on('message', async (msg) => {
    if (!msg.text) return; // If photo/video but not in waiting state, ignore unless handled elsewhere
    
    const chatId = msg.chat.id.toString();
    const text = msg.text || "";

    const webAppUrl = \`https://shopping-gry5.onrender.com?v=\${Date.now()}\`;
    
    if (text === "📢 Xabar yuborish (Hammaga)" && adminIds.includes(chatId)) {
        userStates[chatId] = 'WAITING_FOR_BROADCAST';
        return bot.sendMessage(chatId, "Iltimos, hammaga yubormoqchi bo'lgan xabaringizni yozing (Matn, rasm yoki video yuborishingiz mumkin):", {
            reply_markup: {
                keyboard: [[{ text: "❌ Bekor qilish" }]],
                resize_keyboard: true
            }
        });
    }

    if (text === "❌ Bekor qilish" && userStates[chatId]) {
        delete userStates[chatId];
        return bot.sendMessage(chatId, "Xabar yuborish bekor qilindi.", {
            reply_markup: {
                keyboard: [
                    [{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl } }],
                    [{ text: "📢 Xabar yuborish (Hammaga)" }]
                ],
                resize_keyboard: true
            }
        });
    }

    if (userStates[chatId] === 'WAITING_FOR_BROADCAST') {
        delete userStates[chatId];
        
        bot.sendMessage(chatId, "Xabarlar yuborilmoqda... Kuting.");
        
        let allIds = new Set();
        try {
            const { data: botUsers } = await supabase.from('bot_users').select('id');
            if (botUsers) botUsers.forEach(u => allIds.add(u.id));
            
            const { data: realUsers } = await supabase.from('users').select('telegram_id');
            if (realUsers) realUsers.forEach(u => {
                if (u.telegram_id) allIds.add(u.telegram_id.toString());
            });
        } catch(e) { console.error(e); }
        
        let successCount = 0;
        let failCount = 0;
        
        const idsArray = Array.from(allIds);
        for (const targetId of idsArray) {
            try {
                await bot.copyMessage(targetId, chatId, msg.message_id);
                successCount++;
            } catch(e) {
                failCount++;
            }
            await new Promise(r => setTimeout(r, 40)); 
        }

        return bot.sendMessage(chatId, \`✅ Xabar yuborish yakunlandi.\\n\\nYuborildi: \${successCount} ta\\nYetib bormadi (Botni o'chirganlar): \${failCount} ta\`, {
            reply_markup: {
                keyboard: [
                    [{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl } }],
                    [{ text: "📢 Xabar yuborish (Hammaga)" }]
                ],
                resize_keyboard: true
            }
        });
    }
});

bot.on('callback_query', async (query) => {
    bot.answerCallbackQuery(query.id);
});

console.log('====================================');
console.log('🚀 Telegram Mini App Bot ishga tushdi...');
console.log('====================================');

const app = express();

app.use(express.static(path.join(__dirname, 'out'), { extensions: ['html'] }));

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Web server is running on port " + PORT));