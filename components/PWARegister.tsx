"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    // Залишаємо тільки базову перевірку підтримки Service Worker у браузері
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => console.log("Нері PWA: Офлайн-режим активовано!", reg.scope))
          .catch((err) => console.error("Нері PWA: Помилка активації:", err));
      });
    }
  }, []);

  return null;
}