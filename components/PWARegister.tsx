"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.workbox === undefined) {
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