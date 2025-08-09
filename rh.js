const RhApiPlugin = {
  metadata: {
    name: "RH Video Source",
    description: "Источник видео с api4.rhhhhhhh.live",
    version: "1.0",
    id: "rh_api",
    type: "series" // или "movies" для фильмов
  },

  // Поиск контента по TMDB ID
  async search(query, tmdb_id) {
    try {
      const response = await fetch(`https://api4.rhhhhhhh.live/search?tmdb_id=${tmdb_id}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      return data.map(item => ({
        title: item.title || `Сезон ${item.season} Серия ${item.episode}`,
        url: item.url,
        quality: item.quality || "HD",
        tmdb_id: tmdb_id
      }));
    } catch (error) {
      console.error("Ошибка поиска:", error);
      return [];
    }
  },

  // Получение эпизодов (для сериалов)
  async getEpisodes(tmdb_id) {
    try {
      const response = await fetch(`https://api4.rhhhhhhh.live/episodes?tmdb_id=${tmdb_id}`);
      return await response.json();
    } catch (error) {
      console.error("Ошибка загрузки эпизодов:", error);
      return [];
    }
  }
};

// Регистрация плагина в Lampa
if (window.Lampa && window.Lampa.registerPlugin) {
  window.Lampa.registerPlugin(RhApiPlugin);
}
