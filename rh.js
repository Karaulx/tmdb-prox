// Функция для запуска ReYohoho
function launchReYohoho() {
    // 1. Получаем текущий контент из карточки TMDB
    const item = Lampa.Storage.get('current_item');
    if (!item || !item.id) {
        Lampa.Noty.show('Ошибка: не удалось получить данные');
        return;
    }

    // 2. Формируем URL для ReYohoho
    const baseUrl = 'https://reyohoho.github.io/reyohoho';
    const contentType = item.type === 'movie' ? 'movie' : 'tv';
    const reyohohoUrl = `${baseUrl}/${contentType}/${item.id}`;

    // 3. Создаем меню выбора плеера
    const menu = new Lampa.Menu({
        title: 'Выберите плеер',
        items: [
            {
                name: 'Открыть в ReYohoho',
                action: () => {
                    Lampa.Activity.push({
                        url: reyohohoUrl,
                        component: 'full',
                        source: 'reyohoho'
                    });
                }
            },
            {
                name: 'Использовать внешний плеер',
                action: () => {
                    // 4. Получаем поток из ReYohoho
                    fetch(`https://reyohoho.github.io/api/stream?id=${item.id}&type=${contentType}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.stream) {
                                Lampa.Player.play({
                                    title: item.title || item.name,
                                    files: [{url: data.stream}],
                                    poster: item.poster || item.cover
                                });
                            } else {
                                Lampa.Noty.show('Не удалось получить поток');
                            }
                        })
                        .catch(() => {
                            Lampa.Noty.show('Ошибка подключения к ReYohoho');
                        });
                }
            },
            {
                name: 'Стандартный плеер Lampa',
                action: () => {
                    Lampa.Player.play(item);
                }
            }
        ]
    }).show();
}

// Функция добавления кнопки в интерфейс
function addReYohohoButton() {
    // Удаляем старые кнопки
    $('.re-yohoho-button').remove();

    // Добавляем новую кнопку
    const button = $(`
        <div class="full-start__button selector re-yohoho-button" 
             data-action="reyohoho"
             style="border: 1px solid rgba(255,255,255,0.3);">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z" fill="currentColor"/>
            </svg>
            <span>ReYohoho</span>
        </div>
    `);

    button.on('hover:enter', launchReYohoho);

    // Вставляем в блок кнопок
    const buttonsContainer = $('.full-start__buttons');
    if (buttonsContainer.length) {
        buttonsContainer.find('[data-action="trailer"]').before(button);
    }
}

// Инициализация
if (window.appready) {
    addReYohohoButton();
} else {
    Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') setTimeout(addReYohohoButton, 500);
    });
}
