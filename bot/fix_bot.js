const fs = require('fs');
let botCode = fs.readFileSync('index.js', 'utf8');

const regex = /bot\.onText\(\/\\\/start\/, async \(msg\) => \{[\s\S]*?bot\.sendMessage\(chatId, `Assalomu alaykum, \$\{fullName\}!\\n\\nDo'konimizga xush kelibsiz\. Pastdagi tugmani bosib xaridlarni boshlang:`, opts\);\n\}\);/;

const replacement = `const adminIds = (process.env.ADMIN_IDS || "").split(',').map(id => id.trim());
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

    const opts = {
        reply_markup: {
            keyboard: [
                [{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl } }]
            ],
            resize_keyboard: true
        }
    };
    
    if (adminIds.includes(chatId.toString())) {
        opts.reply_markup.keyboard.push([{ text: "📢 Xabar yuborish (Hammaga)" }]);
    }

    bot.sendMessage(chatId, \`Assalomu alaykum, \${fullName}!\\n\\nDo'konimizga xush kelibsiz. Pastdagi tugmani bosib xaridlarni boshlang:\`, opts);
});

bot.on('message', async (msg) => {
    if (!msg.text) {
        // If it's a photo/video but not in waiting state, ignore unless it triggers broadcast
    }
    
    const chatId = msg.chat.id.toString();
    const text = msg.text || "";

    const webAppUrl = \`https://shopping-gry5.onrender.com?v=\${Date.now()}\`;
    const defaultKeyboard = {
        keyboard: [
            [{ text: "🛍 Do'konni ochish", web_app: { url: webAppUrl } }]
        ],
        resize_keyboard: true
    };
    if (adminIds.includes(chatId)) {
        defaultKeyboard.keyboard.push([{ text: "📢 Xabar yuborish (Hammaga)" }]);
    }

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
            reply_markup: defaultKeyboard
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
            reply_markup: defaultKeyboard
        });
    }
});`;

botCode = botCode.replace(regex, replacement);
fs.writeFileSync('index.js', botCode);
console.log('Bot code updated');
