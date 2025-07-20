/**
 * Event Handler Module
 * Manages all user interactions and event listeners
 */
class EventHandler {
    constructor(stateManager, uiManager, dragDropManager) {
        this.state = stateManager;
        this.ui = uiManager;
        this.dragDrop = dragDropManager;
        this.initEventListeners();
    }

    initEventListeners() {
        this.setupMainButtons();
        this.setupModuleControls();
        this.setupSemesterControls();
        this.setupGlobalEventListeners();
    }

    setupMainButtons() {
        this.ui.elements.startPlanningBtn.addEventListener('click', () => this.startPlanning());
        this.ui.elements.resetPlanBtn.addEventListener('click', () => this.resetPlan());
        this.ui.elements.toggleModuleViewBtn.addEventListener('click', () => this.toggleModuleView());
    }

    setupModuleControls() {
        this.ui.elements.addModuleBtn.addEventListener('click', () => this.addModule());
    }

    setupSemesterControls() {
        // Dynamic event listeners for semester operations are handled by SemesterManager
    }

    setupGlobalEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    startPlanning() {
        const goal = parseFloat(this.ui.elements.totalCreditsInput.value);
        const numSemesters = parseInt(this.ui.elements.numSemestersInput.value, 10);

        if (!isNaN(goal) && goal > 0 && !isNaN(numSemesters) && numSemesters > 0) {
            this.state.totalCreditsGoal = goal;
            this.ui.switchToPlanner();
            this.ui.renderSemesters(numSemesters);
            this.ui.renderModules();
            this.dragDrop.initSortable();
            this.dragDrop.updateTotalCredits();
            this.state.saveState();
        } else {
            alert("Please enter valid, positive numbers for credits and semesters.");
        }
    }

    addModule() {
        const name = this.ui.elements.moduleNameInput.value.trim();
        const value = parseFloat(this.ui.elements.moduleValueInput.value);
        const semesterSpan = parseInt(this.ui.elements.moduleSpanInput.value, 10);

        if (name && !isNaN(value) && value > 0) {
            if (!this.state.validateModuleSpan(semesterSpan)) {
                const currentSemesters = Object.keys(this.state.semesters).length;
                this.ui.showError(`Module semester span (${semesterSpan}) cannot be longer than available semesters (${currentSemesters}).`, 4000);
                return;
            }
            
            const newModule = { id: Utils.generateId(), name, value, semesterSpan };
            this.state.registerModule(newModule);
            this.state.displayedModules.push(newModule);
            
            this.ui.renderModules();
            this.dragDrop.initSortable();
            
            this.clearModuleInputs();
            this.state.saveState();
        } else {
            this.ui.showError("Please enter a valid name and positive credit value.", 3000);
        }
    }

    clearModuleInputs() {
        this.ui.elements.moduleNameInput.value = '';
        this.ui.elements.moduleValueInput.value = '';
        this.ui.elements.moduleSpanInput.value = 1;
    }

    toggleModuleView() {
        if (this.state.showingAllModules) {
            this.dragDrop.showAvailableModules();
        } else {
            this.dragDrop.showAllModules();
        }
    }

    resetPlan() {
        if (confirm("Are you sure you want to reset your entire plan? This cannot be undone.")) {
            this.state.resetState();
            window.location.reload();
        }
    }

    handleEditModule(moduleId, modal) {
        modal.querySelector('#save-edit').addEventListener('click', () => {
            const newName = modal.querySelector('#edit-name').value.trim();
            const newValue = parseFloat(modal.querySelector('#edit-value').value);
            const newSpan = parseInt(modal.querySelector('#edit-span').value);
            
            if (newName && !isNaN(newValue) && newValue > 0) {
                if (!this.state.validateModuleSpan(newSpan)) {
                    const currentSemesters = Object.keys(this.state.semesters).length;
                    alert(`Module semester span (${newSpan}) cannot be longer than available semesters (${currentSemesters}).`);
                    return;
                }
                
                this.updateModuleEverywhere(moduleId, newName, newValue, newSpan);
                this.ui.renderModules();
                this.dragDrop.updateTotalCredits();
                modal.remove();
            } else {
                alert('Please enter valid values');
            }
        });

        modal.querySelector('#cancel-edit').addEventListener('click', () => modal.remove());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    updateModuleEverywhere(moduleId, newName, newValue, newSpan) {
        this.state.updateModule(moduleId, {
            name: newName,
            value: newValue,
            semesterSpan: newSpan
        });
        
        const moduleIndex = this.state.displayedModules.findIndex(m => m.id === moduleId);
        if (moduleIndex !== -1) {
            this.state.displayedModules[moduleIndex] = { 
                ...this.state.displayedModules[moduleIndex], 
                name: newName, 
                value: newValue, 
                semesterSpan: newSpan 
            };
        }
        
        // Update all DOM elements with this module ID
        document.querySelectorAll(`[data-id="${moduleId}"]`).forEach(element => {
            element.dataset.name = newName;
            element.dataset.value = newValue;
            element.dataset.semesterSpan = newSpan;
            
            const nameSpan = element.querySelector('span:first-child');
            const valueSpan = element.querySelector('span.text-indigo-600');
            if (nameSpan) {
                const spanText = newSpan > 1 ? ` (${newSpan} sem)` : '';
                nameSpan.textContent = `${newName}${spanText}`;
            }
            if (valueSpan) {
                valueSpan.textContent = newValue;
            }
        });
        
        // Update placeholders
        document.querySelectorAll(`.course-placeholder[data-parent-id="${moduleId}"]`).forEach(placeholder => {
            const nameSpan = placeholder.querySelector('span:first-child');
            const valueSpan = placeholder.querySelector('span:last-child');
            if (nameSpan && valueSpan) {
                nameSpan.textContent = `${newName} (continued)`;
                valueSpan.textContent = newValue;
            }
        });
    }

    closeModals() {
        document.querySelectorAll('.fixed.inset-0').forEach(modal => {
            modal.remove();
        });
    }

    setupEditModal(moduleId) {
        const modal = this.ui.showEditModal(moduleId);
        this.handleEditModule(moduleId, modal);
        return modal;
    }
}

window.EventHandler = EventHandler;
