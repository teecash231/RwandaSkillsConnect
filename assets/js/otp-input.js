// Enhanced OTP Input Component for Rwanda SkillsConnect
// Provides better UX with individual digit inputs

class OTPInput {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.length = options.length || 6;
        this.onComplete = options.onComplete || (() => {});
        this.onChange = options.onChange || (() => {});
        this.inputs = [];
        
        this.init();
    }
    
    init() {
        this.container.innerHTML = '';
        this.container.className = 'flex justify-center space-x-2 mb-4';
        
        for (let i = 0; i < this.length; i++) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.className = 'w-12 h-12 text-center text-xl font-mono border-2 border-gray-300 rounded-md focus:border-blue-500 focus:outline-none';
            input.dataset.index = i;
            
            // Add event listeners
            input.addEventListener('input', (e) => this.handleInput(e));
            input.addEventListener('keydown', (e) => this.handleKeydown(e));
            input.addEventListener('paste', (e) => this.handlePaste(e));
            
            this.inputs.push(input);
            this.container.appendChild(input);
        }
        
        // Focus first input
        this.inputs[0].focus();
    }
    
    handleInput(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        const value = input.value.replace(/[^0-9]/g, '');
        
        input.value = value;
        
        if (value && index < this.length - 1) {
            this.inputs[index + 1].focus();
        }
        
        this.onChange(this.getValue());
        
        if (this.getValue().length === this.length) {
            this.onComplete(this.getValue());
        }
    }
    
    handleKeydown(e) {
        const input = e.target;
        const index = parseInt(input.dataset.index);
        
        if (e.key === 'Backspace' && !input.value && index > 0) {
            this.inputs[index - 1].focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            this.inputs[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < this.length - 1) {
            this.inputs[index + 1].focus();
        }
    }
    
    handlePaste(e) {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const digits = paste.replace(/[^0-9]/g, '').slice(0, this.length);
        
        this.setValue(digits);
    }
    
    getValue() {
        return this.inputs.map(input => input.value).join('');
    }
    
    setValue(value) {
        const digits = value.toString().replace(/[^0-9]/g, '').slice(0, this.length);
        
        this.inputs.forEach((input, index) => {
            input.value = digits[index] || '';
        });
        
        // Focus next empty input or last input
        const nextEmpty = this.inputs.findIndex(input => !input.value);
        if (nextEmpty !== -1) {
            this.inputs[nextEmpty].focus();
        } else {
            this.inputs[this.length - 1].focus();
        }
        
        this.onChange(this.getValue());
        
        if (this.getValue().length === this.length) {
            this.onComplete(this.getValue());
        }
    }
    
    clear() {
        this.inputs.forEach(input => input.value = '');
        this.inputs[0].focus();
        this.onChange('');
    }
    
    disable() {
        this.inputs.forEach(input => input.disabled = true);
    }
    
    enable() {
        this.inputs.forEach(input => input.disabled = false);
    }
}

// Export for global use
window.OTPInput = OTPInput;