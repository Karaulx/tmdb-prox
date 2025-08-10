(function(){
    // Уникальный идентификатор для защиты от дублирования
    if(window._rh_final_solution) return;
    window._rh_final_solution = true;

    console.log('[RH FINAL] Initializing plugin');

    // Альтернативный метод проверки готовности Lampa
    function checkLampa() {
        // Проверяем разные варианты доступа к Lampa
        const lampa = window.Lampa || window.top.Lampa || window.parent.Lampa;
        if(lampa && (lampa.API || lampa.Plugin)) {
            console.log('[RH FINAL] Lampa found');
            initPlugin(lampa);
            return true;
        }
        return false;
    }

    // Инициализация плагина
    function initPlugin(lampa) {
        console.log('[RH FINAL] Registering plugin');
        
        class RhFinalSource {
            constructor() {
                this.name = "RH Final Source";
                this.id = "rh_final_source";
                this.version = "4.0";
                this.type = "universal";
                this.priority = 1;
            }

            search(query, tmdb_id, callback) {
                console.log('[RH FINAL] Search:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный запрос)
                callback([{
                    title: `${query} [RH TEST]`,
                    url: `https://api4.rhhhhhhh.live/stream?tmdb=${tmdb_id}`,
                    quality: "1080p",
                    translation: "оригинал",
                    type: "video",
                    tmdb_id: tmdb_id
                }]);
            }

            sources(item, callback) {
                this.search(item.title, item.id, callback);
            }
        }

        try {
            // Совместимость со старыми и новыми версиями Lampa
            if(lampa.Plugin && lampa.Plugin.add) {
                lampa.Plugin.add(new RhFinalSource());
                console.log('[RH FINAL] Plugin registered via Plugin.add()');
            } 
            else if(lampa.Plugins && lampa.Plugins.push) {
                lampa.Plugins.push(new RhFinalSource());
                console.log('[RH FINAL] Plugin registered via Plugins.push()');
            }
            else {
                throw new Error('No compatible plugin registration method found');
            }

            // Принудительное обновление
            if(lampa.API && lampa.API.pluginUpdate) {
                lampa.API.pluginUpdate();
                console.log('[RH FINAL] Cache updated');
            }

            // Проверка через 5 секунд
            setTimeout(() => {
                const plugins = lampa.Plugin ? lampa.Plugin.list() : (lampa.Plugins || []);
                const found = plugins.find(p => p.id === 'rh_final_source');
                console.log('[RH FINAL] Verification:', found ? 'SUCCESS' : 'FAILED');
                
                if(found) {
                    found.search('Test', 123, console.log);
                }
            }, 5000);
        }
        catch(e) {
            console.error('[RH FINAL] Registration error:', e);
        }
    }

    // Пытаемся сразу найти Lampa
    if(!checkLampa()) {
        // Если не найдено, устанавливаем интервал проверки
        const interval = setInterval(() => {
            if(checkLampa()) {
                clearInterval(interval);
            }
        }, 100);
        
        // Таймаут через 10 секунд
        setTimeout(() => {
            clearInterval(interval);
            console.warn('[RH FINAL] Lampa not found after 10 seconds');
        }, 10000);
    }
})();
