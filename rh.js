(function () {
    'use strict';

    function startPlugin() {
        if (!Lampa.Source) {
            console.log('Source API не готово, повторная попытка...');
            setTimeout(startPlugin, 500);
            return;
        }

        Lampa.Source.add('reyohoho', {
            title: 'Reyohoho',
            search: function (query, call) {
                Lampa.Utils.request(`https://reyohoho.github.io/api/search?title=${encodeURIComponent(query)}`, (response) => {
                    if (!response || !response.results || !response.results.length) {
                        call([]);
                        return;
                    }

                    let results = response.results.map(item => ({
                        title: item.title,
                        url: item.stream_url,
                        quality: item.quality || 'HD',
                        subtitles: item.subtitles || []
                    }));

                    call(results);
                }, () => {
                    call([]);
                });
            },
            play: function (element) {
                Lampa.Player.play(element.url);
            }
        });

        console.log('Плагин Reyohoho подключён');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') startPlugin();
    });

})();
