(function() {
    'use strict';

    // Ждём, пока Лампа прогрузится
    function start() {
        console.log('[Reyohoho] Плагин инициализирован');

        // Регистрируем источник
        Lampa.Source.add('reyohoho', {
            title: 'Reyohoho',     // Название в списке источников
            type: 'online',        // Обязательно, чтобы попасть в онлайн-источники

            // Поиск
            search: function(query, call) {
                console.log('[Reyohoho] Поиск:', query);

                // Для теста — возвращаем один фейковый результат
                call([{
                    title: 'Тестовый фильм',
                    year: 2024,
                    quality: 'HD',
                    url: 'https://test-stream.example/video.mp4'
                }]);
            },

            // Проигрывание
            play: function(item) {
                console.log('[Reyohoho] Воспроизведение:', item);

                Lampa.Player.play({
                    title: item.title,
                    url: item.url,
                    quality: item.quality || 'HD',
                    subtitles: []
                });
            }
        });

        // Добавляем кнопку в меню
        Lampa.Controller.add('reyohoho_btn', {
            toggle: function() {
                Lampa.Controller.collectionSet(this.render(), this.render());
                Lampa.Controller.collectionFocus(this.render());
            },
            render: function() {
                let button = $('<div class="selector">Reyohoho</div>');
                button.on('hover:enter', function() {
                    Lampa.Noty.show('Кнопка Reyohoho нажата!');
                });
                return button;
            },
            destroy: function() {}
        });

        Lampa.Controller.add('menu', {
            render: function() {
                return $('<div class="menu"></div>').append(Lampa.Controller.get('reyohoho_btn').render());
            }
        });
    }

    // Ждём готовности приложения
    if (window.appready) start();
    else Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') start();
    });

})();
