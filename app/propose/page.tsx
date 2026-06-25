"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import TagSelector from "@/components/TagSelector";

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

  // Обов'язкові поля
  const [title, setTitle] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Додаткові поля
  const [shortDescription, setShortDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [customLocationInput, setCustomLocationInput] = useState(""); // 🟢 Для кастомних локацій
  
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [preparationTime, setPreparationTime] = useState(""); // 🟢 Час на підготовку
  const [participantsMin, setParticipantsMin] = useState("");
  const [participantsMax, setParticipantsMax] = useState("");
  const [animatorsMin, setAnimatorsMin] = useState("");
  const [animatorsMax, setAnimatorsMax] = useState(""); // 🟢 Ідеальна кількість аніматорів
  const [hasEquipment, setHasEquipment] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState("");

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleLocationToggle = (id: string) => {
    setSelectedLocations(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  // 🟢 Додавання кастомної локації (по кліку на кнопку або Enter)
  const handleAddCustomLocation = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && 'key' in e && (e as React.KeyboardEvent).key !== 'Enter') return;
    e?.preventDefault();
    
    const val = customLocationInput.trim();
    if (val && !selectedLocations.includes(val)) {
      setSelectedLocations(prev => [...prev, val]);
    }
    setCustomLocationInput("");
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !fullContent.trim() || selectedCategories.length === 0) {
      alert("⚠️ Будь ласка, заповніть хоча б Назву, Правила та оберіть Категорію.");
      return;
    }

    const hasEmptyOptionals = !shortDescription.trim() || !ageMin || !durationMin || !participantsMin || !animatorsMin || selectedLocations.length === 0 || selectedTags.length === 0;

    if (hasEmptyOptionals) {
      setShowWarningModal(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setShowWarningModal(false);

    // Додаємо локацію з поля вводу, якщо користувач забув натиснути "Додати"
    let finalLocations = [...selectedLocations];
    if (customLocationInput.trim() && !finalLocations.includes(customLocationInput.trim())) {
      finalLocations.push(customLocationInput.trim());
    }

    const { error } = await supabase.from('activities').insert([{
      title,
      short_description: shortDescription.trim() ? shortDescription : null,
      full_content: fullContent,
      category_ids: selectedCategories,
      location: finalLocations, // 🟢 Передаємо всі локації (і стандартні, і кастомні)
      tags: selectedTags,
      age_min: ageMin ? parseInt(ageMin) : null,
      age_max: ageMax ? parseInt(ageMax) : null,
      duration_min: durationMin ? parseInt(durationMin) : null,
      duration_max: durationMax ? parseInt(durationMax) : null,
      preparation_time: preparationTime ? parseInt(preparationTime) : null, // 🟢 Час підготовки
      participants_min: participantsMin ? parseInt(participantsMin) : null,
      participants_max: participantsMax ? parseInt(participantsMax) : null,
      animators_min: animatorsMin ? parseInt(animatorsMin) : null,
      animators_max: animatorsMax ? parseInt(animatorsMax) : null, // 🟢 Ідеальна кількість
      has_equipment: hasEquipment,
      equipment: hasEquipment ? equipmentDetails : null,
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
                  <button type="button" key={cat.id} onClick={() => handleCategoryToggle(cat.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedCategories.includes(cat.id) ? 'bg-[#FDB8D3] text-white border-[#FDB8D3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {cat.title}
                  </button>
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
              ⚙️ Додаткові деталі <span className="text-sm font-normal text-gray-400">(за бажанням)</span>
            </h2>

            <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
              <label className="block font-bold text-indigo-900 mb-2">Хештеги (Настрій гри)</label>
              <TagSelector 
                selectedTags={selectedTags} 
                onChange={setSelectedTags} 
                placeholder="Почніть вводити назву тегу..." 
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Короткий опис (1-2 речення)</label>
              <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Гра на знайомство, де учасники..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
            </div>

            {/* 🟢 ОНОВЛЕНИЙ БЛОК ЛОКАЦІЙ */}
            <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100">
              <label className="block font-bold text-gray-700 mb-3">📍 Локація</label>
              <div className="flex flex-wrap gap-2 mb-4">
                {/* Стандартні локації */}
                {locationsList.map(loc => (
                  <button type="button" key={loc.id} onClick={() => handleLocationToggle(loc.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedLocations.includes(loc.id) ? 'bg-[#44bdf3] text-white border-[#44bdf3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {loc.title}
                  </button>
                ))}
                {/* Кастомні локації (ті, яких немає в списку) */}
                {selectedLocations.filter(loc => !locationsList.some(l => l.id === loc)).map(customLoc => (
                  <button type="button" key={customLoc} onClick={() => handleLocationToggle(customLoc)} className="px-4 py-2 rounded-xl font-bold text-sm transition-all border bg-[#44bdf3] text-white border-[#44bdf3] flex items-center gap-1.5 hover:bg-red-400 hover:border-red-400 group">
                    {customLoc} <span className="text-white/70 group-hover:text-white">&times;</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={customLocationInput} 
                  onChange={e => setCustomLocationInput(e.target.value)} 
                  onKeyDown={handleAddCustomLocation}
                  placeholder="Своя локація (напр: ліс, автобус, поїзд)..." 
                  className="flex-grow bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#44bdf3] outline-none" 
                />
                <button type="button" onClick={handleAddCustomLocation} className="bg-white hover:bg-gray-50 text-[#44bdf3] font-bold px-5 py-2.5 rounded-xl text-sm transition-colors border border-gray-200 shadow-sm">
                  Додати
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Вік від</label>
                <input type="number" value={ageMin} onChange={e => setAgeMin(e.target.value)} placeholder="Напр: 8" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Вік до</label>
                <input type="number" value={ageMax} onChange={e => setAgeMax(e.target.value)} placeholder="Напр: 16" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
            </div>

            {/* 🟢 ОНОВЛЕНИЙ БЛОК ЧАСУ (+ ПІДГОТОВКА) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Тривалість від (хв)</label>
                <input type="number" value={durationMin} onChange={e => setDurationMin(e.target.value)} placeholder="Напр: 15" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Тривалість до (хв)</label>
                <input type="number" value={durationMax} onChange={e => setDurationMax(e.target.value)} placeholder="Напр: 45" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm text-orange-600">Підготовка (хв)</label>
                <input type="number" value={preparationTime} onChange={e => setPreparationTime(e.target.value)} placeholder="Напр: 10" className="w-full bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-400 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Учасників від</label>
                <input type="number" value={participantsMin} onChange={e => setParticipantsMin(e.target.value)} placeholder="Напр: 10" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Учасників до</label>
                <input type="number" value={participantsMax} onChange={e => setParticipantsMax(e.target.value)} placeholder="Напр: 30" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
            </div>

            {/* 🟢 ОНОВЛЕНИЙ БЛОК АНІМАТОРІВ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Мінімум аніматорів</label>
                <input type="number" value={animatorsMin} onChange={e => setAnimatorsMin(e.target.value)} placeholder="Напр: 2" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm text-green-700">Ідеально аніматорів</label>
                <input type="number" value={animatorsMax} onChange={e => setAnimatorsMax(e.target.value)} placeholder="Напр: 4" className="w-full bg-green-50 border border-green-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400 outline-none" />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={hasEquipment} onChange={e => setHasEquipment(e.target.checked)} className="w-6 h-6 text-[#44bdf3] rounded border-gray-300 focus:ring-[#44bdf3]" />
                <span className="font-bold text-gray-700">Грі потрібен реквізит</span>
              </label>
              
              {hasEquipment && (
                <div className="mt-4">
                  <textarea value={equipmentDetails} onChange={e => setEquipmentDetails(e.target.value)} placeholder="Перелічіть необхідний реквізит..." rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
                </div>
              )}
            </div>

          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-[#44bdf3] text-white font-extrabold text-xl py-5 rounded-2xl hover:bg-[#32b0e6] transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? "Обробка..." : "Відправити гру на модерацію"}
          </button>
        </form>
      </div>
    </main>
  );
}