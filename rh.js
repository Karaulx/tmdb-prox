(function(){
    if(window.__rh_reyohoho_integration) return;
    window.__rh_reyohoho_integration = true;

    console.log('[RH REYOHOHO INTEGRATION] Initializing');

    // 1. Конфигурация на основе логов reyohoho
    const config = {
        name: "▶️ RH Плеер",
        apiBase: "https://api4.rhhhhhhh.live",
        endpoints: {
            health: "/health",
            imdbToKp: "/imdb_to_kp/{imdb_id}",
            kpInfo: "/kp_info2/{kp_id}",
            rating: "/rating/{kp_id}",
            comments: "/comments/{kp_id}",
            play: "/play" 
        },
        btnId: "rh-reyohoho-btn"
    };

    // 2. Анализ текущих запросов для определения ID
    const extractContentIds = () => {
        const requests = performance.getEntriesByType("resource");
        let ids = {};

        requests.forEach(req => {
            // Определяем IMDB ID (как в логе /imdb_to_kp/0198781)
            const imdbMatch = req.name.match(/imdb_to_kp\/(tt\d+)/);
            if(imdbMatch) ids.imdb_id = imdbMatch[1];

            // Определяем KP ID (как в логе /kp_info2/458)
            const kpMatch = req.name.match(/kp_info2\/(\d+)/);
            if(kpMatch) ids.kp_id = kpMatch[1];
        });

        return ids;
    };

    // 3. Создаем кнопку в стиле Lampa
    const createButton = () => {
        const btn = document.createElement('div');
        btn.id = config.btnId;
        btn.className = 'selector__item';
        btn.innerHTML = `
            <div class="selector__item-icon">
                <svg height="24" viewBox="0 0 24 24" width="24" fill="#FF0000">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            </div>
            <div class="selector__item-title">${config.name}</div>
        `;
        btn.style.cssText = 'margin: 5px; cursor: pointer;';
        return btn;
    };

    // 4. Формируем правильный play-запрос как в reyohoho
    const buildPlayRequest = (ids) => {
        if(!ids.kp_id) return null;

        const params = new URLSearchParams({
            kp_id: ids.kp_id,
            imdb_id: ids.imdb_id || '',
            _: Date.now()
        });

        return `${config.apiBase}${config.endpoints.play}?${params}`;
    };

    // 5. Встраиваем кнопку в интерфейс Lampa
    const init = (attempt = 0) => {
        const ids = extractContentIds();
        const playUrl = buildPlayRequest(ids);
        const container = document.querySelector('.selector__items, .full__buttons');

        if(container && playUrl) {
            const btn = createButton();
            
            btn.onclick = () => {
                // Полная последовательность как в reyohoho
                fetch(`${config.apiBase}${config.endpoints.health}`)
                    .then(() => {
                        // 1. Проверка здоровья API
                        fetch(`${config.apiBase}${config.endpoints.imdbToKp.replace('{imdb_id}', ids.imdb_id || '')}`)
                            .then(() => {
                                // 2. Получение информации о фильме
                                fetch(`${config.apiBase}${config.endpoints.kpInfo.replace('{kp_id}', ids.kp_id)}`)
                                    .then(() => {
                                        // 3. Запуск плеера
                                        if(window.Lampa?.Player?.play) {
                                            window.Lampa.Player.play({
                                                title: "RH Плеер",
                                                files: [{
                                                    title: "RH Плеер",
                                                    file: playUrl,
                                                    type: "video/mp4"
                                                }]
                                            });
                                        } else {
                                            window.open(playUrl, '_blank');
                                        }
                                    });
                            });
                    })
                    .catch(e => {
                        console.error('API error:', e);
                        alert('Ошибка доступа к API. Попробуйте позже.');
                    });
            };

            container.appendChild(btn);
            console.log('Button integrated with Lampa');
            return;
        }

        if(attempt < 5) setTimeout(() => init(attempt + 1), 1000);
    };

    // 6. Запускаем
    if(document.readyState === 'complete') {
        setTimeout(init, 500);
    } else {
        window.addEventListener('load', () => setTimeout(init, 500));
    }
})();
