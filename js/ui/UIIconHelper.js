/**
 * Хелпер для работы с UI иконками
 * @module UIIconHelper
 */

 class UIIconHelper {
    /**
     * Создает элемент с UI иконкой
     * @param {string} iconKey - Ключ иконки из IMAGE_CONFIG.UI_ICONS
     * @param {ImageManager} imageManager - Менеджер изображений
     * @param {string} size - Размер иконки ('xs', 'sm', 'md', 'lg', 'xl')
     * @param {string} extraClass - Дополнительные CSS-классы
     * @returns {Promise<HTMLElement>}
     */
    static async createIconElement(iconKey, imageManager, size = 'md', extraClass = '') {
        const container = document.createElement('span');
        container.className = `ui-icon ui-icon-${size} ${extraClass}`;
        container.dataset.iconKey = iconKey;
        
        try {
            const icon = await imageManager.getUIIcon(iconKey);
            const img = document.createElement('img');
            img.src = icon.src;
            img.alt = iconKey;
            img.draggable = false;
            img.className = 'ui-icon-img';
            container.appendChild(img);
        } catch (e) {
            console.warn(`⚠️ Не удалось загрузить иконку ${iconKey}:`, e);
            container.textContent = '⬡';
            container.style.color = '#fff';
            container.style.fontSize = size === 'xs' ? '0.8rem' : 
                                      size === 'sm' ? '1rem' : 
                                      size === 'md' ? '1.5rem' : 
                                      size === 'lg' ? '2rem' : '2.5rem';
        }
        
        return container;
    }

    /**
     * Создает HTML-строку для вставки в innerHTML
     * @param {string} iconKey - Ключ иконки
     * @param {string} size - Размер иконки
     * @param {string} extraClass - Дополнительные классы
     * @returns {string}
     */
    static createIconHTML(iconKey, size = 'md', extraClass = '') {
        const sizeClass = `ui-icon-${size}`;
        return `<span class="ui-icon ${sizeClass} ${extraClass}" data-icon-key="${iconKey}">
            <img src="" alt="${iconKey}" class="ui-icon-img" data-icon-key="${iconKey}" style="display: none;">
        </span>`;
    }

    /**
     * Загружает иконку в существующий элемент
     * @param {HTMLElement} element - Элемент с классом ui-icon
     * @param {ImageManager} imageManager - Менеджер изображений
     */
    static async loadIconIntoElement(element, imageManager) {
        if (!element || !imageManager) return;
        
        const iconKey = element.dataset.iconKey;
        if (!iconKey) return;
        
        const img = element.querySelector('.ui-icon-img');
        if (!img) return;
        
        try {
            const icon = await imageManager.getUIIcon(iconKey);
            img.src = icon.src;
            img.style.display = 'block';
        } catch (e) {
            console.warn(`⚠️ Не удалось загрузить иконку ${iconKey}`);
        }
    }

    /**
     * Заменяет Font Awesome иконки на UI иконки в контейнере
     * @param {HTMLElement} container - Контейнер с иконками
     * @param {ImageManager} imageManager - Менеджер изображений
     */
    static async replaceFaIcons(container, imageManager) {
        if (!container) return;
        
        // Находим все элементы с иконками Font Awesome внутри контейнера
        const faIcons = container.querySelectorAll('.fa, .fas, .far, .fal, .fab');
        const replacements = [];
        
        faIcons.forEach((icon, index) => {
            const parent = icon.parentNode;
            const classes = icon.className;
            
            // Определяем какой иконке соответствует
            let iconKey = null;
            
            if (classes.includes('fa-coins')) iconKey = 'COINS';
            else if (classes.includes('fa-star')) iconKey = 'STAR';
            else if (classes.includes('fa-dragon')) iconKey = 'COLLECTION';
            else if (classes.includes('fa-store')) iconKey = 'SHOP';
            else if (classes.includes('fa-map')) iconKey = 'MAP';
            else if (classes.includes('fa-user-circle')) iconKey = 'HERO';
            else if (classes.includes('fa-chart-line')) iconKey = 'SETTINGS';
            else if (classes.includes('fa-users')) iconKey = 'TEAM';
            else if (classes.includes('fa-hospital')) iconKey = 'CENTER';
            else if (classes.includes('fa-trophy')) iconKey = 'GYM';
            else if (classes.includes('fa-scroll')) iconKey = 'QUEST';
            else if (classes.includes('fa-map-marker-alt')) iconKey = 'LOCATION';
            else if (classes.includes('fa-crosshairs')) iconKey = 'SWORD';
            else if (classes.includes('fa-merge') || classes.includes('fa-plus')) iconKey = 'ADD';
            else if (classes.includes('fa-times')) iconKey = 'CLOSE';
            else if (classes.includes('fa-check')) iconKey = 'CHECK';
            else if (classes.includes('fa-gift')) iconKey = 'UNLOCK';
            else if (classes.includes('fa-lock')) iconKey = 'LOCK';
            else if (classes.includes('fa-shield-alt')) iconKey = 'SHIELD';
            else if (classes.includes('fa-bolt')) iconKey = 'ENERGY';
            else if (classes.includes('fa-heart')) iconKey = 'HEALTH';
            else if (classes.includes('fa-hourglass-half')) iconKey = 'LOCATION';
            
            if (iconKey) {
                const size = classes.includes('fa-lg') ? 'lg' : 
                            classes.includes('fa-2x') ? 'xl' : 'md';
                
                // Создаем замену
                const span = document.createElement('span');
                span.className = `ui-icon ui-icon-${size}`;
                span.dataset.iconKey = iconKey;
                
                const img = document.createElement('img');
                img.className = 'ui-icon-img';
                img.alt = iconKey;
                img.dataset.iconKey = iconKey;
                img.style.display = 'none';
                span.appendChild(img);
                
                // Сохраняем для асинхронной загрузки
                replacements.push({
                    oldElement: icon,
                    newElement: span,
                    iconKey: iconKey,
                    parent: parent
                });
            }
        });
        
        // Заменяем элементы
        replacements.forEach(({ oldElement, newElement, parent }) => {
            parent.replaceChild(newElement, oldElement);
        });
        
        // Асинхронно загружаем иконки
        for (const { newElement, iconKey } of replacements) {
            try {
                const icon = await imageManager.getUIIcon(iconKey);
                const img = newElement.querySelector('.ui-icon-img');
                if (img) {
                    img.src = icon.src;
                    img.style.display = 'block';
                }
            } catch (e) {
                console.warn(`⚠️ Не удалось загрузить иконку ${iconKey}`);
            }
        }
    }

    /**
     * Обновляет все UI иконки на странице
     * @param {ImageManager} imageManager - Менеджер изображений
     */
    static async refreshAllUIcons(imageManager) {
        if (!imageManager) return;
        
        // Обновляем все элементы с классом ui-icon
        const icons = document.querySelectorAll('.ui-icon:not(.loaded)');
        for (const icon of icons) {
            await this.loadIconIntoElement(icon, imageManager);
            icon.classList.add('loaded');
        }
    }
}

window.UIIconHelper = UIIconHelper;