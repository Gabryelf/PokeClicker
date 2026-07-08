/**
 * Система боя
 * @module BattleSystem
 */

 class BattleSystem {
    constructor(pokemonManager, game, imageManager) {
        this.pokemonManager = pokemonManager;
        this.game = game;
        this.imageManager = imageManager;
        this.currentEnemy = null;
        this.enemyLevel = 1;
        this.autoAttackInterval = null;
        this.enemyAnimationFrame = null;
        this.isInitialized = false;
        
        this.createNewEnemy();
        this.startEnemyAnimation();
        this.startAutoAttack();
        this.isInitialized = true;
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
    
    getMaxEnemyLevel() {
        return this.getPlayerLevel() * CONFIG.MAX_ENEMY_LEVEL_MULTIPLIER;
    }
    
    createNewEnemy() {
        var currentLocation = this.game.locationSystem ? this.game.locationSystem.currentLocation : 'pallet_town';
        var locationEnemies = CONFIG.ENEMY_DATA[currentLocation] || CONFIG.ENEMY_DATA['pallet_town'];
        var enemyTemplate = locationEnemies[Math.floor(Math.random() * locationEnemies.length)];
        var enemyLevel = Math.floor(Math.random() * this.getMaxEnemyLevel()) + 1;
        var baseHp = CONFIG.BASE_ENEMY_HP;
        var maxHp = Math.floor(baseHp * Math.pow(CONFIG.ENEMY_HP_MULTIPLIER, enemyLevel - 1));
        
        this.currentEnemy = {
            name: enemyTemplate.name,
            rarity: enemyTemplate.rarity,
            types: enemyTemplate.types.slice(),
            imageKey: enemyTemplate.imageKey,
            id: Date.now() + Math.random(),
            hp: maxHp,
            maxHp: maxHp,
            level: enemyLevel
        };
        
        if (this.isInitialized) {
            this.updateUI();
        }
    }
    
    startEnemyAnimation() {
        var self = this;
        function animate() {
            if (self.currentEnemy) {
                var enemyImage = document.querySelector('.enemy-image');
                if (enemyImage && Math.random() < 0.1) {
                    enemyImage.style.animation = 'none';
                    enemyImage.offsetHeight;
                    enemyImage.style.animation = 'enemyFloat 3s ease-in-out infinite';
                }
            }
            self.enemyAnimationFrame = requestAnimationFrame(animate);
        }
        this.enemyAnimationFrame = requestAnimationFrame(animate);
    }
    
    startAutoAttack() {
        if (this.autoAttackInterval) clearInterval(this.autoAttackInterval);
        var self = this;
        this.autoAttackInterval = setInterval(function() {
            if (self.pokemonManager.team.length === self.pokemonManager.maxTeamSize) {
                self.performAutoAttack();
            }
        }, CONFIG.AUTO_ATTACK_INTERVAL);
    }
    
    performAutoAttack() {
        if (!this.currentEnemy || this.pokemonManager.team.length === 0) return;
        var totalDamage = this.pokemonManager.getTeamDamage();
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - totalDamage);
        
        var enemyCard = document.querySelector('.enemy-card');
        if (enemyCard) {
            var rect = enemyCard.getBoundingClientRect();
            if (this.game.animationManager) {
                this.game.animationManager.createDamageEffect(
                    Math.floor(totalDamage),
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    totalDamage > 50
                );
            }
            enemyCard.classList.add('enemy-damage-effect');
            setTimeout(function() {
                enemyCard.classList.remove('enemy-damage-effect');
            }, 300);
        }
        
        if (this.currentEnemy.hp <= 0) {
            this.handleVictory();
        }
        this.updateUI();
    }
    
    attackEnemy(totalDamage) {
        if (!this.currentEnemy) return { damage: 0 };
        var damage = this.pokemonManager.useEnergy();
        if (damage <= 0) return { damage: 0 };
        
        this.currentEnemy.hp = Math.max(0, this.currentEnemy.hp - damage);
        
        var result = { damage: damage, defeated: false };
        if (this.currentEnemy.hp <= 0) {
            result = this.handleVictory(result);
        }
        this.updateUI();
        return result;
    }
    
    handleVictory(result) {
        result = result || {};
        var reward = Math.floor(this.currentEnemy.level * CONFIG.REWARD_MULTIPLIER);
        result.defeated = true;
        result.reward = reward;
        result.enemy = {
            name: this.currentEnemy.name,
            rarity: this.currentEnemy.rarity,
            types: this.currentEnemy.types.slice(),
            level: this.currentEnemy.level
        };
        
        if (this.game.locationSystem) {
            this.game.locationSystem.updateQuestProgress('defeat_enemies', 1);
            this.game.locationSystem.updateQuestProgress('collect_money', reward);
        }
        
        this.createNewEnemy();
        return result;
    }
    
    async updateUI() {
        if (!this.currentEnemy) return;
        
        var nameEl = document.getElementById('enemy-name');
        var levelEl = document.getElementById('enemy-level');
        var hpBar = document.getElementById('enemy-hp-bar');
        var hpText = document.getElementById('enemy-hp-text');
        var rarityIcon = document.getElementById('enemy-rarity-icon');
        var rarityTooltip = document.getElementById('enemy-rarity-tooltip');
        var typeIcons = document.getElementById('enemy-type-icons');
        var imageEl = document.getElementById('enemy-image');
        
        if (nameEl) nameEl.textContent = this.currentEnemy.name;
        if (levelEl) levelEl.textContent = this.currentEnemy.level;
        
        if (rarityIcon) {
            var rarity = CONFIG.RARITIES[this.currentEnemy.rarity];
            if (rarity) {
                rarityIcon.style.borderColor = rarity.color;
                rarityIcon.style.color = rarity.color;
            }
            rarityIcon.textContent = this.getRarityIcon(this.currentEnemy.rarity);
            if (rarityTooltip) {
                rarityTooltip.textContent = rarity ? rarity.name : this.currentEnemy.rarity;
                if (rarity) {
                    rarityTooltip.style.borderColor = rarity.color;
                    rarityTooltip.style.color = rarity.color;
                }
            }
        }
        
        // Обновление иконок типов врага
        if (typeIcons && this.currentEnemy.types) {
            typeIcons.innerHTML = '';
            for (const type of this.currentEnemy.types) {
                try {
                    const icon = await TypeIconHelper.createLoadedTypeIcon(
                        type,
                        this.game.imageManager,
                        'lg'
                    );
                    typeIcons.appendChild(icon);
                } catch (e) {
                    // Запасной вариант
                    const span = document.createElement('span');
                    span.className = 'type-badge-fallback';
                    span.textContent = type;
                    span.style.cssText = `
                        padding: 4px 12px;
                        border-radius: 100px;
                        background: rgba(255,255,255,0.1);
                        color: var(--text-secondary);
                        font-size: 0.8rem;
                    `;
                    typeIcons.appendChild(span);
                }
            }
        }
        
        if (hpBar) {
            var percent = (this.currentEnemy.hp / this.currentEnemy.maxHp) * 100;
            hpBar.style.width = percent + '%';
        }
        if (hpText) {
            hpText.textContent = Math.floor(this.currentEnemy.hp) + '/' + this.currentEnemy.maxHp;
        }
        
        if (imageEl && this.imageManager) {
            var self = this;
            this.imageManager.getEnemyImage(this.currentEnemy.imageKey).then(function(img) {
                imageEl.src = img.src;
            }).catch(function() {
                // Игнорируем ошибки
            });
        }

        
    }
    
    async getTypeIconHTML(type, size = 'md') {
        const container = TypeIconHelper.createTypeIconElement(type, size);
        await TypeIconHelper.loadTypeIcon(container, type, this.game.imageManager);
        return container.outerHTML;
    }
    
    getRarityIcon(rarity) {
        var icons = {
            COMMON: '⬤', UNCOMMON: '🔹', RARE: '🔷',
            EPIC: '💜', SPECIAL: '✨', LEGENDARY: '⭐'
        };
        return icons[rarity] || '⬤';
    }
    
    loadEnemy(data) {
        if (data) {
            this.currentEnemy = data;
        }
    }
    
    cleanup() {
        if (this.enemyAnimationFrame) cancelAnimationFrame(this.enemyAnimationFrame);
        if (this.autoAttackInterval) clearInterval(this.autoAttackInterval);
    }
}

window.BattleSystem = BattleSystem;