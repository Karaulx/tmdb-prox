(function () {
    'use strict';

    Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
            console.log('[RH] Lampa готова — подключаем источник');

            if (Lampa.Platform && Lampa.Platform.addSource) {
                Lampa.Platform.addSource({
                    title: 'Reyohoho',
                    id: 'reyohoho',
                    type: 'online',
                    search: function (query, call) {
                        console.log('[RH] Поиск фильма:', query);

                        fetch('https://tmdb-prox.pages.dev/reyohoho.php?title=' + encodeURIComponent(query))
                            .then(r => r.json())
                            .then(data => {
                                if (data && data.url) {
                                    call([{
                                        title: query,
                                        url: data.url
                                    }]);
                                } else {
                                    call([]);
                                }
                            })
                            .catch(err => {
                                console.error('[RH] Ошибка', err);
                                call([]);
                            });
                    }
                });

                console.log('[RH] Источник Reyohoho подключён');
            } else {
                console.error('[RH] Lampa.Platform.addSource не найден');
            }
        }
    });
})();
