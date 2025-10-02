const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const booksGrid = document.getElementById("books-grid");

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
            throw new Error(errorJson.message || 'Authentication failed');
        }

        const responseData = await response.json();

        userName.textContent = responseData.data.user.firstName + " " + responseData.data.user.lastName;

        console.log(responseData);
        
    } catch (error) {
        console.error("Failed to load Username: " + error);
        alert("Failed to load Username: " + error.message);
        window.location.href = '../dashboard.html';
    } 
}

async function getBooks() {
    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/books`;
        const response = await fetch(apiURL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + getCookie("token")
            }
        });

        const responseData = await response.json();
        if (!response.ok) {
            throw new Error(responseData.message || 'Getting Books List failed');
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

            const borrowBtn = card.querySelector(".borrow-btn");
            viewBtn.addEventListener("click", () => {
                borrowBook(book.id)
            });

        });

        console.log(responseData);

    } catch (error) {
        console.error("Failed to load books list: " + error);
        alert("Failed to load books list: " + error.message);
        window.location.href = '../dashboard.html';
    } 
}

async function borrowBook(id) {
    
}

async function getDatas() { 
    loader.style.display = "flex"; 

    try {
        await getUsername();
        await getBooks();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.style.display = "none"; 
    }
}

getDatas();
