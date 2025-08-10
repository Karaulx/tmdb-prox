(function(){
    if(window.__rh_super_loader) return;
    window.__rh_super_loader = true;

    console.log('[RH SUPER LOADER] Initializing');

    // 1. Конфигурация
    const config = {
        name: "▶️ Смотреть на RH",
        apiUrl: "https://api4.rhhhhhhh.live/play",
        btnId: "rh-super-btn",
        retryDelay: 500,
        maxRetries: 30 // 15 секунд максимум
    };

    // 2. Создаем кнопку с гарантированным отображением
    const createButton = () => {
        let btn = document.getElementById(config.btnId);
        if(!btn) {
            btn = document.createElement('button');
            btn.id = config.btnId;
            btn.style.cssText = `
                position: fixed !important;
                right: 20px !important;
                bottom: 80px !important;
                z-index: 99999 !important;
                background: #FF2D2D !important;
                color: white !important;
                padding: 12px 24px !important;
                border-radius: 10px !important;
                font-size: 16px !important;
                font-weight: bold !important;
                cursor: pointer !important;
                border: none !important;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
                display: none !important;
            `;
            document.body.appendChild(btn);
        }
        return btn;
    };

    // 3. Все возможные способы получения TMDB ID
    const getTmdbId = () => {
        // Способ 1: Через Lampa Storage (основной)
        try {
            const card = window.Lampa?.Storage?.get('card');
            if(card?.id) {
                console.log('ID получен через Lampa Storage:', card.id);
                return {
                    id: card.id,
                    type: card.type || 'movie',
                    title: card.title || ''
                };
            }
        } catch(e) {
            console.error('Ошибка при доступе к Lampa Storage:', e);
        }

        // Способ 2: Из URL страницы
        try {
            const urlMatch = window.location.href.match(/\/(movie|tv)\/(\d+)/);
            if(urlMatch) {
                console.log('ID получен из URL:', urlMatch[2]);
                return {
                    id: urlMatch[2],
                    type: urlMatch[1]
                };
            }
        } catch(e) {
            console.error('Ошибка при парсинге URL:', e);
        }

        // Способ 3: Из meta-тегов
        try {
            const metaId = document.querySelector('meta[property="tmdb:id"], meta[name="tmdb_id"]');
            if(metaId) {
                const id = metaId.getAttribute('content') || metaId.getAttribute('value');
                console.log('ID получен из meta-тегов:', id);
                return {
                    id: id,
                    type: document.querySelector('meta[property="tmdb:type"]')?.content || 'movie'
                };
            }
        } catch(e) {
            console.error('Ошибка при чтении meta-тегов:', e);
        }

        // Способ 4: Из JSON-LD данных
        try {
            const jsonLd = document.querySelector('script[type="application/ld+json"]');
            if(jsonLd) {
                const data = JSON.parse(jsonLd.textContent);
                const url = data?.url || '';
                const match = url.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
                if(match) {
                    console.log('ID получен из JSON-LD:', match[2]);
                    return {
                        id: match[2],
                        type: match[1]
                    };
                }
            }
        } catch(e) {
            console.error('Ошибка при парсинге JSON-LD:', e);
        }

        // Способ 5: Из атрибутов кнопок плеера
        try {
            const playerBtn = document.querySelector('[data-id][data-type]');
            if(playerBtn) {
                console.log('ID получен из атрибутов кнопки:', playerBtn.dataset.id);
                return {
                    id: playerBtn.dataset.id,
                    type: playerBtn.dataset.type
                };
            }
        } catch(e) {
            console.error('Ошибка при чтении атрибутов кнопки:', e);
        }

        return null;
    };

    // 4. Инициализация с агрессивным поиском ID
    const init = (retryCount = 0) => {
        const btn = createButton();
        const tmdbData = getTmdbId();

        if(tmdbData?.id) {
            // Настройка кнопки при успешном получении ID
            btn.textContent = `${config.name}`;
            btn.onclick = () => {
                const params = new URLSearchParams({
                    tmdb_id: tmdbData.id,
                    type: tmdbData.type,
                    title: tmdbData.title || '',
                    _: Date.now()
                });
                window.open(`${config.apiUrl}?${params.toString()}`, '_blank');
            };
            btn.style.display = 'block';
            console.log('Кнопка активирована с ID:', tmdbData.id);
        } else if(retryCount < config.maxRetries) {
            // Продолжаем попытки
            setTimeout(() => init(retryCount + 1), config.retryDelay);
            if(retryCount % 5 === 0) {
                console.log(`Попытка ${retryCount + 1}/${config.maxRetries}...`);
            }
        } else {
            // Все попытки исчерпаны
            btn.textContent = '❌ Ошибка загрузки';
            btn.onclick = () => {
                alert('Пожалуйста:\n1. Полностью откройте карточку\n2. Обновите страницу\n3. Попробуйте снова');
            };
            btn.style.display = 'block';
            console.error('Не удалось получить TMDB ID после всех попыток');
        }
    };

    // 5. Запуск
    if(document.readyState === 'complete') {
        setTimeout(init, 500);
    } else {
        window.addEventListener('load', () => setTimeout(init, 500));
    }

    // Дублирующий запуск через 5 секунд
    setTimeout(init, 5000);
})();
