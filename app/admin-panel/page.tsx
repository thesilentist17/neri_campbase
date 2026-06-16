"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPanelPage() {
  // --- АВТОРИЗАЦІЯ ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // 🔴 ТУТ ВКАЖИ СВІЙ ПАРОЛЬ 🔴
  const SECRET_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  // --- ДАНІ АДМІН-ПАНЕЛІ ---
  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Завантажуємо ігри тільки після успішного входу
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
      setPasswordInput(""); // Очищаємо поле
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

  async function handleApprove(id: string) {
    const confirmApprove = window.confirm("Опублікувати цю гру? Вона стане видимою для всіх.");
    if (!confirmApprove) return;

    // Знаходимо гру, яку зараз публікуємо, щоб взяти її (можливо відредагований) текст
    const activityToPublish = pendingActivities.find(a => a.id === id);

    const { error } = await supabase
      .from('activities')
      .update({
        status: 'published',
        full_content: activityToPublish.full_content // Зберігаємо твої виправлення
      })
      .eq('id', id);

    if (!error) {
      setPendingActivities(pendingActivities.filter(a => a.id !== id));
      alert("✅ Гру успішно опубліковано!");
    } else {
      alert("❌ Сталася помилка при публікації.");
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

  // ЕКРАН ВХОДУ (якщо не авторизований)
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

  // ОСНОВНА АДМІН-ПАНЕЛЬ (якщо авторизований)
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
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-200 text-center">
            <span className="text-5xl block mb-4">🎉</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Все чисто!</h3>
            <p className="text-gray-500">Немає жодної гри, яка б чекала на модерацію.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className="bg-white p-8 rounded-3xl shadow-md border-l-8 border-yellow-400 relative">

                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    {activity.status === 'pending' ? (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">
                        ✨ Нова активність
                      </span>
                    ) : (
                      <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">
                        ✏️ На редагуванні
                      </span>
                    )}
                    <h3 className="text-3xl font-bold text-gray-900">{activity.title}</h3>
                  </div>

                  <div className="flex gap-3 w-full md:w-auto">
                    <button
                      onClick={() => handleReject(activity.id)}
                      className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      ❌ Відхилити
                    </button>
                    <button
                      onClick={() => handleApprove(activity.id)}
                      className="flex-1 md:flex-none bg-green-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                    >
                      ✅ Опублікувати
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6">
                  <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Короткий опис:</h4>
                  <p className="text-gray-600 mb-6 italic">{activity.short_description}</p>

                  <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Повні правила (можна редагувати):</h4>
                  <textarea
                    value={activity.full_content}
                    onChange={(e) => {
                      // Оновлюємо текст конкретної гри під час вводу
                      setPendingActivities(pendingActivities.map(a =>
                        a.id === activity.id ? { ...a, full_content: e.target.value } : a
                      ));
                    }}
                    className="w-full min-h-[200px] text-gray-700 bg-white p-4 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#44bdf3] resize-y"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Використовуй <b>**жирний текст**</b> або <b>## Заголовок</b> для форматування.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-500">
                  <span className="bg-gray-100 px-3 py-1 rounded-lg">Категорії: {activity.category_ids?.join(", ")}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-lg">Вік: {activity.age_min}-{activity.age_max}</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-lg">Час: {activity.duration_min}-{activity.duration_max} хв</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-lg">Учасники: {activity.participants_min}-{activity.participants_max}</span>
                  {activity.has_equipment && <span className="bg-red-50 text-red-500 px-3 py-1 rounded-lg">Є реквізит</span>}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}