
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

// Server URL - Using JSONPlaceholder for simulation
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Auto-sync interval ID
let syncInterval = null;

// Function to show notification
function showNotification(message, type = 'info') {
  const syncStatus = document.getElementById('syncStatus');
  syncStatus.textContent = message;
  syncStatus.className = type;
  syncStatus.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    syncStatus.style.display = 'none';
  }, 5000);
}

// Function to fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverData = await response.json();
    
    // Transform server data to quotes format
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: post.id % 2 === 0 ? 'Server' : 'API'
    }));
    
    return serverQuotes;
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    showNotification('Failed to fetch quotes from server.', 'error');
    return [];
  }
}

// Function to post quotes to the server
async function postQuotesToServer(quotesToPost) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(quotesToPost)
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error posting quotes to server:', error);
    throw error;
  }
}

// Function to sync quotes with server
async function syncQuotes() {
  try {
    showNotification('Syncing with server...', 'info');
    
    // Fetch quotes from server
    const serverQuotes = await fetchQuotesFromServer();
    
    if (serverQuotes.length === 0) {
      showNotification('No data received from server.', 'warning');
      return;
    }
    
    // Check for conflicts and resolve
    const conflicts = resolveConflicts(serverQuotes);
    
    // Update local storage with synced data
    saveQuotes();
    
    // Update UI
    populateCategories();
    filterQuotes();
    
    if (conflicts.length > 0) {
      showNotification(`Synced successfully! ${conflicts.length} conflict(s) resolved (server data took precedence).`, 'warning');
    } else {
      showNotification('Synced successfully! No conflicts detected.', 'success');
    }
    
  } catch (error) {
    console.error('Sync error:', error);
    showNotification('Failed to sync with server. Check your connection.', 'error');
  }
}

// Function to resolve conflicts between local and server data
function resolveConflicts(serverQuotes) {
  const conflicts = [];
  
  // Strategy: Server data takes precedence
  // Check if server quotes already exist locally
  serverQuotes.forEach(serverQuote => {
    const existingIndex = quotes.findIndex(q => 
      q.text.toLowerCase() === serverQuote.text.toLowerCase()
    );
    
    if (existingIndex !== -1) {
      // Conflict detected: same text but possibly different category
      if (quotes[existingIndex].category !== serverQuote.category) {
        conflicts.push({
          local: quotes[existingIndex],
          server: serverQuote
        });
        // Server takes precedence
        quotes[existingIndex] = serverQuote;
      }
    } else {
      // New quote from server, add it
      quotes.push(serverQuote);
    }
  });
  
  return conflicts;
}

// Function to post local quotes to server (wrapper for UI button)
async function postQuotesToServerUI() {
  try {
    showNotification('Posting quotes to server...', 'info');
    
    const result = await postQuotesToServer(quotes);
    showNotification('Quotes posted to server successfully!', 'success');
    console.log('Server response:', result);
    
  } catch (error) {
    console.error('Post error:', error);
    showNotification('Failed to post quotes to server.', 'error');
  }
}

// Function to toggle auto-sync
function toggleAutoSync() {
  const autoSyncToggle = document.getElementById('autoSyncToggle');
  
  if (autoSyncToggle.checked) {
    // Start auto-sync every 30 seconds
    syncInterval = setInterval(syncQuotes, 30000);
    showNotification('Auto-sync enabled (every 30 seconds)', 'success');
  } else {
    // Stop auto-sync
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    showNotification('Auto-sync disabled', 'info');
  }
}

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

// Function to populate categories in the dropdown
function populateCategories() {
  const categoryFilter = document.getElementById('categoryFilter');
  
  // Get unique categories from quotes array
  const categories = [...new Set(quotes.map(quote => quote.category))];
  
  // Clear existing options except "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  
  // Add each unique category as an option
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
  
  // Restore last selected category from local storage
  const lastSelectedCategory = localStorage.getItem('selectedCategory');
  if (lastSelectedCategory) {
    categoryFilter.value = lastSelectedCategory;
  }
}

// Function to filter quotes based on selected category
function filterQuotes() {
  const categoryFilter = document.getElementById('categoryFilter');
  const selectedCategory = categoryFilter.value;
  
  // Save selected category to local storage
  localStorage.setItem('selectedCategory', selectedCategory);
  
  // Get quotes based on selected category
  let filteredQuotes;
  if (selectedCategory === 'all') {
    filteredQuotes = quotes;
  } else {
    filteredQuotes = quotes.filter(quote => quote.category === selectedCategory);
  }
  
  // Display a random quote from filtered quotes
  if (filteredQuotes.length > 0) {
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    const randomQuote = filteredQuotes[randomIndex];
    displayQuote(randomQuote);
  } else {
    const quoteDisplay = document.getElementById('quoteDisplay');
    quoteDisplay.innerHTML = '<p>No quotes available for this category.</p>';
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
  quoteText.style.fontSize = '18px';
  quoteText.style.fontWeight = 'bold';
  quoteText.style.marginBottom = '10px';
  
  // Create paragraph element for quote category
  const quoteCategory = document.createElement('p');
  quoteCategory.textContent = `Category: ${quote.category}`;
  quoteCategory.style.color = '#666';
  quoteCategory.style.fontStyle = 'italic';
  
  // Append elements to quoteDisplay
  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);
  
  // Store last viewed quote in session storage
  sessionStorage.setItem('lastViewedQuote', JSON.stringify(quote));
}

// Function to display a random quote
function showRandomQuote() {
  // Use the filter function to show quotes based on current filter
  filterQuotes();
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
  
  // Update categories dropdown (in case new category was added)
  populateCategories();
  
  // Clear input fields
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  
  // Display the newly added quote
  displayQuote(newQuote);
  
  showNotification('Quote added successfully!', 'success');
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
      
      // Update categories dropdown with new categories
      populateCategories();
      
      showNotification('Quotes imported successfully!', 'success');
      
      // Show a random quote from the imported quotes
      showRandomQuote();
    } catch (error) {
      alert('Error parsing JSON file. Please ensure the file is valid JSON.');
      console.error('Import error:', error);
    }
  };
  
  fileReader.readAsText(event.target.files[0]);
}

// Initialize the application
function initializeApp() {
  // Load quotes from local storage
  loadQuotes();
  
  // Populate categories dropdown
  populateCategories();
  
  // Restore last viewed quote from session storage or show random quote
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    try {
      const quote = JSON.parse(lastViewedQuote);
      displayQuote(quote);
    } catch (error) {
      console.error('Error loading last viewed quote:', error);
      // Show a random quote based on current filter
      filterQuotes();
    }
  } else {
    // Show a random quote based on current filter
    filterQuotes();
  }
  
  // Start auto-sync if enabled
  const autoSyncToggle = document.getElementById('autoSyncToggle');
  if (autoSyncToggle.checked) {
    syncInterval = setInterval(syncQuotes, 30000);
  }
  
  // Perform initial sync
  syncQuotes();
}

// Event listener for the "Show New Quote" button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Event listener for the "Add Quote" button
document.getElementById('addQuoteBtn').addEventListener('click', addQuote);

// Initialize the application
initializeApp();
