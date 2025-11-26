// Workout Tracker Tool
class WorkoutTracker {
    constructor() {
        this.workouts = this.loadWorkouts();
        this.currentWorkout = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupUI();
        this.renderWorkouts();
    }

    bindEvents() {
        const startWorkoutBtn = document.getElementById('startWorkout');
        const endWorkoutBtn = document.getElementById('endWorkout');
        const addExerciseBtn = document.getElementById('addExercise');
        const saveWorkoutBtn = document.getElementById('saveWorkout');
        const clearWorkoutBtn = document.getElementById('clearWorkout');

        if (startWorkoutBtn) {
            startWorkoutBtn.addEventListener('click', () => this.startWorkout());
        }
        if (endWorkoutBtn) {
            endWorkoutBtn.addEventListener('click', () => this.endWorkout());
        }
        if (addExerciseBtn) {
            addExerciseBtn.addEventListener('click', () => this.addExercise());
        }
        if (saveWorkoutBtn) {
            saveWorkoutBtn.addEventListener('click', () => this.saveWorkout());
        }
        if (clearWorkoutBtn) {
            clearWorkoutBtn.addEventListener('click', () => this.clearWorkout());
        }
    }

    setupUI() {
        const style = document.createElement('style');
        style.textContent = `
            .workout-section {
                background: var(--bg-secondary);
                border-radius: 0.5rem;
                padding: 1.5rem;
                margin: 1.5rem 0;
            }
            
            .exercise-item {
                background: var(--bg-primary);
                border: 1px solid var(--border-color);
                border-radius: 0.5rem;
                padding: 1rem;
                margin: 0.5rem 0;
            }
            
            .exercise-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }
            
            .set-item {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr auto;
                gap: 0.5rem;
                margin: 0.5rem 0;
                align-items: center;
            }
        `;
        document.head.appendChild(style);
    }

    startWorkout() {
        this.currentWorkout = {
            id: Date.now(),
            date: new Date().toISOString(),
            exercises: [],
            startTime: Date.now(),
            endTime: null
        };
        this.updateWorkoutUI();
        this.showNotification('Workout started!', 'success');
    }

    endWorkout() {
        if (!this.currentWorkout) return;
        
        this.currentWorkout.endTime = Date.now();
        const duration = Math.round((this.currentWorkout.endTime - this.currentWorkout.startTime) / 1000 / 60);
        this.currentWorkout.duration = duration;
        
        this.updateWorkoutUI();
        this.showNotification(`Workout ended! Duration: ${duration} minutes`, 'success');
    }

    addExercise() {
        if (!this.currentWorkout) {
            this.showNotification('Please start a workout first', 'error');
            return;
        }

        const exerciseName = prompt('Enter exercise name:');
        if (!exerciseName) return;

        const exercise = {
            id: Date.now(),
            name: exerciseName,
            sets: []
        };

        this.currentWorkout.exercises.push(exercise);
        this.updateWorkoutUI();
    }

    addSet(exerciseId) {
        const exercise = this.currentWorkout.exercises.find(e => e.id === exerciseId);
        if (!exercise) return;

        const weight = parseFloat(prompt('Enter weight (kg):') || 0);
        const reps = parseInt(prompt('Enter reps:') || 0);
        const rest = parseInt(prompt('Enter rest time (seconds):') || 60);

        exercise.sets.push({
            id: Date.now(),
            weight: weight,
            reps: reps,
            rest: rest
        });

        this.updateWorkoutUI();
    }

    saveWorkout() {
        if (!this.currentWorkout || this.currentWorkout.exercises.length === 0) {
            this.showNotification('No workout to save', 'error');
            return;
        }

        this.workouts.unshift(this.currentWorkout);
        this.saveWorkouts();
        this.currentWorkout = null;
        this.updateWorkoutUI();
        this.renderWorkouts();
        this.showNotification('Workout saved!', 'success');
    }

    clearWorkout() {
        if (confirm('Are you sure you want to clear the current workout?')) {
            this.currentWorkout = null;
            this.updateWorkoutUI();
        }
    }

    updateWorkoutUI() {
        const workoutContainer = document.getElementById('currentWorkout');
        if (!workoutContainer) return;

        if (!this.currentWorkout) {
            workoutContainer.innerHTML = '<p>No active workout. Click "Start Workout" to begin.</p>';
            return;
        }

        const duration = this.currentWorkout.endTime 
            ? this.currentWorkout.duration 
            : Math.round((Date.now() - this.currentWorkout.startTime) / 1000 / 60);

        let html = `
            <div class="workout-info">
                <h3>Current Workout</h3>
                <p>Duration: ${duration} minutes</p>
                <p>Exercises: ${this.currentWorkout.exercises.length}</p>
            </div>
        `;

        this.currentWorkout.exercises.forEach(exercise => {
            const totalVolume = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
            html += `
                <div class="exercise-item">
                    <div class="exercise-header">
                        <h4>${exercise.name}</h4>
                        <button onclick="window.workoutTracker.addSet(${exercise.id})" class="btn btn-small">Add Set</button>
                    </div>
                    <p>Total Volume: ${totalVolume.toFixed(1)} kg</p>
                    <div class="sets-list">
                        ${exercise.sets.map((set, index) => `
                            <div class="set-item">
                                <span>Set ${index + 1}:</span>
                                <span>${set.weight} kg</span>
                                <span>${set.reps} reps</span>
                                <span>${set.rest}s rest</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        workoutContainer.innerHTML = html;
    }

    renderWorkouts() {
        const historyContainer = document.getElementById('workoutHistory');
        if (!historyContainer) return;

        if (this.workouts.length === 0) {
            historyContainer.innerHTML = '<p>No saved workouts yet.</p>';
            return;
        }

        let html = '<h3>Workout History</h3>';
        this.workouts.slice(0, 10).forEach(workout => {
            const date = new Date(workout.date).toLocaleDateString();
            const totalExercises = workout.exercises.length;
            const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
            
            html += `
                <div class="workout-section">
                    <h4>${date} - ${workout.duration || 0} minutes</h4>
                    <p>Exercises: ${totalExercises} | Sets: ${totalSets}</p>
                </div>
            `;
        });

        historyContainer.innerHTML = html;
    }

    loadWorkouts() {
        try {
            const saved = localStorage.getItem('workoutTracker');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveWorkouts() {
        try {
            localStorage.setItem('workoutTracker', JSON.stringify(this.workouts));
        } catch (e) {
            console.error('Failed to save workouts:', e);
        }
    }

    showNotification(message, type = 'info') {
        if (window.Utils && window.Utils.showNotification) {
            window.Utils.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.workoutTracker = new WorkoutTracker();
});

