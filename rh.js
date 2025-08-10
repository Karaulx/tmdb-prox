(function(){
    if(window.__rh_ultimate_api_connector) return;
    window.__rh_ultimate_api_connector = true;

    console.log('[RH ULTIMATE API CONNECTOR] Initializing');

    // Конфигурация
    const config = {
        name: "RH Плеер",
        icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FF0000"><path d="M8 5v14l11-7z"/></svg>`,
        apiUrl: "https://api4.rhhhhhhh.live/play",
        retryDelay: 1000,
        maxRetries: 5
    };

    // Стили кнопки
    const style = document.createElement('style');
    style.textContent = `
        .rh-player-btn {
            display: flex;
            align-items: center;
            padding: 10px 15px;
            margin: 5px;
            background: rgba(255, 40, 40, 0.2);
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s;
            font-weight: 500;
        }
        .rh-player-btn:hover {
            background: rgba(255, 40, 40, 0.3);
        }
        .rh-player-icon {
            width: 20px;
            height: 20px;
            margin-right: 8px;
        }
    `;
    document.head.appendChild(style);

    // Все способы получения TMDB ID
    const getTmdbId = () => {
        // 1. Через Lampa Storage (основной способ)
        try {
            const card = window.Lampa?.Storage?.get('card');
            if(card?.id) return {
                id: card.id,
                type: card.type,
                season: card.season,
                episode: card.episode
            };
        } catch(e) {}

        // 2. Из URL страницы
        const urlMatch = window.location.href.match(/(movie|tv)\/(\d+)/);
        if(urlMatch) return {
            id: urlMatch[2],
            type: urlMatch[1] === 'movie' ? 'movie' : 'tv'
        };

        // 3. Из meta-тегов
        const metaId = document.querySelector('meta[property="tmdb:id"], meta[name="tmdb_id"]');
        if(metaId) return {
            id: metaId.getAttribute('content') || metaId.getAttribute('value'),
            type: document.querySelector('meta[property="tmdb:type"]')?.content || 'movie'
        };

        // 4. Из данных в DOM
        const scriptData = document.querySelector('script[type="application/ld+json"]');
        if(scriptData) {
            try {
                const data = JSON.parse(scriptData.textContent);
                if(data.url) {
                    const tmdbMatch = data.url.match(/themoviedb\.org\/(movie|tv)\/(\d+)/);
                    if(tmdbMatch) return {
                        id: tmdbMatch[2],
                        type: tmdbMatch[1]
                    };
                }
            } catch(e) {}
        }

        return null;
    };

    // Создание кнопки
    const createButton = (retryCount = 0) => {
        if(retryCount >= config.maxRetries) {
            console.warn('Max retries reached, button not created');
            return;
        }

        const container = document.querySelector('.selector__items, .selectbox, .player__sources') 
                       || document.body;

        // Удаляем старую кнопку если есть
        const oldBtn = document.querySelector('.rh-player-btn');
        if(oldBtn) oldBtn.remove();

        const button = document.createElement('div');
        button.className = 'rh-player-btn';
        button.innerHTML = `
            <div class="rh-player-icon">${config.icon}</div>
            <div>${config.name}</div>
        `;

        button.onclick = () => {
            const data = getTmdbId();
            if(!data?.id) {
                alert('Ошибка: Не удалось определить ID контента\nПопробуйте открыть карточку заново');
                return;
            }

            const params = new URLSearchParams();
            params.append('tmdb_id', data.id);
            params.append('type', data.type || 'movie');
            if(data.season) params.append('season', data.season);
            if(data.episode) params.append('episode', data.episode);

            window.open(`${config.apiUrl}?${params.toString()}`, '_blank');
        };

        container.appendChild(button);
        console.log('RH button added successfully');
    };

    // Запуск
    const init = () => {
        let attempts = 0;
        const tryCreate = () => {
            attempts++;
            if(typeof Lampa !== 'undefined' || attempts >= 3) {
                createButton();
            } else {
                setTimeout(tryCreate, 1000);
            }
        };

        if(document.readyState === 'complete') {
            tryCreate();
        } else {
            window.addEventListener('load', tryCreate);
        }
    };

    init();
})();
