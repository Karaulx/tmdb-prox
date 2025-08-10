(function(){
    // Защита от дублирования
    if(window.__rh_ultimate_v7) return;
    window.__rh_ultimate_v7 = true;

    console.log('[RH ULTIMATE v7] Initializing plugin');

    // 1. Функция для получения объекта Lampa
    function getLampa() {
        const targets = [
            window,
            window.top,
            window.parent,
            window.opener
        ].filter(Boolean);

        for(const target of targets) {
            try {
                if(target.Lampa) return target.Lampa;
                if(target.__lampa_public?.Lampa) return target.__lampa_public.Lampa;
            } catch(e) {}
        }
        return null;
    }

    // 2. Основная функция инициализации
    function init() {
        const lampa = getLampa();
        if(!lampa) {
            console.warn('[RH ULTIMATE v7] Lampa not found');
            return false;
        }

        console.log('[RH ULTIMATE v7] Lampa found:', lampa);

        // 3. Создаем источник
        const source = {
            name: "RH Source",
            id: "rh_ultimate_v7",
            version: "7.0",
            type: "universal",
            priority: 1,
            active: true,
            
            search: function(query, tmdb_id, callback) {
                console.log('[RH ULTIMATE v7] Search:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный API)
                callback([{
                    title: `${query} [RH TEST]`,
                    url: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4",
                    quality: "1080p",
                    translation: "оригинал",
                    type: "video",
                    tmdb_id: tmdb_id,
                    iframe: false,
                    external: false,
                    origin: 'RH Source'
                }]);
            },
            
            sources: function(item, callback) {
                this.search(item.title, item.id, callback);
            }
        };

        // 4. Альтернативные методы регистрации
        try {
            // Метод 1: Через Sources если доступен
            if(lampa.Sources?.add) {
                lampa.Sources.add(source);
                console.log('[RH ULTIMATE v7] Registered via Sources.add()');
                return true;
            }
            
            // Метод 2: Через PluginManager если доступен
            if(lampa.PluginManager?.add) {
                lampa.PluginManager.add(source);
                console.log('[RH ULTIMATE v7] Registered via PluginManager.add()');
                return true;
            }
            
            // Метод 3: Через глобальный массив _plugins (если существует)
            if(window._plugins && Array.isArray(window._plugins)) {
                window._plugins.push(source);
                console.log('[RH ULTIMATE v7] Registered via window._plugins');
                return true;
            }
            
            // Метод 4: Через событие (если поддерживается)
            const event = new CustomEvent('lampa_add_plugin', {detail: source});
            window.dispatchEvent(event);
            console.log('[RH ULTIMATE v7] Registration event dispatched');
            
            return true;
        } catch(e) {
            console.error('[RH ULTIMATE v7] Registration error:', e);
            return false;
        }
    }

    // 5. Пытаемся инициализировать сразу
    if(!init()) {
        // Если не получилось, пробуем каждые 500мс в течение 10 секунд
        const interval = setInterval(() => {
            if(init()) clearInterval(interval);
        }, 500);
        
        setTimeout(() => clearInterval(interval), 10000);
    }

    // 6. Проверка через 5 секунд
    setTimeout(() => {
        try {
            const lampa = getLampa();
            if(!lampa) return;
            
            // Проверяем разными способами
            let plugins = [];
            
            if(lampa.Sources?.list) plugins = lampa.Sources.list();
            else if(lampa.PluginManager?.list) plugins = lampa.PluginManager.list();
            else if(window._plugins) plugins = window._plugins;
            
            const found = plugins.find(p => p.id === 'rh_ultimate_v7');
            console.log('[RH ULTIMATE v7] Verification:', found ? 'SUCCESS' : 'FAILED');
        } catch(e) {
            console.error('[RH ULTIMATE v7] Verification error:', e);
        }
    }, 5000);
})();
