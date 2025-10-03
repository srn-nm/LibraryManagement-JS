const userName = document.getElementById("userName");
const studentName = document.getElementById("studentName");
const activeLoans = document.getElementById("activeLoans");
const availableBooks = document.getElementById("availableBooks");
const loader = document.getElementById("loader");

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = "token=; path=/; max-age=0";
        localStorage.clear();
        window.location.href = "login.html";
    });
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('='); 
        if (key === name) return decodeURIComponent(value);
    }
    return null; 
}

async function setMe() {
    loader.style.display = "flex"; 

    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/auth/me`;
        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("token")
            }
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.message || 'Authentication failed');
        }

        const data = await response.json();

        userName.textContent = data.data.user.firstName + " " + data.data.user.lastName;
        studentName.textContent = data.data.user.firstName;
        activeLoans.textContent = data.data.stats.activeLoans;
        availableBooks.textContent = data.data.stats.availableBooks; 

        console.log(data);
        
    } catch (error) {
        console.error("Failed to load dashboard data: " + error);
        alert("Failed to load dashboard data: " + error.message);
        window.location.href = '../login.html';

    } finally {
        loader.style.display = "none"; 
    }
}

setMe();
