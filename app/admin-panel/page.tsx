"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPanelPage() {
  // --- АВТОРИЗАЦІЯ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const SECRET_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // --- ДАНІ АДМІН-ПАНЕЛІ ---
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPendingActivities();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("❌ Невірний пароль! Доступ заборонено.");
      setPasswordInput("");
    }
  };

  async function fetchPendingActivities() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .in('status', ['pending', 'editing'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Помилка:", error);
    } else {
      setPendingActivities(data || []);
    }
    setIsLoading(false);
  }

  // 🟢 Універсальна функція для оновлення будь-якого поля в стані
  const handleUpdateField = (id: string, field: string, value: any) => {
    setPendingActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  async function handleApprove(id: string) {
    const confirmApprove = window.confirm("Опублікувати цю гру? Вона стане видимою для всіх.");
    if (!confirmApprove) return;

    const activityToPublish = pendingActivities.find(a => a.id === id);

    // 🟢 Тепер ми передаємо в базу ВСІ відредаговані поля
    const { error } = await supabase
      .from('activities')
      .update({
        status: 'published',
        title: activityToPublish.title,
        short_description: activityToPublish.short_description,
        full_content: activityToPublish.full_content,
        age_min: activityToPublish.age_min,
        age_max: activityToPublish.age_max,
        duration_min: activityToPublish.duration_min,
        duration_max: activityToPublish.duration_max,
        participants_min: activityToPublish.participants_min,
        participants_max: activityToPublish.participants_max,
        animators_min: activityToPublish.animators_min,
        animators_max: activityToPublish.animators_max,
        preparation_time: activityToPublish.preparation_time,
        has_equipment: activityToPublish.has_equipment,
        equipment: activityToPublish.equipment,
        category_ids: activityToPublish.category_ids,
        location: activityToPublish.location
      })
      .eq('id', id);

    if (!error) {
      setPendingActivities(pendingActivities.filter(a => a.id !== id));
      alert("✅ Гру успішно опубліковано!");
    } else {
      alert("❌ Сталася помилка при публікації.");
      console.error(error);
    }
  }

  async function handleReject(id: string) {
    const confirmReject = window.confirm("УВАГА! Ви дійсно хочете відхилити та приховати цю гру?");
    if (!confirmReject) return;

    const { error } = await supabase
      .from('activities')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (!error) {
      setPendingActivities(pendingActivities.filter(a => a.id !== id));
    }
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-gray-900 flex items-center justify-center font-sans px-4">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🔒</span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Доступ закрито</h1>
          <p className="text-gray-500 mb-8">Будь ласка, введіть пароль модератора</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Пароль..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-center text-xl tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FDB8D3]"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#FDB8D3] text-white font-bold py-4 rounded-xl hover:bg-[#f9a8c8] transition-colors shadow-md text-lg"
            >
              Увійти
            </button>
          </form>

          <div className="mt-8">
            <Link href="/" className="text-gray-400 hover:text-gray-600 font-bold text-sm underline">
              ← Повернутися на сайт
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 font-sans pb-20">
      <div className="bg-gray-900 p-6 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🛡️</span>
            <div>
              <h1 className="text-2xl font-extrabold uppercase tracking-widest text-[#FDB8D3]">Панель Модератора</h1>
              <p className="text-gray-400 text-sm">Керування запропонованими активностями</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-white font-bold text-sm">
              🚪 Вийти
            </button>
            <Link href="/" className="text-[#44bdf3] hover:text-white font-bold underline">
              На сайт
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-10 px-6">
        <div className="mb-8 flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-800">
            Очікують на перевірку: {pendingActivities.length}
          </h2>
          <button onClick={fetchPendingActivities} className="text-blue-600 hover:underline font-bold text-sm flex items-center gap-1">
            🔄 Оновити список
          </button>
        </div>

        {isLoading ? (
          <div className="text-center p-10 text-gray-500 font-bold">Завантаження бази...</div>
        ) : pendingActivities.length === 0 ? (
          /* 🟢 ОНОВЛЕНИЙ КРАСИВИЙ СТАН "ПОРОЖНЬО" */
          <div className="bg-white p-16 rounded-3xl shadow-md border border-gray-100 text-center max-w-xl mx-auto mt-10 transform transition-all">
            <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
              <span className="text-5xl">☕</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-950 mb-3 tracking-tight">
              Чудова робота!
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              Всі запропоновані активності успішно перевірено. <br />
              Можна відпочити!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className="bg-white p-8 rounded-3xl shadow-md border-l-8 border-yellow-400 relative">

                {/* ШАПКА КАРТКИ */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="w-full">
                    {activity.status === 'pending' ? (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">✨ Нова активність</span>
                    ) : (
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">✏️ На редагуванні</span>
                    )}

                    {/* 🟢 РЕДАГУВАННЯ НАЗВИ */}
                    <input
                      type="text"
                      value={activity.title || ''}
                      onChange={(e) => handleUpdateField(activity.id, 'title', e.target.value)}
                      className="w-full text-3xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-[#44bdf3] focus:outline-none bg-transparent transition-colors py-1"
                      placeholder="Назва гри..."
                    />
                  </div>

                  <div className="flex gap-3 w-full md:w-auto shrink-0">
                    <button onClick={() => handleReject(activity.id)} className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-colors">
                      ❌ Відхилити
                    </button>
                    <button onClick={() => handleApprove(activity.id)} className="flex-1 md:flex-none bg-green-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-sm">
                      ✅ Опублікувати
                    </button>
                  </div>
                </div>

                {/* 🟢 РЕДАГУВАННЯ ОСНОВНИХ ТЕКСТІВ */}
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-6">

                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Короткий опис:</h4>
                    <textarea
                      value={activity.short_description || ''}
                      onChange={(e) => handleUpdateField(activity.id, 'short_description', e.target.value)}
                      className="w-full text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#44bdf3] resize-y min-h-[80px]"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Повні правила:</h4>
                    <textarea
                      value={activity.full_content || ''}
                      onChange={(e) => handleUpdateField(activity.id, 'full_content', e.target.value)}
                      className="w-full min-h-[200px] text-gray-700 bg-white p-4 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#44bdf3] resize-y"
                    />
                  </div>

                </div>

                {/* 🟢 РЕДАГУВАННЯ ЧИСЛОВИХ ПАРАМЕТРІВ (СІТКА) */}
                <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase px-2">Технічні параметри:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 px-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Вік (від-до)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.age_min || ''} onChange={(e) => handleUpdateField(activity.id, 'age_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.age_max || ''} onChange={(e) => handleUpdateField(activity.id, 'age_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Час у хв (від-до)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.duration_min || ''} onChange={(e) => handleUpdateField(activity.id, 'duration_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.duration_max || ''} onChange={(e) => handleUpdateField(activity.id, 'duration_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Учасники (від-до)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.participants_min || ''} onChange={(e) => handleUpdateField(activity.id, 'participants_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.participants_max || ''} onChange={(e) => handleUpdateField(activity.id, 'participants_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Аніматори (від-до)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.animators_min || ''} onChange={(e) => handleUpdateField(activity.id, 'animators_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.animators_max || ''} onChange={(e) => handleUpdateField(activity.id, 'animators_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

                {/* 🟢 КАТЕГОРІЇ, ЛОКАЦІЇ ТА РЕКВІЗИТ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 mb-6">
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Категорії (через кому)</span>
                    <input
                      type="text"
                      value={(activity.category_ids || []).join(', ')}
                      onChange={(e) => handleUpdateField(activity.id, 'category_ids', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full bg-white p-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="vechory, mali-ihry..."
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-tight">
                      <span className="font-bold text-gray-500">Доступні ключі:</span> vechory, katekhyzatsii, mali-ihry, velyki-ihry, maister-klasy, hrupky
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Локації (через кому)</span>
                    <input
                      type="text"
                      value={(activity.location || []).join(', ')}
                      onChange={(e) => handleUpdateField(activity.id, 'location', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                      className="w-full bg-white p-2 border border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                      placeholder="indoor, outdoor..."
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 leading-tight">
                      <span className="font-bold text-gray-500">Доступні ключі:</span> indoor (в приміщенні), outdoor (надворі), water (біля води)
                    </p>
                  </div>
                  <div className="md:col-span-2 bg-white p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center mt-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={activity.has_equipment || false}
                        onChange={(e) => handleUpdateField(activity.id, 'has_equipment', e.target.checked)}
                        className="w-5 h-5 accent-red-500"
                      />
                      🎒 Потрібен реквізит
                    </label>
                    {activity.has_equipment && (
                      <input
                        type="text"
                        value={activity.equipment || ''}
                        onChange={(e) => handleUpdateField(activity.id, 'equipment', e.target.value)}
                        placeholder="Наприклад: м'яч, 10 аркушів паперу, маркери..."
                        className="w-full bg-gray-50 p-2 rounded-xl border focus:border-red-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>

                {/* БЛОК ПРИКРІПЛЕНИХ МАТЕРІАЛІВ */}
                {(activity.image_urls?.length > 0 || activity.file_urls?.length > 0) && (
                  <div className="bg-white p-4 rounded-xl border border-gray-200 mx-2">
                    <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">📎 Прикріплені матеріали:</h4>

                    {activity.image_urls?.length > 0 && (
                      <div className="mb-3">
                        <span className="text-xs text-gray-500 font-bold block mb-1">ФОТО:</span>
                        <div className="flex gap-2 flex-wrap">
                          {activity.image_urls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" className="text-[#44bdf3] hover:underline text-sm font-medium">
                              🖼️ Переглянути фото {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {activity.file_urls?.length > 0 && (
                      <div>
                        <span className="text-xs text-gray-500 font-bold block mb-1">ДОКУМЕНТИ:</span>
                        <div className="flex gap-2 flex-wrap">
                          {activity.file_urls.map((url: string, i: number) => (
                            <a key={i} href={url} target="_blank" className="text-green-600 hover:underline text-sm font-medium">
                              📄 Переглянути файл {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}