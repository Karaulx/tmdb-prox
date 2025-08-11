(function () {
    'use strict';

    Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
            console.log('[RH] Lampa готова — подключаем источник');

            function registerSource() {
                let sourceData = {
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
                };

                if (Lampa.Platform && Lampa.Platform.addSource) {
                    Lampa.Platform.addSource(sourceData);
                    console.log('[RH] Источник добавлен через Platform');
                } 
                else if (Lampa.Source && Lampa.Source.add) {
                    Lampa.Source.add(sourceData);
                    console.log('[RH] Источник добавлен через Source');
                } 
                else {
                    console.warn('[RH] API для источников не найден — добавляем через Component');

                    let origComponentAdd = Lampa.Component.add;
                    Lampa.Component.add = function (name, comp) {
                        if (name === 'sources') {
                            if (comp && comp.sources) {
                                comp.sources.push(sourceData);
                                console.log('[RH] Источник добавлен через Component');
                            }
                        }
                        return origComponentAdd.apply(this, arguments);
                    };
                }
            }

            registerSource();
        }
    });
})();
