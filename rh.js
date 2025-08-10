(function(){
    if(window.__rh_absolute_solution) return;
    window.__rh_absolute_solution = true;

    console.log('[RH ABSOLUTE SOLUTION] Starting nuclear approach');

    // 1. Конфигурация
    const config = {
        name: "🔥 RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-absolute-btn",
        maxWaitTime: 15000 // 15 секунд максимум
    };

    // 2. Создаем "неубиваемую" кнопку
    const createButton = () => {
        let btn = document.getElementById(config.btnId);
        if(!btn) {
            btn = document.createElement('button');
            btn.id = config.btnId;
            btn.style.cssText = `
                position: fixed !important;
                right: 20px !important;
                bottom: 80px !important;
                z-index: 2147483647 !important;
                background: linear-gradient(135deg, #FF0000, #FF4500) !important;
                color: white !important;
                padding: 14px 28px !important;
                border-radius: 12px !important;
                font-size: 18px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border: none !important;
                box-shadow: 0 6px 24px rgba(255, 0, 0, 0.4) !important;
                display: flex !important;
                align-items: center !important;
                gap: 10px !important;
            `;
            btn.innerHTML = `<span style="font-size:20px">▶️</span> ${config.name}`;
            document.body.appendChild(btn);
        }
        return btn;
    };

    // 3. Расширенный метод получения данных карточки
    const getCardData = () => {
        // Все возможные источники данных
        const sources = [
            // 1. Официальный API Lampa
            () => {
                try {
                    const card = window.Lampa?.Storage?.get('card');
                    if(card?.id) return card;
                } catch(e) {}
                return null;
            },
            
            // 2. Внутренние структуры Lampa
            () => {
                try {
                    if(window.Lampa?.TMDB?.data?.id) {
                        return {
                            id: window.Lampa.TMDB.data.id,
                            type: window.Lampa.TMDB.data.type,
                            title: window.Lampa.TMDB.data.title
                        };
                    }
                } catch(e) {}
                return null;
            },
            
            // 3. Анализ DOM
            () => {
                try {
                    const meta = document.querySelector('meta[property="tmdb:id"]');
                    if(meta) {
                        return {
                            id: meta.content,
                            type: document.querySelector('meta[property="tmdb:type"]')?.content || 'movie'
                        };
                    }
                } catch(e) {}
                return null;
            },
            
            // 4. Перехват сетевых запросов
            () => {
                try {
                    if(window._rh_last_tmdb_request) {
                        const match = window._rh_last_tmdb_request.match(/(movie|tv)\/(\d+)/);
                        if(match) return {id: match[2], type: match[1]};
                    }
                } catch(e) {}
                return null;
            },
            
            // 5. Глобальные переменные Lampa
            () => {
                try {
                    if(window._lampa_events?.current?.id) {
                        return {
                            id: window._lampa_events.current.id,
                            type: window._lampa_events.current.type
                        };
                    }
                } catch(e) {}
                return null;
            }
        ];

        // Пробуем все источники
        for(let source of sources) {
            try {
                const data = source();
                if(data?.id) {
                    console.log('Data source:', source.toString().slice(0, 100));
                    return {
                        id: data.id,
                        type: data.type || 'movie',
                        title: data.title || '',
                        season: data.season,
                        episode: data.episode
                    };
                }
            } catch(e) {
                console.warn('Source error:', e);
            }
        }
        
        return null;
    };

    // 4. Перехватчик сетевых запросов
    const hookNetworkRequests = () => {
        if(window.XMLHttpRequest.isHooked) return;
        
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if(url.includes('themoviedb')) {
                window._rh_last_tmdb_request = url;
            }
            return originalOpen.apply(this, arguments);
        };
        
        window.XMLHttpRequest.isHooked = true;
        console.log('Network hook installed');
    };

    // 5. Основная функция
    const init = (startTime = Date.now()) => {
        hookNetworkRequests();
        const btn = createButton();
        const card = getCardData();

        if(card?.id) {
            // Успешно получили данные
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: card.id,
                    type: card.type,
                    season: card.season || '',
                    episode: card.episode || '',
                    title: encodeURIComponent(card.title),
                    _: Date.now()
                });
                
                // Пробуем запустить через Lampa Player
                if(window.Lampa?.Player?.play) {
                    window.Lampa.Player.play({
                        title: card.title,
                        files: [{
                            title: card.title,
                            file: `${config.apiUrl}?${params}`,
                            type: 'video/mp4'
                        }]
                    });
                } else {
                    window.open(`${config.apiUrl}?${params}`, '_blank');
                }
            };
            
            console.log('Success! ID:', card.id);
            return;
        }

        if(Date.now() - startTime < config.maxWaitTime) {
            setTimeout(() => init(startTime), 500);
        } else {
            btn.onclick = () => {
                alert('Для работы плагина:\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Обновите страницу (Ctrl+F5)');
            };
            console.error('Failed after all attempts');
        }
    };

    // 6. Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }

    // Дублирующий запуск через 5 секунд
    setTimeout(init, 5000);
})();
