(function() {
    'use strict';

    if (window.ReYohohoTestPlugin) return;
    window.ReYohohoTestPlugin = true;

    // Простая функция для теста
    function testPlay(data) {
        Lampa.Noty.show('Тест: Кнопка работает!');
        console.log('Тестовые данные:', data);
    }

    // Добавляем кнопку в интерфейс (гарантированно видимая)
    function addTestButton() {
        Lampa.Listener.follow('full', function(e) {
            if (e.type === 'complite' && e.object) {
                const button = `
                    <div class="full-start__button view--test">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
                        </svg>
                        <span>Тест ReYohoho</span>
                    </div>
                `;
                
                // Вставляем кнопку в стандартный контейнер
                const buttonsContainer = e.object.activity.render().find('.full-start__buttons');
                if (buttonsContainer.length) {
                    buttonsContainer.append($(button).on('hover:enter', () => testPlay(e.data)));
                }
            }
        });
    }

    // Регистрируем обработчик (минимальная версия)
    function registerHandler() {
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho-test',
                title: 'ReYohoho Test',
                priority: 5,
                handler: testPlay
            });
        }
    }

    // Инициализация
    function init() {
        addTestButton();
        registerHandler();
        console.log('ReYohoho Test plugin loaded');
    }

    // Запуск
    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') init();
        });
    }
})();
