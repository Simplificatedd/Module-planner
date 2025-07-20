/**
 * Main Application Controller
 * Orchestrates all modules and handles initialization
 */
class SemesterPlanner {
    constructor() {
        this.stateManager = new StateManager();
        this.uiManager = new UIManager(this.stateManager);
        this.dragDropManager = new DragDropManager(this.stateManager, this.uiManager);
        this.semesterManager = new SemesterManager(this.stateManager, this.uiManager, this.dragDropManager);
        this.eventHandler = new EventHandler(this.stateManager, this.uiManager, this.dragDropManager);
        
        this.init();
    }

    init() {
        this.loadSavedState();
        this.setupModuleEditHandling();
    }

    loadSavedState() {
        const savedState = this.stateManager.loadState();
        if (!savedState) return;

        this.uiManager.elements.totalCreditsInput.value = savedState.totalCreditsGoal;
        this.uiManager.elements.numSemestersInput.value = savedState.numSemesters;

        this.eventHandler.startPlanning();

        Object.keys(savedState.semesters).forEach(semesterIndex => {
            const container = document.getElementById(`sem-courses-${semesterIndex}`);
            if (!container) return;

            container.innerHTML = '';
            savedState.semesters[semesterIndex].forEach(course => {
                if (!this.stateManager.moduleRegistry.has(course.id)) {
                    this.stateManager.registerModule(course);
                }
                container.appendChild(this.uiManager.createModuleElement(course, false));
            });
        });
        
        this.dragDropManager.updateTotalCredits();
    }

    setupModuleEditHandling() {
        const originalShowEditModal = this.uiManager.showEditModal.bind(this.uiManager);
        this.uiManager.showEditModal = (moduleId) => {
            const modal = originalShowEditModal(moduleId);
            this.eventHandler.handleEditModule(moduleId, modal);
            return modal;
        };
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const requiredClasses = [StateManager, UIManager, DragDropManager, SemesterManager, EventHandler];
    const missingClasses = requiredClasses.filter(cls => typeof cls === 'undefined');
    
    if (missingClasses.length > 0) {
        console.error('Required modules not loaded. Please ensure all script files are included.');
        return;
    }

    new SemesterPlanner();
});
