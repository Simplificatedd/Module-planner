/**
 * Semester Manager Module
 * Handles semester-specific operations (add, delete, manage)
 */
class SemesterManager {
    constructor(stateManager, uiManager, dragDropManager) {
        this.state = stateManager;
        this.ui = uiManager;
        this.dragDrop = dragDropManager;
    }

    addSemester() {
        const currentSemesters = Object.keys(this.state.semesters).length;
        const newSemesterIndex = currentSemesters;
        
        const semesterEl = this.createSemesterElement(newSemesterIndex);
        const addSemesterButton = document.querySelector('.add-semester-column');
        this.ui.elements.semestersGrid.insertBefore(semesterEl, addSemesterButton);
        
        this.state.semesters[newSemesterIndex] = [];
        this.ui.elements.numSemestersInput.value = newSemesterIndex + 1;
        
        // Update delete buttons for all semesters (including existing ones)
        this.updateAllDeleteButtons();
        
        // Setup event listeners and sortables for all semesters (including the new one)
        this.setupInitialSemesterListeners(newSemesterIndex + 1);
        
        this.state.saveState();
    }

    createSemesterElement(index) {
        const currentSemesters = Object.keys(this.state.semesters).length;
        const willHaveAfterAdd = currentSemesters + 1; // This semester will be added
        
        const semesterEl = document.createElement('div');
        semesterEl.className = 'semester-column bg-gray-100 p-4 rounded-lg shadow-inner group';
        semesterEl.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-lg">Semester ${index + 1}</h3>
                <div class="flex items-center gap-2">
                    <span id="sem-total-${index}" class="font-bold text-gray-700">0 Credits</span>
                    ${willHaveAfterAdd > 1 ? `<button id="delete-sem-${index}" class="delete-semester-btn text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete semester">🗑️</button>` : ''}
                </div>
            </div>
            <div id="sem-courses-${index}" class="semester-courses space-y-2 min-h-[320px] max-h-[320px] overflow-y-auto"></div>
        `;
        return semesterEl;
    }

    updateAllDeleteButtons() {
        const semesterElements = this.ui.elements.semestersGrid.querySelectorAll('.semester-column:not(.add-semester-column)');
        const totalSemesters = semesterElements.length;
        
        semesterElements.forEach((semesterEl, index) => {
            const headerDiv = semesterEl.querySelector('.flex.justify-between.items-center');
            const existingDeleteBtn = headerDiv.querySelector('.delete-semester-btn');
            
            if (totalSemesters > 1) {
                // Should have a delete button
                if (!existingDeleteBtn) {
                    // Add delete button
                    const deleteBtn = document.createElement('button');
                    deleteBtn.id = `delete-sem-${index}`;
                    deleteBtn.className = 'delete-semester-btn text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity';
                    deleteBtn.title = 'Delete semester';
                    deleteBtn.innerHTML = '🗑️';
                    headerDiv.querySelector('.flex.items-center.gap-2').appendChild(deleteBtn);
                }
            } else {
                // Should not have a delete button
                if (existingDeleteBtn) {
                    existingDeleteBtn.remove();
                }
            }
        });
    }

    setupSemesterEventListeners(index) {
        const deleteBtn = document.getElementById(`delete-sem-${index}`);
        if (deleteBtn) {
            // Remove any existing listeners by cloning the button
            const newBtn = deleteBtn.cloneNode(true);
            deleteBtn.parentNode.replaceChild(newBtn, deleteBtn);
            
            // Add the event listener to the new button
            newBtn.addEventListener('click', () => {
                // Use the current index directly instead of parsing from ID
                this.deleteSemester(index);
            });
        }
    }

    setupSemesterSortable(index) {
        const semesterCoursesEl = document.getElementById(`sem-courses-${index}`);
        if (semesterCoursesEl) {
            // Destroy existing Sortable instance if it exists
            if (semesterCoursesEl.sortableInstance) {
                semesterCoursesEl.sortableInstance.destroy();
            }
            
            // Create new Sortable instance
            semesterCoursesEl.sortableInstance = new Sortable(semesterCoursesEl, {
                group: 'courses',
                animation: 150,
                onStart: (evt) => this.dragDrop.handleDragStart(evt),
                onAdd: (evt) => this.dragDrop.handleModuleAdd(evt),
                onRemove: (evt) => this.dragDrop.handleModuleRemove(evt),
                onUpdate: () => this.dragDrop.updateTotalCredits(),
            });
        }
    }

    deleteSemester(semesterIndex) {
        if (!this.canDeleteSemester(semesterIndex)) {
            return;
        }

        if (!confirm(`Are you sure you want to delete Semester ${semesterIndex + 1}?`)) {
            return;
        }

        this.removeSemesterElement(semesterIndex);
        this.reindexSemesters();
        this.dragDrop.updateTotalCredits();
        this.state.saveState();
    }

    canDeleteSemester(semesterIndex) {
        const semesterCoursesEl = document.getElementById(`sem-courses-${semesterIndex}`);
        if (!semesterCoursesEl) {
            return false;
        }
        
        const hasModules = semesterCoursesEl.querySelectorAll('.course-unit').length > 0;
        const hasPlaceholders = semesterCoursesEl.querySelectorAll('.course-placeholder').length > 0;
        
        if (hasModules || hasPlaceholders) {
            Utils.showNotification('Cannot delete semester that contains modules or continued modules. Please move or remove all modules first.', 'warning', 4000);
            return false;
        }
        
        const currentSemesters = Object.keys(this.state.semesters).length;
        if (currentSemesters <= 1) {
            Utils.showNotification('Cannot delete the last remaining semester.', 'warning', 3000);
            return false;
        }

        return true;
    }

    removeSemesterElement(semesterIndex) {
        const semesterCoursesEl = document.getElementById(`sem-courses-${semesterIndex}`);
        
        if (semesterCoursesEl) {
            const semesterColumn = semesterCoursesEl.closest('.semester-column');
            if (semesterColumn) {
                semesterColumn.remove();
                
                // Also remove from state immediately to avoid conflicts
                delete this.state.semesters[semesterIndex];
            }
        }
    }

    reindexSemesters() {
        const newSemesters = {};
        
        // Get all semester columns and create a mapping of their current indices
        const semesterElements = [];
        const grid = this.ui.elements.semestersGrid;
        
        // Iterate through all children of the grid and collect only semester columns (not add-semester button)
        for (let child of grid.children) {
            if (child.classList.contains('semester-column') && !child.classList.contains('add-semester-column')) {
                semesterElements.push(child);
            }
        }
        
        // Clear the state before rebuilding
        this.state.semesters = {};
        
        // Now reindex them in the order they appear in the DOM
        semesterElements.forEach((semesterEl, newIndex) => {
            // Extract courses BEFORE updating indices to preserve data
            const courses = this.extractSemesterCourses(semesterEl);
            
            // Update the visual indices
            this.updateSemesterIndices(semesterEl, newIndex);
            
            // Store the courses with the new index
            newSemesters[newIndex] = courses;
            this.state.semesters[newIndex] = courses;
        });
        
        this.ui.elements.numSemestersInput.value = semesterElements.length;
        
        // Update delete buttons for all remaining semesters
        this.updateAllDeleteButtons();
        
        // Set up event listeners for all remaining semesters
        this.setupInitialSemesterListeners(semesterElements.length);
    }

    updateSemesterIndices(semesterEl, newIndex) {
        const titleEl = semesterEl.querySelector('h3');
        titleEl.textContent = `Semester ${newIndex + 1}`;
        
        const totalEl = semesterEl.querySelector('[id^="sem-total-"]');
        totalEl.id = `sem-total-${newIndex}`;
        
        const coursesEl = semesterEl.querySelector('[id^="sem-courses-"]');
        coursesEl.id = `sem-courses-${newIndex}`;
        
        const deleteBtn = semesterEl.querySelector('[id^="delete-sem-"]');
        if (deleteBtn) {
            const oldId = deleteBtn.id;
            deleteBtn.id = `delete-sem-${newIndex}`;
            
            // Always clone and replace the button to ensure fresh event listeners
            const newBtn = deleteBtn.cloneNode(true);
            deleteBtn.parentNode.replaceChild(newBtn, deleteBtn);
        }
    }

    extractSemesterCourses(semesterEl) {
        const courses = [];
        const coursesEl = semesterEl.querySelector('[id^="sem-courses-"]');
        
        coursesEl.querySelectorAll('.course-unit').forEach(courseEl => {
            const moduleId = courseEl.dataset.id;
            const registryModule = this.state.getModule(moduleId);
            if (registryModule) {
                courses.push({
                    id: registryModule.id,
                    name: registryModule.name,
                    value: registryModule.value,
                    semesterSpan: registryModule.semesterSpan
                });
            }
        });
        
        return courses;
    }

    setupInitialSemesterListeners(numSemesters) {
        // Set up delete button listeners and sortables for all semesters
        for (let i = 0; i < numSemesters; i++) {
            if (numSemesters > 1) {
                this.setupSemesterEventListeners(i);
            }
            this.setupSemesterSortable(i);
        }
    }
}

window.SemesterManager = SemesterManager;
