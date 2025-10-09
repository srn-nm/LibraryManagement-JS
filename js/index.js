import { apiFetch, getCookie } from "./utils/api.js";

document.addEventListener("DOMContentLoaded", async () => {
    
    const loader = document.getElementById("loader");

    async function getMe() {
        loader.style.display = "flex";
        try {
            const data = await apiFetch("/auth/me");
            return data.data.user.firstName + " " + data.data.user.lastName;
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
            return null;
        } finally {
            loader.style.display = "none";
        }
    }

    const hasToken = getCookie("token");
    document.getElementById("get-started-btn").href = hasToken ? "dashboard.html" : "login.html";

    checkToken();
    
    async function checkToken() {
        if (hasToken) {
            const fullName = await getMe();
            if (fullName) {
                const initials = fullName[0].toUpperCase();
                document.getElementById("login-check").innerHTML = `
                    <div class="user-info">
                        <div class="user-avatar" id="userAvatar">${initials}</div>
                        <span id="userName">${fullName}</span>
                    </div>
                `;
            }
        } else {
            document.getElementById("login-check").innerHTML = `<a href="login.html">Login</a>`;
            loader.style.display = "none";
        }
    }
    
});
