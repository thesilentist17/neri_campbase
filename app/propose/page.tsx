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
  { id: "hrupky", title: "Групки" },
  { id: "duelni-ihry", title: "Дуельні ігри" },
  { id: "kvest-tochky", title: "Точки на квест" }
];

const locationsList = [
  { id: "indoor", title: "В приміщенні" },
  { id: "outdoor", title: "Надворі" },
  { id: "water", title: "Біля води" }
];

// 🟢 НОВИЙ СПИСОК ТЕГІВ
const tagsList = [
  { id: "znayomstvo", title: "Знайомство" },
  { id: "kryholamy", title: "Криголами" },
  { id: "rukhlyvi", title: "Рухливі" },
  { id: "spokiyni", title: "Спокійні" },
  { id: "lohika", title: "На логіку" },
  { id: "komandni", title: "Командні" },
  { id: "tantsyuvalni", title: "Танцювальні" },
  { id: "voda", title: "З водою" }
];

export default function ProposePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [showWarningModal, setShowWarningModal] = useState(false);

  const [title, setTitle] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [shortDescription, setShortDescription] = useState("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  // 🟢 Стан для вибраних тегів
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [durationMax, setDurationMax] = useState("");
  const [participantsMin, setParticipantsMin] = useState("");
  const [participantsMax, setParticipantsMax] = useState("");
  const [animatorsMin, setAnimatorsMin] = useState("");
  const [hasEquipment, setHasEquipment] = useState(false);
  const [equipmentDetails, setEquipmentDetails] = useState("");

  const handleCategoryToggle = (id: string) => {
    setSelectedCategories(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const handleLocationToggle = (id: string) => {
    setSelectedLocations(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  // 🟢 Функція перемикання тегів
  const handleTagToggle = (id: string) => {
    setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !fullContent.trim() || selectedCategories.length === 0) {
      alert("⚠️ Будь ласка, заповніть хоча б Назву, Правила та оберіть Категорію.");
      return;
    }

    const hasEmptyOptionals = 
      !shortDescription.trim() || !ageMin || !durationMin || !participantsMin || !animatorsMin || selectedLocations.length === 0 || selectedTags.length === 0;

    if (hasEmptyOptionals) {
      setShowWarningModal(true);
    } else {
      executeSubmit();
    }
  };

  const executeSubmit = async () => {
    setIsSubmitting(true);
    setShowWarningModal(false);

    const { error } = await supabase.from('activities').insert([
      {
        title,
        short_description: shortDescription.trim() ? shortDescription : null,
        full_content: fullContent,
        category_ids: selectedCategories,
        location: selectedLocations,
        tags: selectedTags, // 🟢 Відправляємо теги в базу
        age_min: ageMin ? parseInt(ageMin) : null,
        age_max: ageMax ? parseInt(ageMax) : null,
        duration_min: durationMin ? parseInt(durationMin) : null,
        duration_max: durationMax ? parseInt(durationMax) : null,
        participants_min: participantsMin ? parseInt(participantsMin) : null,
        participants_max: participantsMax ? parseInt(participantsMax) : null,
        animators_min: animatorsMin ? parseInt(animatorsMin) : null,
        has_equipment: hasEquipment,
        equipment: hasEquipment ? equipmentDetails : null,
        status: 'pending'
      }
    ]);

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
              Якщо маєте хвилинку — додайте теги, короткий опис, вік, час чи кількість учасників. Це дуже допоможе нашій модерації! <br/><br/>
              Але якщо ви поспішаєте — можете відправити гру як є, ми доопрацюємо її самі. 😉
            </p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setShowWarningModal(false)} className="w-full bg-[#E0F2FE] text-[#60a5fa] font-bold py-4 rounded-xl hover:bg-[#bae6fd] transition-colors">
                ← Повернутися і заповнити
              </button>
              <button onClick={executeSubmit} disabled={isSubmitting} className="w-full bg-[#FDB8D3] text-white font-bold py-4 rounded-xl hover:bg-[#f9a8c8] transition-colors shadow-sm">
                {isSubmitting ? "Відправляємо..." : "Відправити як є 🚀"}
              </button>
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
        <div className="bg-blue-50 text-blue-800 p-5 rounded-2xl mb-8 text-sm font-medium border border-blue-100 flex gap-3 items-start">
          <span className="text-2xl">💡</span>
          <p>Поділіться своєю улюбленою грою з іншими аніматорами! Обов'язкові поля позначені червоною зірочкою (<span className="text-red-500">*</span>). Усі інші поля заповнюйте за бажанням.</p>
        </div>

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

            {/* 🟢 БЛОК ДЛЯ ТЕГІВ */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">Хештеги (настрій гри)</label>
              <div className="flex flex-wrap gap-2">
                {tagsList.map(tag => (
                  <button type="button" key={tag.id} onClick={() => handleTagToggle(tag.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedTags.includes(tag.id) ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    #{tag.title}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Короткий опис (1-2 речення)</label>
              <textarea value={shortDescription} onChange={e => setShortDescription(e.target.value)} placeholder="Гра на знайомство, де учасники..." rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-2">Локація</label>
              <div className="flex flex-wrap gap-2">
                {locationsList.map(loc => (
                  <button type="button" key={loc.id} onClick={() => handleLocationToggle(loc.id)} className={`px-4 py-2 rounded-xl font-bold text-sm transition-all border ${selectedLocations.includes(loc.id) ? 'bg-[#44bdf3] text-white border-[#44bdf3]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
                    {loc.title}
                  </button>
                ))}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Час (хв) від</label>
                <input type="number" value={durationMin} onChange={e => setDurationMin(e.target.value)} placeholder="Напр: 15" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">Час (хв) до</label>
                <input type="number" value={durationMax} onChange={e => setDurationMax(e.target.value)} placeholder="Напр: 45" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
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

            <div>
              <label className="block font-bold text-gray-700 mb-2">Мінімум аніматорів</label>
              <input type="number" value={animatorsMin} onChange={e => setAnimatorsMin(e.target.value)} placeholder="Напр: 2" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none" />
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

          <button type="submit" disabled={isSubmitting} className="w-full bg-[#44bdf3] text-white font-extrabold text-xl py-5 rounded-2xl hover:bg-[#32b0e6] transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50">
            {isSubmitting ? "Обробка..." : "Відправити гру на модерацію"}
          </button>
        </form>
      </div>
    </main>
  );
}