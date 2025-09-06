function openSignupModal() {
    document.getElementById('signupModal').style.display = 'block';
    populateDayOptions();
    populateYearOptions();
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function populateDayOptions() {
    const daySelect = document.querySelector('.birthday-selects select:nth-child(2)');
    daySelect.innerHTML = '<option value="">일</option>';
    
    for (let i = 1; i <= 31; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '일';
        daySelect.appendChild(option);
    }
}

function populateYearOptions() {
    const yearSelect = document.querySelector('.birthday-selects select:nth-child(3)');
    yearSelect.innerHTML = '<option value="">연도</option>';
    
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 120; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i + '년';
        yearSelect.appendChild(option);
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('signupModal');
    if (event.target === modal) {
        closeSignupModal();
    }
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    
    if (email && password) {
        alert('로그인 시도: ' + email);
    } else {
        alert('이메일과 비밀번호를 입력해주세요.');
    }
});

document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const lastName = e.target.querySelector('.name-row input:first-child').value;
    const firstName = e.target.querySelector('.name-row input:last-child').value;
    const email = e.target.querySelector('input[type="email"]').value;
    const password = e.target.querySelector('input[type="password"]').value;
    const month = e.target.querySelector('.birthday-selects select:first-child').value;
    const day = e.target.querySelector('.birthday-selects select:nth-child(2)').value;
    const year = e.target.querySelector('.birthday-selects select:nth-child(3)').value;
    const gender = e.target.querySelector('input[name="gender"]:checked')?.value;
    
    if (lastName && firstName && email && password && month && day && year && gender) {
        alert(`회원가입 완료!\n이름: ${firstName} ${lastName}\n이메일: ${email}\n생년월일: ${year}-${month}-${day}\n성별: ${gender}`);
        closeSignupModal();
        e.target.reset();
    } else {
        alert('모든 필드를 입력해주세요.');
    }
});

document.querySelectorAll('.gender-option').forEach(option => {
    option.addEventListener('click', function() {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;
    });
});

document.querySelector('.birthday-selects select:first-child').addEventListener('change', function() {
    updateDayOptions();
});

document.querySelector('.birthday-selects select:nth-child(3)').addEventListener('change', function() {
    updateDayOptions();
});

function updateDayOptions() {
    const monthSelect = document.querySelector('.birthday-selects select:first-child');
    const daySelect = document.querySelector('.birthday-selects select:nth-child(2)');
    const yearSelect = document.querySelector('.birthday-selects select:nth-child(3)');
    
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);
    
    if (month && year) {
        const daysInMonth = new Date(year, month, 0).getDate();
        const currentDay = parseInt(daySelect.value);
        
        daySelect.innerHTML = '<option value="">일</option>';
        
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i + '일';
            if (i === currentDay && i <= daysInMonth) {
                option.selected = true;
            }
            daySelect.appendChild(option);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#1877f2';
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.style.borderColor = '#dddfe2';
            }
        });
    });
});