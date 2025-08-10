(function(){
    // 1. Защита от дублирования
    if(window.__rh_final_v6_1) return;
    window.__rh_final_v6_1 = true;
    
    console.log('[RH FINAL v6.1] Initializing plugin');

    // 2. Получение объекта Lampa
    function getLampaObject() {
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

    // 3. Инициализация плагина
    function initPlugin() {
        const lampa = getLampaObject();
        if(!lampa) {
            console.warn('[RH FINAL v6.1] Lampa object not found');
            return false;
        }

        console.log('[RH FINAL v6.1] Lampa found:', lampa);

        // 4. Класс источника
        class RhFinalSource {
            constructor() {
                this.name = "RH Source";
                this.id = "rh_final_source_v6_1";
                this.version = "6.1";
                this.type = "universal";
                this.priority = 1;
                this.active = true;
            }

            search(query, tmdb_id, callback) {
                console.log('[RH FINAL v6.1] Search:', query, tmdb_id);
                
                // Временные тестовые данные
                callback([{
                    title: `${query} (RH Test)`,
                    url: `https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4`,
                    quality: "1080p",
                    translation: "оригинал",
                    type: "video",
                    tmdb_id: tmdb_id,
                    iframe: false,
                    external: false,
                    origin: 'RH Source'
                }]);
            }

            sources(item, callback) {
                this.search(item.title, item.id, callback);
            }
        }

        // 5. Регистрация
        try {
            const source = new RhFinalSource();
            
            // Совместимость со всеми версиями
            if(lampa.Plugin?.add) {
                lampa.Plugin.add(source);
                console.log('[RH FINAL v6.1] Registered via Plugin.add()');
            } 
            else if(Array.isArray(lampa.Plugins)) {
                lampa.Plugins.push(source);
                console.log('[RH FINAL v6.1] Registered via Plugins.push()');
            }
            else {
                console.error('[RH FINAL v6.1] No registration method found');
                return false;
            }

            // 6. Проверка через 3 секунды
            setTimeout(() => {
                try {
                    const plugins = lampa.Plugin?.list?.() || 
                                 (Array.isArray(lampa.Plugins) ? lampa.Plugins : []);
                    
                    if(Array.isArray(plugins)) {
                        const found = plugins.find(p => p.id === 'rh_final_source_v6_1');
                        console.log('[RH FINAL v6.1] Verification:', found ? 'SUCCESS' : 'FAILED');
                    } else {
                        console.warn('[RH FINAL v6.1] Plugins is not an array:', plugins);
                    }
                } catch(e) {
                    console.error('[RH FINAL v6.1] Verification error:', e);
                }
            }, 3000);

            return true;
        } catch(e) {
            console.error('[RH FINAL v6.1] Registration error:', e);
            return false;
        }
    }

    // 7. Запуск
    function start() {
        if(initPlugin()) return;
        
        const interval = setInterval(() => {
            if(initPlugin()) clearInterval(interval);
        }, 500);

        setTimeout(() => clearInterval(interval), 10000);
    }

    // 8. Загрузка
    if(document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
})();
