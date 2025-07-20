/**
 * State Management Module
 * Handles all application state and data operations
 */
class StateManager {
    constructor() {
        this.totalCreditsGoal = 200;
        this.displayedModules = [];
        this.moduleRegistry = new Map();
        this.semesters = {};
        this.showingAllModules = false;
    }

    registerModule(module) {
        this.moduleRegistry.set(module.id, { ...module });
    }

    updateModule(id, updates) {
        if (this.moduleRegistry.has(id)) {
            const existing = this.moduleRegistry.get(id);
            this.moduleRegistry.set(id, { ...existing, ...updates });
        }
    }

    getModule(id) {
        return this.moduleRegistry.get(id);
    }

    removeModule(id) {
        return this.moduleRegistry.delete(id);
    }

    getAllModules() {
        return Array.from(this.moduleRegistry.values());
    }

    saveState() {
        const state = {
            totalCreditsGoal: this.totalCreditsGoal,
            numSemesters: Object.keys(this.semesters).length,
            modules: this.displayedModules,
            semesters: this.semesters,
            moduleRegistry: Array.from(this.moduleRegistry.entries())
        };
        Utils.storage.set('semesterPlannerState', state);
    }

    loadState() {
        const state = Utils.storage.get('semesterPlannerState');
        if (state) {
            this.totalCreditsGoal = state.totalCreditsGoal || 200;
            this.displayedModules = state.modules || [];
            
            if (state.moduleRegistry) {
                this.moduleRegistry = new Map(state.moduleRegistry);
            } else {
                this.moduleRegistry = new Map();
                this.displayedModules.forEach(module => this.registerModule(module));
            }
            
            return state;
        }
        return null;
    }

    resetState() {
        Utils.storage.remove('semesterPlannerState');
        this.totalCreditsGoal = 200;
        this.displayedModules = [];
        this.moduleRegistry = new Map();
        this.semesters = {};
        this.showingAllModules = false;
    }

    validateModuleSpan(semesterSpan) {
        const currentSemesters = Object.keys(this.semesters).length;
        return !(semesterSpan > currentSemesters && currentSemesters > 0);
    }
}

window.StateManager = StateManager;
