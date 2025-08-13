// Проверяем, что Lampa полностью загружена
if (typeof Lampa === 'undefined') {
    console.error('Lampa не обнаружена');
} else {
    console.log('Lampa обнаружена, инициализируем ReYohoho плагин');
    
    // Функция для обработки нажатия кнопки
    function handleReYohohoClick() {
        console.log('Кнопка ReYohoho нажата');
        
        // Получаем текущий контент
        const item = Lampa.Storage.get('current_item');
        if (!item || !item.id) {
            console.error('Не удалось получить данные контента');
            Lampa.Noty.show('Ошибка: данные не загружены', 'error');
            return;
        }

        console.log('Данные контента:', item);

        // Формируем URL для ReYohoho
        const type = item.type === 'movie' ? 'movie' : 'tv';
        const reyohohoUrl = `https://reyohoho.github.io/reyohoho/${type}/${item.id}`;
        console.log('ReYohoho URL:', reyohohoUrl);

        // Создаем меню выбора
        new Lampa.Menu({
            title: 'Выберите вариант просмотра',
            items: [
                {
                    name: 'Открыть в ReYohoho',
                    action: () => {
                        console.log('Открываем ReYohoho в новом окне');
                        window.open(reyohohoUrl, '_blank');
                    }
                },
                {
                    name: 'Воспроизвести в Lampa',
                    action: () => {
                        console.log('Пытаемся получить поток...');
                        fetch(`https://reyohoho.github.io/api/stream?id=${item.id}&type=${type}`)
                            .then(response => {
                                console.log('Ответ от API:', response);
                                return response.json();
                            })
                            .then(data => {
                                if (data.stream) {
                                    console.log('Поток получен:', data.stream);
                                    Lampa.Player.play({
                                        title: item.title || item.name,
                                        files: [{url: data.stream}],
                                        poster: item.poster || item.cover
                                    });
                                } else {
                                    console.error('Поток не найден в ответе');
                                    Lampa.Noty.show('Не удалось получить видео поток', 'error');
                                }
                            })
                            .catch(error => {
                                console.error('Ошибка при получении потока:', error);
                                Lampa.Noty.show('Ошибка подключения к ReYohoho', 'error');
                            });
                    }
                }
            ]
        }).show();
    }

    // Функция добавления кнопки
    function addReYohohoButton() {
        console.log('Попытка добавить кнопку ReYohoho...');
        
        // Удаляем старые кнопки
        $('.re-yohoho-button').remove();

        // Создаем новую кнопку
        const button = $(`
            <div class="full-start__button selector re-yohoho-button" 
                 data-action="reyohoho"
                 style="border: 1px solid #00ff00; background: rgba(0,255,0,0.1);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#00ff00">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4.5-4.5 1.5-1.5 3 3 7.5-7.5 1.5 1.5-9 9z"/>
                </svg>
                <span style="color: #00ff00">ReYohoho</span>
            </div>
        `);

        // Добавляем обработчик
        button.on('hover:enter', handleReYohohoClick);

        // Вставляем кнопку в интерфейс
        const buttonsContainer = $('.full-start__buttons');
        if (buttonsContainer.length) {
            console.log('Контейнер кнопок найден');
            const trailerButton = buttonsContainer.find('[data-action="trailer"]');
            if (trailerButton.length) {
                trailerButton.before(button);
                console.log('Кнопка добавлена перед трейлером');
            } else {
                buttonsContainer.prepend(button);
                console.log('Кнопка добавлена в начало контейнера');
            }
        } else {
            console.error('Контейнер кнопок не найден!');
        }
    }

    // Инициализация
    if (window.appready) {
        console.log('Lampa готова, добавляем кнопку');
        addReYohohoButton();
    } else {
        console.log('Ожидаем готовности Lampa...');
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') {
                console.log('Событие ready получено');
                setTimeout(addReYohohoButton, 500);
            }
        });
    }

    // Дополнительная проверка через 3 секунды
    setTimeout(() => {
        if ($('.re-yohoho-button').length === 0) {
            console.warn('Кнопка не добавлена, пробуем снова');
            addReYohohoButton();
        }
    }, 3000);
}
