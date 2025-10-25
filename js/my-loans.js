import { apiFetch, getCookie } from "./utils/api.js";

const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const loansTableBody = document.querySelector(".table tbody");
const totalLoans = document.getElementById("totalLoans");
const activeLoans = document.getElementById("activeLoans");
const returnedBooks = document.getElementById("returnedBooks");
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

async function getUsername() {
    try {
        const response = await apiFetch("/auth/me");
        const user = response.data.user;
        userName.textContent = `${user.firstName} ${user.lastName}`;
        userAvatar.textContent = user.firstName[0].toUpperCase();
    } catch (error) {
        console.error("Failed to load Username:", error);
    }
}

async function returnLoan(id) {
    const btn = document.querySelector(`button.return[data-id="${id}"]`);
    if (!btn) return;

    const btnText = btn.querySelector(".btn-text");
    const spinner = btn.querySelector(".loading");

    btnText.textContent = "";
    spinner.classList.remove("hidden");
    btn.disabled = true;

    try {
        await apiFetch(`/loans/${id}/return`, {
            method: "POST",
            body: JSON.stringify({ id }),
        });

        console.log("Book returned successfully");

        localStorage.removeItem("my-loans");
        localStorage.removeItem("my-loans_timestamp");

        await getLoans();
    } catch (error) {
        console.error("Failed to return book:", error);
        btnText.textContent = "Return";
        spinner.classList.add("hidden");
        btn.disabled = false;
    }
}

async function getLoans() {
    try {
        const response = await apiFetch("/loans/my-loans");

        loansTableBody.innerHTML = "";
        let activeCount = 0;
        let returnedCount = 0;

        response.data.forEach((loan) => {
            const tr = document.createElement("tr");
            const isActive = loan.status === "active";

            const statusHTML = `<span class="status ${isActive ? "status-active" : "status-returned"}">
                ${isActive ? "Active" : "Returned"}</span>`;
            const actionHTML = isActive
                ? `<button class="btn btn-success btn-sm return" data-id="${loan.id}">
                    <span class="btn-text">Return</span>
                    <span class="loading hidden"></span>
                </button>`
                : `<button class="btn btn-secondary btn-sm" disabled>
                    <span class="btn-text">Returned</span>
                    <span class="loading hidden"></span>
                </button>`;  

            if (isActive) activeCount++;
            else returnedCount++;

            const formatted = new Date(loan.loanDate).toLocaleString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }).replace(",", "");

            tr.innerHTML = `
                <td><strong>${loan.book.title}</strong><br><small style="color: #666;">ISBN: ${loan.book.isbn}</small></td>
                <td>${loan.book.author}</td>
                <td>${formatted}</td>
                <td>${statusHTML}</td>
                <td>${actionHTML}</td>
            `;

            loansTableBody.appendChild(tr);
        });

        loansTableBody.querySelectorAll(".return").forEach((btn) => {
            btn.addEventListener("click", () => returnLoan(btn.dataset.id));
        });

        activeLoans.textContent = activeCount;
        returnedBooks.textContent = returnedCount;
        totalLoans.textContent = `Total: ${response.data.length} loans`;
    } catch (error) {
        console.error("Failed to load Loans list:", error);
    }
}

loader.style.display = "flex";

try {
    await Promise.all([
        getUsername(),
        getLoans()
    ]);
} catch (error) {
    console.error("Error loading data:", error);
} finally {
    loader.style.display = "none";
}
