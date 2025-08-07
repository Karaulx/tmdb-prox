(function() {
    'use strict';

    // Сохраняем оригинальные методы
    const originalFetch = window.fetch;
    const originalXHROpen = XMLHttpRequest.prototype.open;

    // ================= JACKETT INTEGRATION =================
    function setupJackettIntegration() {
        // Проверяем наличие объекта Lampa
        if (!window.Lampa || !Lampa.Storage) {
            console.warn('Lampa object not found, retrying in 1 second...');
            setTimeout(setupJackettIntegration, 1000);
            return;
        }

        Lampa.Jackett = {
            getConfig: function() {
                return {
                    server: Lampa.Storage.get('jackett_server') || 'http://novomih25.duckdns.org',
                    apiKey: Lampa.Storage.get('jackett_apikey') || '',
                    timeout: 10000
                };
            },
            
            search: function(params) {
                const config = this.getConfig();
                if (!config.apiKey) {
                    return Promise.reject('Jackett API key not configured');
                }

                const url = new URL(`${config.server}/api/v2.0/indexers/all/results`);
                url.searchParams.append('apikey', config.apiKey);

                Object.keys(params).forEach(key => {
                    if (Array.isArray(params[key])) {
                        params[key].forEach(val => url.searchParams.append(`${key}[]`, val));
                    } else {
                        url.searchParams.append(key, params[key]);
                    }
                });

                // Используем оригинальный fetch для запросов Jackett
                return originalFetch(url.toString(), {
                    method: 'GET',
                    headers: { 'Accept': 'application/json' }
                }).then(r => r.json());
            }
        };

        console.log('[Lampa Mod] Jackett integration activated');
    }

    // ================= SAFE INITIALIZATION =================
    function initialize() {
        // Инициализируем только интеграцию Jackett
        // Не переопределяем глобальные fetch/XHR, чтобы не ломать другие запросы
        setupJackettIntegration();

        // Добавляем UI элементы для настроек Jackett
        if (Lampa.Settings) {
            Lampa.Settings.listener.follow('open', () => {
                setTimeout(() => {
                    if (!document.querySelector('.jackett-settings')) {
                        const html = `
                            <div class="jackett-settings" style="margin-top:20px">
                                <div class="settings-param selector">
                                    <div class="settings-param__name">Jackett Server</div>
                                    <div class="settings-param__value">
                                        <input type="text" class="settings-param__input" 
                                            value="${Lampa.Storage.get('jackett_server') || 'http://novomih25.duckdns.org'}" 
                                            placeholder="http://jackett.example.com">
                                    </div>
                                </div>
                                <div class="settings-param selector">
                                    <div class="settings-param__name">Jackett API Key</div>
                                    <div class="settings-param__value">
                                        <input type="text" class="settings-param__input" 
                                            value="${Lampa.Storage.get('jackett_apikey') || ''}" 
                                            placeholder="Your API Key">
                                    </div>
                                </div>
                            </div>
                        `;
                        
                        const settingsBlock = document.querySelector('.settings-params');
                        if (settingsBlock) {
                            settingsBlock.insertAdjacentHTML('beforeend', html);
                            
                            // Сохраняем настройки при изменении
                            document.querySelectorAll('.jackett-settings input').forEach(input => {
                                input.addEventListener('change', (e) => {
                                    const key = e.target.parentElement.previousElementSibling.textContent.trim() === 'Jackett Server' 
                                        ? 'jackett_server' 
                                        : 'jackett_apikey';
                                    Lampa.Storage.set(key, e.target.value);
                                });
                            });
                        }
                    }
                }, 300);
            });
        }
    }

    // Запускаем после полной загрузки страницы
    if (document.readyState === 'complete') {
        initialize();
    } else {
        window.addEventListener('load', initialize);
    }
})();
