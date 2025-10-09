import { apiFetch, getCookie } from "./utils/api.js";

const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");

const userName = document.getElementById("userName");
const loader = document.getElementById("loader");
const title = document.getElementById("title");
const status = document.getElementById("status");
const author = document.getElementById("author");
const isbn = document.getElementById("isbn");
const categoryName = document.getElementById("categoryName");
const publicationYear = document.getElementById("publicationYear");
const availableCopies = document.getElementById("availableCopies");
const description = document.getElementById("description");
const borrowButton = document.getElementById("borrowButton")

const totalCopies = document.getElementById("totalCopies");
const publisher = document.getElementById("publisher");
const tags = document.getElementById("tags-container");

function isThisBookAlreadyBorrowedByMe(bookID) {
    let loans = JSON.parse(localStorage.getItem("my-loans")) || [];
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
            throw new Error(errorJson.message);
        }

        const data = await response.json();

        userName.textContent = data.data.user.firstName + " " + data.data.user.lastName;

    } catch (error) {
        console.error("Failed to load userName " + error);
        alert("Failed to load userName: " + error.message);
        window.location.href = '../login.html';
    } 
}

async function getBook() {
    try {
        const apiURL = `https://karyar-library-management-system.liara.run/api/books/${bookId}`;
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

        console.log(responseData);

        title.textContent = responseData.title;

        const alreadyBorrowed = isThisBookAlreadyBorrowedByMe(bookId);

        if (alreadyBorrowed) {
            status.innerHTML = `<span class="status status-available">Borrowed</span>`;
            borrowButton.innerHTML = `<button class="btn btn-secondary btn-sm" disabled style="font-size: 1rem;">Borrowed</button>`;
        } else if (responseData.status === "available") {
            status.innerHTML = `<span class="status status-available">Available</span>`;
            borrowButton.innerHTML = `<button class="btn btn-primary btn-sm borrow-btn" style="font-size: 1rem;">Borrow Book</button>`;
        } else {
            status.innerHTML = `<span class="status status-unavailable">Unavailable</span>`;
            borrowButton.innerHTML = `<button class="btn btn-secondary btn-sm" disabled style="font-size: 1rem;">Not Available</button>`;
        }
    
        author.textContent = responseData.author;
        isbn.textContent = responseData.isbn;
        categoryName.textContent = responseData.category || "not specified";
        publicationYear.textContent = responseData.publicationYear;
        description.textContent = responseData.description;

        totalCopies.textContent = responseData.totalCopies;
        availableCopies.textContent = responseData.availableCopies;

        publisher.textContent = responseData.publisher;

        getTags(responseData);

    } catch (error) {
        console.error("Failed to load book: " + error);
        alert("Failed to load book: " + error.message);
        window.location.href = '../books.html';
    } 
}

function getTags(responseData) {
    const tagsContainer = document.getElementById("tags-container");

    console.log(tags)
    responseData.tags.forEach(tag => {
        const tagDiv = document.createElement("div");
        tagDiv.classList.add("status"); 
        tagDiv.classList.add("tag"); 
        tagDiv.style.fontSize = "0.8rem";
        tagDiv.textContent = "#" + tag;
        tagsContainer.appendChild(tagDiv);
    });
}


async function getDatas() { 
    loader.style.display = "flex"; 

    try {
        await getUsername();

        if (!bookId || isNaN(bookId)) {
            window.location.href = "../notfound.html";
            return;
        }

        await getBook();
    } catch (error) {
        console.error("Error loading data:", error);
        window.location.href = "../notfound.html";
    } finally {
        loader.style.display = "none"; 
    }
}


getDatas();