import { apiFetch, getCookie } from "./api.js";

function checkAuth() {
    const token = getCookie("token");
    const path = window.location.pathname;

    const publicPages = ["/index.html", "/login.html"];

    if (!token && !publicPages.some(page => path.endsWith(page))) {
        window.location.href = "login.html";
    } else if (token && path.endsWith("/login.html")){
        window.location.href = "dashboard.html";
    }
}

checkAuth();
