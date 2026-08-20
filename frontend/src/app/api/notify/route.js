import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();
    const { orderDetails, receiptUrl, customerName, customerPhone } = body;

    const BOT_TOKEN = "8977055750:AAHvhnSZHJyJ0dqUhVIQjpp2UrE9udVgpYI";
    const ADMIN_IDS = (process.env.NEXT_PUBLIC_ADMIN_IDS || "5466728043").split(',');

    let message = `🛒 <b>Yangi Buyurtma!</b>\n\n`;
    message += `👤 Mijoz: ${customerName}\n`;
    message += `📞 Tel: ${customerPhone}\n\n`;
    message += `🛍️ <b>Mahsulotlar:</b>\n${orderDetails}\n\n`;
    message += `To'lov cheki quyidagi rasmda ⬇️`;

    for (const adminId of ADMIN_IDS) {
      if (!adminId.trim()) continue;
      
      // Send Photo with caption
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: adminId.trim(),
          photo: receiptUrl,
          caption: message,
          parse_mode: 'HTML'
        })
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Notify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
