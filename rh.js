(function(){
    if(window.__rh_tmdb_final_v3) return;
    window.__rh_tmdb_final_v3 = true;

    console.log('[RH FINAL v3] Initializing');

    // 1. Ждем полной загрузки Lampa
    const waitLampa = callback => {
        if(window.Lampa && window.Lampa.API) callback();
        else setTimeout(() => waitLampa(callback), 100);
    };

    waitLampa(() => {
        // 2. Создаем источник
        const source = {
            id: "rh_final_v3",
            name: "RH Final Source",
            type: "universal",
            priority: 1,
            proxy: 'https://novomih25.duckdns.org:9092/tmdb-api',
            
            // 3. Основной метод поиска
            search: function(query, tmdb_id, callback) {
                console.log(`[RH FINAL] Search: ${query} (${tmdb_id})`);
                
                fetch(`${this.proxy}/movie/${tmdb_id}/videos`)
                    .then(r => r.json())
                    .then(data => {
                        const results = data.results.map(video => ({
                            title: `${query} (${video.type})`,
                            url: this._getVideoUrl(video),
                            quality: this._getQuality(video),
                            type: 'video',
                            tmdb_id: tmdb_id
                        }));
                        callback(results.length ? results : this._getFallback());
                    })
                    .catch(e => {
                        console.error('[RH FINAL] Error:', e);
                        callback(this._getFallback());
                    });
            },
            
            // 4. Вспомогательные методы
            _getVideoUrl: function(video) {
                return video.site === 'YouTube'
                    ? `https://youtube.com/watch?v=${video.key}`
                    : `${this.proxy}/video/${video.key}`;
            },
            
            _getQuality: function(video) {
                return video.size > 720 ? '1080p' : '720p';
            },
            
            _getFallback: function() {
                return [{
                    title: 'Backup Stream',
                    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    quality: '1080p',
                    type: 'video'
                }];
            }
        };

        // 5. Интеграция с интерфейсом Lampa
        const integrateWithUI = () => {
            // Способ 1: Через стандартную регистрацию
            if(window.Lampa.Plugin?.add) {
                window.Lampa.Plugin.add(source);
                console.log('[RH FINAL] Registered via Plugin.add()');
                return;
            }
            
            // Способ 2: Через перехват кнопки источников
            const tryConnect = () => {
                const btn = document.querySelector('.selectbox [data-type="source"]');
                if(btn) {
                    btn.addEventListener('click', () => {
                        setTimeout(() => {
                            const container = document.querySelector('.sources-list');
                            if(container) {
                                const item = document.createElement('div');
                                item.className = 'source-item';
                                item.innerHTML = `
                                    <div class="source-item__name">${source.name}</div>
                                    <div class="source-item__quality">Auto</div>
                                `;
                                item.onclick = () => {
                                    window.Lampa.Player.play(source.id);
                                };
                                container.prepend(item);
                            }
                        }, 300);
                    });
                    console.log('[RH FINAL] Connected to sources button');
                } else {
                    setTimeout(tryConnect, 500);
                }
            };
            
            tryConnect();
        };

        // 6. Запускаем интеграцию
        integrateWithUI();
        console.log('[RH FINAL] Integration started');
    });
})();
