/**
 * Менеджер сохранений
 * @module SaveManager
 */

 class SaveManager {
    constructor(saveKey) {
        this.saveKey = saveKey;
    }
    
    load() {
        const saved = localStorage.getItem(this.saveKey);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                // Ошибка загрузки сохранения
            }
        }
        return null;
    }
    
    save(data) {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }
    
    clear() {
        localStorage.removeItem(this.saveKey);
    }
}

window.SaveManager = SaveManager;