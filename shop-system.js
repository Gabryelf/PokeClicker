// ==============================
// ИСПРАВЛЕННЫЙ SHOP SYSTEM
// ==============================

class ShopSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.money = GAME_CONFIG.STARTING_MONEY;
        this.pokeballs = { ...GAME_CONFIG.STARTING_POKEBALLS };
    }
    
    // Получить уровень игрока
    getPlayerLevel() {
        if (this.pokemonManager.team.length === 0) {
            return 1;
        }
        return Math.max(...this.pokemonManager.team.map(p => p.level));
    }
    
    // Проверить, доступна ли редкость для игрока
    isRarityAvailable(rarity) {
        const playerLevel = this.getPlayerLevel();
        const requiredLevel = GAME_CONFIG.RARITY_LEVEL_REQUIREMENTS[rarity] || 0;
        return playerLevel >= requiredLevel;
    }
    
    openPokeball(type) {
        if (!this.pokeballs[type] || this.pokeballs[type] <= 0) {
            return null;
        }
        
        this.pokeballs[type]--;
        this.updatePokeballsDisplay();
        
        // Фильтруем доступных покемонов по уровню игрока
        const availablePokemon = Object.entries(GAME_CONFIG.POKEMON_DATA)
            .filter(([_, data]) => this.isRarityAvailable(data.rarity))
            .map(([id, data]) => ({ id: parseInt(id), ...data }));
        
        if (availablePokemon.length === 0) {
            // Если нет доступных покемонов, используем всех
            const allPokemon = Object.entries(GAME_CONFIG.POKEMON_DATA)
                .map(([id, data]) => ({ id: parseInt(id), ...data }));
            return this.selectRandomPokemon(allPokemon, type);
        }
        
        return this.selectRandomPokemon(availablePokemon, type);
    }
    
    selectRandomPokemon(pokemonList, pokeballType) {
        // Сортируем по редкости
        const rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'SPECIAL', 'LEGENDARY'];
        const rates = GAME_CONFIG.POKEBALL_RATES[pokeballType];
        
        // Сначала пробуем выбрать по редкости
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const rarity of rarityOrder) {
            const rate = rates[rarity] || 0;
            if (rate > 0) {
                cumulative += rate;
                if (random <= cumulative) {
                    // Выбираем случайного покемона этой редкости
                    const pokemonOfRarity = pokemonList.filter(p => p.rarity === rarity);
                    if (pokemonOfRarity.length > 0) {
                        const selected = pokemonOfRarity[Math.floor(Math.random() * pokemonOfRarity.length)];
                        return this.pokemonManager.addToCollection(selected.id);
                    }
                }
            }
        }
        
        // Если ничего не выбрали, берем случайного из всех доступных
        const randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
        return this.pokemonManager.addToCollection(randomPokemon.id);
    }
    
    addMoney(amount) {
        this.money += amount;
        this.updateMoneyDisplay();
        return this.money;
    }
    
    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.updateMoneyDisplay();
            return true;
        }
        return false;
    }
    
    updateMoneyDisplay() {
        const moneyElement = document.getElementById('money');
        if (moneyElement) {
            moneyElement.textContent = this.money;
        }
    }
    
    updatePokeballsDisplay() {
        const normalCount = document.getElementById('normal-count');
        const masterCount = document.getElementById('master-count');
        const mythicCount = document.getElementById('mythic-count');
        
        if (normalCount) normalCount.textContent = this.pokeballs.NORMAL;
        if (masterCount) masterCount.textContent = this.pokeballs.MASTER;
        if (mythicCount) mythicCount.textContent = this.pokeballs.MYTHIC;
    }
    
    async createShopUI() {
        const shopContainer = document.getElementById('shop-items');
        if (!shopContainer) return;
        
        shopContainer.innerHTML = '';
        
        const items = [
            { type: 'NORMAL', name: 'Покебол', price: GAME_CONFIG.SHOP_PRICES.NORMAL_BALL, icon: 'NORMAL' },
            { type: 'MASTER', name: 'Мастербол', price: GAME_CONFIG.SHOP_PRICES.MASTER_BALL, icon: 'MASTER' },
            { type: 'MYTHIC', name: 'Мификбол', price: GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL, icon: 'MYTHIC' }
        ];
        
        for (const item of items) {
            const itemElement = document.createElement('div');
            itemElement.className = 'shop-item';
            
            // Создаем контейнер для изображения
            const imgContainer = document.createElement('div');
            imgContainer.className = 'shop-item-image-container';
            imgContainer.style.width = '80px';
            imgContainer.style.height = '80px';
            imgContainer.style.display = 'flex';
            imgContainer.style.alignItems = 'center';
            imgContainer.style.justifyContent = 'center';
            
            // Создаем изображение
            const img = document.createElement('img');
            img.className = 'shop-item-image';
            img.alt = item.name;
            img.style.maxWidth = '100%';
            img.style.maxHeight = '100%';
            img.style.objectFit = 'contain';
            
            try {
                const pokeballImg = await this.imageManager.getPokeballImage(item.icon);
                img.src = pokeballImg.src;
            } catch (e) {
                console.error(`❌ Ошибка загрузки изображения для ${item.name}:`, e);
                // Запасной вариант
                img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
            }
            
            imgContainer.appendChild(img);
            
            itemElement.innerHTML = `
                ${imgContainer.outerHTML}
                <div class="shop-item-info">
                    <h4>${item.name}</h4>
                    <div class="price">
                        <i class="fas fa-coins"></i>
                        <span>${item.price}</span>
                    </div>
                </div>
                <button class="buy-btn" data-type="${item.type}">Купить</button>
            `;
            
            shopContainer.appendChild(itemElement);
        }
        
        // Добавляем обработчики
        shopContainer.querySelectorAll('.buy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const ballType = e.target.dataset.type;
                this.buyPokeball(ballType);
            });
        });
    }
    
    buyPokeball(ballType) {
        let price;
        
        switch(ballType) {
            case 'NORMAL':
                price = GAME_CONFIG.SHOP_PRICES.NORMAL_BALL;
                break;
            case 'MASTER':
                price = GAME_CONFIG.SHOP_PRICES.MASTER_BALL;
                break;
            case 'MYTHIC':
                price = GAME_CONFIG.SHOP_PRICES.MYTHIC_BALL;
                break;
            default:
                return;
        }
        
        if (this.spendMoney(price)) {
            this.pokeballs[ballType]++;
            this.updatePokeballsDisplay();
            this.game.showNotification(`Куплен ${ballType} покебол!`, 'success');
            this.game.saveGame();
            // Обновляем магазин после покупки
            this.createShopUI();
        } else {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
        }
    }
}

window.ShopSystem = ShopSystem;