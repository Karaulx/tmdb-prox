(function() {
    'use strict';

    // Ждём полной инициализации Lampa
    Lampa.Listener.follow('app', function (event) {
        if (event.type === 'ready') {
            console.log('[RH] Lampa готова — подключаем источник');

            // Регистрируем новый источник
            if (Lampa.Source && Lampa.Source.add) {
                Lampa.Source.add('reyohoho', 'Reyohoho', function (search, call) {
                    console.log('[RH] Поиск:', search);
                    
                    // Здесь твоя логика запроса на API
                    // Пример:
                    fetch('https://example.com/api?q=' + encodeURIComponent(search.query))
                        .then(r => r.json())
                        .then(data => {
                            // Преобразуем результаты в формат Lampa
                            const results = data.map(item => ({
                                title: item.title,
                                url: item.url
                            }));
                            call(results);
                        })
                        .catch(err => {
                            console.error('[RH] Ошибка поиска', err);
                            call([]);
                        });
                });
            } else {
                console.error('[RH] Lampa.Source.add не найден');
            }
        }
    });
})();
