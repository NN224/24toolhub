class TimeZoneConverter {
    constructor() {
        this.sourceTimezone = document.getElementById('sourceTimezone');
        this.targetTimezone = document.getElementById('targetTimezone');
        this.sourceCurrentTime = document.getElementById('sourceCurrentTime');
        this.targetCurrentTime = document.getElementById('targetCurrentTime');
        this.sourceTimezoneName = document.getElementById('sourceTimezoneName');
        this.targetTimezoneName = document.getElementById('targetTimezoneName');
        this.dateTimeInput = document.getElementById('dateTimeInput');
        this.swapBtn = document.getElementById('swapBtn');
        this.convertBtn = document.getElementById('convertBtn');
        this.useNowBtn = document.getElementById('useNowBtn');
        this.resultBox = document.getElementById('resultBox');
        this.resultTime = document.getElementById('resultTime');
        this.resultDate = document.getElementById('resultDate');
        this.timeDifference = document.getElementById('timeDifference');
        this.differenceText = document.getElementById('differenceText');

        this.timezones = [
            { name: 'UTC - Coordinated Universal Time', value: 'UTC' },
            { name: 'GMT - Greenwich Mean Time', value: 'GMT' },
            { name: 'EST - Eastern Standard Time', value: 'America/New_York' },
            { name: 'CST - Central Standard Time', value: 'America/Chicago' },
            { name: 'MST - Mountain Standard Time', value: 'America/Denver' },
            { name: 'PST - Pacific Standard Time', value: 'America/Los_Angeles' },
            { name: 'AKST - Alaska Standard Time', value: 'America/Anchorage' },
            { name: 'HST - Hawaii Standard Time', value: 'Pacific/Honolulu' },
            { name: 'AST - Atlantic Standard Time', value: 'America/Halifax' },
            { name: 'CET - Central European Time', value: 'Europe/Paris' },
            { name: 'EET - Eastern European Time', value: 'Europe/Athens' },
            { name: 'WET - Western European Time', value: 'Europe/Lisbon' },
            { name: 'BST - British Summer Time', value: 'Europe/London' },
            { name: 'IST - Indian Standard Time', value: 'Asia/Kolkata' },
            { name: 'JST - Japan Standard Time', value: 'Asia/Tokyo' },
            { name: 'KST - Korea Standard Time', value: 'Asia/Seoul' },
            { name: 'CST - China Standard Time', value: 'Asia/Shanghai' },
            { name: 'AEST - Australian Eastern Standard Time', value: 'Australia/Sydney' },
            { name: 'ACST - Australian Central Standard Time', value: 'Australia/Adelaide' },
            { name: 'AWST - Australian Western Standard Time', value: 'Australia/Perth' },
            { name: 'NZST - New Zealand Standard Time', value: 'Pacific/Auckland' },
            { name: 'MSK - Moscow Standard Time', value: 'Europe/Moscow' },
            { name: 'AST - Arabia Standard Time', value: 'Asia/Dubai' },
            { name: 'PKT - Pakistan Standard Time', value: 'Asia/Karachi' },
            { name: 'BRT - Brasilia Time', value: 'America/Sao_Paulo' },
            { name: 'ART - Argentina Time', value: 'America/Argentina/Buenos_Aires' },
            { name: 'SAST - South Africa Standard Time', value: 'Africa/Johannesburg' },
            { name: 'EAT - East Africa Time', value: 'Africa/Nairobi' },
            { name: 'CAT - Central Africa Time', value: 'Africa/Cairo' }
        ];

        this.init();
    }

    init() {
        this.populateTimezones();
        this.setDefaultTimezones();
        this.updateCurrentTimes();
        this.updateTimeDifference();
        
        setInterval(() => {
            this.updateCurrentTimes();
        }, 1000);

        this.swapBtn.addEventListener('click', () => this.swapTimezones());
        this.convertBtn.addEventListener('click', () => this.convertTime());
        this.useNowBtn.addEventListener('click', () => this.useCurrentTime());
        this.sourceTimezone.addEventListener('change', () => {
            this.updateCurrentTimes();
            this.updateTimeDifference();
        });
        this.targetTimezone.addEventListener('change', () => {
            this.updateCurrentTimes();
            this.updateTimeDifference();
        });

        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        this.dateTimeInput.value = localDateTime;
    }

    populateTimezones() {
        this.timezones.forEach(tz => {
            const option1 = document.createElement('option');
            option1.value = tz.value;
            option1.textContent = tz.name;
            this.sourceTimezone.appendChild(option1);

            const option2 = document.createElement('option');
            option2.value = tz.value;
            option2.textContent = tz.name;
            this.targetTimezone.appendChild(option2);
        });
    }

    setDefaultTimezones() {
        const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const matchingTz = this.timezones.find(tz => tz.value === userTimezone);
        if (matchingTz) {
            this.sourceTimezone.value = matchingTz.value;
        } else {
            this.sourceTimezone.value = 'America/New_York';
        }
        
        this.targetTimezone.value = 'UTC';
    }

    updateCurrentTimes() {
        const now = new Date();
        
        const sourceTime = now.toLocaleTimeString('en-US', {
            timeZone: this.sourceTimezone.value,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        const targetTime = now.toLocaleTimeString('en-US', {
            timeZone: this.targetTimezone.value,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        this.sourceCurrentTime.textContent = sourceTime;
        this.targetCurrentTime.textContent = targetTime;

        const sourceDate = now.toLocaleDateString('en-US', {
            timeZone: this.sourceTimezone.value,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        const targetDate = now.toLocaleDateString('en-US', {
            timeZone: this.targetTimezone.value,
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });

        this.sourceTimezoneName.textContent = sourceDate;
        this.targetTimezoneName.textContent = targetDate;
    }

    updateTimeDifference() {
        const now = new Date();
        
        const sourceOffset = this.getTimezoneOffset(now, this.sourceTimezone.value);
        const targetOffset = this.getTimezoneOffset(now, this.targetTimezone.value);
        
        const diffMinutes = targetOffset - sourceOffset;
        const hours = Math.floor(Math.abs(diffMinutes) / 60);
        const minutes = Math.abs(diffMinutes) % 60;
        
        let diffText = '';
        if (diffMinutes === 0) {
            diffText = 'Same time zone';
        } else if (diffMinutes > 0) {
            diffText = `${hours}h ${minutes}m ahead`;
        } else {
            diffText = `${hours}h ${minutes}m behind`;
        }
        
        this.differenceText.textContent = diffText;
    }

    getTimezoneOffset(date, timezone) {
        const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
        const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
        return (tzDate.getTime() - utcDate.getTime()) / 60000;
    }

    swapTimezones() {
        const temp = this.sourceTimezone.value;
        this.sourceTimezone.value = this.targetTimezone.value;
        this.targetTimezone.value = temp;
        this.updateCurrentTimes();
        this.updateTimeDifference();
        if (this.resultBox.style.display !== 'none') {
            this.convertTime();
        }
    }

    useCurrentTime() {
        const now = new Date();
        const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        this.dateTimeInput.value = localDateTime;
        this.convertTime();
    }

    convertTime() {
        if (!this.dateTimeInput.value) {
            alert('Please select a date and time to convert');
            return;
        }

        const inputDate = new Date(this.dateTimeInput.value);
        
        const sourceDate = new Date(inputDate.toLocaleString('en-US', { timeZone: this.sourceTimezone.value }));
        const targetDateString = inputDate.toLocaleString('en-US', { 
            timeZone: this.targetTimezone.value,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const timePart = inputDate.toLocaleTimeString('en-US', {
            timeZone: this.targetTimezone.value,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        const datePart = inputDate.toLocaleDateString('en-US', {
            timeZone: this.targetTimezone.value,
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.resultTime.textContent = timePart;
        this.resultDate.textContent = datePart;
        this.resultBox.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TimeZoneConverter();
});
