class TipCalculator {
    constructor() {
        this.billAmount = document.getElementById('billAmount');
        this.tipSlider = document.getElementById('tipSlider');
        this.tipPercentage = document.getElementById('tipPercentage');
        this.numPeople = document.getElementById('numPeople');
        this.presetButtons = document.querySelectorAll('.preset-btn');
        this.resetBtn = document.getElementById('resetBtn');

        this.tipAmount = document.getElementById('tipAmount');
        this.totalAmount = document.getElementById('totalAmount');
        this.perPerson = document.getElementById('perPerson');

        this.summaryBill = document.getElementById('summaryBill');
        this.summaryTip = document.getElementById('summaryTip');
        this.summaryTipPercent = document.getElementById('summaryTipPercent');
        this.summaryPeople = document.getElementById('summaryPeople');
        this.summaryTotal = document.getElementById('summaryTotal');

        this.init();
    }

    init() {
        this.billAmount.addEventListener('input', () => this.calculate());
        this.tipSlider.addEventListener('input', () => {
            this.tipPercentage.textContent = this.tipSlider.value + '%';
            this.updatePresetButtons();
            this.calculate();
        });
        this.numPeople.addEventListener('input', () => this.calculate());

        this.presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tipValue = parseInt(btn.dataset.tip);
                this.tipSlider.value = tipValue;
                this.tipPercentage.textContent = tipValue + '%';
                this.updatePresetButtons();
                this.calculate();
            });
        });

        this.resetBtn.addEventListener('click', () => this.reset());

        this.updatePresetButtons();
        this.calculate();
    }

    updatePresetButtons() {
        const currentTip = parseInt(this.tipSlider.value);
        this.presetButtons.forEach(btn => {
            const tipValue = parseInt(btn.dataset.tip);
            if (tipValue === currentTip) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    calculate() {
        const bill = parseFloat(this.billAmount.value) || 0;
        const tipPercent = parseFloat(this.tipSlider.value) || 0;
        const people = parseInt(this.numPeople.value) || 1;

        const tip = (bill * tipPercent) / 100;
        const total = bill + tip;
        const perPersonAmount = total / people;

        this.tipAmount.textContent = this.formatCurrency(tip);
        this.totalAmount.textContent = this.formatCurrency(total);
        this.perPerson.textContent = this.formatCurrency(perPersonAmount);

        this.summaryBill.textContent = this.formatCurrency(bill);
        this.summaryTip.textContent = this.formatCurrency(tip);
        this.summaryTipPercent.textContent = tipPercent;
        this.summaryPeople.textContent = people;
        this.summaryTotal.textContent = this.formatCurrency(total);
    }

    formatCurrency(amount) {
        return '$' + amount.toFixed(2);
    }

    reset() {
        this.billAmount.value = '';
        this.tipSlider.value = 15;
        this.tipPercentage.textContent = '15%';
        this.numPeople.value = 1;
        this.updatePresetButtons();
        this.calculate();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TipCalculator();
});
