"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TagSelector from "@/components/TagSelector";
import imageCompression from 'browser-image-compression'; // 🟢 Додано для стиснення фото

const PREDEFINED_CATEGORIES = [
  { id: "vechory", title: "Вечори" },
  { id: "katekhyzatsii", title: "Катехизації" },
  { id: "mali-ihry", title: "Малі ігри" },
  { id: "velyki-ihry", title: "Великі ігри" },
  { id: "maister-klasy", title: "Майстер-класи" },
  { id: "hrupky", title: "Групки" },
  { id: "duelni-ihry", title: "Дуельні ігри" },
  { id: "kvest-tochky", title: "Точки на квест" }
];

const PREDEFINED_LOCATIONS = [
  { id: "indoor", title: "В приміщенні" },
  { id: "outdoor", title: "Надворі" },
  { id: "water", title: "Біля води" }
];

export default function AdminPanelPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  const SECRET_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

  const [pendingActivities, setPendingActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'rejected'>('pending');

  useEffect(() => {
    if (isAuthenticated) {
      fetchActivities();
    }
  }, [isAuthenticated, activeTab]); 

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === SECRET_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert("❌ Невірний пароль! Доступ заборонено.");
      setPasswordInput("");
    }
  };

  async function fetchActivities() {
    setIsLoading(true);
    const statuses = activeTab === 'pending' ? ['pending', 'editing'] : ['rejected'];
    
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .in('status', statuses)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Помилка:", error);
    } else {
      setPendingActivities(data || []);
    }
    setIsLoading(false);
  }

  const handleUpdateField = (id: string, field: string, value: any) => {
    setPendingActivities(prev =>
      prev.map(activity =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  const toggleArrayItem = (id: string, field: string, value: string, currentArray: string[]) => {
    const arr = currentArray || [];
    const newArr = arr.includes(value) ? arr.filter(i => i !== value) : [...arr, value];
    handleUpdateField(id, field, newArr);
  };

  const handleCustomArrayInput = (id: string, field: string, inputValue: string, predefinedList: any[], currentArray: string[]) => {
    const customVals = inputValue.split(',').filter(Boolean);
    const standardVals = (currentArray || []).filter(item => predefinedList.some(p => p.id === item));
    const merged = Array.from(new Set([...standardVals, ...customVals]));
    handleUpdateField(id, field, merged);
  };

  // 🟢 ФУНКЦІЯ ЗАВАНТАЖЕННЯ ФАЙЛІВ ДЛЯ АДМІНА
  const handleFileUpload = async (id: string, files: FileList | null, isImage: boolean, currentUrls: string[]) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const MAX_SIZE = 10 * 1024 * 1024; // 10 МБ

    // Валідація
    for (const file of fileArray) {
      if (isImage && !file.type.startsWith("image/")) {
        alert(`❌ Файл "${file.name}" не є зображенням!`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        alert(`❌ Файл "${file.name}" занадто великий (макс 10 МБ).`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    alert("⏳ Почалось завантаження файлів. Це може зайняти хвилину...");

    const urls: string[] = [];
    for (const file of validFiles) {
      let fileToUpload = file;
      
      if (isImage) {
        try {
          // Стискаємо фото
          fileToUpload = await imageCompression(file, { maxSizeMB: 0.3, maxWidthOrHeight: 1920, useWebWorker: true });
        } catch (error) {
          console.error("Помилка стиснення:", error);
        }
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${isImage ? 'images' : 'documents'}/${fileName}`;

      const { error } = await supabase.storage.from('activities').upload(filePath, fileToUpload);
      if (!error) {
        const { data } = supabase.storage.from('activities').getPublicUrl(filePath);
        urls.push(data.publicUrl);
      } else {
        alert(`❌ Помилка завантаження файлу ${file.name}`);
      }
    }

    if (urls.length > 0) {
      const updatedUrls = [...(currentUrls || []), ...urls];
      handleUpdateField(id, isImage ? 'image_urls' : 'file_urls', updatedUrls);
      alert("✅ Файли успішно завантажено та прикріплено!");
    }
  };

  async function handleApprove(id: string) {
    const confirmApprove = window.confirm("Опублікувати цю гру? Вона стане видимою для всіх.");
    if (!confirmApprove) return;

    const activityToPublish = pendingActivities.find(a => a.id === id);

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
        preparation_time: activityToPublish.preparation_time,
        participants_min: activityToPublish.participants_min,
        participants_max: activityToPublish.participants_max,
        animators_min: activityToPublish.animators_min,
        animators_max: activityToPublish.animators_max,
        has_equipment: activityToPublish.has_equipment,
        equipment: activityToPublish.equipment,
        category_ids: activityToPublish.category_ids?.map((c: string) => c.trim()).filter(Boolean),
        location: activityToPublish.location?.map((l: string) => l.trim()).filter(Boolean),
        tags: activityToPublish.tags?.map((t: string) => t.trim()).filter(Boolean),
        image_urls: activityToPublish.image_urls,
        file_urls: activityToPublish.file_urls
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

    const { error } = await supabase.from('activities').update({ status: 'rejected' }).eq('id', id);
    if (!error) setPendingActivities(pendingActivities.filter(a => a.id !== id));
  }

  async function handleRestore(id: string) {
    const confirmRestore = window.confirm("Відновити цю гру? Вона повернеться у список 'Очікують'.");
    if (!confirmRestore) return;

    const { error } = await supabase.from('activities').update({ status: 'pending' }).eq('id', id);
    if (!error) setPendingActivities(pendingActivities.filter(a => a.id !== id));
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
            <button type="submit" className="w-full bg-[#FDB8D3] text-white font-bold py-4 rounded-xl hover:bg-[#f9a8c8] transition-colors shadow-md text-lg">Увійти</button>
          </form>

          <div className="mt-8">
            <Link href="/" className="text-gray-400 hover:text-gray-600 font-bold text-sm underline">← Повернутися на сайт</Link>
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
            <button onClick={() => setIsAuthenticated(false)} className="text-gray-400 hover:text-white font-bold text-sm">🚪 Вийти</button>
            <Link href="/" className="text-[#44bdf3] hover:text-white font-bold underline">На сайт</Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-8 px-6">
        
        <div className="flex gap-4 mb-8 border-b border-gray-200 pb-4">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`font-bold text-lg px-4 py-2 rounded-xl transition-all ${activeTab === 'pending' ? 'bg-[#FDB8D3] text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            📋 Очікують перевірки
          </button>
          <button 
            onClick={() => setActiveTab('rejected')}
            className={`font-bold text-lg px-4 py-2 rounded-xl transition-all ${activeTab === 'rejected' ? 'bg-red-500 text-white shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
          >
            🗑️ Відхилені
          </button>
        </div>

        <div className="mb-6 flex justify-between items-end">
          <h2 className="text-2xl font-bold text-gray-800">
            {activeTab === 'pending' ? 'Очікують на перевірку' : 'Відхилені активності'}: {pendingActivities.length}
          </h2>
          <button onClick={fetchActivities} className="text-blue-600 hover:underline font-bold text-sm flex items-center gap-1">🔄 Оновити список</button>
        </div>

        {isLoading ? (
          <div className="text-center p-10 text-gray-500 font-bold">Завантаження бази...</div>
        ) : pendingActivities.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl shadow-md border border-gray-100 text-center max-w-xl mx-auto mt-10 transform transition-all">
            <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
              <span className="text-5xl">{activeTab === 'pending' ? '☕' : '✨'}</span>
            </div>
            <h3 className="text-3xl font-extrabold text-gray-950 mb-3 tracking-tight">
              {activeTab === 'pending' ? 'Чудова робота!' : 'Тут порожньо'}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed font-medium">
              {activeTab === 'pending' ? 'Всі запропоновані активності успішно перевірено. Можна відпочити!' : 'Немає жодної відхиленої гри.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingActivities.map((activity) => (
              <div key={activity.id} className={`bg-white p-8 rounded-3xl shadow-md border-l-8 relative ${activeTab === 'rejected' ? 'border-red-400 opacity-80 hover:opacity-100 transition-opacity' : 'border-yellow-400'}`}>

                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div className="w-full">
                    {activity.status === 'pending' && <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">✨ Нова активність</span>}
                    {activity.status === 'editing' && <span className="bg-purple-100 text-purple-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">✏️ На редагуванні</span>}
                    {activity.status === 'rejected' && <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full uppercase mb-3 inline-block">🗑️ Відхилена</span>}

                    <input
                      type="text"
                      value={activity.title || ''}
                      onChange={(e) => handleUpdateField(activity.id, 'title', e.target.value)}
                      className="w-full text-3xl font-bold text-gray-900 border-b-2 border-transparent hover:border-gray-200 focus:border-[#44bdf3] focus:outline-none bg-transparent transition-colors py-1"
                      placeholder="Назва гри..."
                    />
                  </div>

                  <div className="flex gap-3 w-full md:w-auto shrink-0">
                    {activeTab === 'pending' ? (
                      <>
                        <button onClick={() => handleReject(activity.id)} className="flex-1 md:flex-none bg-red-50 text-red-600 border border-red-200 font-bold px-6 py-3 rounded-xl hover:bg-red-100 transition-colors">❌ Відхилити</button>
                        <button onClick={() => handleApprove(activity.id)} className="flex-1 md:flex-none bg-green-500 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-600 transition-colors shadow-sm">✅ Опублікувати</button>
                      </>
                    ) : (
                      <button onClick={() => handleRestore(activity.id)} className="flex-1 md:flex-none bg-yellow-100 text-yellow-700 border border-yellow-300 font-bold px-6 py-3 rounded-xl hover:bg-yellow-200 transition-colors">🔄 Відновити</button>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 space-y-6">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Короткий опис:</h4>
                    <textarea value={activity.short_description || ''} onChange={(e) => handleUpdateField(activity.id, 'short_description', e.target.value)} className="w-full text-gray-600 italic bg-white p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#44bdf3] resize-y min-h-[80px]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-700 mb-2 text-sm uppercase">Повні правила:</h4>
                    <textarea value={activity.full_content || ''} onChange={(e) => handleUpdateField(activity.id, 'full_content', e.target.value)} className="w-full min-h-[200px] text-gray-700 bg-white p-4 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-[#44bdf3] resize-y" />
                  </div>
                </div>

                <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase px-2">Технічні параметри:</h4>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6 px-2">
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Вік (від-до)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.age_min || ''} onChange={(e) => handleUpdateField(activity.id, 'age_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.age_max || ''} onChange={(e) => handleUpdateField(activity.id, 'age_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Час у хв</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.duration_min || ''} onChange={(e) => handleUpdateField(activity.id, 'duration_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.duration_max || ''} onChange={(e) => handleUpdateField(activity.id, 'duration_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Підготовка (хв)</span>
                    <div className="flex items-center gap-2 h-full pb-1">
                      <input type="number" value={activity.preparation_time || ''} onChange={(e) => handleUpdateField(activity.id, 'preparation_time', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" placeholder="0" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Учасники</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.participants_min || ''} onChange={(e) => handleUpdateField(activity.id, 'participants_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.participants_max || ''} onChange={(e) => handleUpdateField(activity.id, 'participants_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-gray-200">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-1">Аніматори (мін-макс)</span>
                    <div className="flex items-center gap-2">
                      <input type="number" value={activity.animators_min || ''} onChange={(e) => handleUpdateField(activity.id, 'animators_min', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                      <span>-</span>
                      <input type="number" value={activity.animators_max || ''} onChange={(e) => handleUpdateField(activity.id, 'animators_max', parseInt(e.target.value) || null)} className="w-full bg-gray-50 p-1 rounded text-center border focus:border-blue-400 focus:outline-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2 mb-6">
                  {/* КАТЕГОРІЇ */}
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-3">Категорії:</span>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {PREDEFINED_CATEGORIES.map(cat => {
                        const isSelected = (activity.category_ids || []).includes(cat.id);
                        return (
                          <button key={cat.id} onClick={() => toggleArrayItem(activity.id, 'category_ids', cat.id, activity.category_ids)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isSelected ? 'bg-[#FDB8D3] border-[#FDB8D3] text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                            {isSelected ? '✓ ' : '+ '}{cat.title}
                          </button>
                        );
                      })}
                    </div>
                    <input type="text" value={(activity.category_ids || []).filter((id: string) => !PREDEFINED_CATEGORIES.find(c => c.id === id)).join(', ')} onChange={(e) => handleCustomArrayInput(activity.id, 'category_ids', e.target.value, PREDEFINED_CATEGORIES, activity.category_ids)} className="w-full bg-gray-50 p-2 text-sm border border-gray-200 rounded-lg focus:border-[#44bdf3] focus:outline-none" placeholder="Кастомні (через кому)..." />
                  </div>

                  {/* ЛОКАЦІЇ */}
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-3">Локації:</span>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {PREDEFINED_LOCATIONS.map(loc => {
                        const isSelected = (activity.location || []).includes(loc.id);
                        return (
                          <button key={loc.id} onClick={() => toggleArrayItem(activity.id, 'location', loc.id, activity.location)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${isSelected ? 'bg-[#44bdf3] border-[#44bdf3] text-white shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}>
                            {isSelected ? '✓ ' : '+ '}{loc.title}
                          </button>
                        );
                      })}
                    </div>
                    <input type="text" value={(activity.location || []).filter((id: string) => !PREDEFINED_LOCATIONS.find(c => c.id === id)).join(', ')} onChange={(e) => handleCustomArrayInput(activity.id, 'location', e.target.value, PREDEFINED_LOCATIONS, activity.location)} className="w-full bg-gray-50 p-2 text-sm border border-gray-200 rounded-lg focus:border-[#44bdf3] focus:outline-none" placeholder="Кастомні (через кому)..." />
                  </div>

                  {/* ТЕГИ */}
                  <div className="bg-white border border-gray-200 p-4 rounded-xl">
                    <span className="text-xs text-gray-500 font-bold uppercase block mb-3">Хештеги (Настрій):</span>
                    <TagSelector selectedTags={activity.tags || []} onChange={newTags => handleUpdateField(activity.id, 'tags', newTags)} placeholder="Шукати або створити..." />
                  </div>

                  {/* РЕКВІЗИТ */}
                  <div className="md:col-span-3 bg-white p-4 border border-gray-200 rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-700 whitespace-nowrap">
                      <input type="checkbox" checked={activity.has_equipment || false} onChange={(e) => handleUpdateField(activity.id, 'has_equipment', e.target.checked)} className="w-5 h-5 accent-red-500" />
                      🎒 Потрібен реквізит
                    </label>
                    {activity.has_equipment && (
                      <input type="text" value={activity.equipment || ''} onChange={(e) => handleUpdateField(activity.id, 'equipment', e.target.value)} placeholder="Наприклад: м'яч, 10 аркушів паперу, маркери..." className="w-full bg-gray-50 p-2 rounded-xl border focus:border-red-400 focus:outline-none" />
                    )}
                  </div>
                </div>

                {/* 🟢 БЛОК КЕРУВАННЯ МАТЕРІАЛАМИ В АДМІНЦІ (ТЕПЕР ІЗ ЗАВАНТАЖЕННЯМ) */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 mx-2 mb-6 shadow-sm">
                  <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase">📎 Прикріплені матеріали:</h4>

                  <div className="mb-6 border-b border-gray-100 pb-5">
                    <span className="text-xs text-gray-500 font-bold block mb-2">ФОТОГРАФІЇ ТА СХЕМИ:</span>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {activity.image_urls?.map((url: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg group">
                          <a href={url} target="_blank" className="text-[#44bdf3] hover:underline text-sm font-bold">Фото {i + 1}</a>
                          <button onClick={() => handleUpdateField(activity.id, 'image_urls', activity.image_urls.filter((u: string) => u !== url))} className="text-gray-400 hover:text-red-500 font-bold ml-2 text-lg leading-none">×</button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input 
                        type="text" 
                        placeholder="Вставити пряме посилання на нове фото..." 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) handleUpdateField(activity.id, 'image_urls', [...(activity.image_urls || []), val]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full bg-gray-50 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#44bdf3]"
                      />
                      <span className="text-xs font-bold text-gray-400 uppercase">або</span>
                      <input 
                        type="file" 
                        multiple 
                        accept="image/*"
                        onChange={(e) => handleFileUpload(activity.id, e.target.files, true, activity.image_urls)}
                        className="text-sm w-full sm:w-auto file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#44bdf3]/10 file:text-[#44bdf3] hover:file:bg-[#44bdf3]/20 cursor-pointer"
                        title="Завантажити з комп'ютера"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 font-bold block mb-2">ДОКУМЕНТИ ТА ФАЙЛИ:</span>
                    <div className="flex gap-2 flex-wrap mb-3">
                      {activity.file_urls?.map((url: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-green-50 border border-green-100 px-3 py-1.5 rounded-lg group">
                          <a href={url} target="_blank" className="text-green-600 hover:underline text-sm font-bold">Файл {i + 1}</a>
                          <button onClick={() => handleUpdateField(activity.id, 'file_urls', activity.file_urls.filter((u: string) => u !== url))} className="text-gray-400 hover:text-red-500 font-bold ml-2 text-lg leading-none">×</button>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-center">
                      <input 
                        type="text" 
                        placeholder="Вставити пряме посилання на документ..." 
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = (e.target as HTMLInputElement).value.trim();
                            if (val) handleUpdateField(activity.id, 'file_urls', [...(activity.file_urls || []), val]);
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                        className="w-full bg-gray-50 p-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-green-400"
                      />
                      <span className="text-xs font-bold text-gray-400 uppercase">або</span>
                      <input 
                        type="file" 
                        multiple 
                        accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.mp3,.wav,.mp4,.mov,.zip,.rar,.7z,.svg"
                        onChange={(e) => handleFileUpload(activity.id, e.target.files, false, activity.file_urls)}
                        className="text-sm w-full sm:w-auto file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
                        title="Завантажити з комп'ютера"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}