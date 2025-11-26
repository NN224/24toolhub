class AgeCalculator {
    constructor() {
        this.birthDate = document.getElementById('birthDate');
        this.currentDate = document.getElementById('currentDate');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.resultsGrid = document.getElementById('resultsGrid');
        this.summaryCard = document.getElementById('summaryCard');
        this.birthdayCountdown = document.getElementById('birthdayCountdown');

        this.init();
    }

    init() {
        // Set today as default for current date
        const today = new Date().toISOString().split('T')[0];
        this.currentDate.value = today;
        this.currentDate.max = today;
        this.birthDate.max = today;

        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.clearBtn.addEventListener('click', () => this.clear());
    }

    calculate() {
        const birth = new Date(this.birthDate.value);
        const current = new Date(this.currentDate.value);

        if (!this.birthDate.value || !this.currentDate.value) {
            alert('Please select both dates');
            return;
        }

        if (birth > current) {
            alert('Birth date cannot be after current date');
            return;
        }

        // Calculate detailed age
        const age = this.calculateDetailedAge(birth, current);
        
        // Display results
        this.displayResults(age);
        
        // Calculate next birthday
        this.calculateNextBirthday(birth, current);
    }

    calculateDetailedAge(birth, current) {
        // Use date-fns utilities if available, otherwise fallback to manual calculation
        let years, months, days, totalDays, totalHours, totalMinutes;

        if (window.differenceInYears && window.differenceInMonths && window.differenceInDays) {
            // Use date-fns functions
            years = window.differenceInYears(birth, current);
            const totalMonths = window.differenceInMonths(birth, current);
            months = totalMonths % 12;
            totalDays = window.differenceInDays(birth, current);
            
            // Calculate days remaining after years and months
            const dateAfterYearsMonths = new Date(birth);
            dateAfterYearsMonths.setFullYear(birth.getFullYear() + years);
            dateAfterYearsMonths.setMonth(birth.getMonth() + totalMonths);
            days = window.differenceInDays(dateAfterYearsMonths, current);
            
            totalHours = window.differenceInHours(birth, current);
            totalMinutes = window.differenceInMinutes(birth, current);
        } else {
            // Fallback to manual calculation
            const diff = current - birth;
            
            // Calculate years, months, days
            years = current.getFullYear() - birth.getFullYear();
            months = current.getMonth() - birth.getMonth();
            days = current.getDate() - birth.getDate();

            // Adjust for negative days
            if (days < 0) {
                months--;
                const prevMonth = new Date(current.getFullYear(), current.getMonth(), 0);
                days += prevMonth.getDate();
            }

            // Adjust for negative months
            if (months < 0) {
                years--;
                months += 12;
            }

            // Calculate total days, hours, minutes
            totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
            totalHours = Math.floor(diff / (1000 * 60 * 60));
            totalMinutes = Math.floor(diff / (1000 * 60));
        }

        return {
            years,
            months,
            days,
            totalDays,
            totalHours,
            totalMinutes
        };
    }

    displayResults(age) {
        document.getElementById('years').textContent = age.years;
        document.getElementById('months').textContent = age.months;
        document.getElementById('days').textContent = age.days;
        document.getElementById('hours').textContent = age.totalHours.toLocaleString();
        document.getElementById('minutes').textContent = age.totalMinutes.toLocaleString();

        this.resultsGrid.classList.add('active');

        // Summary text
        const summaryText = `You are <strong>${age.years} years, ${age.months} months, and ${age.days} days</strong> old. 
        That's approximately <strong>${age.totalDays.toLocaleString()} days</strong>, 
        <strong>${age.totalHours.toLocaleString()} hours</strong>, or 
        <strong>${age.totalMinutes.toLocaleString()} minutes</strong> since you were born!`;
        
        document.getElementById('summaryText').innerHTML = summaryText;
        this.summaryCard.classList.add('active');
    }

    calculateNextBirthday(birth, current) {
        const nextBirthday = new Date(current.getFullYear(), birth.getMonth(), birth.getDate());
        
        // If birthday has passed this year, use next year
        if (nextBirthday < current) {
            nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        }

        const daysUntilBirthday = Math.ceil((nextBirthday - current) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirthday === 0) {
            document.getElementById('countdownText').innerHTML = 
                `<strong>🎉 Happy Birthday! 🎉</strong>`;
        } else if (daysUntilBirthday === 1) {
            document.getElementById('countdownText').innerHTML = 
                `Your next birthday is <strong>tomorrow</strong>! 🎈`;
        } else {
            const months = Math.floor(daysUntilBirthday / 30);
            const days = daysUntilBirthday % 30;
            
            let text = 'Your next birthday is in ';
            if (months > 0) {
                text += `<strong>${months} month${months > 1 ? 's' : ''}</strong> and `;
            }
            text += `<strong>${days} day${days > 1 ? 's' : ''}</strong>!`;
            
            document.getElementById('countdownText').innerHTML = text;
        }

        this.birthdayCountdown.classList.add('active');
    }

    clear() {
        this.birthDate.value = '';
        const today = new Date().toISOString().split('T')[0];
        this.currentDate.value = today;
        this.resultsGrid.classList.remove('active');
        this.summaryCard.classList.remove('active');
        this.birthdayCountdown.classList.remove('active');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AgeCalculator();
});
