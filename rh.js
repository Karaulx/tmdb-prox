(function() {
    'use strict';

    // Проверка на дублирование
    if (window.ReYohohoButtonPlugin) return;
    window.ReYohohoButtonPlugin = true;

    console.log('ReYohoho plugin started');

    // 1. Функция для теста
    function testPlay(data) {
        try {
            const movie = data.movie || data;
            const title = movie?.title || movie?.name || 'Unknown';
            Lampa.Noty.show(`Тест: ${title}`);
            console.log('Тестовые данные:', movie);
        } catch (e) {
            console.error('Test error:', e);
        }
    }

    // 2. Гарантированное добавление кнопки
    function addButton() {
        // Способ 1: Через стандартный контейнер
        const addToUI = () => {
            const container = $('.selector__items, .full-start__buttons').first();
            if (container.length && !container.find('[data-type="reyohoho-test"]').length) {
                const button = `
                    <div class="selector__item selector-available" data-type="reyohoho-test">
                        <div class="selector__icon">
                            <svg width="24" height="24"><use xlink:href="#player"/></svg>
                        </div>
                        <div class="selector__title">ReYohoho</div>
                    </div>
                `;
                container.append($(button).on('hover:enter', () => {
                    const cardData = Lampa.Storage.get('card_data') || {};
                    testPlay(cardData);
                }));
                console.log('Кнопка добавлена в', container[0]);
                return true;
            }
            return false;
        };

        // Способ 2: Если стандартный не сработал
        const fallbackAdd = () => {
            const newContainer = $('<div class="selector__items"></div>');
            $('body').append(newContainer);
            const button = $(`<div class="selector__item">ReYohoho</div>`)
                .on('click', () => testPlay({}));
            newContainer.append(button);
            console.warn('Использован fallback-контейнер');
        };

        // Пытаемся добавить каждые 500мс, пока не получится
        const tryAdd = setInterval(() => {
            if (addToUI() || fallbackAdd()) {
                clearInterval(tryAdd);
            }
        }, 500);
    }

    // 3. Регистрация обработчика
    function registerHandler() {
        if (typeof Lampa?.Player?.handler?.add === 'function') {
            Lampa.Player.handler.add({
                name: 'reyohoho-test',
                title: 'ReYohoho',
                priority: 10,
                handler: testPlay
            });
            console.log('Обработчик зарегистрирован');
        }
    }

    // 4. Запуск плагина
    function init() {
        addButton();
        registerHandler();
        
        // Дублирующая проверка через 3 секунды
        setTimeout(() => {
            if (!$('[data-type="reyohoho-test"]').length) {
                console.warn('Кнопка не найдена, повторная попытка');
                addButton();
            }
        }, 3000);
    }

    // Загрузка
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', (e) => {
            if (e.type === 'ready') init();
        });
    }
})();
