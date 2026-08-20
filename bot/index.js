require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

// -----------------------------------------------------------------------------
// Initialization & Configuration
// -----------------------------------------------------------------------------
const token = process.env.TELEGRAM_BOT_TOKEN;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!token) {
    console.error("❌ XATOLIK: TELEGRAM_BOT_TOKEN topilmadi!");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const supabase = createClient(supabaseUrl || 'https://mock.supabase.co', supabaseKey || 'mock-key');

// -----------------------------------------------------------------------------
// Core Command Handlers
// -----------------------------------------------------------------------------

bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const telegramId = msg.from.id;
    const fullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');

    console.log(`[+] Yangi mijoz: ${fullName} (${telegramId})`);

    try {
        // Only run Supabase if valid URL is provided
        if (supabaseUrl && supabaseUrl.startsWith('http')) {
            const { error } = await supabase
                .from('users')
                .upsert([{ telegram_id: telegramId, full_name: fullName }], { onConflict: 'telegram_id' });
            
            if (error) console.error("Database error (upsert user):", error);
        }

        const webAppUrl = (process.env.WEBAPP_URL || 'https://localhost:3000') + '?v=2';

        const welcomeMessage = `
👋 <b>Assalomu alaykum, ${fullName}!</b>

Kiyim-kechak va poyabzallar internet-do'koniga xush kelibsiz. 
Biz orqali Xitoydan to'g'ridan-to'g'ri, eng hamyonbop narxlarda sifatli mahsulotlarga buyurtma berishingiz mumkin.

👇 <i>Katalogni ko'rish va buyurtma berish uchun quyidagi tugmani bosing:</i>`;

        bot.sendMessage(chatId, welcomeMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ 
                        text: "🛍 Do'konni ochish", 
                        web_app: { url: webAppUrl } 
                    }]
                ]
            }
        });
    } catch (err) {
        console.error('Start command error:', err);
        bot.sendMessage(chatId, "⚠️ Kechirasiz, tizimda vaqtinchalik nosozlik yuz berdi. Iltimos, keyinroq urinib ko'ring.");
    }
});

// -----------------------------------------------------------------------------
// Admin Action Handlers (Approve/Reject Receipts)
// -----------------------------------------------------------------------------

bot.on('callback_query', async (query) => {
    const data = query.data; 
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (!data) return;

    try {
        // [APPROVE] ACTION
        if (data.startsWith('approve_')) {
            const orderId = data.split('_')[1];
            
            if (supabaseUrl && supabaseUrl.startsWith('http')) {
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'Qabul qilindi' })
                    .eq('id', orderId);
                    
                if (error) throw error;
            }

            // Update admin message
            bot.editMessageReplyMarkup({ 
                inline_keyboard: [[{ text: "✅ Tasdiqlangan", callback_data: "ignore" }]] 
            }, { chat_id: chatId, message_id: messageId });
            
            bot.sendMessage(chatId, `✅ <b>Buyurtma (#${orderId.substring(0,6)}) tasdiqlandi.</b>\nMijozga muvaffaqiyatli xabar yuborildi.`, { parse_mode: 'HTML' });
            
            // TODO: Fetch user_id from order and send success notification to user
            
        // [REJECT] ACTION
        } else if (data.startsWith('reject_')) {
            const orderId = data.split('_')[1];
            
            if (supabaseUrl && supabaseUrl.startsWith('http')) {
                const { error } = await supabase
                    .from('orders')
                    .update({ status: 'Bekor qilindi' })
                    .eq('id', orderId);
                
                if (error) throw error;
            }

            // Update admin message
            bot.editMessageReplyMarkup({ 
                inline_keyboard: [[{ text: "❌ Rad etilgan", callback_data: "ignore" }]] 
            }, { chat_id: chatId, message_id: messageId });
            
            bot.sendMessage(chatId, `❌ <b>Buyurtma (#${orderId.substring(0,6)}) rad etildi!</b>`, { parse_mode: 'HTML' });
            
            // TODO: Notify user about rejection
            
        // [IGNORE] ACTION (prevent button double clicks)
        } else if (data === 'ignore') {
            bot.answerCallbackQuery(query.id, { text: "Bu amal allaqachon bajarilgan!" });
        }
        
    } catch (err) {
        console.error('Callback query error:', err);
        bot.answerCallbackQuery(query.id, { text: "Xatolik yuz berdi!", show_alert: true });
    }
});

// Start logging
console.log('====================================');
console.log('🤖 Telegram Mini App Bot ishga tushdi...');
console.log('====================================');
