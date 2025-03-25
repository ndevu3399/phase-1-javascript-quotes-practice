document.addEventListener("DOMContentLoaded", () => {
    const quoteList = document.getElementById("quote-list");
    const form = document.getElementById("new-quote-form");
    const sortButton = document.getElementById("sort-button");
    let quotes = [];
    let sorted = false;
  
    // Fetch quotes and render them
    function fetchQuotes() {
      fetch("http://localhost:3000/quotes?_embed=likes")
        .then(res => res.json())
        .then(data => {
          quotes = data;
          renderQuotes();
        });
    }
  
    function renderQuotes() {
      quoteList.innerHTML = "";
      const displayQuotes = sorted ? [...quotes].sort((a, b) => a.author.localeCompare(b.author)) : quotes;
      displayQuotes.forEach(quote => addQuoteToDOM(quote));
    }
  
    function addQuoteToDOM(quote) {
      const li = document.createElement("li");
      li.classList.add("quote-card");
      li.innerHTML = `
        <blockquote class="blockquote">
          <p class="mb-0">${quote.quote}</p>
          <footer class="blockquote-footer">${quote.author}</footer>
          <br>
          <button class='btn-success'>Likes: <span>${quote.likes.length}</span></button>
          <button class='btn-danger'>Delete</button>
          <button class='btn-edit'>Edit</button>
        </blockquote>
      `;
  
      const likeBtn = li.querySelector(".btn-success");
      likeBtn.addEventListener("click", () => likeQuote(quote, likeBtn));
  
      const deleteBtn = li.querySelector(".btn-danger");
      deleteBtn.addEventListener("click", () => deleteQuote(quote.id, li));
  
      const editBtn = li.querySelector(".btn-edit");
      editBtn.addEventListener("click", () => editQuote(quote, li));
  
      quoteList.appendChild(li);
    }
  
    function likeQuote(quote, likeBtn) {
      fetch("http://localhost:3000/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId: quote.id })
      })
      .then(() => {
        quote.likes.push({ quoteId: quote.id });
        likeBtn.querySelector("span").textContent = quote.likes.length;
      });
    }
  
    function deleteQuote(id, li) {
      fetch(`http://localhost:3000/quotes/${id}`, { method: "DELETE" })
      .then(() => li.remove());
    }
  
    function editQuote(quote, li) {
      const editForm = document.createElement("form");
      editForm.innerHTML = `
        <input type="text" value="${quote.quote}" id="edit-quote">
        <input type="text" value="${quote.author}" id="edit-author">
        <button type="submit">Save</button>
      `;
      li.appendChild(editForm);
      
      editForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const updatedQuote = document.getElementById("edit-quote").value;
        const updatedAuthor = document.getElementById("edit-author").value;
        
        fetch(`http://localhost:3000/quotes/${quote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quote: updatedQuote, author: updatedAuthor })
        })
        .then(() => {
          quote.quote = updatedQuote;
          quote.author = updatedAuthor;
          renderQuotes();
        });
      });
    }
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const newQuote = document.getElementById("new-quote").value;
      const newAuthor = document.getElementById("author").value;
      
      fetch("http://localhost:3000/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quote: newQuote, author: newAuthor, likes: [] })
      })
      .then(res => res.json())
      .then(quote => {
        quotes.push(quote);
        addQuoteToDOM(quote);
        form.reset();
      });
    });
  
    sortButton.addEventListener("click", () => {
      sorted = !sorted;
      renderQuotes();
    });
  
    fetchQuotes();
  });