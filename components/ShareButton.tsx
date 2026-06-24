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
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Помилка поширення:", error);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Не вдалося скопіювати посилання:", err);
        alert("Не вдалося скопіювати посилання автоматично.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      title="Поділитись"
      className={`flex items-center justify-center gap-2 font-bold w-11 h-11 sm:w-auto sm:h-auto sm:px-5 sm:py-2.5 rounded-xl transition-all shadow-sm shrink-0 ${
        isCopied
          ? "bg-green-500 border-green-500 text-white"
          : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
      }`}
    >
      {isCopied ? (
        <>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
          <span className="hidden sm:inline text-sm">Скопійовано!</span>
        </>
      ) : (
        <>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.748a3.001 3.001 0 100 2.504l6.588 3.545a3.001 3.001 0 101.352-2.547l-6.588-3.545a3.001 3.001 0 00-1.352-2.505l6.588-3.545a3.001 3.001 0 10-1.352-2.547L8.684 10.748z" />
          </svg>
          <span className="hidden sm:inline text-sm">Поділитись</span>
        </>
      )}
    </button>
  );
}