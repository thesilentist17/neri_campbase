"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoriesList = [
  { id: "vechory", title: "Вечори" },
  { id: "katekhyzatsii", title: "Катехизації" },
  { id: "mali-ihry", title: "Малі ігри" },
  { id: "velyki-ihry", title: "Великі ігри" },
  { id: "maister-klasy", title: "Майстер-класи" },
  { id: "hrupky", title: "Групки" },
  { id: "duelni-ihry", title: "Дуельні ігри" },
  { id: "kvest-tochky", title: "Точки на квест" }
];

const locationsMap: Record<string, string> = {
  "indoor": "В приміщенні",
  "outdoor": "Надворі",
  "water": "Біля води"
};

// 🟢 НАШІ ТЕГИ
const tagsMap: Record<string, string> = {
  "znayomstvo": "Знайомство",
  "kryholamy": "Криголами",
  "rukhlyvi": "Рухливі",
  "spokiyni": "Спокійні",
  "lohika": "На логіку",
  "komandni": "Командні",
  "tantsyuvalni": "Танцювальні",
  "voda": "З водою"
};

const tagsList = Object.keys(tagsMap).map(key => ({ id: key, title: tagsMap[key] }));

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [showDetails, setShowDetails] = useState(true);

  // 🟢 ДОДАЛИ МАСИВ ТЕГІВ ДО ФІЛЬТРІВ
  const [filterInputs, setFilterInputs] = useState({
    searchTitle: "",
    age: "",
    duration: "",
    participants: "",
    animators: "",
    equipmentStatus: "any",
    location: "any",
    tags: [] as string[]
  });

  const [appliedFilters, setAppliedFilters] = useState({
    searchTitle: "",
    age: "",
    duration: "",
    participants: "",
    animators: "",
    equipmentStatus: "any",
    location: "any",
    tags: [] as string[]
  });

  const currentCategory = categoriesList.find(c => c.id === id);
  const title = currentCategory ? currentCategory.title : "Категорія не знайдена";

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function fetchActivities() {
      setIsLoading(true);

      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .contains('category_ids', [id])
        .eq('status', 'published');

      if (error) {
        console.error("Помилка завантаження:", error);
      } else {
        setActivities(data || []);
      }

      setIsLoading(false);
    }

    fetchActivities();
  }, [id]);

  const handleApplyFilters = () => {
    setAppliedFilters(filterInputs);
    setCurrentPage(1); 
    setIsFiltersOpen(false); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); 
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🟢 ФУНКЦІЯ ПЕРЕМИКАННЯ ТЕГІВ У ФІЛЬТРІ
  const handleTagToggle = (tagId: string) => {
    setFilterInputs(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId) 
        ? prev.tags.filter(t => t !== tagId) 
        : [...prev.tags, tagId]
    }));
  };

  const displayedActivities = activities.filter(a => {
    if (appliedFilters.searchTitle) {
      if (!a.title.toLowerCase().includes(appliedFilters.searchTitle.toLowerCase())) return false;
    }
    if (appliedFilters.age) {
      const val = parseInt(appliedFilters.age);
      if (a.age_min !== null && val < a.age_min) return false;
      if (a.age_max !== null && val > a.age_max) return false;
    }
    if (appliedFilters.duration) {
      const val = parseInt(appliedFilters.duration);
      if (a.duration_min !== null && val < a.duration_min) return false;
      if (a.duration_max !== null && val > a.duration_max) return false;
    }
    if (appliedFilters.participants) {
      const val = parseInt(appliedFilters.participants);
      if (a.participants_min !== null && val < a.participants_min) return false;
      if (a.participants_max !== null && val > a.participants_max) return false;
    }
    if (appliedFilters.animators) {
      const val = parseInt(appliedFilters.animators);
      if (a.animators_min !== null && val < a.animators_min) return false;
    }
    if (appliedFilters.equipmentStatus === "yes" && !a.has_equipment) return false;
    if (appliedFilters.equipmentStatus === "no" && a.has_equipment) return false;
    if (appliedFilters.location !== "any") {
      if (!a.location || !a.location.includes(appliedFilters.location)) return false;
    }
    // 🟢 ЛОГІКА ФІЛЬТРАЦІЇ ЗА ТЕГАМИ (шукаємо ігри, які містять ВСІ обрані теги)
    if (appliedFilters.tags.length > 0) {
      if (!a.tags || a.tags.length === 0) return false;
      const hasAllTags = appliedFilters.tags.every(t => a.tags.includes(t));
      if (!hasAllTags) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(displayedActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = displayedActivities.slice(startIndex, startIndex + itemsPerPage);

  return (
    <main className="min-h-screen bg-gray-50 font-sans flex flex-col relative">

      <div className="bg-[#FDB8D3] p-6 lg:p-10 text-white shadow-md relative z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3 flex justify-center md:justify-start">
            <Link href="/" className="text-white/80 hover:text-white font-bold flex items-center gap-2 transition-colors w-fit">
              ← На головну
            </Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-wide text-center w-full md:w-1/3">
            {title}
          </h1>
          
          <div className="w-full md:w-1/3 flex justify-center md:justify-end relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-white/20 hover:bg-white/30 border border-white/50 text-white px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 backdrop-blur-sm"
            >
              Змінити категорію
              <svg className={`w-5 h-5 transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden text-gray-800 flex flex-col z-[100]">
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

      <div className="max-w-7xl mx-auto mt-6 lg:mt-10 px-4 lg:px-6 flex flex-col lg:flex-row gap-6 lg:gap-8 relative z-10 flex-grow w-full mb-16 items-start">

        <aside 
          className="w-full lg:w-1/4 bg-white p-5 sm:p-6 rounded-3xl shadow-lg border border-gray-100 sticky top-4 z-40 transition-all overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 2rem)', scrollbarWidth: 'none' }}
        >
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="w-full flex justify-between items-center lg:pointer-events-none"
          >
            <h2 className="text-xl font-bold text-gray-800 lg:border-b lg:border-gray-100 lg:pb-4 w-full text-left">Фільтри пошуку</h2>
            <svg className={`w-6 h-6 text-gray-500 lg:hidden transition-transform duration-300 ${isFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>

          <div className={`mt-6 ${isFiltersOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="space-y-4 text-gray-600">

              <div className="space-y-1 pb-2 border-b border-gray-100">
                <label className="block text-sm font-bold text-gray-700">🔍 Пошук за назвою</label>
                <input type="text" placeholder="Введіть назву гри..." value={filterInputs.searchTitle} onChange={e => setFilterInputs({ ...filterInputs, searchTitle: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
              </div>

              {/* 🟢 БЛОК ФІЛЬТРАЦІЇ ЗА ТЕГАМИ */}
              <div className="space-y-2 pt-2 border-b border-gray-100 pb-4">
                <label className="block text-sm font-bold text-gray-700">🏷️ Хештеги (настрій)</label>
                <div className="flex flex-wrap gap-1.5">
                  {tagsList.map(tag => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        filterInputs.tags.includes(tag.id)
                          ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      #{tag.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <label className="block text-sm font-bold text-gray-700">📍 Локація</label>
                <select value={filterInputs.location} onChange={e => setFilterInputs({ ...filterInputs, location: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]">
                  <option value="any">Будь-де (Всі локації)</option>
                  <option value="indoor">В приміщенні</option>
                  <option value="outdoor">Надворі</option>
                  <option value="water">Біля води</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">🎂 Вік дитини (років)</label>
                <input type="number" placeholder="Наприклад: 10" value={filterInputs.age} onChange={e => setFilterInputs({ ...filterInputs, age: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">⏳ Скільки маєте часу (хв)</label>
                <input type="number" placeholder="Наприклад: 45" value={filterInputs.duration} onChange={e => setFilterInputs({ ...filterInputs, duration: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">👥 Кількість учасників</label>
                <input type="number" placeholder="Наприклад: 25" value={filterInputs.participants} onChange={e => setFilterInputs({ ...filterInputs, participants: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-bold text-gray-700">🧑‍💼 Скільки є аніматорів</label>
                <input type="number" placeholder="Наприклад: 3" value={filterInputs.animators} onChange={e => setFilterInputs({ ...filterInputs, animators: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]" />
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-sm font-bold text-gray-700">🎒 Наявність реквізиту</label>
                <select value={filterInputs.equipmentStatus} onChange={e => setFilterInputs({ ...filterInputs, equipmentStatus: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#44bdf3]">
                  <option value="any">Не має значення</option>
                  <option value="yes">Тільки з реквізитом</option>
                  <option value="no">Без реквізиту</option>
                </select>
              </div>

            </div>
            <button onClick={handleApplyFilters} className="mt-6 w-full bg-[#E0F2FE] text-[#60a5fa] font-bold py-3 rounded-xl hover:bg-[#bae6fd] transition-colors shadow-sm">
              Застосувати
            </button>
          </div>
        </aside>

        <div className="w-full lg:w-3/4 space-y-6">
          
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-4 gap-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">
              Знайдено: {isLoading ? "..." : displayedActivities.length}
            </h2>
            
            {!isLoading && displayedActivities.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 bg-white p-2.5 px-4 rounded-2xl border border-gray-200 shadow-sm w-full xl:w-auto justify-between xl:justify-start">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={showDetails}
                    onChange={(e) => setShowDetails(e.target.checked)}
                    className="w-5 h-5 text-[#44bdf3] rounded border-gray-300 focus:ring-[#44bdf3] cursor-pointer"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-[#44bdf3] transition-colors">
                    Детальні картки
                  </span>
                </label>

                <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-500">Показувати по:</span>
                  <select 
                    value={itemsPerPage} 
                    onChange={handleItemsPerPageChange}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm font-bold text-gray-800 focus:outline-none focus:border-[#44bdf3] cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {isLoading && (
            <div className="space-y-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="h-8 bg-gray-200 rounded-xl w-3/4 md:w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-20 hidden sm:block"></div>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex gap-2 mt-2 pt-3 border-t border-gray-50">
                    <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                    <div className="h-8 w-24 bg-gray-100 rounded-lg"></div>
                    <div className="h-8 w-32 bg-gray-100 rounded-lg hidden sm:block"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && displayedActivities.length === 0 && (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center gap-4">
              <span className="text-4xl">🏜️</span>
              <p className="text-gray-500 font-medium">За вашим запитом активностей не знайдено.</p>
            </div>
          )}

          {!isLoading && paginatedActivities.map((activity) => (
            <Link
              href={`/activity/${activity.id}`}
              key={activity.id}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-transparent hover:border-l-[#FDB8D3] block"
            >
              <div className="flex justify-between items-start">
                <h3 className="text-2xl font-bold text-gray-900">{activity.title}</h3>
                {/* 🟢 КІЛЬКІСТЬ ПЕРЕГЛЯДІВ В КУТКУ КАРТКИ */}
                <span className="text-sm font-bold text-gray-400 flex items-center gap-1.5 shrink-0 mt-1 bg-gray-50 px-2.5 py-1 rounded-lg">
                  👁️ {activity.views || 0}
                </span>
              </div>

              <p className="text-gray-600 leading-relaxed">{activity.short_description}</p>

              {showDetails && (
                <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-50">
                  
                  {/* 🟢 ВИВІД ХЕШТЕГІВ НА КАРТЦІ */}
                  {activity.tags?.map((tagId: string, index: number) => (
                    <span key={`tag-${index}`} className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-sm px-3 py-1 rounded-lg font-bold flex items-center gap-1.5">
                      #{tagsMap[tagId] || tagId}
                    </span>
                  ))}

                  {(activity.age_min || activity.age_max) && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-200 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      🎂 Вік: {activity.age_min || 0}-{activity.age_max || '18+'} р.
                    </span>
                  )}

                  {(activity.duration_min || activity.duration_max) && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-200 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      ⏳ Гра: {activity.duration_min || 0}-{activity.duration_max || '...'} хв
                    </span>
                  )}

                  {activity.preparation_time !== null && activity.preparation_time !== undefined && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-200 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      🛠 Підготовка: {activity.preparation_time} хв
                    </span>
                  )}

                  {(activity.participants_min || activity.participants_max) && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-200 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      👥 Учасники: {activity.participants_min || 1}-{activity.participants_max || '∞'}
                    </span>
                  )}

                  {activity.animators_min && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-200 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      🧑‍💼 Необхідно аніматорів: {activity.animators_min}
                    </span>
                  )}

                  {activity.location?.map((loc: string, index: number) => (
                    <span key={index} className="bg-blue-50 text-blue-600 border border-blue-100 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      📍 {loc === 'outdoor' ? 'Надворі' :
                          loc === 'indoor' ? 'В приміщенні' :
                          loc === 'water' ? 'Біля води' : loc}
                    </span>
                  ))}

                  {!activity.has_equipment && (
                    <span className="bg-green-50 text-green-600 border border-green-100 text-sm px-3 py-1 rounded-lg font-medium flex items-center gap-1.5">
                      ✅ Не потрібно реквізиту
                    </span>
                  )}
                </div>
              )}
            </Link>
          ))}

          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  scrollToTop();
                }}
                disabled={currentPage === 1}
                className="px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                ← Назад
              </button>
              
              <span className="font-extrabold text-gray-500">
                {currentPage} / {totalPages}
              </span>

              <button 
                onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  scrollToTop();
                }}
                disabled={currentPage === totalPages}
                className="px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm flex items-center gap-2"
              >
                Вперед →
              </button>
            </div>
          )}

        </div>
      </div>

      <footer className="bg-white border-t border-gray-200 py-10 px-6">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-4">
          <Link href="/propose">
            <button className="w-full md:w-auto bg-[#FDB8D3] text-white font-bold px-8 py-4 rounded-full hover:bg-[#f9a8c8] transition-all text-lg shadow-md">
              + Запропонувати активність
            </button>
          </Link>
          <Link href="/school">
            <button className="w-full md:w-auto bg-[#E0F2FE] text-[#60a5fa] font-bold px-8 py-4 rounded-full hover:bg-[#bae6fd] transition-all text-lg shadow-md">
              Записатись на школу аніматора
            </button>
          </Link>
        </div>
      </footer>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 md:bottom-10 md:right-10 p-4 rounded-full bg-[#44bdf3] text-white shadow-2xl transition-all duration-300 z-50 hover:bg-[#32b0e6] hover:scale-110 active:scale-95 ${
          showTopBtn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Повернутися вгору"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
        </svg>
      </button>

    </main>
  );
}