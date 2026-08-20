require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

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
    
    // Foydalanuvchini bazaga saqlash
    try {
        await supabase.from('bot_users').upsert({
            id: chatId.toString(),
            first_name: msg.from.first_name,
            username: msg.from.username || ''
        }, { onConflict: 'id' });
    } catch (err) {
        console.error("Foydalanuvchini saqlashda xatolik:", err);
    }

    const webAppUrl = (process.env.WEBAPP_URL || 'https://localhost:3000') + '?v=3';

    const welcomeMessage = `
👋 <b>Assalomu alaykum, ${fullName}!</b>

Xitoydan to'g'ridan-to'g'ri tovarlar yetkazib beruvchi maxsus do'konimizga xush kelibsiz! 🇨🇳

🛍️ <i>Hoziroq pastdagi tugmani bosib, eng so'nggi tovarlarimiz bilan tanishing va buyurtma bering.</i>`;

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: "🛒 Do'konni ochish", web_app: { url: webAppUrl } }]
            ]
        }
    });
});

bot.onText(/\/broadcast (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const adminIds = (process.env.ADMIN_IDS || '').split(',');
    
    if (!adminIds.includes(chatId.toString())) {
        return bot.sendMessage(chatId, "❌ Sizga bu buyruqqa ruxsat yo'q!");
    }

    const messageToSend = match[1];
    bot.sendMessage(chatId, "⏳ Xabar yuborilmoqda...");

    try {
        const { data: users, error } = await supabase.from('bot_users').select('id');
        if (error) throw error;

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            try {
                await bot.sendMessage(user.id, `🔔 <b>Yangi Xabar!</b>\n\n${messageToSend}`, { parse_mode: 'HTML' });
                successCount++;
            } catch (err) {
                failCount++;
            }
        }

        bot.sendMessage(chatId, `✅ <b>Xabarnoma yakunlandi!</b>\n\n✔️ Yuborildi: ${successCount} kishiga\n❌ Bloklaganlar: ${failCount} kishi`, { parse_mode: 'HTML' });
    } catch (err) {
        bot.sendMessage(chatId, "Xatolik yuz berdi: " + err.message);
    }
});

bot.on('callback_query', async (query) => {
    // keeping empty for now since we'll rebuild orders
    bot.answerCallbackQuery(query.id);
});

console.log('====================================');
console.log('🤖 Telegram Mini App Bot ishga tushdi...');
console.log('====================================');
