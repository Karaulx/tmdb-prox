(function(){
    if(window.__rh_ultimate_integration) return;
    window.__rh_ultimate_integration = true;

    console.log('[RH ULTIMATE INTEGRATION] Starting');

    // 1. Создаем кнопку, которая будет ВИДНА В ЛЮБОМ СЛУЧАЕ
    const btn = document.createElement('button');
    btn.id = 'rh-ultimate-btn';
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
        animation: rh-pulse 1.5s infinite !important;
    `;
    btn.innerHTML = `<span style="font-size:20px">▶️</span> RH Плеер`;
    document.body.appendChild(btn);

    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rh-pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.9; }
            100% { transform: scale(1); opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // 2. Агрессивный поиск ID контента
    const findContentId = () => {
        // Все возможные способы получить ID
        const strategies = [
            // 1. Из URL (например: /movie/123 или /tv/456)
            () => {
                const match = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                return match ? {id: match[2], type: match[1]} : null;
            },
            
            // 2. Из сетевых запросов (как в логах reyohoho)
            () => {
                const requests = performance.getEntriesByType("resource");
                for(let req of requests) {
                    // Ищем /kp_info2/458 или /imdb_to_kp/tt0198781
                    const kpMatch = req.name.match(/kp_info2\/(\d+)/);
                    if(kpMatch) return {id: kpMatch[1], type: 'kp'};
                    
                    const imdbMatch = req.name.match(/imdb_to_kp\/(tt\d+)/);
                    if(imdbMatch) return {id: imdbMatch[1], type: 'imdb'};
                }
                return null;
            },
            
            // 3. Из глобальных переменных Lampa
            () => {
                try {
                    if(window.Lampa?.Storage?.get('card')?.id) {
                        return {
                            id: window.Lampa.Storage.get('card').id,
                            type: window.Lampa.Storage.get('card').type || 'movie'
                        };
                    }
                } catch(e) {}
                return null;
            }
        ];

        // Пробуем все стратегии по очереди
        for(let strategy of strategies) {
            try {
                const result = strategy();
                if(result?.id) return result;
            } catch(e) {
                console.warn('Strategy error:', e);
            }
        }
        
        return null;
    };

    // 3. Формирование конечного URL
    const getPlayUrl = (idData) => {
        if(!idData) return null;
        
        const params = new URLSearchParams({
            [idData.type === 'imdb' ? 'imdb_id' : 'tmdb_id']: idData.id,
            _: Date.now()
        });
        
        return `https://api4.rhhhhhhh.live/play?${params}`;
    };

    // 4. Обновление состояния кнопки
    const updateButton = () => {
        const idData = findContentId();
        const playUrl = getPlayUrl(idData);

        if(playUrl) {
            btn.onclick = () => {
                console.log('Opening:', playUrl);
                window.open(playUrl, '_blank');
            };
            btn.style.background = 'linear-gradient(135deg, #00AA00, #00FF00)';
            btn.innerHTML = `<span style="font-size:20px">▶️</span> Смотреть (ID: ${idData.id})`;
        } else {
            btn.onclick = () => {
                alert('Действия:\n1. Полностью откройте карточку\n2. Дождитесь загрузки\n3. Нажмите F5');
            };
            btn.style.background = 'linear-gradient(135deg, #FF0000, #FF4500)';
            btn.innerHTML = `<span style="font-size:20px">❌</span> Данные не загружены`;
        }
    };

    // 5. Запускаем проверку каждые 500мс
    const interval = setInterval(updateButton, 500);
    
    // Первая проверка
    updateButton();

    // Останавливаем через 30 секунд
    setTimeout(() => {
        clearInterval(interval);
        console.log('Stopped checking for content ID');
    }, 30000);

    console.log('RH Ultimate Integration activated');
})();
