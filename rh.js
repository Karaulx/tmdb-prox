(function() {
    // Проверка на дублирование
    if (window.__reyohoho_final_fix) return;
    window.__reyohoho_final_fix = true;

    class ReYohohoProvider {
        constructor() {
            this.name = 'ReYohoho';
            this.id = 'reyohoho_plugin';
            this.type = 'tv'; // Тип для сериалов (для фильмов используйте 'movie')
            this.supports = ['movie', 'tv']; // Поддерживаемые типы контента
            this.icon = 'https://reyohoho.github.io/favicon.ico';
        }

        async getUrl(params) {
            try {
                // Получаем ID из параметров
                const id = params.kinopoisk_id || params.tmdb_id;
                if (!id) throw new Error('ID не найден');

                // Формируем URL для ReYohoho
                const baseUrl = 'https://reyohoho.github.io/reyohoho';
                let contentUrl = `${baseUrl}/${params.type === 'movie' ? 'movie' : 'tv'}/${id}`;

                // Для сериалов добавляем сезон и эпизод
                if (params.type === 'tv') {
                    contentUrl += `?season=${params.season || 1}&episode=${params.episode || 1}`;
                }

                // Возвращаем данные для плеера
                return {
                    url: contentUrl,
                    name: this.name,
                    title: params.title,
                    external: false // Используем внутренний плеер Lampa
                };

            } catch (e) {
                console.error('ReYohohoProvider error:', e);
                return null;
            }
        }
    }

    // Функция регистрации провайдера
    function registerProvider() {
        // Проверяем доступность API Lampa
        if (typeof window.plugin_provider === 'function') {
            window.plugin_provider(new ReYohohoProvider());
            console.log('ReYohoho provider успешно зарегистрирован');
        } else {
            // Альтернативный метод для старых версий Lampa
            window.extensions_provider = window.extensions_provider || [];
            window.extensions_provider.push(new ReYohohoProvider());
            console.log('ReYohoho provider добавлен через extensions_provider');
        }
    }

    // Автоматическая регистрация при загрузке
    if (document.readyState === 'complete') {
        registerProvider();
    } else {
        window.addEventListener('load', registerProvider);
    }
})();
