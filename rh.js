const RhApiPlugin = {
  metadata: {
    name: "RH Video Source",
    id: "rh_api",
    type: "series",
    version: "1.1"
  },

  async search(query, tmdb_id) {
    try {
      console.log("[RH Plugin] Запрос к API..."); // Логирование
      const response = await fetch(`https://api4.rhhhhhhh.live/search?tmdb_id=${tmdb_id}&query=${query}`);
      
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const data = await response.json();
      console.log("[RH Plugin] Ответ API:", data); // Логирование

      if (!Array.isArray(data)) throw new Error("Некорректный формат ответа API");
      
      return data.map(item => ({
        title: item.title || "Без названия",
        url: item.url,
        quality: item.quality || "HD",
        tmdb_id: tmdb_id
      }));
    } catch (error) {
      console.error("[RH Plugin] Ошибка:", error.message);
      return [];
    }
  }
};

if (window.Lampa && window.Lampa.registerPlugin) {
  window.Lampa.registerPlugin(RhApiPlugin);
  console.log("[RH Plugin] Плагин зарегистрирован");
}
