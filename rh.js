console.log("[RH] Скрипт загружен!");

const RhTestPlugin = {
  metadata: {
    name: "RH Test",
    id: "rh_test",
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

if (window.Lampa) {
  console.log("[RH] Lampa обнаружена");
  window.Lampa.registerPlugin(RhTestPlugin);
} else {
  console.error("[RH] Lampa не найдена!");
}
