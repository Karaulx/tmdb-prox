(function () {
    'use strict';

    function startPlugin() {
        Lampa.Source.add('reyohoho', {
            title: 'Reyohoho',
            search: function (query, call) {
                Lampa.Utils.request(`https://reyohoho.github.io/api/search?title=${encodeURIComponent(query)}`, (response) => {
                    if (!response || !response.results || !response.results.length) {
                        call([]);
                        return;
                    }

                    let results = response.results.map(item => {
                        return {
                            title: item.title,
                            url: item.stream_url,
                            quality: item.quality || 'HD',
                            subtitles: item.subtitles || []
                        };
                    });

                    call(results);
                }, () => {
                    call([]);
                });
            },
            play: function (element) {
                Lampa.Player.play(element.url);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });

})();
