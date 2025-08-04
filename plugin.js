(function() {
    'use strict';
    
    const config = {
        proxyHost: 'https://novomih25.duckdns.org:9091',
        credentials: {
            username: 'ваш_логин', // Замените эти значения
            password: 'ваш_пароль' // из /etc/nginx/.htpasswd
        }
    };

    function init() {
        if (!window.lampa?.interceptor) return;
        
        lampa.interceptor.request.add({
            before: req => {
                if (req.url.includes('themoviedb.org')) {
                    return {
                        ...req,
                        url: req.url.replace('themoviedb.org', 'novomih25.duckdns.org:9091'),
                        headers: {
                            ...req.headers,
                            'Authorization': 'Basic ' + btoa(config.credentials.username + ':' + config.credentials.password)
                        }
                    };
                }
                return req;
            }
        });
    }

    if (window.appready) init();
    else lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
