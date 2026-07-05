/**
 * Магазин и система покеболов
 * @module ShopSystem
 */

 class ShopSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.money = CONFIG.STARTING_MONEY;
        this.pokeballs = {
            NORMAL: CONFIG.STARTING_POKEBALLS.NORMAL,
            MASTER: CONFIG.STARTING_POKEBALLS.MASTER,
            MYTHIC: CONFIG.STARTING_POKEBALLS.MYTHIC
        };
    }
    
    setMoney(amount) {
        this.money = amount;
    }
    
    setPokeballs(pokeballs) {
        this.pokeballs = {
            NORMAL: pokeballs.NORMAL || 0,
            MASTER: pokeballs.MASTER || 0,
            MYTHIC: pokeballs.MYTHIC || 0
        };
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
    
    getPlayerLevel() {
        if (this.pokemonManager.team.length === 0) return 1;
        var maxLevel = 1;
        for (var i = 0; i < this.pokemonManager.team.length; i++) {
            if (this.pokemonManager.team[i].level > maxLevel) {
                maxLevel = this.pokemonManager.team[i].level;
            }
        }
        return maxLevel;
    }
    
    isRarityAvailable(rarity) {
        var requiredLevel = CONFIG.RARITY_LEVEL_REQUIREMENTS[rarity] || 0;
        return this.getPlayerLevel() >= requiredLevel;
    }
    
    openPokeball(type) {
        if (!this.pokeballs[type] || this.pokeballs[type] <= 0) return null;
        
        this.pokeballs[type]--;
        this.updatePokeballsDisplay();
        
        var availablePokemon = [];
        var pokemonData = CONFIG.POKEMON_DATA;
        for (var id in pokemonData) {
            if (pokemonData.hasOwnProperty(id)) {
                var data = pokemonData[id];
                if (this.isRarityAvailable(data.rarity)) {
                    availablePokemon.push({ id: parseInt(id), name: data.name, rarity: data.rarity, types: data.types, baseDamage: data.baseDamage, imageKey: data.imageKey });
                }
            }
        }
        
        if (availablePokemon.length === 0) {
            var allPokemon = [];
            for (var id2 in pokemonData) {
                if (pokemonData.hasOwnProperty(id2)) {
                    var data2 = pokemonData[id2];
                    allPokemon.push({ id: parseInt(id2), name: data2.name, rarity: data2.rarity, types: data2.types, baseDamage: data2.baseDamage, imageKey: data2.imageKey });
                }
            }
            return this.selectRandomPokemon(allPokemon, type);
        }
        
        return this.selectRandomPokemon(availablePokemon, type);
    }
    
    selectRandomPokemon(pokemonList, pokeballType) {
        var rarityOrder = ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'SPECIAL', 'LEGENDARY'];
        var rates = CONFIG.POKEBALL_RATES[pokeballType];
        var random = Math.random() * 100;
        var cumulative = 0;
        
        for (var i = 0; i < rarityOrder.length; i++) {
            var rarity = rarityOrder[i];
            var rate = rates[rarity] || 0;
            if (rate > 0) {
                cumulative += rate;
                if (random <= cumulative) {
                    var pokemonOfRarity = [];
                    for (var j = 0; j < pokemonList.length; j++) {
                        if (pokemonList[j].rarity === rarity) {
                            pokemonOfRarity.push(pokemonList[j]);
                        }
                    }
                    if (pokemonOfRarity.length > 0) {
                        var selected = pokemonOfRarity[Math.floor(Math.random() * pokemonOfRarity.length)];
                        return this.pokemonManager.addToCollection(selected.id);
                    }
                }
            }
        }
        
        var randomPokemon = pokemonList[Math.floor(Math.random() * pokemonList.length)];
        return this.pokemonManager.addToCollection(randomPokemon.id);
    }
    
    buyPokeball(ballType) {
        var priceKey = ballType + '_BALL';
        var price = CONFIG.SHOP_PRICES[priceKey];
        if (!price) return;
        
        if (this.spendMoney(price)) {
            this.pokeballs[ballType]++;
            this.updatePokeballsDisplay();
            this.game.showNotification('Куплен ' + ballType + ' покебол!', 'success');
            this.game.saveGame();
            if (this.game.uiManager) {
                this.game.uiManager.createShopUI();
            }
        } else {
            this.game.showNotification('Недостаточно поке-баксов!', 'error');
        }
    }
    
    updateMoneyDisplay() {
        var element = document.getElementById('money');
        if (element) element.textContent = this.money;
    }
    
    updatePokeballsDisplay() {
        var normal = document.getElementById('normal-count');
        var master = document.getElementById('master-count');
        var mythic = document.getElementById('mythic-count');
        if (normal) normal.textContent = this.pokeballs.NORMAL;
        if (master) master.textContent = this.pokeballs.MASTER;
        if (mythic) mythic.textContent = this.pokeballs.MYTHIC;
    }
    
    createShopUI() {
        var container = document.getElementById('shop-items');
        if (!container) return;
        
        container.innerHTML = '';
        var items = [
            { type: 'NORMAL', name: 'Покебол', price: CONFIG.SHOP_PRICES.NORMAL_BALL },
            { type: 'MASTER', name: 'Мастербол', price: CONFIG.SHOP_PRICES.MASTER_BALL },
            { type: 'MYTHIC', name: 'Ультрабол', price: CONFIG.SHOP_PRICES.MYTHIC_BALL }
        ];
        
        var self = this;
        items.forEach(function(item) {
            var el = document.createElement('div');
            el.className = 'shop-item';
            
            var img = document.createElement('img');
            img.className = 'shop-item-image';
            img.alt = item.name;
            img.width = 80;
            img.height = 80;
            img.style.objectFit = 'contain';
            
            // Загружаем изображение
            self.imageManager.getPokeballImage(item.type).then(function(ballImg) {
                img.src = ballImg.src;
            }).catch(function() {
                // Fallback
                img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Ccircle cx="40" cy="40" r="35" fill="%23ff4444"/%3E%3Ccircle cx="40" cy="40" r="25" fill="%23ffffff"/%3E%3Ccircle cx="40" cy="40" r="15" fill="%23ff4444"/%3E%3C/svg%3E';
            });
            
            el.innerHTML = '';
            var imgContainer = document.createElement('div');
            imgContainer.className = 'shop-item-image-container';
            imgContainer.appendChild(img);
            el.appendChild(imgContainer);
            
            var infoDiv = document.createElement('div');
            infoDiv.className = 'shop-item-info';
            infoDiv.innerHTML = '<h4>' + item.name + '</h4><div class="price"><i class="fas fa-coins"></i> ' + item.price + '</div>';
            el.appendChild(infoDiv);
            
            var buyBtn = document.createElement('button');
            buyBtn.className = 'buy-btn';
            buyBtn.dataset.type = item.type;
            buyBtn.textContent = 'Купить';
            el.appendChild(buyBtn);
            
            container.appendChild(el);
        });
        
        container.querySelectorAll('.buy-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                self.buyPokeball(btn.dataset.type);
            });
        });
    }
}

window.ShopSystem = ShopSystem;