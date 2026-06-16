"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoriesMap: Record<string, string> = {
  "vechory": "Вечори",
  "katekhyzatsii": "Катехизації",
  "mali-ihry": "Малі ігри",
  "velyki-ihry": "Великі ігри",
  "maister-klasy": "Майстер-класи",
  "hrupky": "Групки"
};

const locationsMap: Record<string, string> = {
  "indoor": "В приміщенні",
  "outdoor": "Надворі",
  "water": "Біля води"
};

export default function ActivityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activity, setActivity] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Стан для відображення статусу копіювання посилання
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    async function fetchActivity() {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('id', id)
        .single();
        
      if (data) setActivity(data);
      setIsLoading(false);
    }
    fetchActivity();
  }, [id]);

  // Функція для копіювання посилання в буфер обміну
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      // Через 2 секунди повертаємо початковий стан кнопки
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-xl font-bold">Завантаження...</div>;

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <div className="flex-grow">
        
        {/* Шапка з кнопками Назад та Поділитися */}
        <div className="bg-white border-b border-gray-200 p-6 sticky top-0 z-50">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <button onClick={() => window.history.back()} className="text-gray-500 hover:text-[#FDB8D3] font-bold text-lg transition-colors">
              ← Назад
            </button>
            
            {/* Кнопка Поділитися */}
            <button 
              onClick={handleShare}
              className={`flex items-center gap-2 border font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-sm ${
                isCopied 
                  ? 'bg-green-50 border-green-200 text-green-600' 
                  : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700'
              }`}
            >
              {isCopied ? (
                <>
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Скопійовано!</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.57 2.286M15.118 9.258l-4.57 2.286M20 5a3 3 0 11-6 0 3 3 0 016 0zm-12 7a3 3 0 11-6 0 3 3 0 016 0zm12 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Поділитися грою</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-10 px-6 mb-10">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">{activity.title}</h1>
            
            {/* КАТЕГОРІЇ ТА ЛОКАЦІЇ */}
            <div className="flex flex-wrap gap-2 mb-8">
              {activity.category_ids?.map((catId: string, index: number) => (
                <span key={index} className="bg-[#FDB8D3]/10 text-[#FDB8D3] px-5 py-2 rounded-full font-bold text-base">
                  #{categoriesMap[catId] || catId}
                </span>
              ))}
              {activity.location?.map((loc: string, index: number) => (
                <span key={`loc-${index}`} className="bg-gray-100 text-gray-700 px-5 py-2 rounded-full font-bold text-base">
                  📍 {locationsMap[loc] || loc}
                </span>
              ))}
            </div>
            
            {/* ВЕЛИКІ ТЕХНІЧНІ КАРТКИ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <p className="text-orange-800 font-medium text-base mb-2">⏳ Тривалість: {activity.duration_min}-{activity.duration_max} хв</p>
                <p className="text-orange-800 font-medium text-base">⏱️ Час на підготовку: {activity.preparation_time || 0} хв</p>
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <p className="text-blue-800 font-medium text-base mb-2">👥 Кількість учасників: {activity.participants_min}-{activity.participants_max}</p>
                <p className="text-blue-800 font-medium text-base">🧑‍💼 Необхідна кількість аніматорів: {activity.animators_min}-{activity.animators_max}</p>
              </div>
            </div>

            <div className="mb-8">
              <span className={`px-5 py-2 rounded-full font-bold text-base ${activity.has_equipment ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {activity.has_equipment ? '🎒 Потрібен реквізит' : 'Без реквізиту'}
              </span>
            </div>

            {activity.has_equipment && activity.equipment && (
              <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                <h3 className="font-bold text-gray-800 text-lg mb-2">Перелік необхідного реквізиту:</h3>
                <p className="text-gray-700 text-base leading-relaxed">{activity.equipment}</p>
              </div>
            )}

            <p className="text-2xl text-gray-700 italic border-l-4 border-[#FDB8D3] pl-6 py-2 mb-10 leading-relaxed font-medium">
              {activity.short_description}
            </p>
            
            {/* РОЗДІЛ ІНСТРУКЦІЇ */}
            <div className="mt-12 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-[#44bdf3] text-white p-3 rounded-2xl shadow-lg">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Інструкція до проведення
                </h2>
              </div>
              <div className="h-1 w-32 bg-[#FDB8D3] rounded-full mb-8"></div>
              
              <div className="prose prose-lg text-gray-700 whitespace-pre-wrap leading-relaxed max-w-none text-lg">
                {activity.full_content}
              </div>
            </div>

            {/* МАТЕРІАЛИ */}
            {activity.file_urls && activity.file_urls.length > 0 && (
              <div className="mt-12 border-t border-gray-200 pt-8">
                <h3 className="font-bold text-xl mb-6 text-gray-900">📂 Додаткові матеріали для скачування:</h3>
                {activity.file_urls.map((url: string, index: number) => (
                  <a key={index} href={url} target="_blank" className="flex items-center gap-3 text-lg text-[#44bdf3] hover:underline mb-4 font-medium transition-opacity hover:opacity-80">
                    <span className="bg-[#44bdf3]/10 p-3 rounded-xl">📄</span> Файл №{index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div> 

      {/* ФУТЕР */}
      <footer className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/propose">
            <button className="bg-[#FDB8D3] text-white font-bold px-8 py-4 rounded-full hover:bg-[#f9a8c8] transition-all text-lg shadow-md">
              + Запропонувати активність
            </button>
          </Link>
          <Link href="/school">
            <button className="bg-[#E0F2FE] text-[#60a5fa] font-bold px-8 py-4 rounded-full hover:bg-[#bae6fd] transition-all text-lg shadow-md w-full md:w-auto">
              Записатись на школу аніматора
            </button>
          </Link>
        </div>
      </footer>
    </main>
  );
}