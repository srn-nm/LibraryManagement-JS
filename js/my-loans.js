const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const loansTableBody = document.querySelector(".table tbody"); 
const statCards = document.querySelectorAll(".stat-card .stat-number"); 
const totalLoans = document.getElementById("totalLoans");
const activeLoans = document.getElementById("activeLoans");
const returnedBooks = document.getElementById("returnedBooks");

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

async function getUsername() {
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
            throw new Error(errorJson.message);
        }

        const responseData = await response.json();
        userName.textContent = responseData.data.user.firstName + " " + responseData.data.user.lastName;
        
    } catch (error) {
        console.error("Failed to load Username: " + error);
        alert("Failed to load Username: " + error.message);
        window.location.href = '../dashboard.html';
    } 
}

async function returnLoan(id) {
    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/loans/${id}/return`;
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("token")
            },
            body: JSON.stringify({"id": id})
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.message);
        }

        alert("Book returned successfully!");
        getLoans(); 

    } catch (error) {
        console.error("Failed to return book: " + error);
        alert("Failed to return book: " + error.message);
    } 
}

async function getLoans() {
    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/loans/my-loans`;
        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("token")
            }
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message);
        }

        loansTableBody.innerHTML = "";
        let activeCount = 0;
        let returnedCount = 0;

        responseData.data.forEach((loan) => {
            const tr = document.createElement("tr");

            let statusHTML = "";
            let actionHTML = "";

            if (loan.status === "active") {
                statusHTML = `<span class="status status-active">Active</span>`;
                actionHTML = `<button class="btn btn-success btn-sm return" data-id="${loan.id}">Return</button>`;
                activeCount++;
            } else {
                statusHTML = `<span class="status status-returned">Returned</span>`;
                actionHTML = `<button class="btn btn-secondary btn-sm" disabled>Returned</button>`;
                returnedCount++;
            }

            tr.innerHTML = `
                <td><strong>${loan.book.title}</strong><br><small style="color: #666;">ISBN: ${loan.book.isbn}</small></td>
                <td>${loan.book.author}</td>
                <td>${loan.loanDate}</td>
                <td>${statusHTML}</td>
                <td>${actionHTML}</td>
            `;

            loansTableBody.appendChild(tr);
        });

        document.querySelectorAll(".return").forEach(btn => {
            btn.addEventListener("click", () => {
                const loanId = btn.getAttribute("data-id");
                returnLoan(loanId);
            });
        });

        activeLoans.textContent = activeCount;
        returnedBooks.textContent = returnedCount;
        totalLoans.textContent = `Total: ${responseData.data.length} loans`;

    } catch (error) {
        console.error("Failed to load Loans list: " + error);
        alert("Failed to load Loans list: " + error.message);
        window.location.href = '../dashboard.html';
    }
}

async function getDatas() { 
    loader.style.display = "flex"; 
    try {
        await getUsername();
        await getLoans();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.style.display = "none"; 
    }
}

getDatas();