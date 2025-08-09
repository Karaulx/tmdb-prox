(function() {
    console.log('[RH] Инициализация плагина для Lampa 2.4.6');
    
    // Ждём полной загрузки Lampa
    function waitForLampa(callback) {
        if (window.Lampa && window.Lampa.Plugins) {
            callback();
        } else {
            setTimeout(function() { waitForLampa(callback) }, 100);
        }
    }
    
    waitForLampa(function() {
        console.log('[RH] Lampa обнаружена, регистрируем плагин');
        
        // Создаём объект плагина
        var RhPlugin = {
            name: "RH Source",
            id: "rh_source",
            type: "series",
            version: "1.0",
            
            // Метод поиска
            search: function(query, tmdb_id, callback) {
                console.log('[RH] Поиск:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный запрос к API)
                var testResults = [{
                    title: "Тест от RH (" + query + ")",
                    url: "https://example.com/video.mp4",
                    quality: "1080p",
                    translation: "оригинал",
                    tmdb_id: tmdb_id
                }];
                
                callback(testResults);
            }
        };
        
        // Регистрация в старой версии Lampa
        try {
            window.Lampa.Plugins.push(RhPlugin);
            console.log('[RH] Плагин успешно зарегистрирован');
        } catch (e) {
            console.error('[RH] Ошибка регистрации:', e);
        }
    });
})();
