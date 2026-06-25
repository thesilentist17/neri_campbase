"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

export interface Tag {
  id: string;
  title: string;
}

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

// Функція для створення ID (слага) з назви нового тегу (наприклад "Нова гра" -> "nova-hra")
const generateTagId = (title: string) => {
  const a = 'àáäâãåăæçèéëêẽĕēğìíïîĩĭıðñòóöôõøöşțùúüûũŭūýÿżźžАБВГДДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯабвгддеєжзиіїйклмнопрстуфхцчшщьюя';
  const b = 'aaaaaaaaceeeeeeeegiiiiiiidnooooooöstuuuuuuuyyzzzABVGDDЕEZHZYIIYKLMNOPRSTUFXCChShShchYuYaabvgddeejezyiiyklmnoprstufxcchshshchyuya';
  const p = new RegExp(a.split('').join('|'), 'g');
  return title.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(p, c => b.charAt(a.indexOf(c)))
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export default function TagSelector({ selectedTags, onChange, placeholder = "Шукати або додати тег..." }: TagSelectorProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 1. Завантажуємо всі доступні теги з бази
  useEffect(() => {
    async function fetchTags() {
      const { data } = await supabase.from('tags').select('*').order('title');
      if (data) setAllTags(data);
    }
    fetchTags();
  }, []);

  // 2. Закриваємо список при кліку поза компонентом
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 3. Фільтруємо теги (ховаємо ті, що вже обрані)
  const filteredTags = allTags.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) &&
    !selectedTags.includes(t.id)
  );

  const exactMatch = allTags.find(t => t.title.toLowerCase() === search.trim().toLowerCase());

  const handleSelect = (id: string) => {
    onChange([...selectedTags, id]);
    setSearch("");
    setIsOpen(false);
  };

  const handleCreate = async () => {
    if (!search.trim() || isCreating) return;
    setIsCreating(true);
    
    const newTitle = search.trim();
    const newId = generateTagId(newTitle) || Date.now().toString();
    const newTag = { id: newId, title: newTitle };
    
    // Миттєво оновлюємо UI (щоб не чекати базу)
    onChange([...selectedTags, newId]);
    setAllTags(prev => [...prev, newTag].sort((a, b) => a.title.localeCompare(b.title)));
    setSearch("");
    setIsOpen(false);

    // Зберігаємо в базу
    const { error } = await supabase.from('tags').insert([newTag]);
    if (error) console.error("Помилка збереження тегу:", error);
    
    setIsCreating(false);
  };

  const handleRemove = (idToRemove: string) => {
    onChange(selectedTags.filter(id => id !== idToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (exactMatch) handleSelect(exactMatch.id);
      else if (search.trim()) handleCreate();
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      
      {/* 🟢 БЕЙДЖІ ОБРАНИХ ТЕГІВ */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(id => {
            const tag = allTags.find(t => t.id === id);
            return (
              <span key={id} className="bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 shadow-sm border border-indigo-200 animate-fade-in">
                #{tag ? tag.title : id}
                <button type="button" onClick={() => handleRemove(id)} className="text-indigo-400 hover:text-white hover:bg-red-400 rounded-full w-5 h-5 flex items-center justify-center transition-colors">
                  &times;
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* 🟢 ПОЛЕ ПОШУКУ */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#44bdf3] outline-none transition-shadow"
        />
        
        {/* 🟢 ВИПАДАЮЧИЙ СПИСОК ЗІ СКРОЛОМ */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-56 overflow-y-auto">
            
            {filteredTags.map(tag => (
              <div 
                key={tag.id}
                onClick={() => handleSelect(tag.id)}
                className="px-4 py-3 hover:bg-indigo-50 cursor-pointer font-bold text-gray-700 transition-colors border-b border-gray-50 last:border-0"
              >
                #{tag.title}
              </div>
            ))}
            
            {search.trim() && !exactMatch && (
              <div 
                onClick={handleCreate}
                className="px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 cursor-pointer font-extrabold transition-colors flex items-center gap-2"
              >
                <span>✨</span> Створити тег «{search.trim()}»
              </div>
            )}

            {filteredTags.length === 0 && !search.trim() && (
              <div className="px-4 py-6 text-center text-gray-400 font-medium">
                Почніть вводити для пошуку...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}