import React from 'react';
import { useTheme } from '../themeContext';

export const LegalInfoView: React.FC = () => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const headingColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const bgColor = theme === 'dark' ? 'bg-slate-900' : 'bg-white';

  return (
    <div className={`p-6 max-w-2xl mx-auto space-y-8 ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <h1 className={`text-2xl font-black ${headingColor}`}>Реквизиты и оферта</h1>
      
      <section className={`p-6 rounded-2xl ${bgColor}`}>
        <h2 className={`font-bold mb-4 ${headingColor}`}>Реквизиты самозанятого</h2>
        <div className={`space-y-2 ${textColor}`}>
          <p>ФИО: [Ваши ФИО]</p>
          <p>ИНН: 000000000000</p>
          <p>Email: example@mail.ru</p>
          <p>Телефон: +7 (999) 000-00-00</p>
        </div>
      </section>

      <section className={`p-6 rounded-2xl ${bgColor}`}>
        <h2 className={`font-bold mb-4 ${headingColor}`}>Публичная оферта</h2>
        <p className={`text-sm ${textColor}`}>
          Настоящий документ является публичной офертой, определяющей условия использования сервиса "Фитнес Дневник" и правила предоставления платных услуг (Premium-подписка). 
          Оплачивая подписку, пользователь соглашается с условиями предоставления услуг, политикой возврата средств и порядком обработки персональных данных.
        </p>
      </section>

      <section className={`p-6 rounded-2xl ${bgColor}`}>
        <h2 className={`font-bold mb-4 ${headingColor}`}>Информация о получении услуг</h2>
        <p className={`text-sm ${textColor}`}>
          После успешной оплаты Premium-подписки, доступ к расширенным функциям (графики прогресса, AI-анализ, неограниченные шаблоны) предоставляется автоматически в течение нескольких минут. 
          В случае возникновения проблем с доступом, пожалуйста, свяжитесь с поддержкой по контактам, указанным выше.
        </p>
      </section>
    </div>
  );
};
