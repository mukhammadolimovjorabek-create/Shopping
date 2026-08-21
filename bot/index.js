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

bot.onText(/\/start/, async (msg) => {
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

    const webAppUrl = `https://shopping-gry5.onrender.com?v=${Date.now()}`;

    const opts = {
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
    };
    bot.sendMessage(chatId, `Assalomu alaykum, ${fullName}!\n\nDo'konimizga xush kelibsiz. Pastdagi tugmani bosib xaridlarni boshlang:`, opts);
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