/**
 * Вспомогательные функции
 * @module Helpers
 */

// Функция для генерации случайного числа
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Функция для задержки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для форматирования чисел
function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// ⭐ УСТАРЕЛА - используйте TypeIconHelper вместо неё
// Оставлена для обратной совместимости, но помечена как deprecated
function getTypeSymbol(type) {
    console.warn('⚠️ getTypeSymbol() устарела! Используйте TypeIconHelper.createLoadedTypeIcon()');
    const symbols = {
        NORMAL: '⬤', FIRE: '🔥', WATER: '💧', GRASS: '🌿',
        ELECTRIC: '⚡', ICE: '❄️', FIGHTING: '👊', POISON: '☠️',
        GROUND: '⛰️', FLYING: '🦅', PSYCHIC: '🔮', BUG: '🐛',
        ROCK: '🪨', GHOST: '👻', DRAGON: '🐉'
    };
    return symbols[type] || '❓';
}

// ⭐ НОВАЯ ФУНКЦИЯ - получает цвет типа для фона
function getTypeColor(type) {
    const colors = {
        BUG: '#92BC2C',
        DARK: '#595761',
        DRAGON: '#0C69C8',
        ELECTRIC: '#F2D94E',
        FAIRY: '#EE90E6',
        FIGHTING: '#D3425F',
        FIRE: '#FBA54C',
        FLYING: '#A1BBEC',
        GHOST: '#5F6DBC',
        GRASS: '#5FBD58',
        GROUND: '#DA7C4D',
        ICE: '#75D0C1',
        NORMAL: '#A0A29F',
        POISON: '#B763CF',
        PSYCHIC: '#FA8581',
        ROCK: '#C9BB8A',
        STEEL: '#5695A3',
        WATER: '#539DDF'
    };
    return colors[type] || '#6C5CE7';
}

// ⭐ НОВАЯ ФУНКЦИЯ - получает URL иконки типа
function getTypeIconUrl(type) {
    const baseUrl = 'https://github.com/Gabryelf/Atlas-Assets/raw/main/docs/images/pokemon/type-icons/';
    return `${baseUrl}${type.toLowerCase()}.svg`;
}

// ⭐ НОВАЯ ФУНКЦИЯ - создает HTML для иконки типа (синхронная версия)
function createTypeIconHTML(type, size = 'sm') {
    const color = getTypeColor(type);
    const iconUrl = getTypeIconUrl(type);
    const sizeClass = `type-icon-${size}`;
    const typeClass = type.toLowerCase();
    
    return `
        <div class="type-icon ${typeClass} ${sizeClass}" 
             title="${type}" 
             data-type="${type.toLowerCase()}"
             style="background: ${color}; box-shadow: 0 0 12px ${color}40;">
            <img src="${iconUrl}" 
                 alt="${type}" 
                 style="width: 55%; height: 55%; object-fit: contain; filter: brightness(0) invert(1);"
                 onerror="this.style.display='none'; this.parentElement.textContent='${type.charAt(0).toUpperCase()}'; this.parentElement.style.color='#fff'; this.parentElement.style.fontWeight='bold'; this.parentElement.style.fontSize='0.7rem';">
        </div>
    `;
}

// ⭐ НОВАЯ ФУНКЦИЯ - создает контейнер с иконками типов
function createTypeIconsHTML(types, size = 'sm') {
    if (!types || types.length === 0) return '';
    return `<div class="type-icons-container">${types.map(t => createTypeIconHTML(t, size)).join('')}</div>`;
}

// ⭐ НОВАЯ ФУНКЦИЯ - проверяет, является ли тип допустимым
function isValidType(type) {
    const validTypes = [
        'BUG', 'DARK', 'DRAGON', 'ELECTRIC', 'FAIRY', 'FIGHTING',
        'FIRE', 'FLYING', 'GHOST', 'GRASS', 'GROUND', 'ICE',
        'NORMAL', 'POISON', 'PSYCHIC', 'ROCK', 'STEEL', 'WATER'
    ];
    return validTypes.includes(type.toUpperCase());
}

// ⭐ НОВАЯ ФУНКЦИЯ - получает эффективность типа против другого типа
function getTypeEffectiveness(attackType, defenseType) {
    // Базовая таблица эффективности (упрощенная)
    const effectiveness = {
        // Атакующий тип: { защищающийся тип: множитель }
        FIRE: { GRASS: 2, ICE: 2, BUG: 2, WATER: 0.5, ROCK: 0.5, GROUND: 0.5 },
        WATER: { FIRE: 2, GROUND: 2, ROCK: 2, ELECTRIC: 0.5, GRASS: 0.5 },
        ELECTRIC: { WATER: 2, FLYING: 2, GROUND: 0 },
        GRASS: { WATER: 2, GROUND: 2, ROCK: 2, FIRE: 0.5, ICE: 0.5, POISON: 0.5, FLYING: 0.5, BUG: 0.5 },
        ICE: { GRASS: 2, GROUND: 2, FLYING: 2, DRAGON: 2, FIRE: 0.5, FIGHTING: 0.5, ROCK: 0.5 },
        FIGHTING: { NORMAL: 2, ICE: 2, ROCK: 2, FLYING: 0.5, PSYCHIC: 0.5 },
        POISON: { GRASS: 2, GROUND: 0.5, PSYCHIC: 0.5 },
        GROUND: { FIRE: 2, ELECTRIC: 2, POISON: 2, ROCK: 2, WATER: 0.5, GRASS: 0.5, ICE: 0.5 },
        FLYING: { GRASS: 2, FIGHTING: 2, BUG: 2, ELECTRIC: 0.5, ICE: 0.5, ROCK: 0.5 },
        PSYCHIC: { FIGHTING: 2, POISON: 2, BUG: 0.5, GHOST: 0.5 },
        BUG: { GRASS: 2, PSYCHIC: 2, FIRE: 0.5, FLYING: 0.5, ROCK: 0.5 },
        ROCK: { FIRE: 2, ICE: 2, FLYING: 2, BUG: 2, WATER: 0.5, GRASS: 0.5, FIGHTING: 0.5, GROUND: 0.5 },
        GHOST: { PSYCHIC: 2, GHOST: 2 },
        DRAGON: { DRAGON: 2, ICE: 0.5 }
    };
    
    const attack = attackType.toUpperCase();
    const defense = defenseType.toUpperCase();
    
    if (effectiveness[attack] && effectiveness[attack][defense] !== undefined) {
        return effectiveness[attack][defense];
    }
    return 1; // Нейтрально
}

// ⭐ НОВАЯ ФУНКЦИЯ - получает цвет для типа (с альфа-каналом)
function getTypeColorWithAlpha(type, alpha = 0.2) {
    const color = getTypeColor(type);
    // Преобразуем hex в rgba
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ⭐ НОВАЯ ФУНКЦИЯ - получает имя типа на русском
function getTypeNameRussian(type) {
    const names = {
        BUG: 'Насекомый',
        DARK: 'Тёмный',
        DRAGON: 'Драконий',
        ELECTRIC: 'Электрический',
        FAIRY: 'Волшебный',
        FIGHTING: 'Боевой',
        FIRE: 'Огненный',
        FLYING: 'Летающий',
        GHOST: 'Призрачный',
        GRASS: 'Травяной',
        GROUND: 'Земляной',
        ICE: 'Ледяной',
        NORMAL: 'Обычный',
        POISON: 'Ядовитый',
        PSYCHIC: 'Психический',
        ROCK: 'Каменный',
        STEEL: 'Стальной',
        WATER: 'Водный'
    };
    return names[type.toUpperCase()] || type;
}

// Экспортируем в глобальную область
window.randomInt = randomInt;
window.sleep = sleep;
window.formatNumber = formatNumber;
window.getTypeSymbol = getTypeSymbol; // Устарела, но оставлена для совместимости
window.getTypeColor = getTypeColor;
window.getTypeIconUrl = getTypeIconUrl;
window.createTypeIconHTML = createTypeIconHTML;
window.createTypeIconsHTML = createTypeIconsHTML;
window.isValidType = isValidType;
window.getTypeEffectiveness = getTypeEffectiveness;
window.getTypeColorWithAlpha = getTypeColorWithAlpha;
window.getTypeNameRussian = getTypeNameRussian;