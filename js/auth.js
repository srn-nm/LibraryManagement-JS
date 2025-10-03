function checkAuth() {
    const token = getCookie("token");
    const path = window.location.pathname;

    const publicPages = ["/index.html", "/login.html"];

    if (!token && !publicPages.some(page => path.endsWith(page))) {
        window.location.href = "login.html";
    }
}

checkAuth();