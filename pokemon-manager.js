// ==============================
// МЕНЕДЖЕР ПОКЕМОНОВ С СИСТЕМОЙ СЛИЯНИЯ
// ==============================

class PokemonManager {
    constructor() {
        this.collection = [];
        this.team = [];
        this.maxTeamSize = GAME_CONFIG.MAX_TEAM_SIZE;
        this.mergeCallbacks = [];
    }
    
    onMerge(callback) {
        this.mergeCallbacks.push(callback);
    }
    
    addToCollection(pokemonId) {
        const pokemonData = GAME_CONFIG.POKEMON_DATA[pokemonId];
        if (!pokemonData) return null;
        
        // Проверяем, есть ли уже такой покемон в коллекции
        const existingPokemon = this.collection.find(p => p.id === pokemonId);
        
        if (existingPokemon) {
            // Сливаем покемонов
            return this.mergePokemon(existingPokemon);
        } else {
            // Создаем нового покемона
            const newPokemon = this.createPokemon(pokemonId, pokemonData);
            this.collection.push(newPokemon);
            return newPokemon;
        }
    }
    
    createPokemon(pokemonId, data) {
        const baseDamage = data.baseDamage * GAME_CONFIG.RARITIES[data.rarity].damageMultiplier;
        
        return {
            id: pokemonId,
            name: data.name,
            types: [...data.types],
            rarity: data.rarity,
            baseDamage: data.baseDamage,
            level: 1,
            currentDamage: baseDamage,
            energy: GAME_CONFIG.MAX_ENERGY,
            maxEnergy: GAME_CONFIG.MAX_ENERGY,
            isInTeam: false,
            imageKey: data.imageKey,
            mergeCount: 0,
            damageMultiplier: 1.0
        };
    }
    
    mergePokemon(existingPokemon) {
        // Сохраняем старые значения для анимации
        const oldLevel = existingPokemon.level;
        const oldDamage = existingPokemon.currentDamage;
        
        // Увеличиваем уровень
        existingPokemon.level++;
        existingPokemon.mergeCount++;
        
        // Расчет нового урона с уменьшающейся прибавкой
        const rarityMultiplier = GAME_CONFIG.RARITIES[existingPokemon.rarity].damageMultiplier;
        const levelBonus = Math.log2(existingPokemon.level + 1) * 0.3;
        const newDamage = Math.floor(existingPokemon.baseDamage * rarityMultiplier * (1 + levelBonus));
        
        existingPokemon.currentDamage = newDamage;
        
        // Увеличиваем максимальную энергию
        existingPokemon.maxEnergy = Math.floor(GAME_CONFIG.MAX_ENERGY * (1 + Math.log2(existingPokemon.level) * 0.1));
        
        // Восстанавливаем энергию при слиянии
        existingPokemon.energy = existingPokemon.maxEnergy;
        
        console.log(`🎉 Слияние покемона ${existingPokemon.name}: уровень ${oldLevel} -> ${existingPokemon.level}, урон ${Math.floor(oldDamage)} -> ${Math.floor(newDamage)}`);
        
        // Вызываем колбэки для анимации слияния
        this.mergeCallbacks.forEach(callback => {
            callback({
                pokemon: existingPokemon,
                oldLevel: oldLevel,
                newLevel: existingPokemon.level,
                oldDamage: oldDamage,
                newDamage: existingPokemon.currentDamage,
                mergeCount: existingPokemon.mergeCount
            });
        });
        
        return existingPokemon;
    }
    
    addToTeam(pokemonId) {
        const pokemon = this.getPokemonById(pokemonId);
        
        if (!pokemon) {
            return { success: false, message: 'Покемон не найден' };
        }
        
        if (pokemon.isInTeam) {
            return { success: false, message: 'Покемон уже в команде' };
        }
        
        if (this.team.length >= this.maxTeamSize) {
            return { success: false, message: 'Команда заполнена' };
        }
        
        if (pokemon.energy <= 0) {
            return { success: false, message: 'У покемона нет энергии' };
        }
        
        pokemon.isInTeam = true;
        this.team.push(pokemon);
        
        return { success: true, pokemon };
    }
    
    removeFromTeam(pokemonId) {
        const index = this.team.findIndex(p => p.id === pokemonId);
        
        if (index === -1) return false;
        
        const pokemon = this.team[index];
        pokemon.isInTeam = false;
        this.team.splice(index, 1);
        
        return true;
    }
    
    getPokemonById(pokemonId) {
        return this.collection.find(p => p.id === pokemonId);
    }
    
    getTeamDamage() {
        return Math.floor(this.team.reduce((sum, pokemon) => sum + pokemon.currentDamage, 0));
    }
    
    restoreEnergy() {
        this.collection.forEach(pokemon => {
            if (!pokemon.isInTeam && pokemon.energy < pokemon.maxEnergy) {
                pokemon.energy = Math.min(
                    pokemon.maxEnergy,
                    pokemon.energy + GAME_CONFIG.ENERGY_RESTORE_PER_SECOND
                );
            }
        });
    }
    
    useEnergy() {
        let totalDamage = 0;
        
        this.team.forEach(pokemon => {
            if (pokemon.energy > 0) {
                pokemon.energy = Math.max(0, pokemon.energy - GAME_CONFIG.ENERGY_DECAY_PER_ATTACK);
                totalDamage += pokemon.currentDamage;
            }
        });
        
        // Убираем из команды покемонов без энергии
        this.team = this.team.filter(pokemon => {
            if (pokemon.energy <= 0) {
                pokemon.isInTeam = false;
                return false;
            }
            return true;
        });
        
        return Math.floor(totalDamage);
    }
    
    getDisplayDamage(pokemon) {
        return Math.floor(pokemon.currentDamage);
    }
    
    getDisplayEnergy(pokemon) {
        return Math.floor(pokemon.energy);
    }
}

window.PokemonManager = PokemonManager;