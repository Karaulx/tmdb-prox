(function(){
    if(window.__rh_final_solution) return;
    window.__rh_final_solution = true;

    console.log('[RH FINAL SOLUTION] Initializing');

    // 1. Конфигурация на основе логов reyohoho
    const config = {
        name: "▶️ RH Плеер",
        apiBase: "https://api4.rhhhhhhh.live",
        btnId: "rh-final-btn",
        checkInterval: 500,
        maxChecks: 20
    };

    // 2. Создаем НЕУДАЛЯЕМУЮ кнопку
    const createButton = () => {
        let btn = document.getElementById(config.btnId);
        if(!btn) {
            btn = document.createElement('div');
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
            
            // Анимация для привлечения внимания
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rh-pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                    100% { transform: scale(1); opacity: 1; }
                }
                #${config.btnId} {
                    animation: rh-pulse 1.5s infinite;
                }
            `;
            document.head.appendChild(style);
        }
        return btn;
    };

    // 3. Анализ запросов к API (как в логах reyohoho)
    const getContentIds = () => {
        const requests = performance.getEntriesByType("resource");
        const ids = {};
        
        requests.forEach(req => {
            // IMDB ID (как /imdb_to_kp/tt0198781)
            const imdbMatch = req.name.match(/imdb_to_kp\/(tt\d+)/);
            if(imdbMatch) ids.imdb_id = imdbMatch[1];
            
            // Kinopoisk ID (как /kp_info2/458)
            const kpMatch = req.name.match(/kp_info2\/(\d+)/);
            if(kpMatch) ids.kp_id = kpMatch[1];
        });
        
        return ids;
    };

    // 4. Формирование URL для плеера
    const getPlayUrl = (ids) => {
        if(!ids.kp_id) return null;
        
        const params = new URLSearchParams({
            kp_id: ids.kp_id,
            imdb_id: ids.imdb_id || '',
            _: Date.now()
        });
        
        return `${config.apiBase}/play?${params}`;
    };

    // 5. Основная функция
    const init = (attempt = 0) => {
        const btn = createButton();
        const ids = getContentIds();
        const playUrl = getPlayUrl(ids);

        if(playUrl) {
            btn.onclick = () => {
                console.log('Starting player with URL:', playUrl);
                
                // Проверяем доступность API
                fetch(`${config.apiBase}/health`)
                    .then(() => {
                        // Запускаем через плеер Lampa если доступен
                        if(window.Lampa?.Player?.play) {
                            window.Lampa.Player.play({
                                title: ids.imdb_id || ids.kp_id,
                                files: [{
                                    title: 'RH Плеер',
                                    file: playUrl,
                                    type: 'video/mp4'
                                }]
                            });
                        } else {
                            window.open(playUrl, '_blank');
                        }
                    })
                    .catch(e => {
                        console.error('API health check failed:', e);
                        alert('API временно недоступен. Попробуйте позже.');
                    });
            };
            console.log('Play button ready with IDs:', ids);
            return;
        }

        if(attempt < config.maxChecks) {
            setTimeout(() => init(attempt + 1), config.checkInterval);
        } else {
            btn.onclick = () => alert('Не удалось определить контент. Откройте карточку полностью и обновите страницу.');
        }
    };

    // 6. Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 1000);
    } else {
        window.addEventListener('load', () => setTimeout(init, 1000));
    }

    // Дублирующий запуск через 3 секунды
    setTimeout(init, 3000);
})();
