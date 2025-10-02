const params = new URLSearchParams(window.location.search);
const bookId = params.get("id");
console.log(bookId);

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

const totalCopies = document.getElementById("totalCopies");
const borrowedCopies = document.getElementById("borrowedCopies");
const coverImage = document.getElementById("coverImage");
const publisher = document.getElementById("publisher");
const tags = document.getElementById("tags");

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

        const data = await response.json();

        userName.textContent = data.data.user.firstName + " " + data.data.user.lastName;

        console.log(data);
        
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

        title.textContent = responseData.book.title;
        status.textContent = responseData.book.status;
        author.textContent = responseData.book.author;
        isbn.textContent = responseData.book.isbn;
        categoryName.textContent = responseData.book.categoryName;
        publicationYear.textContent = responseData.book.publicationYear;
        description.textContent = responseData.book.description;

        totalCopies.textContent = responseData.book.totalCopies;
        availableCopies.textContent = responseData.book.availableCopies;
        borrowedCopies.textContent = responseData.book.borrowedCopies;

        coverImage.textContent = responseData.book.coverImage;
        publisher.textContent = responseData.book.publisher;
        tags.textContent = responseData.book.tags;


        console.log(responseData);

    } catch (error) {
        console.error("Failed to load book: " + error);
        alert("Failed to load book: " + error.message);
        window.location.href = '../books.html';
    } 
}

function getTagsandImage() {
    const tagsContainer = document.getElementById("tags-container");

    tags.forEach(tag => {
        const tagDiv = document.createElement("div");
        tagDiv.classList.add("status"); 
        tagDiv.style.fontSize = "0.8rem";
        tagDiv.textContent = tag;
        tagsContainer.appendChild(tagDiv);
    });

    const imageUrl = coverImage;
    const bookImage = document.getElementById("book-image");
    bookImage.src = imageUrl;
}

async function getDatas() { 
    loader.style.display = "flex"; 

    try {
        await getUsername();
        await getBook();
        getTagsandImage();
    } catch (err) {
        console.error("Error loading data:", err);
    } finally {
        loader.style.display = "none"; 
    }
}

getDatas();
