/**
 * Хелпер для работы с иконками типов покемонов
 * @module TypeIconHelper
 */

 class TypeIconHelper {
    /**
     * Создает HTML-элемент иконки типа
     * @param {string} type - Название типа (например, 'fire')
     * @param {string} size - Размер иконки ('xs', 'sm', 'md', 'lg')
     * @param {string} extraClass - Дополнительные CSS-классы
     * @returns {HTMLElement}
     */
    static createTypeIconElement(type, size = 'md', extraClass = '') {
        const normalizedType = type.toLowerCase();
        const typeClass = normalizedType;
        const sizeClass = `type-icon-${size}`;
        
        const container = document.createElement('div');
        container.className = `type-icon ${typeClass} ${sizeClass} ${extraClass}`;
        container.title = type;
        container.dataset.type = normalizedType;
        
        const img = document.createElement('img');
        img.alt = type;
        img.dataset.type = normalizedType;
        img.draggable = false;
        
        container.appendChild(img);
        return container;
    }

    /**
     * Асинхронно загружает и отображает иконку типа в контейнере
     * @param {HTMLElement} container - Контейнер для иконки
     * @param {string} type - Название типа
     * @param {ImageManager} imageManager - Менеджер изображений
     */
    static async loadTypeIcon(container, type, imageManager) {
        if (!container || !type || !imageManager) return;
        
        const img = container.querySelector('img');
        if (!img) return;
        
        try {
            const icon = await imageManager.getTypeIcon(type);
            img.src = icon.src;
            img.alt = type;
        } catch (e) {
            console.warn(`⚠️ Не удалось загрузить иконку типа ${type}:`, e);
            // Используем текстовый заменитель
            img.src = '';
            img.style.display = 'none';
            container.style.color = '#fff';
            container.style.fontSize = '1rem';
            container.style.fontWeight = 'bold';
            container.textContent = type.charAt(0).toUpperCase();
        }
    }

    /**
     * Создает контейнер с иконкой типа и загружает ее
     * @param {string} type - Название типа
     * @param {ImageManager} imageManager - Менеджер изображений
     * @param {string} size - Размер иконки
     * @returns {Promise<HTMLElement>}
     */
    static async createLoadedTypeIcon(type, imageManager, size = 'md') {
        const container = this.createTypeIconElement(type, size);
        await this.loadTypeIcon(container, type, imageManager);
        return container;
    }

    /**
     * Создает контейнер с несколькими иконками типов
     * @param {string[]} types - Массив названий типов
     * @param {ImageManager} imageManager - Менеджер изображений
     * @param {string} size - Размер иконок
     * @param {string} containerClass - Дополнительный класс для контейнера
     * @returns {Promise<HTMLElement>}
     */
    static async createTypeIcons(types, imageManager, size = 'md', containerClass = '') {
        const wrapper = document.createElement('div');
        wrapper.className = `type-icons-container ${containerClass}`;
        
        if (!types || types.length === 0) {
            return wrapper;
        }
        
        for (const type of types) {
            const icon = await this.createLoadedTypeIcon(type, imageManager, size);
            wrapper.appendChild(icon);
        }
        
        return wrapper;
    }

    /**
     * Обновляет иконки типов в существующем контейнере
     * @param {HTMLElement} container - Контейнер с иконками
     * @param {string[]} types - Новые типы
     * @param {ImageManager} imageManager - Менеджер изображений
     * @param {string} size - Размер иконок
     */
    static async updateTypeIcons(container, types, imageManager, size = 'md') {
        if (!container) return;
        
        container.innerHTML = '';
        if (!types || types.length === 0) return;
        
        for (const type of types) {
            const icon = await this.createLoadedTypeIcon(type, imageManager, size);
            container.appendChild(icon);
        }
    }

    /**
     * Создает HTML-строку с иконками типов (для вставки в innerHTML)
     * @param {string[]} types - Массив названий типов
     * @param {string} size - Размер иконок
     * @returns {string}
     */
    static createTypeIconsHTML(types, size = 'sm') {
        if (!types || types.length === 0) return '';
        
        const sizeClass = `type-icon-${size}`;
        return types.map(type => {
            const normalizedType = type.toLowerCase();
            return `<div class="type-icon ${normalizedType} ${sizeClass}" title="${type}" data-type="${normalizedType}">
                <img src="" alt="${type}" data-type="${normalizedType}" style="display: none;">
                <span style="color: #fff; font-weight: bold; font-size: 0.7rem;">${type.charAt(0).toUpperCase()}</span>
            </div>`;
        }).join('');
    }
}

// Делаем глобально доступным
window.TypeIconHelper = TypeIconHelper;