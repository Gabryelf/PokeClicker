/**
 * Менеджер пользовательского интерфейса - исправленная версия
 * @module UIManager
 */

 class UIManager {
    constructor(game, imageManager) {
        this.game = game;
        this.imageManager = imageManager;
        this.modals = {};
        this.activeTab = 'collection';
        this.isProcessingPokeball = false;
        
        this.initModals();
        this.createMergeModal();
        
        var self = this;
        setTimeout(function() {
            self.setupPokeballClickHandlers();
            self.setupTeamSlotClickHandlers();
            self.initEventListeners();
        }, 500);
    }
    
    initModals() {
        var modalNames = ['collection', 'shop', 'team', 'hero', 'hero-upgrade', 'pokemon-center', 'gym'];
        for (var i = 0; i < modalNames.length; i++) {
            var name = modalNames[i];
            var modal = document.getElementById(name + '-modal');
            if (modal) {
                this.modals[name] = modal;
                
                // Находим все кнопки закрытия
                var closeBtns = modal.querySelectorAll('.close');
                for (var j = 0; j < closeBtns.length; j++) {
                    var btn = closeBtns[j];
                    // Используем замыкание с правильной ссылкой
                    (function(currentModal) {
                        btn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            currentModal.style.display = 'none';
                        });
                    })(modal);
                }
                
                // Закрытие по клику вне модального окна
                (function(currentModal) {
                    currentModal.addEventListener('click', function(e) {
                        if (e.target === currentModal) {
                            currentModal.style.display = 'none';
                        }
                    });
                })(modal);
            }
        }
    }
    
    initEventListeners() {
        var enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            var self = this;
            enemyCard.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.game.manualAttack();
            });
        }
        
        var collectionBtn = document.getElementById('collection-menu');
        if (collectionBtn) {
            var self = this;
            collectionBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.showModal('collection');
            });
        }
        
        var shopBtn = document.getElementById('shop-menu');
        if (shopBtn) {
            var self = this;
            shopBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.showModal('shop');
            });
        }
        
        var mapBtn = document.getElementById('map-menu');
        if (mapBtn) {
            var self = this;
            mapBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (self.game.mapModal) {
                    self.game.mapModal.show();
                }
            });
        }
        
        var avatarCircle = document.getElementById('avatar-circle');
        if (avatarCircle) {
            var self = this;
            avatarCircle.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.showHeroModal();
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault();
                self.game.manualAttack();
            }
        });
    }
    
    setupPokeballClickHandlers() {
        var pokeballItems = document.querySelectorAll('.pokeball-item');
        var self = this;
        pokeballItems.forEach(function(item) {
            item.removeEventListener('click', self.pokeballClickHandler);
            self.pokeballClickHandler = function(e) {
                e.stopPropagation();
                var type = item.dataset.type;
                self.handlePokeballClick(type);
            };
            item.addEventListener('click', self.pokeballClickHandler);
        });
    }
    
    setupTeamSlotClickHandlers() {
        var teamSlots = document.getElementById('team-slots');
        if (teamSlots) {
            var self = this;
            teamSlots.removeEventListener('click', self.teamSlotClickHandler);
            
            self.teamSlotClickHandler = function(e) {
                var slot = e.target.closest('.team-slot');
                if (slot) {
                    self.showModal('team');
                }
            };
            
            teamSlots.addEventListener('click', self.teamSlotClickHandler);
        }
    }
    
    handlePokeballClick(type) {
        if (this.game.tutorialSystem && this.game.tutorialSystem.isTutorialActive) {
            var step = this.game.tutorialSystem.steps[this.game.tutorialSystem.currentStep];
            if (step && step.action === 'click-pokeball') {
                // Разрешаем клик
            } else {
                this.game.showNotification('🎓 Следуй указаниям туториала!', 'info');
                return;
            }
        }
        
        if (this.isProcessingPokeball) return;
        
        var count = this.game.shopSystem.pokeballs[type];
        if (count > 0) {
            this.isProcessingPokeball = true;
            this.openPokeballWithAnimation(type);
        } else {
            this.game.showNotification('Купите покеболы в магазине!', 'warning');
            this.showModal('shop');
        }
    }
    
    async openPokeballWithAnimation(type) {
        try {
            var overlay = document.createElement('div');
            overlay.className = 'pokeball-open-overlay';
            document.body.appendChild(overlay);
            
            var animContainer = document.createElement('div');
            animContainer.className = 'pokeball-open-animation';
            var pokeballImg = await this.imageManager.getPokeballImage(type);
            var img = document.createElement('img');
            img.src = pokeballImg.src;
            animContainer.appendChild(img);
            overlay.appendChild(animContainer);
            
            await sleep(800);
            overlay.remove();
            
            var pokemon = this.game.shopSystem.openPokeball(type);
            if (pokemon) {
                await this.showRevealedPokemon(pokemon);
                await this.updateUI();
                this.game.saveGame();
                SoundGenerator.playPokemonCry();
            }
            
            this.isProcessingPokeball = false;
        } catch (e) {
            this.isProcessingPokeball = false;
        }
    }
    
    showRevealedPokemon(pokemon) {
        return new Promise(function(resolve) {
            var overlay = document.createElement('div');
            overlay.className = 'pokemon-reveal-overlay';
            var revealContainer = document.createElement('div');
            revealContainer.className = 'pokemon-reveal-animation';
            
            this.imageManager.getPokemonImage(pokemon.id).then(function(pokemonImg) {
                var img = document.createElement('img');
                img.src = pokemonImg.src;
                revealContainer.appendChild(img);
                var nameDiv = document.createElement('div');
                nameDiv.className = 'pokemon-name-reveal';
                nameDiv.textContent = pokemon.name;
                revealContainer.appendChild(nameDiv);
                overlay.appendChild(revealContainer);
                document.body.appendChild(overlay);
                
                setTimeout(function() {
                    overlay.remove();
                    resolve();
                }, 2000);
            }).catch(function() {
                overlay.remove();
                resolve();
            });
        }.bind(this));
    }
    
    showModal(modalName) {
        var modal = this.modals[modalName];
        if (!modal) return;
        modal.style.display = 'flex';
        this.setActiveTab(modalName);
        
        var self = this;
        switch(modalName) {
            case 'collection':
                this.createCollectionUI();
                break;
            case 'shop':
                if (this.game.shopSystem) {
                    this.game.shopSystem.createShopUI();
                }
                break;
            case 'team':
                this.createTeamSelectionUI();
                break;
        }
    }
    
    setActiveTab(tabName) {
        this.activeTab = tabName;
        var tabs = ['collection', 'shop', 'team'];
        for (var i = 0; i < tabs.length; i++) {
            var tab = tabs[i];
            var btn = document.getElementById(tab + '-menu');
            if (btn) {
                if (tab === tabName) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        }
    }
    
    async updateUI() {
        await this.updateTeamDisplay();
        if (this.game.battleSystem) {
            this.game.battleSystem.updateUI();
        }
        if (this.game.shopSystem) {
            this.game.shopSystem.updateMoneyDisplay();
            this.game.shopSystem.updatePokeballsDisplay();
        }
        
        var team = this.game.pokemonManager.team;
        if (team.length > 0) {
            var maxLevel = 1;
            for (var i = 0; i < team.length; i++) {
                if (team[i].level > maxLevel) {
                    maxLevel = team[i].level;
                }
            }
            var playerLevelEl = document.getElementById('player-level');
            if (playerLevelEl) {
                playerLevelEl.textContent = maxLevel;
            }
        }
        
        await this.updateAvatar();
        
        if (this.game.locationSystem) {
            var locationNameEl = document.getElementById('current-location-name');
            if (locationNameEl) {
                var location = this.game.locationSystem.locations[this.game.locationSystem.currentLocation];
                locationNameEl.textContent = location ? location.name : 'Паллет Таун';
            }
        }
        
        var heroBonusEl = document.getElementById('hero-bonus-text');
        if (heroBonusEl && this.game.heroSystem) {
            var bonus = this.game.heroSystem.getHeroBonus();
            heroBonusEl.textContent = '+' + bonus + '%';
        }
        
        this.setupPokeballClickHandlers();
        this.setupTeamSlotClickHandlers();
    }
    
    async updateTeamDisplay() {
        var teamSlots = document.getElementById('team-slots');
        if (!teamSlots) return;
        teamSlots.innerHTML = '';
        var team = this.game.pokemonManager.team;
        var maxTeamSize = this.game.pokemonManager.maxTeamSize || 3;
        
        for (var i = 0; i < Math.min(team.length, maxTeamSize); i++) {
            var pokemon = team[i];
            var slot = document.createElement('div');
            slot.className = 'team-slot occupied';
            slot.dataset.id = pokemon.id;
            slot.style.setProperty('--i', Math.random() * 2);
            
            var imgHtml = '';
            try {
                var pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
                imgHtml = '<img src="' + pokemonImg.src + '" alt="' + pokemon.name + '" class="team-pokemon-image" width="50" height="50">';
            } catch (e) {
                imgHtml = '<div class="team-pokemon-placeholder">?</div>';
            }
            
            var energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
            slot.innerHTML = imgHtml +
                '<div class="pokemon-info"><span class="pokemon-name">' + pokemon.name + '</span><span class="pokemon-level">Lv.' + pokemon.level + '</span></div>' +
                '<div class="energy-bar" style="--energy-width: ' + energyPercent + '%"></div>';
            teamSlots.appendChild(slot);
        }
        
        for (var j = team.length; j < maxTeamSize; j++) {
            var emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.dataset.empty = 'true';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
    }
    
    async createCollectionUI() {
        var collectionGrid = document.getElementById('collection-grid');
        if (!collectionGrid) return;
        collectionGrid.innerHTML = '';
        var collection = this.game.pokemonManager.collection;
        
        if (collection.length === 0) {
            collectionGrid.innerHTML = '<div class="empty-collection"><i class="fas fa-box-open"></i><p>Коллекция пуста! Откройте покеболы, кликнув на них в шапке.</p></div>';
            return;
        }
        
        collection.sort(function(a, b) {
            if (b.level !== a.level) return b.level - a.level;
            return a.name.localeCompare(b.name);
        });
        
        for (var i = 0; i < collection.length; i++) {
            var pokemon = collection[i];
            var card = await this.createPokemonCard(pokemon);
            collectionGrid.appendChild(card);
        }
        
        this.addCollectionButtonHandlers();
    }
    
    async createPokemonCard(pokemon) {
        var card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        card.dataset.pokemonId = pokemon.id;
        var rarity = CONFIG.RARITIES[pokemon.rarity];
        var energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        var img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        try {
            var pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        }
        
        var isInTeam = false;
        for (var i = 0; i < this.game.pokemonManager.team.length; i++) {
            if (this.game.pokemonManager.team[i].id === pokemon.id) {
                isInTeam = true;
                break;
            }
        }
        
        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${img.src}" alt="${pokemon.name}" class="pokemon-image" width="100" height="100">
            </div>
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">${rarity.name}</div>
            <div class="pokemon-stats">
                <div>Уровень: ${pokemon.level}</div>
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
                <div>Слияний: ${pokemon.mergeCount || 0}</div>
            </div>
            ${isInTeam ? '<div class="in-team">В команде</div>' : ''}
            <div class="pokemon-actions">
                ${!isInTeam && pokemon.energy > 0 && this.game.pokemonManager.team.length < this.game.pokemonManager.maxTeamSize ? 
                    `<button class="add-to-team-btn" data-pokemon-id="${pokemon.id}">➕ В команду</button>` : 
                    (!isInTeam && pokemon.energy <= 0 ? '<div class="no-energy">Нет энергии</div>' : '')}
            </div>
        `;
        
        return card;
    }
    
    addCollectionButtonHandlers() {
        var self = this;
        var buttons = document.querySelectorAll('#collection-grid .add-to-team-btn');
        buttons.forEach(function(btn) {
            btn.removeEventListener('click', self.collectionAddHandler);
            self.collectionAddHandler = function(e) {
                e.stopPropagation();
                var pokemonId = parseInt(btn.dataset.pokemonId);
                var result = self.game.addToTeam(pokemonId);
                if (result && result.success) {
                    self.createCollectionUI();
                    self.updateUI();
                }
            };
            btn.addEventListener('click', self.collectionAddHandler);
        });
    }
    
    async createTeamSelectionUI() {
        var teamSelection = document.getElementById('team-selection');
        if (!teamSelection) return;
        teamSelection.innerHTML = '';
        var collection = this.game.pokemonManager.collection;
        var team = this.game.pokemonManager.team;
        
        if (collection.length === 0) {
            teamSelection.innerHTML = '<p style="text-align: center;">Коллекция пуста!</p>';
            return;
        }
        
        var teamSection = document.createElement('div');
        teamSection.className = 'current-team';
        teamSection.innerHTML = '<h3><i class="fas fa-users"></i> Текущая команда</h3>';
        var teamSlots = document.createElement('div');
        teamSlots.className = 'team-slots selection-slots';
        
        for (var i = 0; i < team.length; i++) {
            var slot = await this.createTeamSlot(team[i], true);
            teamSlots.appendChild(slot);
        }
        
        for (var j = team.length; j < this.game.pokemonManager.maxTeamSize; j++) {
            var emptySlot = document.createElement('div');
            emptySlot.className = 'team-slot empty';
            emptySlot.innerHTML = '<i class="fas fa-plus"></i><span>Пусто</span>';
            teamSlots.appendChild(emptySlot);
        }
        
        teamSection.appendChild(teamSlots);
        teamSelection.appendChild(teamSection);
        
        var totalDamage = this.game.pokemonManager.getTeamDamage();
        var damageDiv = document.createElement('div');
        damageDiv.className = 'team-damage';
        damageDiv.innerHTML = '<span><i class="fas fa-crosshairs"></i> Общий урон команды:</span><span id="team-total-damage">' + Math.floor(totalDamage) + '</span>';
        teamSelection.appendChild(damageDiv);
        
        var availableSection = document.createElement('div');
        availableSection.className = 'available-pokemon';
        availableSection.innerHTML = '<h3><i class="fas fa-dragon"></i> Доступные покемоны</h3>';
        var availableGrid = document.createElement('div');
        availableGrid.className = 'available-grid';
        
        var availablePokemon = [];
        for (var k = 0; k < collection.length; k++) {
            if (!collection[k].isInTeam && collection[k].energy > 0) {
                availablePokemon.push(collection[k]);
            }
        }
        
        if (availablePokemon.length === 0) {
            availableGrid.innerHTML = '<p class="no-pokemon">Нет доступных покемонов</p>';
        } else {
            for (var m = 0; m < availablePokemon.length; m++) {
                var pokemonCard = await this.createSelectablePokemonCard(availablePokemon[m]);
                availableGrid.appendChild(pokemonCard);
            }
        }
        
        availableSection.appendChild(availableGrid);
        teamSelection.appendChild(availableSection);
        this.addTeamSelectionHandlers();
    }
    
    async createSelectablePokemonCard(pokemon) {
        var card = document.createElement('div');
        card.className = 'pokemon-card selectable';
        card.dataset.id = pokemon.id;
        var rarity = CONFIG.RARITIES[pokemon.rarity];
        var energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        var img = document.createElement('img');
        img.className = 'pokemon-image';
        img.alt = pokemon.name;
        try {
            var pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        }
        
        card.innerHTML = `
            <img src="${img.src}" alt="${pokemon.name}" class="pokemon-image" width="80" height="80">
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">Lv.${pokemon.level} ${rarity.name}</div>
            <div class="pokemon-stats">
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
            </div>
            <button class="add-to-team-btn" data-pokemon-id="${pokemon.id}">➕ В команду</button>
        `;
        
        return card;
    }
    
    async createTeamSlot(pokemon, isSelected) {
        var slot = document.createElement('div');
        slot.className = 'team-slot' + (isSelected ? ' selected' : '');
        slot.dataset.id = pokemon.id;
        
        var img = document.createElement('img');
        img.className = 'team-pokemon-image';
        img.alt = pokemon.name;
        try {
            var pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            img.src = pokemonImg.src;
        } catch (e) {
            img.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        }
        
        var energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        slot.innerHTML = `
            <img src="${img.src}" alt="${pokemon.name}" class="team-pokemon-image" width="50" height="50">
            <div class="pokemon-info">
                <span class="pokemon-name">${pokemon.name}</span>
                <span class="pokemon-level">Lv.${pokemon.level}</span>
            </div>
            <div class="energy-bar" style="--energy-width: ${energyPercent}%"></div>
        `;
        
        if (isSelected) {
            var removeBtn = document.createElement('button');
            removeBtn.className = 'remove-btn';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            var self = this;
            removeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                self.game.removeFromTeam(pokemon.id);
                self.createTeamSelectionUI();
                self.updateUI();
            });
            slot.appendChild(removeBtn);
        }
        
        return slot;
    }
    
    addTeamSelectionHandlers() {
        var self = this;
        var buttons = document.querySelectorAll('.available-pokemon .add-to-team-btn, .pokemon-card.selectable .add-to-team-btn');
        buttons.forEach(function(btn) {
            btn.removeEventListener('click', self.teamAddHandler);
            self.teamAddHandler = function(e) {
                e.stopPropagation();
                var pokemonId = parseInt(btn.dataset.pokemonId);
                var result = self.game.addToTeam(pokemonId);
                if (result && result.success) {
                    self.createTeamSelectionUI();
                    self.updateUI();
                }
            };
            btn.addEventListener('click', self.teamAddHandler);
        });
    }
    
    async updateAvatar() {
        var avatarImage = document.getElementById('avatar-image');
        var avatarName = document.getElementById('avatar-name');
        var avatarLevel = document.getElementById('avatar-level');
        if (!avatarImage || !avatarName || !avatarLevel) return;
        
        var heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        var hero = heroSystem.getHero();
        if (!hero) return;
        
        avatarName.textContent = hero.name;
        avatarLevel.textContent = heroSystem.heroLevel;
        avatarImage.src = hero.image;
    }
    
    showHeroModal() {
        var modal = document.getElementById('hero-modal');
        if (!modal) return;
        this.createHeroSelectionUI();
        modal.style.display = 'flex';
    }
    
    createHeroSelectionUI() {
        var container = document.getElementById('hero-selection');
        if (!container) return;
        var heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        var heroes = heroSystem.heroes;
        var currentHero = heroSystem.currentHero;
        
        var html = '<div class="hero-selection-grid">';
        for (var id in heroes) {
            if (heroes.hasOwnProperty(id)) {
                var hero = heroes[id];
                html += '<div class="hero-card' + (currentHero === id ? ' selected' : '') + '" data-hero-id="' + id + '">' +
                    '<div class="hero-avatar" style="border-color: ' + hero.color + '"><img src="' + hero.image + '" alt="' + hero.name + '" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png\'"></div>' +
                    '<h3>' + hero.name + '</h3><p class="hero-description">' + hero.description + '</p>' +
                    '<div class="hero-bonus-info"><span class="hero-bonus-value">+' + hero.bonusValue + '% за уровень</span><p>' + hero.bonus + '</p></div>' +
                    '<div class="hero-favorite-pokemon">';
                for (var i = 0; i < hero.favoritePokemon.length; i++) {
                    html += '<div class="fav-pokemon-icon" title="Любимый покемон"><img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + hero.favoritePokemon[i] + '.png" alt="Pokemon" width="30" height="30" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png\'"></div>';
                }
                html += '</div><button class="select-hero-btn" data-hero-id="' + id + '">' + (currentHero === id ? 'Выбран' : 'Выбрать') + '</button></div>';
            }
        }
        html += '</div>';
        container.innerHTML = html;
        
        var self = this;
        container.querySelectorAll('.select-hero-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var heroId = btn.dataset.heroId;
                if (heroSystem.changeHero(heroId)) {
                    self.createHeroSelectionUI();
                    self.updateAvatar();
                    self.updateUI();
                }
            });
        });
    }
    
    createMergeModal() {
        if (document.getElementById('merge-modal')) return;
        var modal = document.createElement('div');
        modal.id = 'merge-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content merge-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-merge"></i> Слияние покемонов!</h2>
                    <span class="close-merge">&times;</span>
                </div>
                <div class="modal-body merge-body">
                    <div class="merge-animation">
                        <div class="merge-pokemon original"></div>
                        <div class="merge-plus">+</div>
                        <div class="merge-pokemon duplicate"></div>
                        <div class="merge-equals">=</div>
                        <div class="merge-pokemon result"></div>
                    </div>
                    <div class="merge-details">
                        <h3 class="merge-name"></h3>
                        <div class="merge-stats">
                            <div class="stat"><span>Уровень</span><span class="level-change"></span></div>
                            <div class="stat"><span>Урон</span><span class="damage-change"></span></div>
                            <div class="stat"><span>Слияний</span><span class="merge-count"></span></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        var closeBtn = modal.querySelector('.close-merge');
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                modal.style.display = 'none';
            });
        }
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    showMergeAnimation(mergeData) {
        var modal = document.getElementById('merge-modal');
        if (!modal) return;
        
        var pokemon = mergeData.pokemon;
        var nameEl = modal.querySelector('.merge-name');
        if (nameEl) nameEl.textContent = pokemon.name + ' #' + pokemon.level;
        var levelChange = modal.querySelector('.level-change');
        if (levelChange) levelChange.innerHTML = mergeData.oldLevel + ' → <span class="increase">' + mergeData.newLevel + '</span>';
        var damageChange = modal.querySelector('.damage-change');
        if (damageChange) damageChange.innerHTML = Math.floor(mergeData.oldDamage) + ' → <span class="increase">' + Math.floor(mergeData.newDamage) + '</span>';
        var mergeCount = modal.querySelector('.merge-count');
        if (mergeCount) mergeCount.textContent = mergeData.mergeCount;
        
        this.loadPokemonImage(modal.querySelector('.original'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.duplicate'), pokemon.id);
        this.loadPokemonImage(modal.querySelector('.result'), pokemon.id);
        
        modal.style.display = 'flex';
        setTimeout(function() {
            modal.style.display = 'none';
        }, 6000);
    }
    
    loadPokemonImage(container, pokemonId) {
        if (!container) return;
        this.imageManager.getPokemonImage(pokemonId).then(function(img) {
            container.innerHTML = '';
            container.appendChild(img.cloneNode());
        }).catch(function() {});
    }
}

window.UIManager = UIManager;