(function() {
    'use strict';

    // Проверка на дублирование
    if (window.ReYohohoVisiblePlugin) return;
    window.ReYohohoVisiblePlugin = true;

    // Простая функция для теста
    function testAction(data) {
        const movie = data.movie || data;
        Lampa.Noty.show(`Тест: ${movie.title || movie.name}`);
        console.log('Данные фильма:', movie);
    }

    // Добавляем кнопку в интерфейс (100% рабочий вариант)
    function addButton() {
        // Ждем полной загрузки интерфейса
        const checkInterval = setInterval(() => {
            const container = $('.selector__items');
            if (container.length) {
                clearInterval(checkInterval);
                
                // Создаем кнопку
                const button = `
                    <div class="selector__item selector-available" data-type="reyohoho-test">
                        <div class="selector__icon">
                            <svg width="24" height="24"><use xlink:href="#player"/></svg>
                        </div>
                        <div class="selector__title">ReYohoho</div>
                    </div>
                `;
                
                // Добавляем кнопку и обработчик
                container.append($(button).on('hover:enter', (e) => {
                    const cardData = Lampa.Storage.get('card_data');
                    if (cardData) testAction(cardData);
                }));
                
                console.log('Кнопка ReYohoho добавлена');
            }
        }, 300);
    }

    // Альтернативный способ через обработчик плеера
    function registerPlayerHandler() {
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho-test',
                title: 'ReYohoho',
                priority: 15,
                handler: testAction
            });
        }
    }

    // Инициализация
    function init() {
        addButton();
        registerPlayerHandler();
        console.log('ReYohoho Visible Plugin loaded');
    }

    // Запускаем при полной загрузке
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') init();
        });
    }
})();
