const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginText = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const alertContainer = document.getElementById('alert-container');

async function handleLogin(dataSending) {
    const apiURL = `https://karyar-library-management-system.liara.run/api/auth/login`;
    const response = await fetch(apiURL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataSending)
    });

    if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.message || 'Login failed');
    }

    const responseData = await response.json();
    console.log(responseData);

    document.cookie = `token=${responseData.token}; max-age=7200; path=/`;     // 2 hours
}


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    loginText.textContent = '';
    loginSpinner.classList.remove('hidden');

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        showAlert('Please enter both email and password.', 'error');
        resetButton();
        return;
    }

    try {
        await handleLogin({"email": email, "password": password});
        window.location.href = '../dashboard.html';
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        resetButton();
    }
});

function resetButton() {
    loginText.textContent = 'Login';
    loginSpinner.classList.add('hidden');
}

function showAlert(message, type) {
    alertContainer.innerHTML = `<div class="alert-${type}">${message}</div>`;
}