export const sendTelegramMessage = async (chatId: number, text: string) => {
  const token = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.error('BOT TOKEN отсутствует');
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('Ошибка отправки сообщения:', err);
  }
};
