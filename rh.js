// Проверяем глобальный объект Lampa
if(typeof window.Lampa === 'object') {
    registerPlugin();
} else {
    // Ждём появления Lampa
    let checkTimer = setInterval(() => {
        if(typeof window.Lampa === 'object') {
            clearInterval(checkTimer);
            registerPlugin();
        }
    }, 100);
}

function registerPlugin() {
    console.log('[RH] Регистрируем плагин');
    
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
                tmdb_id: tmdb_id,
                // Обязательные поля для Lampa:
                quality: "1080p",
                translation: "оригинал",
                type: "video" // или "torrent"
            }];
        }
    };

    // Современный способ регистрации
    if(window.Lampa.API?.registerPlugin) {
        window.Lampa.API.registerPlugin(RhPlugin);
    } 
    // Старый способ для совместимости
    else if(window.Lampa.Plugin?.register) {
        window.Lampa.Plugin.register(RhPlugin);
    } else {
        console.error('[RH] Не найдена функция регистрации плагинов');
    }
}
