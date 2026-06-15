"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
// Імпортуємо наш файл підключення до бази даних
import { supabase } from "@/lib/supabase";

const categoriesList = [
  { id: "vechory", title: "Вечори" },
  { id: "katekhyzatsii", title: "Катехизації" },
  { id: "mali-ihry", title: "Малі ігри" },
  { id: "velyki-ihry", title: "Великі ігри" },
  { id: "maister-klasy", title: "Майстер-класи" },
  { id: "hrupky", title: "Групки" }
];

const locationsMap: Record<string, string> = {
  "indoor": "В приміщенні",
  "outdoor": "Надворі",
  "water": "Біля води"
};

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Додаємо стани для збереження ігор з бази та статусу завантаження
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Стан фільтрів (введення користувача) - ДОДАНО searchTitle
  const [filterInputs, setFilterInputs] = useState({
    searchTitle: "",
    age: "",
    duration: "",
    participants: "",
    animators: "",
    equipmentStatus: "any", // 'any' | 'yes' | 'no'
    location: "any" // 'any' | 'indoor' | 'outdoor' | 'water'
  });

  // Стани для значень, які реально застосовані після натискання кнопки
  const [appliedFilters, setAppliedFilters] = useState({
    searchTitle: "",
    age: "",
    duration: "",
    participants: "",
    animators: "",
    equipmentStatus: "any",
    location: "any"
  });

  const currentCategory = categoriesList.find(c => c.id === id);
  const title = currentCategory ? currentCategory.title : "Категорія не знайдена";

  // Цей код автоматично запускається, коли користувач заходить на сторінку
  useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true); // Вмикаємо індикатор завантаження

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .contains('category_ids', [id])
        .eq('status', 'published');

      if (error) {
        console.error("Помилка завантаження:", error);
      } else {
        setActivities(data || []); // Зберігаємо отримані ігри
      }

      setIsLoading(false); // Вимикаємо індикатор
    }

    fetchActivities();
  }, [id]); // Запускатиметься знову, якщо зміниться категорія

  // Функція, яка фіксує фільтри при натисканні на кнопку
  const handleApplyFilters = () => {
    setAppliedFilters(filterInputs);
  };

  // Фільтруємо список ігор на льоту на основі розумних поодиноких полів
  const displayedActivities = activities.filter(a => {
    // 0. Фільтр Пошуку за назвою (без урахування регістру)
    if (appliedFilters.searchTitle) {
      if (!a.title.toLowerCase().includes(appliedFilters.searchTitle.toLowerCase())) return false;
    }

    // 1. Фільтр Віку: введене число має потрапляти в [age_min, age_max]
    if (appliedFilters.age) {
      const val = parseInt(appliedFilters.age);
      if (a.age_min !== null && val < a.age_min) return false;
      if (a.age_max !== null && val > a.age_max) return false;
    }

    // 2. Фільтр Тривалості: введене число має потрапляти в [duration_min, duration_max]
    if (appliedFilters.duration) {
      const val = parseInt(appliedFilters.duration);
      if (a.duration_min !== null && val < a.duration_min) return false;
      if (a.duration_max !== null && val > a.duration_max) return false;
    }

    // 3. Фільтр Учасників: введене число має потрапляти в [participants_min, participants_max]
    if (appliedFilters.participants) {
      const val = parseInt(appliedFilters.participants);
      if (a.participants_min !== null && val < a.participants_min) return false;
      if (a.participants_max !== null && val > a.participants_max) return false;
    }

    // 4. Фільтр Аніматорів: наявна кількість (val) має бути БІЛЬШОЮ або рівною за необхідний мінімум
    if (appliedFilters.animators) {
      const val = parseInt(appliedFilters.animators);
      if (a.animators_min !== null && val < a.animators_min) return false;
    }

    // 5. Перемикач Реквізиту (Три стани)
    if (appliedFilters.equipmentStatus === "yes" && !a.has_equipment) return false;
    if (appliedFilters.equipmentStatus === "no" && a.has_equipment) return false;

    // 6. Фільтр Локації
    if (appliedFilters.location !== "any") {
      if (!a.location || !a.location.includes(appliedFilters.location)) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col">

      {/* Шапка сторінки */}
      <div className="bg-[#FDB8D3] p-6 lg:p-10 text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3">
            <Link href="/" className="text-white/80 hover:text-white font-bold flex items-center gap-2 transition-colors w-fit">
              ← На головну
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide text-center w-full md:w-1/3">
            {title}
          </h1>
          <div className="w-full md:w-1/3 flex justify-end relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white/20 hover:bg-white/30 border border-white/50 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              Змінити категорію
              <svg className={`w-5 h-5 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-gray-800 flex flex-col">
                {categoriesList.map((cat) => {
                  const isActive = cat.id === id;
                  if (isActive) {
                    return (
                      <div key={cat.id} className="px-6 py-4 bg-gray-50 text-[#FDB8D3] font-extrabold border-l-4 border-[#FDB8D3] cursor-not-allowed flex justify-between items-center">
                        {cat.title}
                        <span className="w-2 h-2 rounded-full bg-[#FDB8D3]"></span>
                      </div>
                    );
                  }
                  return (
                    <Link key={cat.id} href={`/category/${cat.id}`} onClick={() => setIsMenuOpen(false)} className="px-6 py-4 hover:bg-blue-50 hover:text-[#60a5fa] font-semibold transition-colors border-l-4 border-transparent">
                      {cat.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-10 px-6 flex flex-col lg:flex-row gap-8 relative z-10 flex-grow w-full mb-16">

        {/* ЛІВА КОЛОНКА: Панель фільтрів */}
        <aside className="w-full lg:w-1/4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-4">Фільтри пошуку</h2>
          <div className="space-y-4 text-gray-600">
            
            {/* Фільтр за назвою (ПОШУК) */}
            <div className="space-y-1 pb-2 border-b border-gray-100">
              <label className="block text-sm font-bold text-gray-700">🔍 Пошук за назвою</label>
              <input type="text" placeholder="Введіть назву гри..." value={filterInputs.searchTitle} onChange={e => setFilterInputs({...filterInputs, searchTitle: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
            </div>

            {/* Фільтр локації */}
            <div className="space-y-1 pt-2">
              <label className="block text-sm font-bold text-gray-700">📍 Локація</label>
              <select value={filterInputs.location} onChange={e => setFilterInputs({...filterInputs, location: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]">
                <option value="any">Будь-де (Всі локації)</option>
                <option value="indoor">В приміщенні</option>
                <option value="outdoor">Надворі</option>
                <option value="water">Біля води</option>
              </select>
            </div>

            {/* Фільтр віку */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">🎂 Вік дитини (років)</label>
              <input type="number" placeholder="Наприклад: 10" value={filterInputs.age} onChange={e => setFilterInputs({...filterInputs, age: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
            </div>

            {/* Фільтр тривалості */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">⏳ Скільки маєте часу (хв)</label>
              <input type="number" placeholder="Наприклад: 45" value={filterInputs.duration} onChange={e => setFilterInputs({...filterInputs, duration: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
            </div>

            {/* Фільтр кількості учасників */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">👥 Кількість учасників</label>
              <input type="number" placeholder="Наприклад: 25" value={filterInputs.participants} onChange={e => setFilterInputs({...filterInputs, participants: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
            </div>

            {/* Фільтр кількості аніматорів */}
            <div className="space-y-1">
              <label className="block text-sm font-bold text-gray-700">🧑‍💼 Скільки є аніматорів</label>
              <input type="number" placeholder="Наприклад: 3" value={filterInputs.animators} onChange={e => setFilterInputs({...filterInputs, animators: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
            </div>

            {/* Трьохпозиційний перемикач реквізиту */}
            <div className="space-y-1 pt-1">
              <label className="block text-sm font-bold text-gray-700">🎒 Наявність реквізиту</label>
              <select value={filterInputs.equipmentStatus} onChange={e => setFilterInputs({...filterInputs, equipmentStatus: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]">
                <option value="any">Не має значення</option>
                <option value="yes">Тільки з реквізитом</option>
                <option value="no">Без реквізиту</option>
              </select>
            </div>

          </div>
          <button onClick={handleApplyFilters} className="mt-6 w-full bg-[#E0F2FE] text-[#60a5fa] font-bold py-3 rounded-xl hover:bg-[#bae6fd] transition-colors shadow-sm">
            Застосувати
          </button>
        </aside>

        {/* ПРАВА КОЛОНКА: Список активностей з Бази Даних */}
        <div className="w-full lg:w-3/4 space-y-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Знайдено активностей: {isLoading ? "..." : displayedActivities.length}
            </h2>
          </div>

          {/* Показуємо текст під час завантаження */}
          {isLoading && (
            <div className="p-10 text-center text-gray-500 font-medium">
              Шукаємо активності в базі даних...
            </div>
          )}

          {/* Показуємо повідомлення, якщо ігор немає */}
          {!isLoading && displayedActivities.length === 0 && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">🏜️</span>
              <p className="text-gray-500 font-medium">За вашим запитом активностей не знайдено.</p>
            </div>
          )}

          {/* Малюємо картку для кожної гри, знайденої в базі */}
          {!isLoading && displayedActivities.map((activity) => (
            <Link
              href={`/activity/${activity.id}`}
              key={activity.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-l-[#FDB8D3] block"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">{activity.title}</h3>

                {/* Якщо в базі є локація, показуємо першу з них */}
                {activity.location && activity.location.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {activity.location[0] === 'outdoor' ? 'Надворі' :
                      activity.location[0] === 'indoor' ? 'Приміщення' :
                        activity.location[0] === 'water' ? 'Біля води' : activity.location[0]}
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed">{activity.short_description}</p>

              <div className="flex flex-wrap gap-3 mt-2">
                {/* Відображаємо вік тільки якщо він заданий */}
                {(activity.age_min || activity.age_max) && (
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                    🎂 {activity.age_min || 0}-{activity.age_max || '18+'} років
                  </span>
                )}

                {/* Відображаємо тривалість діапазоном */}
                {(activity.duration_min || activity.duration_max) && (
                  <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                    ⏳ {activity.duration_min || 0}-{activity.duration_max || '...'} хв
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/propose">
            <button className="bg-[#FDB8D3] text-white font-bold px-8 py-4 rounded-full hover:bg-[#f9a8c8] transition-all text-lg shadow-md">
              + Запропонувати активність
            </button>
          </Link>
          <Link href="/school">
            <button className="bg-[#E0F2FE] text-[#60a5fa] font-bold px-8 py-4 rounded-full hover:bg-[#bae6fd] transition-all text-lg shadow-md">
              Записатись на школу аніматора
            </button>
          </Link>
        </div>
      </footer>
    </main>
  );
}