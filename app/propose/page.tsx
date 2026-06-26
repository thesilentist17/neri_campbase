"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TagSelector from "@/components/TagSelector";
import imageCompression from 'browser-image-compression'; 

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

const locationsList = [
  { id: "indoor", title: "В приміщенні" },
  { id: "outdoor", title: "Надворі" },
  { id: "water", title: "Біля води" }
];

export default function ProposePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [title, setTitle] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocationInput, setCustomLocationInput] = useState("");
  
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [participantsMin, setParticipantsMin] = useState("");
  const [participantsMax, setParticipantsMax] = useState("");
  const [animatorsMin, setAnimatorsMin] = useState("");
  const [animatorsMax, setAnimatorsMax] = useState("");
  const [hasEquipment, setHasEquipment] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const handleCategoryToggle = (id: string) => setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  const handleLocationToggle = (id: string) => setSelectedLocations(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);

  const handleAddCustomLocation = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
    e?.preventDefault();
    const val = customLocationInput.trim();
    if (val && !selectedLocations.includes(val)) setSelectedLocations(prev => [...prev, val]);
    setCustomLocationInput("");
  };

  // 🟢 ВІДНОВЛЕНИЙ ОБРОБНИК ДЛЯ ФОТОГРАФІЙ (з лімітом 10МБ, бо далі буде стиснення)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validImages: File[] = [];
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 МБ 

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        alert(`❌ Файл "${file.name}" не є зображенням! Можна завантажувати лише фото.`);
        e.target.value = "";
        setImageFiles([]);
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        alert(`❌ Фото "${file.name}" занадто велике! Максимально дозволений розмір — 10 МБ.`);
        e.target.value = "";
        setImageFiles([]);
        return;
      }
      validImages.push(file);
    }
    setImageFiles(validImages);
  };

  // 🟢 ВІДНОВЛЕНИЙ ОБРОБНИК ДЛЯ ДОКУМЕНТІВ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 МБ
    const allowedExtensions = [
      "pdf", "doc", "docx", "txt", "ppt", "pptx", "xls", "xlsx", "csv", // Документи та таблиці
      "mp3", "wav", // Аудіо
      "mp4", "mov", // Відео
      "zip", "rar", "7z", // Архіви
      "svg"  // Векторна графіка
    ];

    for (const file of files) {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || "";

      if (!allowedExtensions.includes(fileExt)) {
        alert(`❌ Недопустимий формат для файлу "${file.name}". Дозволені лише: PDF, DOC, TXT, PPT (презентації), XLS (таблиці), аудіо, відео або архіви.`);
        e.target.value = "";
        setDocumentFiles([]);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        alert(`❌ Файл "${file.name}" занадто великий! Максимально дозволений розмір — 10 МБ.`);
        e.target.value = "";
        setDocumentFiles([]);
        return;
      }
      validFiles.push(file);
    }
    setDocumentFiles(validFiles);
  };

  const uploadMedia = async (files: File[], isImage: boolean) => {
    const urls: string[] = [];
    for (const file of files) {
      let fileToUpload = file;
      
      if (isImage) {
        try {
          // Стискаємо всі фото до ~300 КБ перед відправкою в Supabase
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
      }
    }
    return urls;
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !fullContent.trim() || selectedCategories.length === 0) {
      alert("⚠️ Будь ласка, заповніть хоча б Назву, Правила та оберіть Категорію.");
      return;
    }
    const hasEmptyOptionals = !shortDescription.trim() || !ageMin || !durationMin || !participantsMin || !animatorsMin || selectedLocations.length === 0 || selectedTags.length === 0;
    if (hasEmptyOptionals) setShowWarningModal(true);
    else executeSubmit();
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setShowWarningModal(false);

    let finalLocations = [...selectedLocations];
    if (customLocationInput.trim() && !finalLocations.includes(customLocationInput.trim())) {
      finalLocations.push(customLocationInput.trim());
    }

    const uploadedImageUrls = await uploadMedia(imageFiles, true);
    const uploadedFileUrls = await uploadMedia(documentFiles, false);

    const { error } = await supabase.from('activities').insert([{
      title,
      short_description: shortDescription.trim() ? shortDescription : null,
      full_content: fullContent,
      category_ids: selectedCategories,
      location: finalLocations,
      tags: selectedTags,
      age_min: ageMin ? parseInt(ageMin) : null,
      age_max: ageMax ? parseInt(ageMax) : null,
      duration_min: durationMin ? parseInt(durationMin) : null,
      duration_max: durationMax ? parseInt(durationMax) : null,
      preparation_time: preparationTime ? parseInt(preparationTime) : null,
      participants_min: participantsMin ? parseInt(participantsMin) : null,
      participants_max: participantsMax ? parseInt(participantsMax) : null,
      animators_min: animatorsMin ? parseInt(animatorsMin) : null,
      animators_max: animatorsMax ? parseInt(animatorsMax) : null,
      has_equipment: hasEquipment,
      equipment: hasEquipment ? equipmentDetails : null,
      image_urls: uploadedImageUrls, 
      file_urls: uploadedFileUrls,   
      status: 'pending'
    }]);

    setIsSubmitting(false);

    if (error) {
      console.error(error);
      alert("Сталася помилка при відправці. Спробуйте ще раз.");
    } else {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isSuccess) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center text-5xl">🎉</div>
          <h1 className="text-3xl font-extrabold text-gray-800">Гру успішно надіслано!</h1>
          <p className="text-gray-600 text-lg">Дякуємо за ваш внесок! Наші модератори перевірять гру і незабаром вона з'явиться в загальній базі.</p>
          <Link href="/">
            <button className="mt-4 bg-[#44bdf3] text-white font-bold px-8 py-4 rounded-xl hover:bg-[#32b0e6] transition-all shadow-md">Повернутися на головну</button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 font-sans pb-20">
      
      {showWarningModal && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full transform transition-all text-center">
            <div className="text-5xl mb-4">⏱️</div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-3">Ви пропустили кілька полів</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Якщо маєте хвилинку — додайте теги, короткий опис чи вік. Це дуже допоможе модерації! <br/><br/>
              Але якщо ви поспішаєте — можете відправити гру як є. 😉
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-[#E0F2FE] text-[#60a5fa] font-bold py-4 rounded-xl hover:bg-[#bae6fd] transition-colors">← Повернутися і заповнити</button>
              <button onClick={executeSubmit} disabled={isSubmitting} className="w-full bg-[#FDB8D3] text-white font-bold py-4 rounded-xl hover:bg-[#f9a8c8] transition-colors shadow-sm">{isSubmitting ? "Відправляємо..." : "Відправити як є 🚀"}</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#FDB8D3] p-6 lg:p-10 text-white shadow-md relative z-50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="w-full md:w-1/3 flex justify-center md:justify-start">
            <Link href="/" className="text-white/80 hover:text-white font-bold flex items-center gap-2 transition-colors w-fit">← Назад</Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide text-center w-full md:w-1/3 whitespace-nowrap">
            Додати гру
          </h1>
          <div className="w-full md:w-1/3"></div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto mt-10 px-4">
        <form className="space-y-8" onSubmit={handleInitialSubmit}>
          
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">📝 Основна інформація</h2>
            <div>
              <label className="block font-bold text-gray-700 mb-2">Назва гри <span className="text-red-500">*</span></label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Наприклад: Захоплення прапора" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" required />
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">Категорія (можна кілька) <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2">
                {categoriesList.map(cat => (
                  <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedCategories.includes(cat.id) ? 'bg-[#FDB8D3] text-white border-[#FDB8D3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{cat.title}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block font-bold text-gray-700 mb-2">Детальні правила та інструкція <span className="text-red-500">*</span></label>
              <textarea value={fullContent} onChange={e => setFullContent(e.target.value)} placeholder="Опишіть хід гри, підготовку та фінал..." rows={8} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" required />
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4 flex items-center gap-2">
              ⚙️ Додаткові деталі
            </h2>

            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
              <label className="block font-bold text-indigo-900 mb-2">Хештеги (Настрій гри)</label>
              <TagSelector selectedTags={selectedTags} onChange={setSelectedTags} placeholder="Почніть вводити назву тегу..." />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Короткий опис (1-2 речення)</label>
              <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Гра на знайомство, де учасники..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
            </div>

            <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
              <label className="block font-bold text-gray-700 mb-3">📍 Локація</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {locationsList.map(loc => (
                  <button type="button" key={loc.id} onClick={() => handleLocationToggle(loc.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedLocations.includes(loc.id) ? 'bg-[#44bdf3] text-white border-[#44bdf3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>{loc.title}</button>
                ))}
                {selectedLocations.filter(loc => !locationsList.some(l => l.id === loc)).map(customLoc => (
                  <button type="button" key={customLoc} onClick={() => handleLocationToggle(customLoc)} className="px-4 py-2 rounded-xl font-bold text-sm transition-all border bg-[#44bdf3] text-white border-[#44bdf3] flex items-center gap-1.5 hover:bg-red-400 hover:border-red-400 group">
                    {customLoc} <span className="text-white/70 group-hover:text-white">&times;</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={customLocationInput} onChange={e => setCustomLocationInput(e.target.value)} onKeyDown={handleAddCustomLocation} placeholder="Своя локація (напр: ліс, автобус)..." className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#44bdf3] outline-none" />
                <button type="button" onClick={handleAddCustomLocation} className="bg-white hover:bg-gray-50 text-[#44bdf3] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors border border-gray-200 shadow-sm">Додати</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Вік від</label><input type="number" value={ageMin} onChange={e => setAgeMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Вік до</label><input type="number" value={ageMax} onChange={e => setAgeMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Тривалість від (хв)</label><input type="number" value={durationMin} onChange={e => setDurationMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Тривалість до (хв)</label><input type="number" value={durationMax} onChange={e => setDurationMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold text-gray-700 mb-2 text-sm text-orange-600">Підготовка (хв)</label><input type="number" value={preparationTime} onChange={e => setPreparationTime(e.target.value)} className="w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 focus:ring-orange-400" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Учасників від</label><input type="number" value={participantsMin} onChange={e => setParticipantsMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Учасників до</label><input type="number" value={participantsMax} onChange={e => setParticipantsMax(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><label className="block font-bold text-gray-700 mb-2 text-sm">Мінімум аніматорів</label><input type="number" value={animatorsMin} onChange={e => setAnimatorsMin(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" /></div>
              <div><label className="block font-bold text-gray-700 mb-2 text-sm text-green-700">Ідеально аніматорів</label><input type="number" value={animatorsMax} onChange={e => setAnimatorsMax(e.target.value)} className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 focus:ring-green-400" /></div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasEquipment} onChange={e => setHasEquipment(e.target.checked)} className="w-6 h-6 text-[#44bdf3]" />
                <span className="font-bold text-gray-700">Грі потрібен реквізит</span>
              </label>
              {hasEquipment && <textarea value={equipmentDetails} onChange={e => setEquipmentDetails(e.target.value)} placeholder="Перелічіть необхідний реквізит..." rows={3} className="mt-4 w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3" />}
            </div>
          </div>

          {/* 🟢 ВІДНОВЛЕНИЙ БЛОК ДЛЯ ФАЙЛІВ ТА ФОТО */}
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-4">📎 Додаткові матеріали</h2>
            
            <div>
              <label className="block font-bold text-gray-700 mb-2">Фотографії або схеми (до 10 МБ)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleImageChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
              />
              {imageFiles.length > 0 && <p className="text-sm text-green-600 mt-2 font-bold">✅ Вибрано фото: {imageFiles.length} шт (Будуть автоматично стиснені)</p>}
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Файли (PDF, Word, Excel, Архіви, Аудіо/Відео)</label>
              <input 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.mp3,.wav,.mp4,.mov,.zip,.rar,.7z,.svg"
                onChange={handleFileChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer"
              />
              {documentFiles.length > 0 && <p className="text-sm text-green-600 mt-2 font-bold">✅ Вибрано файлів: {documentFiles.length} шт</p>}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#44bdf3] text-white font-extrabold text-xl py-5 rounded-2xl hover:bg-[#32b0e6] transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <><svg className="animate-spin w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Відправляємо (це може зайняти хвилину)...</>
            ) : "Відправити гру на модерацію"}
          </button>
        </form>
      </div>
    </main>
  );
}