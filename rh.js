(function(){
    if(window.__rh_ultimate_final) return;
    window.__rh_ultimate_final = true;

    console.log('[RH ULTIMATE FINAL] Starting nuclear approach');

    // 1. Конфигурация
    const config = {
        name: "🔥 СМОТРЕТЬ",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-ultimate-btn",
        retryDelay: 300,
        maxRetries: 50 // 15 секунд максимум
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
            document.body.appendChild(btn);
        }
        return btn;
    };

    // 3. Все возможные способы получения ID (расширенная версия)
    const getTmdbId = () => {
        const sources = [
            // 1. Стандартные методы Lampa
            () => window.Lampa?.Storage?.get('card'),
            
            // 2. Внутренние структуры Lampa
            () => window.Lampa?.TMDB?.data?.id ? {
                id: window.Lampa.TMDB.data.id,
                type: window.Lampa.TMDB.data.type
            } : null,
            
            // 3. URL страницы
            () => {
                const match = window.location.href.match(/\/(movie|tv)\/(\d+)/);
                return match ? {id: match[2], type: match[1]} : null;
            },
            
            // 4. Data-атрибуты
            () => {
                const el = document.querySelector('[data-id][data-type]');
                return el ? {
                    id: el.dataset.id,
                    type: el.dataset.type
                } : null;
            },
            
            // 5. Глобальные события
            () => window._lampa_events?.current?.id ? {
                id: window._lampa_events.current.id,
                type: window._lampa_events.current.type
            } : null,
            
            // 6. Внутренний кеш Lampa
            () => window.Lampa?.Cache?.get('card'),
            
            // 7. Перехват XHR-запросов
            () => {
                if(window._lampa_last_xhr_url) {
                    const match = window._lampa_last_xhr_url.match(/(movie|tv)\/(\d+)/);
                    return match ? {id: match[2], type: match[1]} : null;
                }
                return null;
            }
        ];

        // Пробуем все источники
        for(let source of sources) {
            try {
                const result = source();
                if(result?.id) {
                    console.log('ID found via:', source.toString().slice(0, 80));
                    return {
                        id: result.id,
                        type: result.type || 'movie',
                        title: result.title || ''
                    };
                }
            } catch(e) {
                console.warn('Source error:', e);
            }
        }
        
        return null;
    };

    // 4. Перехватчик XHR (дополнительный метод)
    const hookXHR = () => {
        if(window.XMLHttpRequest.isHooked) return;
        
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url) {
            if(url.includes('themoviedb')) {
                window._lampa_last_xhr_url = url;
            }
            return originalOpen.apply(this, arguments);
        };
        
        window.XMLHttpRequest.isHooked = true;
        console.log('XHR hook installed');
    };

    // 5. Основная функция
    const init = (retryCount = 0) => {
        const btn = createButton();
        const tmdbData = getTmdbId();

        if(tmdbData?.id) {
            // Успех - настраиваем кнопку
            btn.innerHTML = `<span style="font-size:20px">▶️</span> ${config.name}`;
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: tmdbData.id,
                    type: tmdbData.type,
                    title: tmdbData.title || '',
                    _: Date.now()
                });
                window.open(`${config.apiUrl}?${params}`, '_blank');
            };
            btn.style.display = 'block';
            
            // Анимация для привлечения внимания
            btn.style.animation = 'rh-pulse 1.5s infinite';
            const style = document.createElement('style');
            style.textContent = `
                @keyframes rh-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
            `;
            document.head.appendChild(style);
            
            console.log(`Success! ID: ${tmdbData.id}`);
            return;
        }

        if(retryCount < config.maxRetries) {
            // Продолжаем попытки
            setTimeout(() => init(retryCount + 1), config.retryDelay);
            if(retryCount === 0) hookXHR(); // Устанавливаем перехватчик
        } else {
            // Все попытки исчерпаны
            btn.innerHTML = `<span style="font-size:20px">❌</span> Ошибка`;
            btn.onclick = () => {
                alert('Действия:\n1. Полностью откройте карточку\n2. Нажмите F5 для перезагрузки\n3. Если проблема сохраняется - сообщите в поддержку');
            };
            btn.style.display = 'block';
            console.error('Failed after all retries');
        }
    };

    // 6. Запуск
    const start = () => {
        if(document.readyState === 'complete') {
            setTimeout(init, 500);
        } else {
            window.addEventListener('load', () => setTimeout(init, 500));
        }
        setTimeout(init, 3000); // Дублирующий запуск
    };

    start();
})();
