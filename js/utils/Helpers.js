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

// Функция для получения типа покемона по символу
function getTypeSymbol(type) {
    const symbols = {
        NORMAL: '⬤', FIRE: '🔥', WATER: '💧', GRASS: '🌿',
        ELECTRIC: '⚡', ICE: '❄️', FIGHTING: '👊', POISON: '☠️',
        GROUND: '⛰️', FLYING: '🦅', PSYCHIC: '🔮', BUG: '🐛',
        ROCK: '🪨', GHOST: '👻', DRAGON: '🐉'
    };
    return symbols[type] || '❓';
}

// Экспортируем в глобальную область
window.randomInt = randomInt;
window.sleep = sleep;
window.formatNumber = formatNumber;
window.getTypeSymbol = getTypeSymbol;