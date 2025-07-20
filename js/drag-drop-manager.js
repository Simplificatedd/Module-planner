/**
 * Drag and Drop Manager
 * Handles all sortable functionality and drag-and-drop logic
 */
class DragDropManager {
    constructor(stateManager, uiManager) {
        this.state = stateManager;
        this.ui = uiManager;
    }

    initSortable() {
        this.initModuleBank();
        this.initSemesterColumns();
        this.initTrashZone();
    }

    initModuleBank() {
        new Sortable(this.ui.elements.moduleBank, {
            group: { name: 'courses', pull: 'clone', put: false },
            animation: 150,
            sort: false,
        });
    }

    initSemesterColumns() {
        document.querySelectorAll('.semester-courses').forEach((semesterColumn) => {
            new Sortable(semesterColumn, {
                group: 'courses',
                animation: 150,
                onStart: (evt) => this.handleDragStart(evt),
                onAdd: (evt) => this.handleModuleAdd(evt),
                onRemove: (evt) => this.handleModuleRemove(evt),
                onUpdate: () => this.updateTotalCredits(),
            });
        });
    }

    initTrashZone() {
        const trashZone = document.getElementById('trash-zone');
        if (trashZone) {
            new Sortable(trashZone, {
                group: 'courses',
                animation: 150,
                onAdd: (evt) => this.handleTrashDrop(evt),
            });
        }
    }

    handleDragStart(evt) {
        const courseEl = evt.item;
        const moduleId = courseEl.dataset.id;
        const registryModule = this.state.getModule(moduleId);
        
        if (registryModule) {
            evt.item._moduleData = { ...registryModule };
        } else {
            const semesterSpan = parseInt(courseEl.dataset.semesterSpan);
            evt.item._moduleData = {
                id: courseEl.dataset.id,
                name: courseEl.dataset.name,
                value: parseFloat(courseEl.dataset.value),
                semesterSpan: isNaN(semesterSpan) ? 1 : semesterSpan
            };
            this.state.registerModule(evt.item._moduleData);
        }
    }

    handleModuleAdd(evt) {
        const courseEl = evt.item;
        
        if (evt.item._moduleData) {
            courseEl.dataset.id = evt.item._moduleData.id;
            courseEl.dataset.name = evt.item._moduleData.name;
            courseEl.dataset.value = evt.item._moduleData.value;
            courseEl.dataset.semesterSpan = evt.item._moduleData.semesterSpan;
            this.state.updateModule(evt.item._moduleData.id, evt.item._moduleData);
        }
        
        const semesterSpan = parseInt(courseEl.dataset.semesterSpan);
        const targetSemesterIndex = parseInt(evt.to.id.split('-')[2]);
        
        if (evt.from !== this.ui.elements.moduleBank && evt.from !== evt.to) {
            const courseId = courseEl.dataset.id;
            this.removePlaceholders(courseId);
        }
        
        if (evt.from === this.ui.elements.moduleBank) {
            this.removeFromModuleBank(courseEl.dataset.id);
        }
        
        if (!this.state.showingAllModules && evt.from === this.ui.elements.moduleBank) {
            setTimeout(() => this.showAvailableModules(), 100);
        }
        
        if (semesterSpan > 1) {
            this.createPlaceholders(courseEl, targetSemesterIndex, semesterSpan);
        }
        
        delete evt.item._moduleData;
        this.updateTotalCredits();
    }

    handleModuleRemove(evt) {
        const courseId = evt.item.dataset.id;
        this.removePlaceholders(courseId);
        
        if (evt.to === this.ui.elements.moduleBank && this.state.getModule(courseId)) {
            const module = this.state.getModule(courseId);
            if (!this.state.displayedModules.find(m => m.id === courseId)) {
                if (this.state.showingAllModules) {
                    this.state.displayedModules.push(module);
                }
            }
        }
        
        this.updateTotalCredits();
    }

    handleTrashDrop(evt) {
        const courseEl = evt.item;
        const courseId = courseEl.dataset.id;
        
        this.removePlaceholders(courseId);
        this.removeAllInstancesOfModule(courseId);
        this.removeFromModuleBank(courseId);
        this.state.removeModule(courseId);
        
        if (courseEl.parentNode) {
            courseEl.remove();
        }
        this.updateTotalCredits();
    }

    createPlaceholders(courseEl, targetSemesterIndex, semesterSpan) {
        const totalSemesters = document.querySelectorAll('.semester-courses').length;
        let spanDirection = 'forward';
        let startIndex = targetSemesterIndex;
        let endIndex = targetSemesterIndex + semesterSpan - 1;
        
        if (endIndex >= totalSemesters) {
            startIndex = targetSemesterIndex - semesterSpan + 1;
            endIndex = targetSemesterIndex;
            
            if (startIndex < 0) {
                courseEl.remove();
                alert(`This module requires ${semesterSpan} semesters but there isn't enough space from this position.`);
                return;
            }
            spanDirection = 'backward';
        }
        
        if (spanDirection === 'forward') {
            for (let i = 1; i < semesterSpan; i++) {
                const nextSemesterEl = document.getElementById(`sem-courses-${targetSemesterIndex + i}`);
                if (nextSemesterEl) {
                    const placeholder = this.ui.createPlaceholderElement(courseEl);
                    nextSemesterEl.appendChild(placeholder);
                }
            }
        } else {
            for (let i = 1; i < semesterSpan; i++) {
                const prevSemesterEl = document.getElementById(`sem-courses-${targetSemesterIndex - i}`);
                if (prevSemesterEl) {
                    const placeholder = this.ui.createPlaceholderElement(courseEl);
                    prevSemesterEl.appendChild(placeholder);
                }
            }
        }
    }

    removePlaceholders(courseId) {
        document.querySelectorAll(`.course-placeholder[data-parent-id="${courseId}"]`).forEach(placeholder => {
            placeholder.remove();
        });
    }

    removeFromModuleBank(moduleId) {
        const moduleIndex = this.state.displayedModules.findIndex(module => module.id === moduleId);
        if (moduleIndex !== -1) {
            this.state.displayedModules.splice(moduleIndex, 1);
            this.ui.renderModules();
        }
    }

    removeAllInstancesOfModule(courseId) {
        document.querySelectorAll(`.course-unit[data-id="${courseId}"]`).forEach(courseInstance => {
            this.removePlaceholders(courseId);
            courseInstance.remove();
        });
    }

    updateTotalCredits() {
        let currentTotal = 0;
        this.state.semesters = {};
        
        document.querySelectorAll('.semester-column').forEach((col, index) => {
            let semesterTotal = 0;
            const semesterCourses = [];
            
            col.querySelectorAll('.course-unit').forEach(courseEl => {
                const moduleData = this.getOrCreateModuleData(courseEl);
                const value = parseFloat(moduleData.value);
                
                if (!isNaN(value)) {
                    semesterTotal += value;
                    semesterCourses.push({
                        id: moduleData.id,
                        name: moduleData.name,
                        value: value,
                        semesterSpan: moduleData.semesterSpan
                    });
                }
            });
            
            this.ui.updateSemesterTotal(index, semesterTotal);
            currentTotal += semesterTotal;
            this.state.semesters[index] = semesterCourses;
        });

        this.ui.updateProgressBar(currentTotal);
        this.state.saveState();
    }

    getOrCreateModuleData(courseEl) {
        const moduleId = courseEl.dataset.id;
        const registryModule = this.state.getModule(moduleId);
        
        if (registryModule) {
            courseEl.dataset.name = registryModule.name;
            courseEl.dataset.value = registryModule.value;
            courseEl.dataset.semesterSpan = registryModule.semesterSpan;
            return registryModule;
        } else {
            const moduleData = {
                id: courseEl.dataset.id,
                name: courseEl.dataset.name,
                value: parseFloat(courseEl.dataset.value),
                semesterSpan: parseInt(courseEl.dataset.semesterSpan)
            };
            this.state.registerModule(moduleData);
            return moduleData;
        }
    }

    showAvailableModules() {
        const placedModuleIds = new Set();
        document.querySelectorAll('.semester-courses .course-unit').forEach(courseEl => {
            placedModuleIds.add(courseEl.dataset.id);
        });
        
        this.state.displayedModules = this.state.getAllModules().filter(module => !placedModuleIds.has(module.id));
        this.state.showingAllModules = false;
        this.ui.elements.toggleModuleViewBtn.textContent = 'Show All';
        this.ui.renderModules();
        this.initSortable();
    }

    showAllModules() {
        this.state.displayedModules = [...this.state.getAllModules()];
        this.state.showingAllModules = true;
        this.ui.elements.toggleModuleViewBtn.textContent = 'Show Available';
        this.ui.renderModules();
        this.initSortable();
    }
}

window.DragDropManager = DragDropManager;
