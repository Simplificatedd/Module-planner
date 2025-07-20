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
        
        this.setupSemesterEventListeners(newSemesterIndex);
        this.setupSemesterSortable(newSemesterIndex);
        
        this.state.saveState();
    }

    createSemesterElement(index) {
        const semesterEl = document.createElement('div');
        semesterEl.className = 'semester-column bg-gray-100 p-4 rounded-lg shadow-inner group';
        semesterEl.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <h3 class="font-semibold text-lg">Semester ${index + 1}</h3>
                <div class="flex items-center gap-2">
                    <span id="sem-total-${index}" class="font-bold text-gray-700">0 Credits</span>
                    <button id="delete-sem-${index}" class="delete-semester-btn text-red-400 hover:text-red-600 text-xs opacity-0 group-hover:opacity-100 transition-opacity" title="Delete semester">🗑️</button>
                </div>
            </div>
            <div id="sem-courses-${index}" class="semester-courses space-y-2 min-h-[320px] max-h-[320px] overflow-y-auto"></div>
        `;
        return semesterEl;
    }

    setupSemesterEventListeners(index) {
        const deleteBtn = document.getElementById(`delete-sem-${index}`);
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteSemester(index));
        }

        const addSemesterBtn = document.getElementById('add-semester-btn');
        if (addSemesterBtn) {
            addSemesterBtn.replaceWith(addSemesterBtn.cloneNode(true));
            document.getElementById('add-semester-btn').addEventListener('click', () => this.addSemester());
        }
    }

    setupSemesterSortable(index) {
        const newSemesterCourses = document.getElementById(`sem-courses-${index}`);
        new Sortable(newSemesterCourses, {
            group: 'courses',
            animation: 150,
            onStart: (evt) => this.dragDrop.handleDragStart(evt),
            onAdd: (evt) => this.dragDrop.handleModuleAdd(evt),
            onRemove: (evt) => this.dragDrop.handleModuleRemove(evt),
            onUpdate: () => this.dragDrop.updateTotalCredits(),
        });
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
        const hasModules = semesterCoursesEl.querySelectorAll('.course-unit').length > 0;
        const hasPlaceholders = semesterCoursesEl.querySelectorAll('.course-placeholder').length > 0;
        
        if (hasModules || hasPlaceholders) {
            alert('Cannot delete semester that contains modules or continued modules. Please move or remove all modules first.');
            return false;
        }
        
        const currentSemesters = Object.keys(this.state.semesters).length;
        if (currentSemesters <= 1) {
            alert('Cannot delete the last remaining semester.');
            return false;
        }

        return true;
    }

    removeSemesterElement(semesterIndex) {
        const semesterCoursesEl = document.getElementById(`sem-courses-${semesterIndex}`);
        const semesterColumn = semesterCoursesEl.closest('.semester-column');
        semesterColumn.remove();
    }

    reindexSemesters() {
        const newSemesters = {};
        const remainingSemesters = document.querySelectorAll('.semester-column');
        
        remainingSemesters.forEach((semesterEl, index) => {
            this.updateSemesterIndices(semesterEl, index);
            newSemesters[index] = this.extractSemesterCourses(semesterEl);
        });
        
        this.state.semesters = newSemesters;
        this.ui.elements.numSemestersInput.value = remainingSemesters.length;
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
            deleteBtn.id = `delete-sem-${newIndex}`;
            deleteBtn.replaceWith(deleteBtn.cloneNode(true));
            this.setupSemesterEventListeners(newIndex);
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
        for (let i = 0; i < numSemesters; i++) {
            if (numSemesters > 1) {
                this.setupSemesterEventListeners(i);
            }
        }

        const addSemesterBtn = document.getElementById('add-semester-btn');
        if (addSemesterBtn) {
            addSemesterBtn.addEventListener('click', () => this.addSemester());
        }
    }
}

window.SemesterManager = SemesterManager;
