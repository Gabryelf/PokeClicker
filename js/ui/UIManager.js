/**
 * Менеджер пользовательского интерфейса
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
                
                var closeBtns = modal.querySelectorAll('.close');
                for (var j = 0; j < closeBtns.length; j++) {
                    var btn = closeBtns[j];
                    (function(currentModal) {
                        btn.addEventListener('click', function(e) {
                            e.stopPropagation();
                            currentModal.style.display = 'none';
                        });
                    })(modal);
                }
                
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
        
        // Кнопка героев
        var heroBtn = document.getElementById('hero-menu');
        if (heroBtn) {
            var self = this;
            heroBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                self.showHeroModal();
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
                this.game.showNotification('Следуй указаниям туториала!', 'info');
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
    
    // ============ МЕТОДЫ ДЛЯ ГЕРОЕВ ============
    
    showHeroModal() {
        var modal = document.getElementById('hero-modal');
        if (!modal) return;
        
        // Обновляем UI героев перед показом
        this.createHeroSelectionUI();
        modal.style.display = 'flex';
    }
    
    createHeroSelectionUI() {
        var container = document.getElementById('hero-selection');
        if (!container) return;
        
        var heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        var allHeroes = heroSystem.getAllHeroes();
        var unlockedHeroes = heroSystem.getUnlockedHeroes();
        var lockedHeroes = heroSystem.getLockedHeroes();
        var currentHero = heroSystem.currentHero;
        var stats = heroSystem.getHeroStats();
        
        var html = '<div class="hero-stats-header">';
        if (stats) {
            html += '<div class="hero-stats">' +
                '<div class="hero-stat"><span class="stat-label">Уровень</span><span class="stat-value">' + stats.level + '</span></div>' +
                '<div class="hero-stat"><span class="stat-label">Опыт</span><span class="stat-value">' + Math.floor(stats.exp) + '/' + stats.expNeeded + '</span></div>' +
                '<div class="hero-stat"><span class="stat-label">Очки навыков</span><span class="stat-value" style="color: var(--accent-warning);">' + stats.skillPoints + '</span></div>' +
                '<div class="hero-stat"><span class="stat-label">Бонус</span><span class="stat-value" style="color: var(--accent-success);">+' + stats.bonus + '%</span></div>' +
                '</div>';
        }
        html += '</div>';
        
        html += '<div class="hero-selection-grid">';
        
        // Отображаем доступных героев
        for (var id in unlockedHeroes) {
            if (unlockedHeroes.hasOwnProperty(id)) {
                var hero = unlockedHeroes[id];
                var isSelected = (id === currentHero);
                html += this.createHeroCardHTML(hero, isSelected, false);
            }
        }
        
        // Отображаем заблокированных героев
        for (var id in lockedHeroes) {
            if (lockedHeroes.hasOwnProperty(id)) {
                var hero = lockedHeroes[id];
                html += this.createHeroCardHTML(hero, false, true);
            }
        }
        
        html += '</div>';
        
        // Кнопка открытия дерева улучшений
        html += '<div class="hero-upgrades-section">' +
            '<button class="show-upgrades-btn" id="show-upgrades-btn">' +
            '<i class="fas fa-chart-line"></i> Дерево улучшений' +
            '</button>' +
            '</div>';
        
        container.innerHTML = html;
        
        // Обработчики для кнопок выбора героя
        var selectBtns = container.querySelectorAll('.select-hero-btn:not(.locked)');
        selectBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var heroId = btn.dataset.heroId;
                if (heroSystem.changeHero(heroId)) {
                    // Обновляем UI
                    self.createHeroSelectionUI();
                    self.updateUI();
                }
            });
        });
        
        // Обработчик для кнопки открытия дерева улучшений
        var upgradesBtn = document.getElementById('show-upgrades-btn');
        if (upgradesBtn) {
            upgradesBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                self.showHeroUpgrades();
            });
        }
        
        var self = this;
    }
    
    createHeroCardHTML(hero, isSelected, isLocked) {
        var lockedClass = isLocked ? 'locked' : '';
        var selectedClass = isSelected ? 'selected' : '';
        var statusText = isLocked ? '🔒 ' + (hero.unlockText || 'Закрыт') : (isSelected ? '✅ Выбран' : 'Выбрать');
        var disabledAttr = isLocked ? 'disabled' : '';
        
        return '<div class="hero-card ' + lockedClass + ' ' + selectedClass + '" data-hero-id="' + hero.id + '">' +
            '<div class="hero-avatar" style="border-color: ' + hero.color + '">' +
            '<img src="' + hero.image + '" alt="' + hero.name + '" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png\'">' +
            '</div>' +
            '<h3>' + hero.name + '</h3>' +
            '<p class="hero-description">' + hero.description + '</p>' +
            '<div class="hero-bonus-info">' +
            '<span class="hero-bonus-value">' + hero.bonus + '</span>' +
            '</div>' +
            '<div class="hero-favorite-pokemon">' +
            hero.favoritePokemon.map(function(id) {
                return '<div class="fav-pokemon-icon" title="Любимый покемон">' +
                    '<img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/' + id + '.png" alt="Pokemon" width="30" height="30" onerror="this.src=\'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png\'">' +
                    '</div>';
            }).join('') +
            '</div>' +
            '<button class="select-hero-btn ' + lockedClass + '" data-hero-id="' + hero.id + '" ' + disabledAttr + '>' + statusText + '</button>' +
            '</div>';
    }
    
    showHeroUpgrades() {
        var modal = document.getElementById('hero-upgrade-modal');
        if (!modal) return;
        
        var heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        var hero = heroSystem.getHero();
        if (!hero) return;
        
        // Обновляем имя героя в заголовке
        var nameEl = document.getElementById('hero-upgrade-name');
        if (nameEl) {
            nameEl.textContent = 'для ' + hero.name;
        }
        
        this.createUpgradeTree();
        modal.style.display = 'flex';
    }
    
    createUpgradeTree() {
        var container = document.getElementById('hero-upgrade-tree');
        if (!container) return;
        
        var heroSystem = this.game.heroSystem;
        if (!heroSystem) return;
        
        var hero = heroSystem.getHero();
        if (!hero) return;
        
        var availableUpgrades = heroSystem.getAvailableUpgrades();
        var purchased = heroSystem.getPurchasedUpgrades();
        var stats = heroSystem.getHeroStats();
        
        var html = '';
        
        // Информация об очках навыков
        html += '<div class="upgrade-info-header">' +
            '<div class="upgrade-skill-points">' +
            '<i class="fas fa-star" style="color: var(--accent-warning);"></i>' +
            ' Очки навыков: <span style="color: var(--accent-warning); font-weight: bold;">' + (stats ? stats.skillPoints : 0) + '</span>' +
            '</div>' +
            '<div class="upgrade-level-info">Уровень: ' + (stats ? stats.level : 1) + '</div>' +
            '</div>';
        
        html += '<div class="upgrade-tree">';
        
        for (var tier = 1; tier <= heroSystem.heroLevel; tier++) {
            var tierUpgrades = hero.upgrades[tier] || [];
            if (tierUpgrades.length === 0) continue;
            
            var isTierAvailable = tier <= heroSystem.heroLevel;
            var tierClass = isTierAvailable ? 'available' : 'locked';
            
            html += '<div class="upgrade-tier ' + tierClass + '">' +
                '<h4><i class="fas fa-star"></i> Уровень ' + tier + 
                (tier > heroSystem.heroLevel ? ' 🔒' : '') +
                '</h4>' +
                '<div class="upgrade-grid">';
            
            for (var i = 0; i < tierUpgrades.length; i++) {
                var upgrade = tierUpgrades[i];
                var isPurchased = purchased.indexOf(upgrade.id) !== -1;
                var isAvailable = false;
                
                // Проверяем доступность
                if (isTierAvailable && !isPurchased) {
                    var requirementsMet = true;
                    if (upgrade.requires) {
                        for (var j = 0; j < upgrade.requires.length; j++) {
                            if (purchased.indexOf(upgrade.requires[j]) === -1) {
                                requirementsMet = false;
                                break;
                            }
                        }
                    }
                    if (requirementsMet && stats && stats.skillPoints > 0) {
                        isAvailable = true;
                    }
                }
                
                var statusClass = '';
                if (isPurchased) statusClass = 'purchased';
                else if (isAvailable) statusClass = 'available';
                else statusClass = 'locked';
                
                html += '<div class="upgrade-item ' + statusClass + '" data-upgrade-id="' + upgrade.id + '">' +
                    '<div class="upgrade-icon">' + (upgrade.icon || '⭐') + '</div>' +
                    '<div class="upgrade-name">' + upgrade.name + '</div>' +
                    '<div class="upgrade-desc">' + upgrade.desc + '</div>';
                
                if (!isPurchased) {
                    html += '<div class="upgrade-cost">' +
                        '<i class="fas fa-coins"></i> ' + upgrade.cost +
                        ' <i class="fas fa-star" style="color: var(--accent-warning); margin-left: 5px;"></i> 1 очко' +
                        '</div>';
                } else {
                    html += '<div class="purchased-badge">✅ Куплено</div>';
                }
                
                if (upgrade.requires) {
                    var reqNames = upgrade.requires.map(function(reqId) {
                        var reqUpgrade = heroSystem.findUpgrade(reqId);
                        return reqUpgrade ? reqUpgrade.name : reqId;
                    });
                    html += '<div class="upgrade-prerequisites">Требуется: ' + reqNames.join(', ') + '</div>';
                }
                
                html += '</div>';
            }
            
            html += '</div></div>';
        }
        
        html += '</div>';
        container.innerHTML = html;
        
        // Обработчики для доступных улучшений
        var self = this;
        var items = container.querySelectorAll('.upgrade-item.available');
        items.forEach(function(item) {
            item.addEventListener('click', function() {
                var upgradeId = item.dataset.upgradeId;
                var success = heroSystem.purchaseUpgrade(upgradeId);
                if (success) {
                    // Обновляем дерево
                    self.createUpgradeTree();
                    self.updateUI();
                }
            });
        });
    }
    
    // ============ ОСТАЛЬНЫЕ МЕТОДЫ ============
    
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
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.dataset.id = pokemon.id;
        card.dataset.pokemonId = pokemon.id;
        
        const rarity = CONFIG.RARITIES[pokemon.rarity];
        const energyPercent = (pokemon.energy / pokemon.maxEnergy) * 100;
        
        // Загружаем изображение покемона
        let pokemonImgSrc = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png';
        try {
            const pokemonImg = await this.imageManager.getPokemonImage(pokemon.id);
            pokemonImgSrc = pokemonImg.src;
        } catch (e) {
            // используем запасной вариант
        }
        
        // Проверяем, в команде ли покемон
        const isInTeam = this.game.pokemonManager.team.some(p => p.id === pokemon.id);
        
        // Создаем иконки типов
        let typesHTML = '';
        if (pokemon.types && pokemon.types.length > 0) {
            // Используем готовый HTML с иконками
            typesHTML = `<div class="pokemon-type-icons">`;
            for (const type of pokemon.types) {
                const normalizedType = type.toLowerCase();
                typesHTML += `
                    <div class="type-icon ${normalizedType} type-icon-sm" title="${type}">
                        <img src="" alt="${type}" style="display: none;">
                        <span style="color: #fff; font-weight: bold; font-size: 0.6rem;">${type.charAt(0).toUpperCase()}</span>
                    </div>
                `;
            }
            typesHTML += `</div>`;
        }
        
        // После создания HTML, загружаем реальные иконки
        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${pokemonImgSrc}" alt="${pokemon.name}" class="pokemon-image" width="100" height="100">
            </div>
            <h4>${pokemon.name}</h4>
            <div class="pokemon-rarity" style="color: ${rarity.color}; border-color: ${rarity.color}">${rarity.name}</div>
            ${typesHTML}
            <div class="pokemon-stats">
                <div>Уровень: ${pokemon.level}</div>
                <div>Урон: ${Math.floor(pokemon.currentDamage)}</div>
                <div>Энергия: ${Math.floor(energyPercent)}%</div>
                <div>Слияний: ${pokemon.mergeCount || 0}</div>
            </div>
            ${isInTeam ? '<div class="in-team"> </div>' : ''}
            <div class="pokemon-actions">
                ${!isInTeam && pokemon.energy > 0 && this.game.pokemonManager.team.length < this.game.pokemonManager.maxTeamSize ? 
                    `<button class="add-to-team-btn" data-pokemon-id="${pokemon.id}">➕ В команду</button>` : 
                    (!isInTeam && pokemon.energy <= 0 ? '<div class="no-energy">Нет энергии</div>' : '')}
            </div>
        `;
        
        // Асинхронно загружаем реальные иконки
        this.loadTypeIconsForCard(card, pokemon.types);
        
        return card;
    }
    
    /**
     * Загружает реальные иконки типов для карточки
     */
    async loadTypeIconsForCard(card, types) {
        if (!types || types.length === 0) return;
        
        const iconContainers = card.querySelectorAll('.pokemon-type-icons .type-icon');
        if (iconContainers.length === 0) return;
        
        for (let i = 0; i < Math.min(iconContainers.length, types.length); i++) {
            const container = iconContainers[i];
            const type = types[i];
            try {
                const icon = await this.imageManager.getTypeIcon(type);
                const img = container.querySelector('img');
                if (img) {
                    img.src = icon.src;
                    img.style.display = 'block';
                    const span = container.querySelector('span');
                    if (span) span.style.display = 'none';
                }
            } catch (e) {
                // Оставляем текстовый заменитель
                console.warn(`Не удалось загрузить иконку ${type}`);
            }
        }
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