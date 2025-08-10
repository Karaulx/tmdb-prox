(function(){
    // Уникальный идентификатор для защиты от дублирования
    if(window.__rh_ultimate_plugin) return;
    window.__rh_ultimate_plugin = true;

    console.log('[RH ULTIMATE] Plugin initialization started');

    // 1. Альтернативный метод доступа к Lampa
    function getLampa() {
        // Проверяем все возможные варианты доступа
        return window.Lampa || 
               window.top?.Lampa || 
               window.parent?.Lampa || 
               (window.__lampa_public && window.__lampa_public.Lampa) ||
               findLampaInIframes();
    }

    // 2. Поиск Lampa во фреймах
    function findLampaInIframes() {
        try {
            const iframes = document.getElementsByTagName('iframe');
            for(let i = 0; i < iframes.length; i++) {
                try {
                    if(iframes[i].contentWindow?.Lampa) {
                        return iframes[i].contentWindow.Lampa;
                    }
                } catch(e) {}
            }
        } catch(e) {}
        return null;
    }

    // 3. Основная инициализация
    function initPlugin() {
        const lampa = getLampa();
        
        if(!lampa) {
            console.warn('[RH ULTIMATE] Lampa object not found');
            return false;
        }

        console.log('[RH ULTIMATE] Lampa found, version:', lampa.API?.version);

        // 4. Создаем класс плагина
        class RhUltimateSource {
            constructor() {
                this.name = "RH Ultimate";
                this.id = "rh_ultimate_source";
                this.version = "5.0";
                this.type = "universal";
                this.priority = 1;
            }

            search(query, tmdb_id, callback) {
                console.log('[RH ULTIMATE] Searching for:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный API запрос)
                setTimeout(() => {
                    callback([{
                        title: `${query} [RH TEST]`,
                        url: `https://api4.rhhhhhhh.live/stream?tmdb=${tmdb_id}`,
                        quality: "1080p",
                        translation: "оригинал",
                        type: "video",
                        tmdb_id: tmdb_id
                    }]);
                }, 300);
            }

            sources(item, callback) {
                this.search(item.title, item.id, callback);
            }
        }

        // 5. Регистрация плагина
        try {
            if(lampa.Plugin?.add) {
                lampa.Plugin.add(new RhUltimateSource());
                console.log('[RH ULTIMATE] Registered via Plugin.add()');
            } 
            else if(lampa.Plugins?.push) {
                lampa.Plugins.push(new RhUltimateSource());
                console.log('[RH ULTIMATE] Registered via Plugins.push()');
            }
            else {
                throw new Error('No compatible registration method found');
            }

            // 6. Принудительное обновление
            if(lampa.API?.pluginUpdate) {
                lampa.API.pluginUpdate();
                console.log('[RH ULTIMATE] Cache updated');
            }

            return true;
        } catch(e) {
            console.error('[RH ULTIMATE] Registration failed:', e);
            return false;
        }
    }

    // 7. Стратегия загрузки
    function start() {
        // Первая попытка
        if(initPlugin()) return;

        // Интервал проверки
        const interval = setInterval(() => {
            if(initPlugin()) {
                clearInterval(interval);
            }
        }, 500);

        // Таймаут
        setTimeout(() => {
            clearInterval(interval);
            console.warn('[RH ULTIMATE] Failed to initialize after 15 seconds');
        }, 15000);
    }

    // Запускаем
    start();
})();
