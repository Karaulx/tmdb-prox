(function() {
    'use strict';

    if (window.ReYohohoSearchPlayer) return;
    window.ReYohohoSearchPlayer = true;

    const REYOHOHO_URL = 'https://reyohoho.github.io/reyohoho';

    async function findAndPlay(data) {
        try {
            // 1. Получаем данные из карточки Lampa
            const movie = data.movie || data;
            if (!movie) throw new Error('Нет данных о фильме');
            
            const title = movie.title || movie.name;
            if (!title) throw new Error('Нет названия фильма');

            // 2. Поиск на reyohoho по названию
            console.log(`Ищем "${title}" на reyohoho...`);
            const searchUrl = `${REYOHOHO_URL}/search.html?q=${encodeURIComponent(title)}`;
            const searchResponse = await fetch(searchUrl);
            const searchHtml = await searchResponse.text();

            // 3. Извлекаем ID из результатов поиска
            const idMatch = searchHtml.match(/href="\/(movie|tv)\/(\d+)"/i);
            if (!idMatch) throw new Error('Фильм не найден на reyohoho');

            const [_, type, id] = idMatch;
            console.log(`Найден ID: ${id}, тип: ${type}`);

            // 4. Получаем страницу с плеером
            const contentUrl = `${REYOHOHO_URL}/${type}/${id}`;
            const contentResponse = await fetch(contentUrl);
            const contentHtml = await contentResponse.text();

            // 5. Извлекаем m3u8 поток
            const m3u8Url = contentHtml.match(/(https?:\/\/[^\s"']+\.m3u8[^\s"']*)/i)?.[0];
            if (!m3u8Url) throw new Error('Поток не найден');

            console.log('Найден поток:', m3u8Url);

            // 6. Запускаем в плеере Lampa
            Lampa.Player.play({
                url: m3u8Url,
                title: title,
                external: false,
                source: 'reyohoho-search',
                headers: {
                    'Referer': contentUrl,
                    'Origin': REYOHOHO_URL
                }
            });

        } catch (error) {
            console.error('ReYohoho Error:', error);
            Lampa.Noty.show('Ошибка: ' + error.message);
        }
    }

    // Добавляем кнопку в интерфейс
    function addButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite') {
                const button = `
                    <div class="selector__item selector-available">
                        <div class="selector__icon">
                            <svg width="24" height="24"><use xlink:href="#player"/></svg>
                        </div>
                        <div class="selector__title">ReYohoho Search</div>
                    </div>
                `;

                const btn = $(button).on('hover:enter', () => findAndPlay(e.data));
                e.object.activity.render().find('.selector__items').append(btn);
            }
        });
    }

    // Регистрируем обработчик
    function registerHandler() {
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho-search',
                title: 'ReYohoho (Search)',
                priority: 15,
                handler: findAndPlay
            });
        }
    }

    // Инициализация
    function init() {
        addButton();
        registerHandler();
        console.log('ReYohoho Search plugin loaded');
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && init());
})();
