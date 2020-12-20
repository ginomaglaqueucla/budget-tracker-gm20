let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_fund', { autoIncrement: true });
};
 
request.onsuccess = function(event) {

    db = event.target.result;

    if (navigator.onLine) {
      uploadFund();
    }
  };
  
  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };

function saveRecord(record) {
    const transaction = db.transaction(['new_fund'], 'readwrite');
  
    const budgetObjectStore = transaction.objectStore('new_fund');
  
    budgetObjectStore.add(record);
}

function uploadFund() {
    const transaction = db.transaction(['new_fund'], 'readwrite');
  
    const fundObjectStore = transaction.objectStore('new_fund');
  
    const getAll = fundObjectStore.getAll();
  
    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
        fetch('/api/transaction', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
            Accept: 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
            }
        })
            .then(response => response.json())
            .then(serverResponse => {
            if (serverResponse.message) {
                throw new Error(serverResponse);
            }
            const transaction = db.transaction(['new_fund'], 'readwrite');
            const fundObjectStore = transaction.objectStore('new_fund');
            fundObjectStore.clear();

            alert('All saved funds have been submitted!');
            })
            .catch(err => {
            console.log(err);
            });
        }
    };
}

// listen for app coming back online
window.addEventListener('online', uploadFund);
  