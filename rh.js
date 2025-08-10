(function(){
    // 1. Защита от дублирования
    if(window.__rh_final_v6) return;
    window.__rh_final_v6 = true;
    
    console.log('[RH FINAL v6] Initializing plugin');

    // 2. Функция для получения объекта Lampa с учетом всех возможных вариантов
    function getLampaObject() {
        // Основные места, где может находиться Lampa
        const targets = [
            window,
            window.top,
            window.parent,
            window.opener,
            document.querySelector('iframe#lampa')?.contentWindow,
            document.querySelector('iframe[name="lampa"]')?.contentWindow
        ].filter(Boolean);

        for(const target of targets) {
            try {
                if(target.Lampa) return target.Lampa;
                if(target.__lampa_public?.Lampa) return target.__lampa_public.Lampa;
            } catch(e) {}
        }
        
        return null;
    }

    // 3. Основная функция инициализации
    function initPlugin() {
        const lampa = getLampaObject();
        
        if(!lampa) {
            console.warn('[RH FINAL v6] Lampa object not found');
            return false;
        }

        console.log('[RH FINAL v6] Lampa found:', lampa);

        // 4. Создаем класс источника
        class RhFinalSource {
            constructor() {
                this.name = "RH Source Final";
                this.id = "rh_final_source_v6";
                this.version = "6.0";
                this.type = "universal";
                this.priority = 1;
                this.active = true; // Явно указываем, что источник активен
                this.supported_types = ['movie', 'series']; // Явное указание поддерживаемых типов
            }

            search(query, tmdb_id, callback) {
                console.log('[RH FINAL v6] Search:', query, tmdb_id);
                
                // Тестовые данные (замените на реальный API запрос)
                callback([{
                    title: `${query} [RH TEST]`,
                    url: `https://api4.rhhhhhhh.live/stream?tmdb=${tmdb_id}`,
                    quality: "1080p",
                    translation: "оригинал",
                    type: "video",
                    tmdb_id: tmdb_id,
                    // Дополнительные обязательные поля
                    iframe: false,
                    external: false,
                    origin: 'RH Source'
                }]);
            }

            sources(item, callback) {
                this.search(item.title, item.id, callback);
            }
        }

        // 5. Регистрация источника
        try {
            const source = new RhFinalSource();
            
            // Совместимость со всеми версиями Lampa
            if(lampa.Plugin?.add) {
                lampa.Plugin.add(source);
                console.log('[RH FINAL v6] Registered via Plugin.add()');
            } 
            else if(lampa.Plugins?.push) {
                lampa.Plugins.push(source);
                console.log('[RH FINAL v6] Registered via Plugins.push()');
            }
            else {
                console.error('[RH FINAL v6] No registration method found');
                return false;
            }

            // 6. Принудительное обновление кеша
            if(lampa.API?.pluginUpdate) {
                lampa.API.pluginUpdate();
                console.log('[RH FINAL v6] Cache updated');
            }

            // 7. Проверка через 3 секунды
            setTimeout(() => {
                const plugins = lampa.Plugin?.list?.() || lampa.Plugins || [];
                const found = plugins.find(p => p.id === 'rh_final_source_v6');
                console.log('[RH FINAL v6] Verification:', found ? 'SUCCESS' : 'FAILED');
                
                if(!found) {
                    console.warn('[RH FINAL v6] Possible solutions:',
                        '1. Clear cache and reload',
                        '2. Check plugin priority',
                        '3. Verify Lampa version compatibility');
                }
            }, 3000);

            return true;
        } catch(e) {
            console.error('[RH FINAL v6] Registration error:', e);
            return false;
        }
    }

    // 8. Стратегия запуска
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
            console.warn('[RH FINAL v6] Initialization timeout');
        }, 10000);
    }

    // 9. Запускаем после полной загрузки страницы
    if(document.readyState === 'complete') {
        start();
    } else {
        window.addEventListener('load', start);
    }
})();
