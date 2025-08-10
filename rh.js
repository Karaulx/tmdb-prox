(function(){
    if(window.__rh_nuclear_loader) return;
    window.__rh_nuclear_loader = true;

    console.log('[RH NUCLEAR LOADER] Starting aggressive interception');

    // 1. Конфигурация
    const config = {
        name: "▶️ RH Плеер",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-nuclear-btn",
        checkInterval: 500,
        maxChecks: 40 // 20 секунд максимум
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
                z-index: 2147483647 !important; /* Максимальный z-index */
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
            document.body.appendChild(btn);
        }
        return btn;
    };

    // 3. Перехват всех возможных мест, где может быть TMDB ID
    const huntForTmdbId = () => {
        // Все возможные источники ID в порядке приоритета
        const sources = [
            // 1. Lampa Storage (оригинальный способ)
            () => {
                try {
                    const card = window.Lampa?.Storage?.get('card');
                    if(card?.id) return {
                        id: card.id,
                        type: card.type || 'movie',
                        title: card.title || ''
                    };
                } catch(e) {}
                return null;
            },
            
            // 2. Внутренние переменные Lampa
            () => {
                try {
                    if(window.Lampa?.TMDB?.id) return {
                        id: window.Lampa.TMDB.id,
                        type: window.Lampa.TMDB.type
                    };
                    
                    if(window.Lampa?.Player?.current?.id) return {
                        id: window.Lampa.Player.current.id,
                        type: window.Lampa.Player.current.type
                    };
                } catch(e) {}
                return null;
            },
            
            // 3. URL страницы
            () => {
                try {
                    const match = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                    if(match) return {
                        id: match[2],
                        type: match[1]
                    };
                } catch(e) {}
                return null;
            },
            
            // 4. Атрибуты data-* в DOM
            () => {
                try {
                    const elements = document.querySelectorAll('[data-id][data-type]');
                    for(let el of elements) {
                        if(el.dataset.id && el.dataset.type) {
                            return {
                                id: el.dataset.id,
                                type: el.dataset.type
                            };
                        }
                    }
                } catch(e) {}
                return null;
            },
            
            // 5. Внутренние события Lampa
            () => {
                try {
                    if(window._lampa_events?.current?.id) return {
                        id: window._lampa_events.current.id,
                        type: window._lampa_events.current.type
                    };
                } catch(e) {}
                return null;
            }
        ];

        // Пробуем все источники по очереди
        for(let source of sources) {
            try {
                const result = source();
                if(result?.id) {
                    console.log('TMDB ID найден через:', source.toString().slice(0, 100));
                    return result;
                }
            } catch(e) {
                console.error('Ошибка в источнике:', e);
            }
        }

        return null;
    };

    // 4. Агрессивный мониторинг
    const startNuclearMonitoring = () => {
        const btn = createButton();
        let checksCount = 0;
        let success = false;

        const checkInterval = setInterval(() => {
            checksCount++;
            const tmdbData = huntForTmdbId();

            if(tmdbData?.id && !success) {
                // Успешно нашли ID
                success = true;
                clearInterval(checkInterval);
                
                btn.innerHTML = `<span style="font-size:20px">▶️</span> ${config.name}`;
                btn.onclick = () => {
                    const params = new URLSearchParams({
                        tmdb_id: tmdbData.id,
                        type: tmdbData.type,
                        title: tmdbData.title || '',
                        _: Date.now(),
                        from: 'nuclear_loader'
                    });
                    window.open(`${config.apiUrl}?${params.toString()}`, '_blank');
                };
                
                console.log(`Успешно! ID: ${tmdbData.id}, тип: ${tmdbData.type}`);
                
                // Добавляем анимацию для привлечения внимания
                btn.style.animation = 'rh-pulse 1.5s infinite';
                const pulseStyle = document.createElement('style');
                pulseStyle.textContent = `
                    @keyframes rh-pulse {
                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7); }
                        70% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(255, 0, 0, 0); }
                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 0, 0, 0); }
                    }
                `;
                document.head.appendChild(pulseStyle);
                
                return;
            }

            if(checksCount >= config.maxChecks && !success) {
                // Превышено количество попыток
                clearInterval(checkInterval);
                btn.innerHTML = `<span style="font-size:20px">❌</span> Ошибка загрузки`;
                btn.onclick = () => {
                    alert('Пожалуйста:\n1. Убедитесь что карточка полностью открыта\n2. Проверьте интернет-соединение\n3. Обновите страницу (Ctrl+F5)');
                };
                btn.style.background = '#FF0000';
                console.error('Не удалось получить TMDB ID после всех попыток');
            }
        }, config.checkInterval);
    };

    // 5. Запускаем при полной загрузке страницы
    if(document.readyState === 'complete') {
        startNuclearMonitoring();
    } else {
        window.addEventListener('load', startNuclearMonitoring);
    }

    // Дублирующий запуск через 3 секунды
    setTimeout(startNuclearMonitoring, 3000);
})();
