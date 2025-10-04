// Initial quotes array
const quotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
  { text: "Life is what happens when you’re busy making other plans.", category: "Life" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" }
];

// Get DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

// Function to show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.textContent = "No quotes available. Add one!";
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear old content
  quoteDisplay.innerHTML = "";

  // Create new elements dynamically
  const quoteText = document.createElement("p");
  quoteText.textContent = `"${quote.text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = ` — ${quote.category}`;
  quoteCategory.style.fontStyle = "italic";
  quoteCategory.style.color = "gray";

  // Append to DOM
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
}

// Function to add a new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const text = textInput.value.trim();
  const category = categoryInput.value.trim() || "Uncategorized";

  if (text === "") {
    alert("Please enter a quote!");
    return;
  }

  // Add new quote to array
  quotes.push({ text, category });

  // Clear form inputs
  textInput.value = "";
  categoryInput.value = "";

  // Show confirmation
  alert("New quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Show one quote on load
showRandomQuote();
