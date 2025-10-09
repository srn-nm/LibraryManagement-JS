import { apiFetch, getCookie } from "./utils/api.js";

const userName = document.getElementById("userName");
const studentName = document.getElementById("studentName");
const activeLoans = document.getElementById("activeLoans");
const availableBooks = document.getElementById("availableBooks");
const loader = document.getElementById("loader");
const userAvatar = document.getElementById("userAvatar");

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = "token=; path=/; max-age=0";
        localStorage.clear();
        window.location.href = "login.html";
    });
}

async function setMe() {
    loader.style.display = "flex";
    try {
        const data = await apiFetch("/auth/me");
        userName.textContent = data.data.user.firstName + " " + data.data.user.lastName;
        userAvatar.textContent = data.data.user.firstName[0].toUpperCase();
        studentName.textContent = data.data.user.firstName;
        activeLoans.textContent = data.data.stats.activeLoans;
        availableBooks.textContent = data.data.stats.availableBooks;
    } catch (error) {
        console.error("Failed to load dashboard data: " + error);
        window.location.href = '../login.html';
    } finally {
        loader.style.display = "none";
    }
}

setMe();
