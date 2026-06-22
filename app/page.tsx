"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase"; // Переконайся, що шлях правильний

const categories = [
  { id: "vechory", title: "Вечори", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg> },
  { id: "katekhyzatsii", title: "Катехизації", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
  { id: "mali-ihry", title: "Малі ігри", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg> },
  { id: "velyki-ihry", title: "Великі ігри", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg> },
  { id: "maister-klasy", title: "Майстер-класи", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg> },
  { id: "hrupky", title: "Групки", icon: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg> },
];

const carouselImages = [
  '/images/camp-carousel/camp-1.jpg',
  '/images/camp-carousel/camp-2.jpg',
  '/images/camp-carousel/camp-3.jpg',
  '/images/camp-carousel/camp-4.jpg',
  '/images/camp-carousel/camp-5.jpg',
  '/images/camp-carousel/camp-6.jpg',
  '/images/camp-carousel/camp-7.jpg',
  '/images/camp-carousel/camp-8.jpg',
  '/images/camp-carousel/camp-9.jpg',
  '/images/camp-carousel/camp-10.jpg',
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSendFeedback = async () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    
    const { error } = await supabase.from('feedback').insert([{ message }]);
    
    if (error) {
      alert("Помилка при відправці. Спробуйте ще раз.");
    } else {
      setSuccess(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setSuccess(false);
        setMessage("");
      }, 2000);
    }
    setIsSubmitting(false);
  };

  return (
    <main className="min-h-screen bg-[#FDB8D3] flex flex-col relative overflow-hidden font-sans">

      {/* Шапка з кнопками */}
      <nav className="absolute top-0 w-full p-6 lg:px-12 flex justify-end gap-4 z-50">
        <button 
          onClick={() => setIsContactModalOpen(true)}
          // 🟢 ТУТ ЗМІНИЛИ ТЕКСТ
          className="bg-white/20 backdrop-blur-sm border-2 border-white text-white font-bold px-6 py-2.5 rounded-full hover:bg-white hover:text-[#FDB8D3] transition-all text-sm md:text-base"
        >
          Зв'язок та пропозиції
        </button>
        <Link href="/propose">
          <button className="bg-transparent border-2 border-white text-white font-bold px-6 py-2.5 rounded-full hover:bg-white hover:text-[#FDB8D3] transition-colors text-sm md:text-base">
            + Запропонувати активність
          </button>
        </Link>
        <Link href="/school">
          <button className="bg-white text-[#FDB8D3] font-bold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors text-sm md:text-base shadow-lg">
            Записатись на школу аніматора
          </button>
        </Link>
      </nav>

      {/* Модальне вікно зв'язку */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            
            {success ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-800">Дякуємо за відгук!</h3>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 🟢 ТУТ ТЕЖ ОНОВИЛИ ЗАГОЛОВОК */}
                <h2 className="text-2xl font-extrabold text-gray-800">Зв'язок з автором</h2>
                <p className="text-gray-500 text-sm">Ваші ідеї роблять цей сайт кращим!</p>
                
                <div className="space-y-3">
                  <a href="https://t.me/thesilentist" target="_blank" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                    <span>📱 Telegram: @thesilentist</span>
                  </a>
                  <div className="p-3 bg-gray-50 text-gray-700 rounded-xl font-bold">
                    📞 Телефон: 093 823 6241
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-gray-700 font-bold mb-2">Надіслати ідею чи пропозицію:</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" 
                    rows={4} 
                    placeholder="Форма, на жаль, поки не працює, але ми обов'язково її доробимо! Поки можете писати свої пропозиції у Telegram або на пошту: nazar18derevoriz@gmail.com"
                  />
                  <button 
                    disabled={isSubmitting || !message.trim()}
                    onClick={handleSendFeedback}
                    className="w-full mt-4 bg-[#44bdf3] text-white font-bold py-3 rounded-xl hover:bg-[#32b0e6] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Відправка..." : "Надіслати пропозицію"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Модальне вікно зв'язку */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setIsContactModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
            
            {success ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-800">Дякуємо за повідомлення!</h3>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-extrabold text-gray-800">Зв'язок з автором</h2>
                
                <div className="space-y-3">
                  <a href="https://t.me/thesilentist" target="_blank" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors">
                    <span>📱 Telegram: @thesilentist</span>
                  </a>
                  <div className="p-3 bg-gray-50 text-gray-700 rounded-xl font-bold">
                    📞 Телефон: 093 823 6241
                  </div>
                </div>

                <div className="border-t pt-4">
                  <label className="block text-gray-700 font-bold mb-2">Надіслати ідею чи пропозицію:</label>
                  <textarea 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" 
                    rows={4} 
                    placeholder="Форма, на жаль, поки не працює, але ми обов'язково її доробимо! Поки можете писати свої пропозиції у Telegram або на пошту: nazar18derevoriz@gmail.com"
                  />
                  <button 
                    disabled={isSubmitting || !message.trim()}
                    onClick={handleSendFeedback}
                    className="w-full mt-4 bg-[#44bdf3] text-white font-bold py-3 rounded-xl hover:bg-[#32b0e6] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Відправка..." : "Надіслати"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Головна секція (без змін) */}
      <div className="flex-grow flex flex-col lg:flex-row items-center justify-between p-8 lg:p-16 pb-32 gap-10 mt-16 lg:mt-0">
        <div className="w-full lg:w-5/12 z-10 space-y-6">
          <h1 className="text-6xl md:text-8xl font-extrabold text-white drop-shadow-sm leading-tight" style={{ fontFamily: 'system-ui, sans-serif' }}>
            Аніматори<br />Нері
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium max-w-lg">
            База корисних матеріалів, ігор та сценаріїв для ідеального табору.
          </p>
        </div>

        <div className="w-full lg:w-7/12 h-[40vh] lg:h-[60vh] relative rounded-3xl overflow-hidden shadow-2xl bg-black/5">
          <div className="w-full h-full relative">
            {carouselImages.map((imagePath, index) => (
              <div
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <Image src={imagePath} alt={`Кадр з табору ${index + 1}`} fill priority={index === 0} className="object-cover" sizes="(max-width: 1024px) 100vw, 60vw" />
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-30 bg-black/30 px-4 py-2 rounded-full backdrop-blur-md">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${currentSlide === index ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Панель категорій */}
      <div className="w-full bg-[#44bdf3] absolute bottom-0 flex overflow-x-auto shadow-2xl z-20" style={{ scrollbarWidth: 'none' }}>
        {categories.map((cat) => (
          <Link href={`/category/${cat.id}`} key={cat.id} className="flex-1 min-w-fit px-6 py-4 flex flex-row items-center justify-center gap-3 hover:bg-[#32b0e6] transition-colors border-r border-[#32b0e6] last:border-r-0 group">
            <div className="group-hover:scale-110 transition-transform flex items-center justify-center">{cat.icon}</div>
            <span className="font-extrabold text-white text-center uppercase tracking-wide text-lg md:text-xl whitespace-nowrap drop-shadow-sm">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}