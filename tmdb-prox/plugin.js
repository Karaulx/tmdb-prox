(function() {
    'use strict';

    console.log('TMDB Proxy: Plugin initialized');

    if (!window.lampa || !lampa.app) {
        setTimeout(arguments.callee, 100);
        return;
    }

    const config = {
        active: true,
        debug: true,
        proxyUrl: 'https://your-tmdb-proxy.com/api',
        originalUrl: 'https://api.themoviedb.org/3'
    };

    const utils = {
        log: function(...args) {
            if (config.debug) console.log('[TMDB Proxy]', ...args);
        },
        showNotice: function(text, type) {
            if (lampa.notice) lampa.notice.show(text, type || 'success');
        }
    };

    function interceptRequests() {
        if (!lampa.interceptor) {
            utils.log('Interceptor API not available');
            return;
        }

        lampa.interceptor.request.add({
            before: function(request) {
                if (!config.active) return request;
                
                try {
                    if (request.url.includes(config.originalUrl)) {
                        const newUrl = request.url.replace(
                            config.originalUrl, 
                            config.proxyUrl
                        );
                        
                        utils.log('Intercepted request:', request.url, '->', newUrl);
                        
                        return {
                            ...request,
                            url: newUrl,
                            headers: {
                                ...request.headers,
                                'X-Proxy-Request': 'true'
                            }
                        };
                    }
                } catch (e) {
                    utils.log('Interception error:', e);
                }
                
                return request;
            },
            
            after: function(response) {
                if (config.debug && response.url.includes(config.proxyUrl)) {
                    utils.log('Proxied response:', response);
                }
                return response;
            },
            
            error: function(error) {
                utils.log('Request error:', error);
                return error;
            }
        });
    }

    function addSettings() {
        if (!lampa.SettingsApi) return;
        
        lampa.SettingsApi.addParam({
            component: 'network',
            param: {
                name: 'tmdb_proxy_active',
                type: 'trigger',
                default: config.active
            },
            field: {
                name: 'Активировать TMDB Proxy',
                description: 'Перенаправляет запросы к TMDB через прокси'
            },
            onChange: (value) => {
                config.active = value;
                utils.showNotice('TMDB Proxy ' + (value ? 'активирован' : 'деактивирован'));
            }
        });
        
        lampa.SettingsApi.addParam({
            component: 'network',
            param: {
                name: 'tmdb_proxy_url',
                type: 'text',
                default: config.proxyUrl
            },
            field: {
                name: 'URL прокси-сервера',
                description: 'Адрес вашего TMDB прокси'
            },
            onChange: (value) => {
                config.proxyUrl = value;
                utils.showNotice('URL прокси обновлен');
            }
        });
    }

    function init() {
        interceptRequests();
        addSettings();
        utils.showNotice('TMDB Proxy загружен');
        
        if (lampa.utils && lampa.utils.addStyle) {
            lampa.utils.addStyle(`
                .tmdb-proxy-badge {
                    background: rgba(3, 37, 65, 0.8);
                    color: white;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 11px;
                    margin-left: 8px;
                    display: inline-block;
                }
            `);
        }
    }

    if (window.appready) {
        init();
    } else {
        lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') init();
        });
    }
})();
