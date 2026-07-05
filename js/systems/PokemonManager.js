/**
 * Менеджер покемонов
 * @module PokemonManager
 */

 class PokemonManager {
    constructor(config) {
        this.config = config;
        this.collection = [];
        this.team = [];
        this.maxTeamSize = config.MAX_TEAM_SIZE;
        this.mergeCallbacks = [];
    }
    
    onMerge(callback) {
        this.mergeCallbacks.push(callback);
    }
    
    addToCollection(pokemonId) {
        const pokemonData = this.config.POKEMON_DATA[pokemonId];
        if (!pokemonData) return null;
        
        const existingPokemon = this.collection.find(function(p) { return p.id === pokemonId; });
        if (existingPokemon) {
            return this.mergePokemon(existingPokemon);
        }
        
        const newPokemon = this.createPokemon(pokemonId, pokemonData);
        this.collection.push(newPokemon);
        return newPokemon;
    }
    
    createPokemon(pokemonId, data) {
        const rarityMultiplier = this.config.RARITIES[data.rarity] ? this.config.RARITIES[data.rarity].damageMultiplier : 1;
        return {
            id: pokemonId,
            name: data.name,
            types: data.types.slice(),
            rarity: data.rarity,
            baseDamage: data.baseDamage,
            level: 1,
            currentDamage: data.baseDamage * rarityMultiplier,
            energy: this.config.MAX_ENERGY,
            maxEnergy: this.config.MAX_ENERGY,
            isInTeam: false,
            imageKey: data.imageKey,
            mergeCount: 0
        };
    }
    
    mergePokemon(existingPokemon) {
        const oldLevel = existingPokemon.level;
        const oldDamage = existingPokemon.currentDamage;
        
        existingPokemon.level++;
        existingPokemon.mergeCount++;
        
        const rarityMultiplier = this.config.RARITIES[existingPokemon.rarity] ? this.config.RARITIES[existingPokemon.rarity].damageMultiplier : 1;
        const levelBonus = Math.log2(existingPokemon.level + 1) * 0.3;
        existingPokemon.currentDamage = Math.floor(
            existingPokemon.baseDamage * rarityMultiplier * (1 + levelBonus)
        );
        
        existingPokemon.maxEnergy = Math.floor(
            this.config.MAX_ENERGY * (1 + Math.log2(existingPokemon.level) * 0.1)
        );
        existingPokemon.energy = existingPokemon.maxEnergy;
        
        this.mergeCallbacks.forEach(function(callback) {
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
        if (!pokemon) return { success: false, message: 'Покемон не найден' };
        if (pokemon.isInTeam) return { success: false, message: 'Покемон уже в команде' };
        if (this.team.length >= this.maxTeamSize) {
            return { success: false, message: 'Команда заполнена' };
        }
        if (pokemon.energy <= 0) return { success: false, message: 'У покемона нет энергии' };
        
        pokemon.isInTeam = true;
        this.team.push(pokemon);
        return { success: true, pokemon: pokemon };
    }
    
    removeFromTeam(pokemonId) {
        var index = -1;
        for (var i = 0; i < this.team.length; i++) {
            if (this.team[i].id === pokemonId) {
                index = i;
                break;
            }
        }
        if (index === -1) return false;
        var pokemon = this.team[index];
        pokemon.isInTeam = false;
        this.team.splice(index, 1);
        return true;
    }
    
    getPokemonById(pokemonId) {
        for (var i = 0; i < this.collection.length; i++) {
            if (this.collection[i].id === pokemonId) {
                return this.collection[i];
            }
        }
        return null;
    }
    
    getTeamDamage() {
        var total = 0;
        for (var i = 0; i < this.team.length; i++) {
            total += this.team[i].currentDamage;
        }
        return Math.floor(total);
    }
    
    restoreEnergy() {
        for (var i = 0; i < this.collection.length; i++) {
            var pokemon = this.collection[i];
            if (!pokemon.isInTeam && pokemon.energy < pokemon.maxEnergy) {
                pokemon.energy = Math.min(
                    pokemon.maxEnergy,
                    pokemon.energy + this.config.ENERGY_RESTORE_PER_SECOND
                );
            }
        }
    }
    
    useEnergy() {
        var totalDamage = 0;
        var teamCopy = this.team.slice();
        for (var i = 0; i < teamCopy.length; i++) {
            var pokemon = teamCopy[i];
            if (pokemon.energy > 0) {
                pokemon.energy = Math.max(0, pokemon.energy - this.config.ENERGY_DECAY_PER_ATTACK);
                totalDamage += pokemon.currentDamage;
            }
        }
        
        var newTeam = [];
        for (var j = 0; j < this.team.length; j++) {
            var p = this.team[j];
            if (p.energy > 0) {
                newTeam.push(p);
            } else {
                p.isInTeam = false;
            }
        }
        this.team = newTeam;
        
        return Math.floor(totalDamage);
    }
    
    loadData(collection, team) {
        this.collection = collection || [];
        this.team = team || [];
        for (var i = 0; i < this.team.length; i++) {
            this.team[i].isInTeam = true;
        }
    }
    
    setMaxTeamSize(size) {
        this.maxTeamSize = size;
    }
}

window.PokemonManager = PokemonManager;