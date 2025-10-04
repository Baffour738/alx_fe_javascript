// Array of quote objects with text and category
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Motivation" },
  { text: "Innovation distinguishes between a leader and a follower.", category: "Leadership" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Motivation" },
  { text: "Be yourself; everyone else is already taken.", category: "Life" },
  { text: "The best way to predict the future is to create it.", category: "Leadership" },
  { text: "Believe you can and you're halfway there.", category: "Inspiration" }
];

// Function to load quotes from local storage
function loadQuotes() {
  const storedQuotes = localStorage.getItem('quotes');
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Function to save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to populate categories dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // If categoryFilter doesn't exist, return
  if (!categoryFilter) return;
  
  // Get unique categories from quotes
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add category options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected category from session storage
  const lastCategory = sessionStorage.getItem('lastCategory');
  if (lastCategory) {
    categoryFilter.value = lastCategory;
  }
}

// Function to filter quotes by category
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
  
  // Save selected category to session storage
  sessionStorage.setItem('lastCategory', selectedCategory);
  
  // Filter quotes based on selected category
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(quote => quote.category === selectedCategory);
  
  // Display a random quote from filtered quotes
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    displayQuote(randomQuote);
  } else {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '<p>No quotes available in this category.</p>';
  }
}

// Function to display a quote
function displayQuote(quote) {
  const quoteDisplay = document.getElementById('quoteDisplay');
  
  // Clear existing content
  quoteDisplay.innerHTML = '';
  
  // Create paragraph element for quote text
  const quoteText = document.createElement('p');
  quoteText.textContent = quote.text;
  
  // Create paragraph element for quote category
  const quoteCategory = document.createElement('p');
  quoteCategory.textContent = `Category: ${quote.category}`;
  
  // Append elements to quoteDisplay
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to display a random quote
function showRandomQuote() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  if (categoryFilter) {
    // If category filter exists, use filterQuotes function
    filterQuotes();
  } else {
    // Otherwise, show random quote from all quotes
    if (quotes.length > 0) {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];
      displayQuote(randomQuote);
    } else {
      const quoteDisplay = document.getElementById('quoteDisplay');
      quoteDisplay.innerHTML = '<p>No quotes available.</p>';
    }
  }
}

// Function to create the add quote form
function createAddQuoteForm() {
  const formContainer = document.createElement('div');
  formContainer.id = 'quoteFormContainer';
  
  // Create input for quote text
  const quoteInput = document.createElement('input');
  quoteInput.id = 'newQuoteText';
  quoteInput.type = 'text';
  quoteInput.placeholder = 'Enter a new quote';
  
  // Create input for quote category
  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';
  
  // Create add quote button
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;
  
  // Append elements to form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
  
  // Append form to body (after the newQuote button)
  document.body.appendChild(formContainer);
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value.trim();
  const newQuoteCategory = document.getElementById('newQuoteCategory').value.trim();
  
  // Validate that both fields have values
  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both quote text and category');
    return;
  }
  
  // Create new quote object
  const newQuote = {
    text: newQuoteText,
    category: newQuoteCategory
  };
  
  // Add new quote to the quotes array
  quotes.push(newQuote);
  
  // Save quotes to local storage
  saveQuotes();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Update categories dropdown if it exists
  populateCategories();
  
  // Display the newly added quote
  displayQuote(newQuote);
  
  alert('Quote added successfully!');
}

// Function to export quotes to JSON file
function exportToJsonFile() {
  // Convert quotes array to JSON string
  const dataStr = JSON.stringify(quotes, null, 2);
  
  // Create a Blob from the JSON string
  const blob = new Blob([dataStr], { type: 'application/json' });
  
  // Create a download link
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = 'quotes.json';
  
  // Append to body, trigger download, then remove
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      
      // Validate that imported data is an array
      if (!Array.isArray(importedQuotes)) {
        alert('Invalid JSON format. Expected an array of quotes.');
        return;
      }
      
      // Validate each quote has required properties
      const isValid = importedQuotes.every(quote => 
        quote.hasOwnProperty('text') && quote.hasOwnProperty('category')
      );
      
      if (!isValid) {
        alert('Invalid quote format. Each quote must have "text" and "category" properties.');
        return;
      }
      
      // Add imported quotes to existing quotes
      quotes.push(...importedQuotes);
      
      // Save updated quotes to local storage
      saveQuotes();
      
      // Update categories dropdown if it exists
      populateCategories();
      
      alert('Quotes imported successfully!');
      
      // Show a random quote from the imported quotes
      showRandomQuote();
    } catch (error) {
      alert('Error parsing JSON file. Please ensure the file is valid JSON.');
      console.error('Import error:', error);
    }
  };
  
  fileReader.readAsText(event.target.files[0]);
}

// Function to create export button
function createExportButton() {
  const exportButton = document.createElement('button');
  exportButton.textContent = 'Export Quotes';
  exportButton.id = 'exportQuotes';
  exportButton.onclick = exportToJsonFile;
  document.body.appendChild(exportButton);
}

// Function to create import file input
function createImportFileInput() {
  const importInput = document.createElement('input');
  importInput.type = 'file';
  importInput.id = 'importFile';
  importInput.accept = '.json';
  importInput.onchange = importFromJsonFile;
  document.body.appendChild(importInput);
}

// Initialize the application
function initializeApp() {
  // Load quotes from local storage
  loadQuotes();
  
  // Populate categories if categoryFilter exists
  populateCategories();
  
  // Restore last viewed quote from session storage
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    try {
      const quote = JSON.parse(lastViewedQuote);
      displayQuote(quote);
    } catch (error) {
      console.error('Error loading last viewed quote:', error);
      showRandomQuote();
    }
  } else {
    // Show a random quote on initial load
    showRandomQuote();
  }
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Add event listener for category filter if it exists
const categoryFilter = document.getElementById('categoryFilter');
if (categoryFilter) {
  categoryFilter.addEventListener('change', filterQuotes);
}

// Create the add quote form when the page loads
createAddQuoteForm();

// Create export button
createExportButton();

// Create import file input
createImportFileInput();

// Initialize the application
initializeApp();
