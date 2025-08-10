(function(){
    // 1. Защита от дублирования
    if(window.__rh_super_final_v8) return;
    window.__rh_super_final_v8 = true;

    console.log('[RH SUPER FINAL v8] Initializing plugin');

    // 2. Основная функция инициализации
    function init() {
        // 3. Получаем объект Lampa любым способом
        const lampa = window.Lampa || window.top?.Lampa || window.parent?.Lampa || 
                     window.__lampa_public?.Lampa || findLampaInIframes();
        
        if(!lampa) {
            console.warn('[RH SUPER FINAL v8] Lampa not found');
            return false;
        }

        console.log('[RH SUPER FINAL v8] Lampa found:', lampa);

        // 4. Создаем источник с уникальным ID
        const source = {
            name: "RH Super Source",
            id: "rh_super_final_v8",
            version: "8.0",
            type: "universal",
            priority: 1,
            active: true,
            
            search: function(query, tmdb_id, callback) {
                console.log('[RH SUPER FINAL v8] Search:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный API)
                callback([{
                    title: `${query} [RH LIVE]`,
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

        // 5. Регистрация через все возможные методы
        try {
            // Метод 1: Через _plugins (если есть)
            if(window._plugins && Array.isArray(window._plugins)) {
                window._plugins.push(source);
                console.log('[RH SUPER FINAL v8] Registered via window._plugins');
                return true;
            }

            // Метод 2: Через глобальное событие
            const event = new CustomEvent('lampa_add_source', {
                detail: source
            });
            window.dispatchEvent(event);
            console.log('[RH SUPER FINAL v8] Registration event dispatched');

            // Метод 3: Через таймаут (на случай если Lampa еще не готов)
            setTimeout(() => {
                try {
                    if(lampa.Plugins && Array.isArray(lampa.Plugins)) {
                        lampa.Plugins.push(source);
                        console.log('[RH SUPER FINAL v8] Registered via lampa.Plugins');
                    }
                } catch(e) {}
            }, 1000);

            return true;
        } catch(e) {
            console.error('[RH SUPER FINAL v8] Registration error:', e);
            return false;
        }
    }

    // 6. Поиск Lampa во фреймах
    function findLampaInIframes() {
        try {
            const iframes = document.getElementsByTagName('iframe');
            for(let iframe of iframes) {
                try {
                    if(iframe.contentWindow?.Lampa) {
                        return iframe.contentWindow.Lampa;
                    }
                } catch(e) {}
            }
        } catch(e) {}
        return null;
    }

    // 7. Проверка регистрации через 5 секунд
    function verifyRegistration() {
        try {
            const lampa = window.Lampa || window.top?.Lampa;
            if(!lampa) return;

            let plugins = [];
            
            // Проверяем все возможные места, где может быть список плагинов
            if(window._plugins) plugins = window._plugins;
            if(lampa.Plugins && Array.isArray(lampa.Plugins)) plugins = plugins.concat(lampa.Plugins);
            if(lampa.PluginManager?.list) plugins = plugins.concat(lampa.PluginManager.list());
            
            const found = plugins.find(p => p.id === 'rh_super_final_v8');
            console.log('[RH SUPER FINAL v8] Verification:', found ? 'SUCCESS!' : 'FAILED!');
            
            if(!found) {
                console.warn('[RH SUPER FINAL v8] Possible solutions:',
                    '1. Clear cache and reload',
                    '2. Try different Lampa version',
                    '3. Check browser console for errors');
            }
        } catch(e) {
            console.error('[RH SUPER FINAL v8] Verification error:', e);
        }
    }

    // 8. Запуск инициализации
    if(!init()) {
        const interval = setInterval(() => {
            if(init()) clearInterval(interval);
        }, 500);
        
        setTimeout(() => {
            clearInterval(interval);
            console.warn('[RH SUPER FINAL v8] Initialization timeout');
        }, 10000);
    }

    // Проверка через 5 секунд
    setTimeout(verifyRegistration, 5000);
})();
