(function() {
    'use strict';

    // Защита от дублирования (как в torrents.js)
    if (window.plugin_reyohoho_ready) return;
    window.plugin_reyohoho_ready = true;

    // Основная функция (аналог button_click из torrents.js)
    function reyohoho_play(data) {
        const movie = data.movie;
        const type = movie.name ? 'tv' : 'movie';
        const id = movie.tmdb_id || movie.kinopoisk_id;
        
        try {
            const contentUrl = `https://reyohoho.github.io/${type}/${id}`;
            const html = await fetch(contentUrl).then(r => r.text());
            const videoUrl = extractVideoUrl(html);
            
            if (!videoUrl) throw new Error('Ссылка не найдена');
            
            Lampa.Player.play({
                url: videoUrl,
                title: movie.title || movie.name,
                external: false,
                source: 'reyohoho',
                headers: {
                    'Referer': contentUrl,
                    'Origin': 'https://reyohoho.github.io'
                }
            });
        } catch (e) {
            console.error(e);
            Lampa.Noty.show('Ошибка ReYohoho');
        }
    }

    // Функция извлечения URL (без изменений)
    function extractVideoUrl(html) {
        const regex = /(https?:\/\/[^\s"'<>]+\.(m3u8|mp4|mkv|webm)[^\s"'<>]*)/i;
        const match = html.match(regex);
        return match ? match[0] : null;
    }

    // Точная копия логики добавления кнопки из torrents.js
    function addButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                // 1. Берем HTML кнопки из torrents.js (адаптируем только иконку)
                const button = `
                    <div class="full-start__button view--reyohoho">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        <span>ReYohoho</span>
                    </div>
                `;
                
                // 2. Полностью копируем логику вставки
                const btn = $(button);
                btn.on('hover:enter', function() {
                    reyohoho_play(e.data);
                });
                
                // 3. Ключевая строка - вставка ТОЧНО как в torrents.js
                if (e.data && e.object) {
                    e.object.activity.render().find('.view--torrent').last().after(btn);
                }
            }
        });
    }

    // Инициализация как в torrents.js
    if (window.appready) {
        addButton();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type == 'ready') addButton();
        });
    }

    // Регистрация обработчика (если нужно)
    if (Lampa.Player.handler?.add) {
        Lampa.Player.handler.add({
            name: 'reyohoho',
            title: 'ReYohoho',
            priority: 10,
            handler: reyohoho_play
        });
    }
})();
