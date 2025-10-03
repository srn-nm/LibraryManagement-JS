const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const booksGrid = document.getElementById("books-grid");

const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        document.cookie = "token=; path=/; max-age=0";
        localStorage.clear();
        window.location.href = "login.html";
    });
}

function setCache(key, data, ttlMs) {
    const record = {
        data: data,
        timestamp: new Date().getTime(),
        ttl: ttlMs
    };
    localStorage.setItem(key, JSON.stringify(record));
}

function getCache(key) {
    const record = JSON.parse(localStorage.getItem(key));
    if (!record) return null;

    const now = new Date().getTime();
    if (now - record.timestamp > record.ttl) {
        localStorage.removeItem(key);
        return null;
    }
    return record.data;
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) return decodeURIComponent(value);
    }
    return null;
}

async function getLoansList() {
    try {
        let responseData = getCache("my-loans");
        if (!responseData) {
            const apiURL = `https://karyar-library-management-system.liara.run/api/loans/my-loans`;
            const response = await fetch(apiURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getCookie("token")
                }
            });

            responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message);
            }

            setCache("my-loans", responseData.data, 5 * 60 * 1000);
        }
        localStorage.setItem("my-loans", JSON.stringify(responseData));
    } catch (error) {
        console.error("Failed to load Loans list: " + error);
        alert("Failed to load Loans list: " + error.message);
        window.location.href = '../dashboard.html';
    }
}

function isThisBookAlreadyBorrowedByMe(bookID) {
    let loans = JSON.parse(localStorage.getItem("my-loans"));
    return loans.some(loan => loan.book.id === bookID && loan.status === "active");
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
            throw new Error(errorJson.message || 'Authentication failed');
        }

        const responseData = await response.json();

        userName.textContent = responseData.data.user.firstName + " " + responseData.data.user.lastName;
        localStorage.setItem("userID", responseData.data.user.id);

    } catch (error) {
        console.error("Failed to load Username: " + error);
        alert("Failed to load Username: " + error.message);
        window.location.href = '../dashboard.html';
    }
}

async function getBooks() {
    try {
        let responseData = getCache("books-list");
        if (!responseData) {
            const apiURL = `https://karyar-library-management-system.liara.run/api/books`;
            const response = await fetch(apiURL, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getCookie("token")
                }
            });

            responseData = await response.json();
            if (!response.ok) {
                throw new Error(responseData.message || 'Getting Books List failed');
            }

            setCache("books-list", responseData, 5 * 60 * 1000);
        }

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
                    ${book.status === "available" 
                        ? isThisBookAlreadyBorrowedByMe(book.id)
                            ? `<button class="btn btn-secondary btn-sm">Borrowed</button>` 
                            : `<button class="btn btn-primary btn-sm borrow-btn">Borrow Book</button>` 
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
        alert("Failed to load books list: " + error.message);
        window.location.href = '../dashboard.html';
    }
}

async function borrowBook(userID, bookID) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const isoString = futureDate.toISOString();

    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/loans`;
        const response = await fetch(apiURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("token")
            },
            body: JSON.stringify({
                "bookId": bookID,
                "userId": userID,
                "loanPeriod": 14,
                "dueDate": isoString
            }),
        });

        if (!response.ok) {
            const errorJson = await response.json();
            throw new Error(errorJson.message || 'Authentication failed');
        }

        const responseData = await response.json();
        alert("Loaning Successful!");

        const borrowBtn = document.getElementById(bookID).querySelector(".borrow-btn");
        borrowBtn.textContent = "Borrowed";
        borrowBtn.disabled = true;
        borrowBtn.classList.remove("btn-primary");
        borrowBtn.classList.add("btn-secondary");

        let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
        loans.push(responseData.loan);
        localStorage.setItem("my-loans", JSON.stringify(loans));

        setCache("my-loans", loans, 5 * 60 * 1000);

    } catch (error) {
        console.error("Failed to borrow book: " + error);
        alert("Failed to borrow book: " + error.message);
        window.location.href = '../dashboard.html';
    }
}

async function getDatas() { 
    loader.style.display = "flex"; 
    try {
        await getUsername();
        await getLoansList();
        await getBooks();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.style.display = "none"; 
    }
}

getDatas();