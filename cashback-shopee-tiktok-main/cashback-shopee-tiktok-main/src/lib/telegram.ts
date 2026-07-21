const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8937342385:AAEIYE4m5WSvg4GiRz5q7xPGBdtMLYv119U';

export async function sendTelegramMessage(chatId: string | number, text: string) {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true,
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      console.error('Telegram API Error:', data);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send Telegram message:', error);
    return false;
  }
}
