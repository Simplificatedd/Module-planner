/**
 * UI Manager Module
 * Handles all DOM manipulation and rendering
 */
class UIManager {
    constructor(stateManager) {
        this.state = stateManager;
        this.semesterManager = null; // Will be set later
        this.elements = this.initializeElements();
    }

    setSemesterManager(semesterManager) {
        this.semesterManager = semesterManager;
    }

    initializeElements() {
        return {
            setupSection: document.getElementById('setup-section'),
            plannerSection: document.getElementById('planner-section'),
            startPlanningBtn: document.getElementById('start-planning-btn'),
            resetPlanBtn: document.getElementById('reset-plan-btn'),
            totalCreditsInput: document.getElementById('total-credits'),
            numSemestersInput: document.getElementById('num-semesters'),
            addModuleBtn: document.getElementById('add-unit-btn'),
            moduleNameInput: document.getElementById('unit-name'),
            moduleValueInput: document.getElementById('unit-value'),
            moduleSpanInput: document.getElementById('unit-span'),
            moduleBank: document.getElementById('credit-units-bank'),
            semestersGrid: document.getElementById('semesters-grid'),
            toggleModuleViewBtn: document.getElementById('toggle-module-view'),
            progressBar: document.getElementById('progress-bar'),
            progressText: document.getElementById('progress-text')
        };
    }

    createModuleElement(module, showEditButton = false) {
        const registryModule = this.state.getModule(module.id);
        const moduleData = registryModule || module;
        
        const el = document.createElement('div');
        el.className = 'course-unit bg-white p-3 rounded-md shadow-sm border border-gray-200 flex justify-between items-center relative group';
        el.dataset.id = moduleData.id;
        el.dataset.name = moduleData.name;
        el.dataset.value = moduleData.value;
        el.dataset.semesterSpan = moduleData.semesterSpan;
        
        const semesterSpanText = moduleData.semesterSpan > 1 ? ` (${moduleData.semesterSpan} sem)` : '';
        const editButtonHtml = showEditButton ? 
            '<button class="edit-module-btn opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-gray-600 text-xs" title="Edit module">✏️</button>' : '';
        
        el.innerHTML = `
            <span class="font-medium text-sm">${moduleData.name}${semesterSpanText}</span>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-indigo-600">${moduleData.value}</span>
                ${editButtonHtml}
            </div>
        `;
        
        if (showEditButton) {
            const editBtn = el.querySelector('.edit-module-btn');
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showEditModal(moduleData.id);
            });
        }
        
        return el;
    }

    createPlaceholderElement(courseEl) {
        const placeholder = document.createElement('div');
        placeholder.className = 'course-placeholder bg-gray-300 p-3 rounded-md shadow-sm border border-gray-400 flex justify-between items-center opacity-75';
        placeholder.dataset.parentId = courseEl.dataset.id;
        placeholder.innerHTML = `
            <span class="font-medium text-sm text-gray-600">${courseEl.dataset.name} (continued)</span>
            <span class="font-bold text-sm text-gray-600">${courseEl.dataset.value}</span>
        `;
        return placeholder;
    }

    renderModules() {
        this.elements.moduleBank.innerHTML = '';
        this.state.displayedModules.forEach(module => {
            const showEditButton = this.state.showingAllModules;
            this.elements.moduleBank.appendChild(this.createModuleElement(module, showEditButton));
        });
        
        if (!document.getElementById('trash-zone')) {
            this.createTrashZone();
        }
    }

    createTrashZone() {
        const trashZone = document.createElement('div');
        trashZone.id = 'trash-zone';
        trashZone.className = 'mt-4 p-4 text-center border-2 border-dashed border-red-300 rounded-lg text-red-500 bg-red-50 hover:bg-red-100 transition-colors';
        trashZone.innerHTML = '🗑️ Drag here to delete module';
        this.elements.moduleBank.parentElement.appendChild(trashZone);
    }

    renderSemesters(num) {
        this.elements.semestersGrid.innerHTML = '';
        
        for (let i = 0; i < num; i++) {
            this.createSemesterColumn(i, num);
        }
        
        if (num > 0) {
            this.createAddSemesterButton();
        }
    }

    createSemesterColumn(index, totalSemesters) {
        const semesterEl = document.createElement('div');
        semesterEl.className = 'semester-column bg-gray-100 p-4 rounded-lg shadow-inner group';
        semesterEl.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-lg">Semester ${index + 1}</h3>
                <div class="flex items-center gap-2">
                    <span id="sem-total-${index}" class="font-bold text-gray-700">0 Credits</span>
                    ${totalSemesters > 1 ? `<button id="delete-sem-${index}" class="delete-semester-btn text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete semester">🗑️</button>` : ''}
                </div>
            </div>
            <div id="sem-courses-${index}" class="semester-courses space-y-2 min-h-[320px] max-h-[320px] overflow-y-auto"></div>
        `;
        this.elements.semestersGrid.appendChild(semesterEl);
        this.state.semesters[index] = [];
    }

    createAddSemesterButton() {
        const addSemesterEl = document.createElement('div');
        addSemesterEl.className = 'add-semester-column bg-gray-50 p-4 rounded-lg shadow-inner border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[400px]';
        addSemesterEl.innerHTML = `
            <button id="add-semester-btn" class="flex flex-col items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none">
                <div class="text-4xl font-bold">+</div>
                <div class="text-sm font-medium">Add Semester</div>
            </button>
        `;
        this.elements.semestersGrid.appendChild(addSemesterEl);
        
        // Set up the event listener immediately after creating the button
        const addSemesterBtn = document.getElementById('add-semester-btn');
        if (addSemesterBtn && this.semesterManager) {
            addSemesterBtn.addEventListener('click', () => {
                this.semesterManager.addSemester();
            });
        }
    }

    updateProgressBar(currentTotal) {
        this.elements.progressText.textContent = `${currentTotal.toFixed(1)} / ${parseFloat(this.state.totalCreditsGoal).toFixed(1)} Credits`;
        const percentage = this.state.totalCreditsGoal > 0 ? (currentTotal / this.state.totalCreditsGoal) * 100 : 0;
        this.elements.progressBar.style.width = `${Math.min(percentage, 100)}%`;

        this.elements.progressBar.classList.remove('bg-yellow-500', 'bg-green-500', 'bg-blue-500');
        
        if (percentage >= 100) {
            this.elements.progressBar.classList.add('bg-green-500');
        } else if (percentage > 75) {
            this.elements.progressBar.classList.add('bg-yellow-500');
        } else {
            this.elements.progressBar.classList.add('bg-blue-500');
        }
    }

    showError(message, duration) {
        Utils.showNotification(message, 'error', duration);
    }

    showEditModal(moduleId) {
        const module = this.state.getModule(moduleId);
        if (!module) return;
        
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
                <h3 class="text-lg font-semibold mb-4">Edit Module</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Module Name</label>
                        <input type="text" id="edit-name" value="${module.name}" class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Credit Value</label>
                        <input type="number" id="edit-value" value="${module.value}" step="0.1" min="0" class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Semester Span</label>
                        <input type="number" id="edit-span" value="${module.semesterSpan}" min="1" class="mt-1 block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1">
                    </div>
                </div>
                <div class="flex justify-end gap-2 mt-6">
                    <button id="cancel-edit" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Cancel</button>
                    <button id="save-edit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Save</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.querySelector('#edit-name').focus();
        
        return modal;
    }

    switchToPlanner() {
        this.elements.setupSection.classList.add('hidden');
        this.elements.plannerSection.classList.remove('hidden');
    }

    updateSemesterTotal(index, total) {
        const totalEl = document.getElementById(`sem-total-${index}`);
        if (totalEl) {
            totalEl.textContent = `${total.toFixed(1)} Credits`;
        }
    }
}

window.UIManager = UIManager;
