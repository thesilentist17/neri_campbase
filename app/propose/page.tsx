"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categoriesList = [
  { id: "vechory", title: "Вечори" },
  { id: "katekhyzatsii", title: "Катехизації" },
  { id: "mali-ihry", title: "Малі ігри" },
  { id: "velyki-ihry", title: "Великі ігри" },
  { id: "maister-klasy", title: "Майстер-класи" },
  { id: "hrupky", title: "Групки" }
];

const locationsList = [
  { id: "indoor", title: "В приміщенні" },
  { id: "outdoor", title: "Надворі" },
  { id: "water", title: "Біля води" },
  { id: "other", title: "Інше (свій варіант)" }
];

export default function ProposePage() {
  // Текстові стани
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [locationIds, setLocationIds] = useState<string[]>([]);
  const [customLocation, setCustomLocation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [hasEquipment, setHasEquipment] = useState(false);
  const [equipment, setEquipment] = useState("");

  // Числові стани
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [participantsMin, setParticipantsMin] = useState("");
  const [participantsMax, setParticipantsMax] = useState("");
  const [animatorsMin, setAnimatorsMin] = useState("");
  const [animatorsMax, setAnimatorsMax] = useState("");
  const [prepTime, setPrepTime] = useState("");

  // Стани для файлів
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Системні стани
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const toggleCategory = (id: string) => {
    setCategoryIds(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const toggleLocation = (id: string) => {
    setLocationIds(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  // 🟢 ОБРОБНИК ТА ВАЛІДАТОР ДЛЯ ФОТОГРАФІЙ
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages: File[] = [];
    const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 МБ у байтах

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`❌ Файл "${file.name}" не є зображенням! Можна завантажувати лише фото.`);
        e.target.value = "";
        setSelectedImages([]);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`❌ Фото "${file.name}" занадто велике! Максимально дозволений розмір — 5 МБ.`);
        e.target.value = "";
        setSelectedImages([]);
        return;
      }
      validImages.push(file);
    }
    setSelectedImages(validImages);
  };

  // 🟢 ОБРОБНИК ТА ВАЛІДАТОР ДЛЯ ДОКУМЕНТІВ (ДОДАНО ПРЕЗЕНТАЦІЇ ТА ТАБЛИЦІ)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ у байтах
    // Додали формати PowerPoint та Excel
    const allowedExtensions = [
      "pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx", "csv", // Документи та таблиці
      "mp3", "wav", // Аудіо
      "mp4", "mov", // Відео (з обережністю!)
      "zip", "rar", "7z", , // Архіви
      "svg"  // Векторна графіка
    ];

    for (const file of files) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || "";

      if (!allowedExtensions.includes(fileExt)) {
        alert(`❌ Недопустимий формат для файлу "${file.name}". Дозволені лише: PDF, DOC, TXT, PPT (презентації) та XLS (таблиці).`);
        e.target.value = "";
        setSelectedFiles([]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`❌ Файл "${file.name}" занадто великий! Максимально дозволений розмір — 10 МБ.`);
        e.target.value = "";
        setSelectedFiles([]);
        return;
      }
      validFiles.push(file);
    }
    setSelectedFiles(validFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    if (categoryIds.length === 0) {
      setErrorMsg("Будь ласка, оберіть хоча б одну категорію.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Завантаження картинок у Supabase
      const imageUrls: string[] = [];
      for (const file of selectedImages) {
        const fileExt = file.name.split('.').pop();
        const randomStr = Math.random().toString(36).substring(2, 7);
        const fileName = `images/${Date.now()}-${randomStr}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('activity-media')
          .upload(fileName, file, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error("Деталі помилки Supabase Storage:", uploadError);
          throw new Error(`Не вдалося завантажити фото "${file.name}". Причина: ${uploadError.message}`);
        }

        const { data } = supabase.storage.from('activity-media').getPublicUrl(fileName);
        if (data?.publicUrl) {
          imageUrls.push(data.publicUrl);
        }
      }

      // 2. Завантаження документів на Google Диск
      const fileUrls: string[] = [];
      for (const file of selectedFiles) {
        const fileFormData = new FormData();
        fileFormData.append('file', file);

        const uploadResponse = await fetch('/api/upload-to-drive', {
          method: 'POST',
          body: fileFormData,
        });

        const uploadData = await uploadResponse.json();

        if (uploadResponse.ok && uploadData.url) {
          fileUrls.push(uploadData.url);
        } else {
          console.error("Помилка завантаження файлу на Google Диск:", uploadData.error);
          throw new Error(`Помилка Google Диску: ${uploadData.error || 'Невідома помилка'}`);
        }
      }

      // 3. Формування локацій
      let finalLocations = [...locationIds.filter(id => id !== 'other')];
      if (locationIds.includes('other') && customLocation.trim() !== '') {
        finalLocations.push(customLocation.trim());
      }

      // 4. Запис усіх даних гри у базу даних Supabase
      const { error: dbError } = await supabase.from('activities').insert({
        title,
        author,
        category_ids: categoryIds,
        location: finalLocations.length > 0 ? finalLocations : null,
        age_min: ageMin ? parseInt(ageMin) : null,
        age_max: ageMax ? parseInt(ageMax) : null,
        duration_min: durationMin ? parseInt(durationMin) : null,
        duration_max: durationMax ? parseInt(durationMax) : null,
        participants_min: participantsMin ? parseInt(participantsMin) : null,
        participants_max: participantsMax ? parseInt(participantsMax) : null,
        animators_min: animatorsMin ? parseInt(animatorsMin) : null,
        animators_max: animatorsMax ? parseInt(animatorsMax) : null,
        preparation_time: prepTime ? parseInt(prepTime) : null,
        has_equipment: hasEquipment,
        equipment: hasEquipment ? equipment : null,
        short_description: shortDescription,
        full_content: fullContent,
        image_urls: imageUrls,
        file_urls: fileUrls,
        status: 'pending'
      });

      if (dbError) throw dbError;
      setIsSuccess(true);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Виникла помилка при відправці. Спробуйте ще раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-[#FDB8D3] flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full space-y-6">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-900">Дякуємо!</h1>
          <p className="text-gray-600 text-lg">Ваша активність успішно надіслана. Вона з'явиться на сайті після перевірки.</p>
          <Link href="/" className="inline-block mt-4 bg-[#44bdf3] text-white font-bold px-8 py-3 rounded-full hover:bg-[#32b0e6] transition-colors">
            Повернутися на головну
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* Шапка */}
      <div className="bg-[#44bdf3] p-6 lg:p-10 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white/80 hover:text-white font-bold flex items-center gap-2 transition-colors">
            ← Назад
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide">
            Нова активність
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-10 px-6">
        <p className="text-gray-600 mb-8 text-lg text-center max-w-2xl mx-auto">
          Маєте круту ідею для табору? Поділіться нею! Заповніть форму нижче, додайте схеми чи питання, і після модерації гра стане доступною для всіх.
        </p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 font-medium border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* БЛОК 1: ОСНОВНА ІНФОРМАЦІЯ */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b border-gray-100 pb-4">1. Основна інформація</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Назва гри або активності <span className="text-red-500">*</span></label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]" placeholder="Наприклад: Захоплення прапора" />
              </div>
              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Ваше ім'я або псевдонім <span className="text-red-500">*</span></label>
                <input required type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]" placeholder="Як вас підписати?" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-800 font-bold">Оберіть категорії <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoriesList.map(cat => (
                  <label key={cat.id} className={`flex justify-center p-3 rounded-xl border cursor-pointer font-bold text-sm transition-colors ${categoryIds.includes(cat.id) ? 'bg-[#FDB8D3] border-[#FDB8D3] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="hidden" checked={categoryIds.includes(cat.id)} onChange={() => toggleCategory(cat.id)} />
                    {cat.title}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-gray-800 font-bold">Де найкраще проводити цю активність?</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {locationsList.map(loc => (
                  <label key={loc.id} className={`flex justify-center p-3 rounded-xl border cursor-pointer font-bold text-sm transition-colors ${locationIds.includes(loc.id) ? 'bg-[#44bdf3] border-[#44bdf3] text-white shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="hidden" checked={locationIds.includes(loc.id)} onChange={() => toggleLocation(loc.id)} />
                    {loc.title}
                  </label>
                ))}
              </div>
              {locationIds.includes('other') && (
                <input type="text" value={customLocation} onChange={e => setCustomLocation(e.target.value)} className="w-full mt-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]" placeholder="Напишіть свій варіант (наприклад: В автобусі під час поїздки)..." />
              )}
            </div>
          </div>

          {/* БЛОК 2: ТЕХНІЧНІ ПАРАМЕТРИ */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b border-gray-100 pb-4">2. Технічні параметри гри</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Тривалість гри (у хвилинах)</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" value={durationMin} onChange={e => setDurationMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Мінімум" />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="number" min="1" value={durationMax} onChange={e => setDurationMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Максимум" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Кількість учасників</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" value={participantsMin} onChange={e => setParticipantsMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Мінімум" />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="number" min="1" value={participantsMax} onChange={e => setParticipantsMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Максимум" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Необхідна кількість аніматорів</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="1" value={animatorsMin} onChange={e => setAnimatorsMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Мінімум" />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="number" min="1" value={animatorsMax} onChange={e => setAnimatorsMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Ідеально" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-gray-800 font-bold">Рекомендований вік дітей</label>
                <div className="flex items-center gap-3">
                  <input type="number" min="0" value={ageMin} onChange={e => setAgeMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="Від (років)" />
                  <span className="text-gray-400 font-bold">-</span>
                  <input type="number" min="0" value={ageMax} onChange={e => setAgeMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-center focus:ring-2 focus:ring-[#44bdf3]" placeholder="До (років)" />
                </div>
              </div>

            </div>

            <div className="space-y-3">
              <label className="block text-gray-800 font-bold">Час на підготовку локації та реквізиту (у хвилинах)</label>
              <input type="number" min="0" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]" placeholder="Наприклад: 15 (якщо потрібно розкласти підказки чи станції)" />
            </div>

            {/* Блок з реквізитом */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasEquipment} onChange={e => setHasEquipment(e.target.checked)} className="w-6 h-6 text-[#44bdf3] rounded focus:ring-[#44bdf3]" />
                <span className="text-gray-900 font-extrabold text-lg">Для цієї активності потрібен реквізит</span>
              </label>

              {hasEquipment && (
                <div className="mt-4 pt-4 border-t border-gray-200 transition-all">
                  <label className="block text-gray-800 font-bold mb-2">Перелік необхідного реквізиту <span className="text-red-500">*</span></label>
                  <textarea
                    required={hasEquipment}
                    value={equipment}
                    onChange={e => setEquipment(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]"
                    placeholder="Перелічіть усе, що знадобиться: 2 м'ячі, 10 пов'язок на очі, колонка для музики..."
                  />
                </div>
              )}
            </div>

          </div>

          {/* БЛОК 3: ОПИС ТА ФАЙЛИ */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-800 border-b border-gray-100 pb-4">3. Опис та матеріали</h2>

            <div className="space-y-3">
              <label className="block text-gray-800 font-bold">Короткий опис (для карток на сайті) <span className="text-red-500">*</span></label>
              <textarea required value={shortDescription} onChange={e => setShortDescription(e.target.value)} rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]" placeholder="Суть гри в 1-2 реченнях, щоб зацікавити аніматора..." />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <label className="block text-gray-800 font-bold">Повні правила та інструкції <span className="text-red-500">*</span></label>

                <div className="relative group cursor-pointer">
                  <svg className="w-6 h-6 text-gray-400 hover:text-[#44bdf3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>

                  <div className="absolute left-0 bottom-full mb-3 w-80 p-5 bg-gray-900 text-white text-sm rounded-2xl shadow-xl hidden group-hover:block z-50 leading-relaxed">
                    <span className="font-extrabold text-[#44bdf3] block mb-3 text-base">Рекомендований формат:</span>
                    <p className="mb-3"><span className="font-bold block">1. Підготовка:</span>[опис того, що треба зробити до початку]</p>
                    <p className="mb-3"><span className="font-bold block">2. Загальні правила:</span>[в чому суть гри, як визначається переможець тощо]</p>
                    <p className="mb-3"><span className="font-bold block">3. Хід гри:</span>[покроковий опис]</p>
                    <p><span className="font-bold block">4. Особливі правила та безпека:</span>[що заборонено або на що звернути увагу]</p>
                  </div>
                </div>
              </div>

              <textarea
                required
                value={fullContent}
                onChange={e => setFullContent(e.target.value)}
                rows={10}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3]"
                placeholder="Напишіть правила тут..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
              <div className="space-y-2">
                <label className="block text-gray-800 font-bold">📸 Додати фото або схеми (до 5 МБ)</label>
                <input
                  type="file" multiple accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FDB8D3]/20 file:text-[#FDB8D3] hover:file:bg-[#FDB8D3]/30 cursor-pointer"
                />
                {selectedImages.length > 0 && <p className="text-sm text-green-600 font-bold mt-2">✓ Вибрано фотографій: {selectedImages.length}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-gray-800 font-bold">📄 Додати PDF, Документи, Презентації чи Таблиці (до 10 МБ)</label>
                <input
                  type="file" multiple accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#44bdf3]/20 file:text-[#44bdf3] hover:file:bg-[#44bdf3]/30 cursor-pointer"
                />
                {selectedFiles.length > 0 && <p className="text-sm text-green-600 font-bold mt-2">✓ Вибрано файлів: {selectedFiles.length}</p>}
              </div>
            </div>
          </div>

          {/* КНОПКА ВІДПРАВКИ */}
          <button disabled={isSubmitting} type="submit" className="w-full bg-[#FDB8D3] text-white font-extrabold text-2xl py-5 rounded-2xl hover:bg-[#f9a8c8] transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1">
            {isSubmitting ? "Відправка даних та файлів..." : "Надіслати на перевірку"}
          </button>

        </form>
      </div>
    </main>
  );
}