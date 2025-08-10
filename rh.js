(function() {
    'use strict';

    if (window.ReYohohoPluginReady) return;
    window.ReYohohoPluginReady = true;

    function initPlugin() {
        // Ваша функция обработки ReYohoho
        async function handleReYohohoPlay(data) {
            // ... ваш существующий код ...
        }

        // Добавляем кнопку в интерфейс (аналогично торрентам)
        Lampa.Listener.follow('full', function(e) {
            if (e.type == 'complite') {
                // Создаем элемент для чекбокса
                const checkbox = `
                <label class="source-selector__item">
                    <input type="radio" name="source" value="reyohoho">
                    <div class="source-selector__icon">
                        <svg width="24" height="24"><use xlink:href="#player"/></svg>
                    </div>
                    <div class="source-selector__title">ReYohoho</div>
                </label>
                `;

                // Вставляем в тот же контейнер, где находятся торренты
                const container = e.object.activity.render().find('.source-selector__items');
                if (container.length) {
                    container.append(checkbox);
                    
                    // Обработчик выбора
                    container.find('input[value="reyohoho"]').on('change', function() {
                        if ($(this).is(':checked')) {
                            handleReYohohoPlay(e.data);
                        }
                    });
                }
            }
        });

        // Регистрация обработчика
        if (Lampa.Player.handler?.add) {
            Lampa.Player.handler.add({
                name: 'reyohoho',
                title: 'ReYohoho',
                priority: 10,
                handler: handleReYohohoPlay
            });
        }
    }

    // Запуск плагина
    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', e => e.type == 'ready' && initPlugin());
})();
