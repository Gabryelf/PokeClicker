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
                const fallbackImg = this.createFallbackImage(id);
                this.cache.set(id, fallbackImg);
                this.loadingPromises.delete(id);
                resolve(fallbackImg);
            };
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
        ctx.fillStyle = '#6C5CE7';
        ctx.fillRect(0, 0, 128, 128);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 48px Inter, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', 64, 64);
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

    async preloadAll() {
        const promises = [];
        for (const [id] of Object.entries(this.config.POKEMON_IMAGES)) {
            promises.push(this.getPokemonImage(parseInt(id)).catch(() => {}));
        }
        for (const [key] of Object.entries(this.config.ENEMY_IMAGES)) {
            promises.push(this.getEnemyImage(key).catch(() => {}));
        }
        for (const [type] of Object.entries(this.config.POKEBALL_IMAGES)) {
            promises.push(this.getPokeballImage(type).catch(() => {}));
        }
        await Promise.all(promises);
        this.isReady = true;
    }

    getCachedPokemonImage(pokemonId) {
        return this.cache.getCached('pokemon_' + pokemonId);
    }
}

// Функция для обновления изображений покеболов
function updatePokeballImages(imageManager) {
    const pokeballItems = document.querySelectorAll('.pokeball-item');
    pokeballItems.forEach(function(item) {
        const type = item.dataset.type;
        const img = item.querySelector('img');
        if (!img || !type) return;
        imageManager.getPokeballImage(type).then(function(pokeballImg) {
            img.src = pokeballImg.src;
            img.style.width = '32px';
            img.style.height = '32px';
            img.style.objectFit = 'contain';
        }).catch(function() {
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        });
    });
}

// Делаем глобально доступным
window.ImageManager = ImageManager;
window.ImageCache = ImageCache;
window.updatePokeballImages = updatePokeballImages;