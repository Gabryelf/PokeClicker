/**
 * Загрузчик изображений
 * @module ImageLoader
 */

 class ImageCache {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
    }

    loadImage(url, id) {
        if (this.cache.has(id)) {
            return Promise.resolve(this.cache.get(id));
        }

        if (this.loadingPromises.has(id)) {
            return this.loadingPromises.get(id);
        }

        const promise = new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.cache.set(id, img);
                this.loadingPromises.delete(id);
                resolve(img);
            };
            
            img.onerror = () => {
                console.warn('⚠️ Ошибка загрузки изображения:', url);
                const fallbackImg = this.createFallbackImage(id);
                this.cache.set(id, fallbackImg);
                this.loadingPromises.delete(id);
                resolve(fallbackImg);
            };
            
            // Добавляем таймаут для загрузки
            img.src = url;
        });

        this.loadingPromises.set(id, promise);
        return promise;
    }

    createFallbackImage(id) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        let color = '#6C5CE7';
        let text = '?';
        
        if (id.includes('NORMAL')) {
            color = '#ff4444';
            text = 'PB';
        } else if (id.includes('MASTER')) {
            color = '#9c27b0';
            text = 'MB';
        } else if (id.includes('MYTHIC')) {
            color = '#ffd700';
            text = 'UB';
        } else if (id.includes('pokemon')) {
            color = '#4CAF50';
            text = 'PK';
        } else if (id.includes('enemy')) {
            color = '#f44336';
            text = 'EN';
        }
        
        // Рисуем круг
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Рисуем текст
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 64, 64);
        
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    getCached(id) {
        return this.cache.get(id) || null;
    }
}

class ImageManager {
    constructor(imageConfig) {
        this.config = imageConfig;
        this.cache = new ImageCache();
        this.isReady = false;
    }

    // МЕТОД ДЛЯ UI ИКОНОК
    getUIIcon(iconKey) {
        const url = this.config.UI_ICONS[iconKey];
        if (!url) {
            console.warn(`⚠️ UI иконка не найдена: ${iconKey}`);
            return Promise.resolve(this.cache.createFallbackImage('ui_' + iconKey));
        }
        return this.cache.loadImage(url, 'ui_' + iconKey);
    }

    getPokemonImage(pokemonId) {
        const url = this.config.POKEMON_IMAGES[pokemonId];
        if (!url) {
            return Promise.resolve(this.cache.createFallbackImage('pokemon_' + pokemonId));
        }
        return this.cache.loadImage(url, 'pokemon_' + pokemonId);
    }

    getEnemyImage(enemyKey) {
        const url = this.config.ENEMY_IMAGES[enemyKey];
        if (!url) {
            return Promise.resolve(this.cache.createFallbackImage('enemy_' + enemyKey));
        }
        return this.cache.loadImage(url, 'enemy_' + enemyKey);
    }

    getPokeballImage(pokeballType) {
        const url = this.config.POKEBALL_IMAGES[pokeballType];
        if (!url) {
            return Promise.resolve(this.cache.createFallbackImage('pokeball_' + pokeballType));
        }
        return this.cache.loadImage(url, 'pokeball_' + pokeballType);
    }

    // ⭐ НОВЫЙ МЕТОД - загрузка иконок типов
    getTypeIcon(type) {
        const normalizedType = type.toUpperCase();
        const url = this.config.TYPE_ICONS[normalizedType];
        if (!url) {
            return Promise.resolve(this.cache.createFallbackImage('type_' + normalizedType));
        }
        return this.cache.loadImage(url, 'type_' + normalizedType);
    }

    async preloadAll() {
        const promises = [];
        
        // Загружаем покеболы
        for (const [type] of Object.entries(this.config.POKEBALL_IMAGES)) {
            promises.push(this.getPokeballImage(type).catch(() => {}));
        }
        
        // Загружаем иконки типов
        for (const [type] of Object.entries(this.config.TYPE_ICONS)) {
            promises.push(this.getTypeIcon(type).catch(() => {}));
        }
        
        // Загружаем покемонов
        for (const [id] of Object.entries(this.config.POKEMON_IMAGES)) {
            promises.push(this.getPokemonImage(parseInt(id)).catch(() => {}));
        }
        
        // Загружаем врагов
        for (const [key] of Object.entries(this.config.ENEMY_IMAGES)) {
            promises.push(this.getEnemyImage(key).catch(() => {}));
        }

        // Загружаем UI иконки
        for (const [key] of Object.entries(this.config.UI_ICONS)) {
            promises.push(this.getUIIcon(key).catch(() => {}));
        }
        
        await Promise.all(promises);
        this.isReady = true;
    }

    getCachedPokemonImage(pokemonId) {
        return this.cache.getCached('pokemon_' + pokemonId);
    }
    
    getCachedPokeballImage(type) {
        return this.cache.getCached('pokeball_' + type);
    }

    getCachedTypeIcon(type) {
        return this.cache.getCached('type_' + type.toUpperCase());
    }

    // Получить кэшированную UI иконку
    getCachedUIIcon(iconKey) {
        return this.cache.getCached('ui_' + iconKey);
    }
}

// Функция для обновления изображений покеболов в хедере
async function updatePokeballImages(imageManager) {

    const pokeballItems = document.querySelectorAll('.pokeball-item');
    
    for (const item of pokeballItems) {
        const type = item.dataset.type;
        const img = item.querySelector('img');
        if (!img || !type) {
            console.warn('⚠️ Нет изображения или типа для покебола');
            continue;
        }
        
        try {
            const pokeballImg = await imageManager.getPokeballImage(type);
            if (pokeballImg && pokeballImg.src) {
                img.src = pokeballImg.src;
                img.style.width = '32px';
                img.style.height = '32px';
                img.style.objectFit = 'contain';
                img.style.display = 'block';
            }
        } catch (e) {
            console.error(`❌ Ошибка обновления покебола ${type}:`, e);
            // Запасной вариант - используем PokeAPI
            const fallbackUrls = {
                'NORMAL': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
                'MASTER': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/master-ball.png',
                'MYTHIC': 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/ultra-ball.png'
            };
            img.src = fallbackUrls[type] || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.objectFit = 'contain';
        }
    }
}

// Делаем глобально доступным
window.ImageManager = ImageManager;
window.ImageCache = ImageCache;
window.updatePokeballImages = updatePokeballImages;