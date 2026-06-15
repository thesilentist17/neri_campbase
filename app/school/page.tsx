"use client";

import Link from "next/link";

export default function SchoolPage() {
  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col pb-20">
      
      {/* Шапка */}
      <div className="bg-[#44bdf3] p-6 lg:p-10 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white/80 hover:text-white font-bold flex items-center gap-2 transition-colors">
            ← На головну
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">
            Школа Аніматора
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* Основний контент */}
      <div className="flex-grow max-w-4xl mx-auto mt-10 px-6 space-y-8 w-full">
        
        {/* Інформаційний блок */}
        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
          {/* Декоративний елемент */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FDB8D3]/10 rounded-full blur-3xl"></div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 relative z-10">
            Стань частиною нашої команди! 🎉
          </h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8 relative z-10">
            Школа Аніматора — це унікальний простір, де ми готуємо лідерів для проведення найяскравіших дитячих та підліткових таборів. Тут ти навчишся організовувати ігри, розуміти психологію команди та створювати незабутню атмосферу.
          </p>
          
          <div className="flex flex-wrap gap-4 relative z-10">
            <span className="bg-[#FDB8D3]/10 text-[#FDB8D3] px-5 py-2.5 rounded-full font-bold">🎯 Лідерство</span>
            <span className="bg-[#44bdf3]/10 text-[#44bdf3] px-5 py-2.5 rounded-full font-bold">🧩 Ігропрактика</span>
            <span className="bg-orange-100 text-orange-600 px-5 py-2.5 rounded-full font-bold">⛺ Табірництво</span>
          </div>
        </div>

        {/* Блок з контактами */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Телефон */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-green-100 p-5 rounded-full mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Реєстрація та питання</h3>
            <p className="text-gray-600 mb-6 text-lg">Телефонуйте або пишіть (Telegram/Viber):</p>
            
            {/* ТУТ ЗМІНИ НОМЕР */}
            <a href="tel:+380990000000" className="text-3xl font-extrabold text-[#44bdf3] hover:underline mb-2">
              +38 (099) 000-00-00
            </a>
            
            {/* ТУТ ЗМІНИ ІМ'Я */}
            <p className="text-base font-bold text-gray-400 uppercase tracking-widest mt-2">
              Ім'я Відповідального
            </p>
          </div>

          {/* Instagram */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-3xl shadow-sm border border-pink-100 flex flex-col justify-center items-center text-center hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px] rounded-[1.8rem] mb-6 shadow-lg">
              <div className="bg-white p-4 rounded-[1.7rem]">
                <svg className="w-10 h-10 text-pink-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Наш Instagram</h3>
            <p className="text-gray-600 mb-8 text-lg">Більше фото, відео та відгуків з нашої школи:</p>
            
            {/* ТУТ ЗМІНИ ПОСИЛАННЯ */}
            <a href="https://instagram.com/" target="_blank" className="bg-white text-pink-600 font-extrabold px-8 py-4 rounded-full shadow-md hover:shadow-xl hover:-translate-y-1 transition-all border border-pink-100 text-lg">
              Перейти на сторінку
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}