// 1. Проверяем, что Lampa полностью загружена
function waitForLampa() {
  return new Promise((resolve) => {
    const check = () => {
      if (window.Lampa && window.Lampa.API && window.Lampa.API.registerPlugin) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

// 2. Основной код плагина
async function initPlugin() {
  console.log("[RH] Инициализация плагина...");
  
  const RhPlugin = {
    metadata: {
      name: "RH Source",
      id: "rh_source",
      type: "series",
      version: "1.0"
    },
    async search(query, tmdb_id) {
      console.log("[RH] Поиск:", query, tmdb_id);
      return [{
        title: "Тест от RH (" + query + ")",
        url: "https://example.com/video.mp4",
        tmdb_id: tmdb_id
      }];
    }
  };

  try {
    await waitForLampa();
    window.Lampa.API.registerPlugin(RhPlugin);
    console.log("[RH] Плагин успешно зарегистрирован");
  } catch (e) {
    console.error("[RH] Ошибка регистрации:", e);
  }
}

// 3. Запуск
initPlugin();
