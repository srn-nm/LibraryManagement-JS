import { apiFetch, getCookie } from "./utils/api.js";

const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const booksGrid = document.getElementById("books-grid");
const userAvatar = document.getElementById("userAvatar");

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = "token=; path=/; max-age=0";
        localStorage.clear();
        window.location.href = "login.html";
    });
}

function isCacheValid(key) {
    const timestamp = localStorage.getItem(key + "_timestamp");
    if (!timestamp) return false;
    return Date.now() - parseInt(timestamp) < CACHE_DURATION;
}

async function getLoansList() {
    const cacheKey = "my-loans";
    if (isCacheValid(cacheKey)) return; // use cache

    try {
        const { data } = await apiFetch("/loans/my-loans");
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheKey + "_timestamp", Date.now());
    } catch (error) {
        console.error("Failed to load Loans list: " + error);
    }
}

function isThisBookAlreadyBorrowedByMe(bookID) {
    let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
    return loans.some(loan => loan.book.id === bookID && loan.status === "active");
}

async function getUsername() {
    const cacheKey = "user-info";
    if (isCacheValid(cacheKey)) {
        const data = JSON.parse(localStorage.getItem(cacheKey));
        userName.textContent = data.firstName + " " + data.lastName;
        userAvatar.textContent = data.firstName[0].toUpperCase();
        localStorage.setItem("userID", data.id);
        return;
    }

    try {
        const { data } = await apiFetch("/auth/me");
        userName.textContent = data.user.firstName + " " + data.user.lastName;
        userAvatar.textContent = data.user.firstName[0].toUpperCase();
        localStorage.setItem("userID", data.user.id);
        localStorage.setItem(cacheKey, JSON.stringify(data.user));
        localStorage.setItem(cacheKey + "_timestamp", Date.now());
    } catch (error) {
        console.error("Failed to load Username: " + error);
    } 
}

async function getBooks() {
    const cacheKey = "books";
    let responseData;

    if (isCacheValid(cacheKey)) {
        responseData = JSON.parse(localStorage.getItem(cacheKey));
    } else {
        const { data } = await apiFetch("/books");
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(cacheKey + "_timestamp", Date.now());
        responseData = data;
    }

    booksGrid.innerHTML = ""; 
    responseData.forEach(book => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.id = book.id;
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${book.title}</h3>
                ${book.status === "available" 
                    ? `<span class="status status-available">Available</span>` 
                    : `<span class="status status-unavailable">Unavailable</span>`}
            </div>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn}</p>
            <p><strong>Category:</strong> ${book.category?.name}</p>
            <p><strong>Available Copies:</strong> ${book.availableCopies}</p>
            <p class="mb-2">${book.description}</p>
            <div class="card-footer">
                ${isThisBookAlreadyBorrowedByMe(book.id)
                    ? `<button class="btn btn-secondary btn-sm">Borrowed</button>`
                    : book.status === "available"
                        ? `<button class="btn btn-primary btn-sm borrow-btn"><span class="btn-text">Borrow Book</span><span class="loading hidden"></span></button>`
                        : `<button class="btn btn-secondary btn-sm" disabled>Not Available</button>`}

                <button class="btn btn-secondary btn-sm view-details">View Details</button>
            </div>
        `;
        booksGrid.appendChild(card);

        const viewBtn = card.querySelector(".view-details");
        viewBtn.addEventListener("click", () => {
            window.location.href = `../book.html?id=${book.id}`;
        });

        if (book.status === "available" && !isThisBookAlreadyBorrowedByMe(book.id)) {
            const borrowBtn = card.querySelector(".borrow-btn");
            borrowBtn.addEventListener("click", () => {
                borrowBook(localStorage.getItem("userID"), book.id);
            });
        }
    });
}
async function borrowBook(userID, bookID) {
    const card = document.getElementById(bookID);
    const borrowBtn = card.querySelector(".borrow-btn");
    const btnText = borrowBtn.querySelector(".btn-text");
    const spinner = borrowBtn.querySelector(".loading");

    // دکمه در حالت "در حال بارگذاری"
    btnText.textContent = "";
    spinner.classList.remove("hidden");
    borrowBtn.disabled = true;

    const now = new Date();
    const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isoString = futureDate.toISOString();

    try {
        const { loan } = await apiFetch("/loans", {
            method: "POST",
            body: JSON.stringify({
                "bookId": bookID,
                "userId": userID,
                "loanPeriod": 14,
                "dueDate": isoString
            }),
        });

        // بعد از موفقیت
        btnText.textContent = "Borrowed";
        spinner.classList.add("hidden");
        borrowBtn.classList.remove("btn-primary");
        borrowBtn.classList.add("btn-secondary");

        let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
        loans.push(loan);
        localStorage.setItem("my-loans", JSON.stringify(loans));
        localStorage.setItem("my-loans_timestamp", Date.now());
        console.log("book borrowed.");
    } catch (error) {
        console.error("Failed to borrow book: " + error);
        btnText.textContent = "Borrow Book";
        spinner.classList.add("hidden");
        borrowBtn.disabled = false;
    }
}


loader.style.display = "flex";

async function loadData() {
    try {
        await Promise.all([
            getUsername(),
            getLoansList()
        ]);
        await getBooks();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.style.display = "none";
    }
}

loadData();
