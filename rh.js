(function(){
    if(window.__rh_final_v4) return;
    window.__rh_final_v4 = true;

    console.log('[RH FINAL v4] Initializing');

    // 1. Конфигурация плагина
    const config = {
        id: "rh_final_v4",
        name: "RH Фильмы", 
        type: "universal",
        priority: 1,
        proxy: 'https://novomih25.duckdns.org:9092/tmdb-api'
    };

    // 2. Основной метод поиска
    config.search = function(query, tmdb_id, callback) {
        console.log(`[RH] Поиск: ${query} (ID: ${tmdb_id})`);
        
        fetch(`${this.proxy}/movie/${tmdb_id}/videos`)
            .then(r => r.json())
            .then(data => {
                const results = data.results.map(video => ({
                    title: `${query} (${video.type})`,
                    url: video.site === 'YouTube' 
                        ? `https://youtu.be/${video.key}`
                        : `${this.proxy}/video/${video.key}`,
                    quality: video.size > 720 ? '1080p' : '720p',
                    type: 'video',
                    tmdb_id: tmdb_id
                }));
                callback(results.length ? results : this._getFallback());
            })
            .catch(e => {
                console.error('[RH] Ошибка:', e);
                callback(this._getFallback());
            });
    };

    config._getFallback = function() {
        return [{
            title: 'Резервное видео',
            url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            quality: '1080p',
            type: 'video'
        }];
    };

    // 3. Регистрация плагина
    if(!window._plugins) window._plugins = [];
    window._plugins.push(config);
    console.log('[RH] Плагин зарегистрирован');

    // 4. Интеграция с интерфейсом
    const integrateUI = () => {
        // Ждем появления кнопки источников
        const checkButton = () => {
            const sourcesBtn = document.querySelector('.selectbox [data-type="source"]');
            const trailersBtn = document.querySelector('.selectbox [data-type="trailer"]');
            
            if(sourcesBtn || trailersBtn) {
                // Создаем свою кнопку
                const btn = document.createElement('div');
                btn.className = 'selectbox__item';
                btn.dataset.type = 'rh_source';
                btn.innerHTML = `
                    <div class="selectbox__item-icon">
                        <svg height="24" viewBox="0 0 24 24" width="24">
                            <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z"/>
                        </svg>
                    </div>
                    <div class="selectbox__item-title">${config.name}</div>
                `;
                
                btn.onclick = () => {
                    const card = window.Lampa.Storage.get('card');
                    if(card) {
                        config.search(card.title, card.id, results => {
                            if(results.length) {
                                window.Lampa.Player.play({
                                    title: card.title,
                                    files: results
                                });
                            }
                        });
                    }
                };
                
                // Добавляем в список
                const container = document.querySelector('.selectbox');
                if(container) {
                    container.appendChild(btn);
                    console.log('[RH] Кнопка добавлена в интерфейс');
                }
            } else {
                setTimeout(checkButton, 300);
            }
        };
        
        checkButton();
    };

    // 5. Запускаем интеграцию после загрузки
    if(document.readyState === 'complete') {
        integrateUI();
    } else {
        window.addEventListener('load', integrateUI);
    }
})();
