(function() {
    'use strict';

    // 1. Ждем загрузки Lampa
    const waitForLampa = setInterval(() => {
        if (!window.Lampa || !Lampa.Storage) return;

        clearInterval(waitForLampa);
        
        // 2. Создаем изолированную Jackett-интеграцию
        const JackettManager = {
            config: {
                server: Lampa.Storage.get('jackett_server') || 'http://novomih25.duckdns.org',
                apiKey: Lampa.Storage.get('jackett_apikey') || ''
            },

            // 3. Безопасный fetch-враппер только для Jackett
            safeFetch: async function(url, options) {
                try {
                    const response = await fetch(url, {
                        ...options,
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json',
                            ...(options?.headers || {})
                        }
                    });
                    return await response.json();
                } catch (e) {
                    console.error('[Jackett Fetch Error]', e);
                    return { error: true, message: e.message };
                }
            },

            // 4. Поиск через Jackett API
            search: function(params) {
                if (!this.config.apiKey) {
                    console.warn('Jackett API key not set');
                    return Promise.reject('API key required');
                }

                const url = new URL(`${this.config.server}/api/v2.0/indexers/all/results`);
                url.searchParams.append('apikey', this.config.apiKey);

                Object.keys(params).forEach(key => {
                    if (Array.isArray(params[key])) {
                        params[key].forEach(val => url.searchParams.append(`${key}[]`, val));
                    } else {
                        url.searchParams.append(key, params[key]);
                    }
                });

                return this.safeFetch(url.toString());
            }
        };

        // 5. Аккуратно интегрируем в Lampa без перезаписи
        if (!Lampa.Jackett) {
            Lampa.Jackett = JackettManager;
            console.log('[Lampa Jackett] Integration loaded safely');
        }

        // 6. Добавляем настройки в интерфейс (опционально)
        if (Lampa.Settings) {
            Lampa.Settings.listener.follow('open', () => {
                setTimeout(() => {
                    if (!document.querySelector('.jackett-settings')) {
                        const html = `
                            <div class="jackett-settings">
                                <div class="settings-param">
                                    <div class="settings-param__name">Jackett Server</div>
                                    <input type="text" value="${JackettManager.config.server}" 
                                        class="settings-param__input" data-key="jackett_server">
                                </div>
                                <div class="settings-param">
                                    <div class="settings-param__name">API Key</div>
                                    <input type="text" value="${JackettManager.config.apiKey}" 
                                        class="settings-param__input" data-key="jackett_apikey">
                                </div>
                            </div>
                        `;
                        
                        const container = document.querySelector('.settings-params');
                        if (container) {
                            container.insertAdjacentHTML('beforeend', html);
                            
                            // Обработчик изменений
                            container.querySelectorAll('[data-key]').forEach(input => {
                                input.addEventListener('change', (e) => {
                                    const key = e.target.dataset.key;
                                    JackettManager.config[key] = e.target.value;
                                    Lampa.Storage.set(key, e.target.value);
                                });
                            });
                        }
                    }
                }, 300);
            });
        }
    }, 500);

    // 7. Чистая инициализация без побочных эффектов
    if (document.readyState === 'complete') {
        clearInterval(waitForLampa);
    } else {
        window.addEventListener('load', () => clearInterval(waitForLampa));
    }
})();
