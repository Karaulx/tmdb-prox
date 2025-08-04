(function() {
    'use strict';

    if(!window.lampa) return;

    const config = {
        proxy: "https://your-tmdb-proxy.com/api",
        patterns: [
            /api\.themoviedb\.org\/3\/movie/,
            /api\.themoviedb\.org\/3\/tv/,
            /api\.themoviedb\.org\/3\/search/
        ]
    };

    function init() {
        if(!lampa.interceptor) return;

        lampa.interceptor.request.add({
            before: function(req) {
                if(config.patterns.some(p => p.test(req.url))) {
                    const newUrl = req.url.replace('https://api.themoviedb.org/3', config.proxy);
                    console.log('TMDB Proxy:', req.url, '->', newUrl);
                    return {
                        ...req,
                        url: newUrl,
                        headers: {
                            ...req.headers,
                            'X-Proxy': 'TMDB'
                        }
                    };
                }
                return req;
            }
        });

        console.log('TMDB Proxy initialized');
    }

    if(window.appready) init();
    else lampa.Listener.follow('app', e => e.type == 'ready' && init());

})();
