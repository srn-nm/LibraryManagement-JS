import { apiFetch, getCookie } from "./utils/api.js";

const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const booksGrid = document.getElementById("books-grid");
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

async function getLoansList() {
    try {
        const {data} = await apiFetch("/loans/my-loans");
        localStorage.setItem("my-loans", JSON.stringify(data));
    } catch (error) {
        console.error("Failed to load Loans list: " + error);
    }
}

function isThisBookAlreadyBorrowedByMe(bookID) {
    let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
    return loans.some(loan => loan.book.id === bookID && loan.status === "active");
}

async function getUsername() {
    try {
        const {data} = await apiFetch("/auth/me");
        userName.textContent = data.user.firstName + " " + data.user.lastName;
        userAvatar.textContent = data.user.firstName[0].toUpperCase();
        localStorage.setItem("userID", data.user.id);
    } catch (error) {
        console.error("Failed to load Username: " + error);
    } 
}

async function getBooks() {
    try {
        const responseData = await apiFetch("/books");
        booksGrid.innerHTML = ""; 
        responseData.data.forEach(book => {
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
                            ? `<button class="btn btn-primary btn-sm borrow-btn">Borrow Book</button>`
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
                    borrowBook(localStorage.getItem("userID"), book.id)
                });
            }
        });
    } catch (error) {
        console.error("Failed to load books list: " + error);
    } 
}

async function borrowBook(userID, bookID) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isoString = futureDate.toISOString();
    try {
        const {loan} = await apiFetch("/loans", {
            method: "POST",
            body: JSON.stringify({
                "bookId": bookID,
                "userId": userID,
                "loanPeriod": 14,
                "dueDate": isoString
            }),
        });
        const borrowBtn = document.getElementById(bookID).querySelector(".borrow-btn");
        borrowBtn.textContent = "Borrowed";
        borrowBtn.disabled = true;
        borrowBtn.classList.remove("btn-primary");
        borrowBtn.classList.add("btn-secondary");
        let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
        loans.push(loan);
        localStorage.setItem("my-loans", JSON.stringify(loans));
        console.log("book borrowed.")
    } catch (error) {
        console.error("Failed to borrow book: " + error);
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