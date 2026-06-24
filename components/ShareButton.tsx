"use client";

import { useState } from "react";

interface ShareButtonProps {
  title: string;
  text?: string;
}

export default function ShareButton({ title, text }: ShareButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: title,
      text: text || "Подивіться цю круту активність для табору!",
      url: window.location.href, // Автоматично бере поточне посилання на гру
    };

    // Перевіряємо, чи підтримує браузер Native Web Share API (переважно мобільні)
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Ігноруємо помилку, якщо користувач просто закрив меню поширення
        if ((error as Error).name !== "AbortError") {
          console.error("Помилка поширення:", error);
        }
      }
    } else {
      // Запасний варіант для ПК: копіюємо посилання в буфер обміну
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Скидаємо статус через 2 секунди
      } catch (err) {
        console.error("Не вдалося скопіювати посилання:", err);
        alert("Не вдалося скопіювати посилання автоматично.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95 ${
        isCopied
          ? "bg-green-500 text-white"
          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {isCopied ? (
        <>
          <span>✓</span>
          <span className="text-sm">Скопійовано!</span>
        </>
      ) : (
        <>
          {/* Іконка поширення (Share) */}
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 10.748a3.001 3.001 0 100 2.504l6.588 3.545a3.001 3.001 0 101.352-2.547l-6.588-3.545a3.001 3.001 0 00-1.352-2.505l6.588-3.545a3.001 3.001 0 10-1.352-2.547L8.684 10.748z"
            />
          </svg>
          <span className="text-sm">Поділитись</span>
        </>
      )}
    </button>
  );
}