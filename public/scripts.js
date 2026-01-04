/*
 * Updated scripts.js for Modern UI
 * Backend logic preserved.
 */

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');

    // Show loading
    loadingGifElem.style.display = 'inline-block';
    statusElem.textContent = "Connecting...";

    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';

    response.text()
        .then((text) => {
            statusElem.textContent = text === "connected" ? "Online" : "Offline";
            statusElem.style.color = text === "connected" ? "#2e7d32" : "#dc2626";
        })
        .catch((error) => {
            statusElem.textContent = 'Connection Error';
            statusElem.style.color = "#dc2626";
        });
}

// set up
async function setupDatabase() {
    const msg = document.getElementById("setupDatabaseMsg");
    msg.textContent = "Processing...";
    msg.style.color = "blue";

    const response = await fetch("/setup-database", {
        method: "POST"
    });

    const result = await response.json();
    if (result.success) {
        msg.textContent = "Database Initialized Successfully";
        msg.style.color = "green";
    } else {
        msg.textContent = "Error: " + result.error;
        msg.style.color = "red";
    }
}

// Insert Follow
async function insertFollow(event) {
    event.preventDefault();

    const usrId = document.getElementById("followUsrId").value;
    const mid = document.getElementById("followMid").value;
    const isActive = document.getElementById("followIsActive").value;
    const msgDiv = document.getElementById("insertFollowResult");

    const res = await fetch("/insert-follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usrId, mid, isActive })
    });

    const json = await res.json();
    if (json.success) {
        msgDiv.textContent = "Success: Follow relationship created.";
        msgDiv.style.color = "green";
        const table = document.getElementById("followTable");
        const tbody = table.querySelector("tbody");
    
        const res2 = await fetch("/get-all-follow");
        const json2 = await res2.json();
    
        if (json2.success) {
            tbody.innerHTML = "";
            json2.rows.forEach(row => {
                const tr = document.createElement("tr");
                row.forEach(val => {
                    const td = document.createElement("td");
                    td.textContent = val;
                    tr.appendChild(td);
                });
                tbody.appendChild(tr);
            });
            table.style.display = "table";
        }
    } else {
        msgDiv.textContent = "Error: " + (json.message || "Insert failed.");
        msgDiv.style.color = "red";
    }
}

// Helper for update
async function loadRecipeList() {
    const res = await fetch("/fetch-recipes");
    const json = await res.json();

    const dropdown = document.getElementById("recipeSelect");
    dropdown.innerHTML = "";

    if (!json.success) {
        const opt = document.createElement("option");
        opt.textContent = "Error loading recipes";
        dropdown.appendChild(opt);
        return;
    }

    json.rows.forEach((row) => {
        // row: [id, name, difficulty, usrid]
        const opt = document.createElement("option");
        opt.value = row[0];
        opt.textContent = `${row[0]} - ${row[1]} (Diff: ${row[2]})`;
        dropdown.appendChild(opt);
    });
}

// Update Recipe
async function updateRecipe(event) {
    event.preventDefault();

    const id = document.getElementById("recipeSelect").value;
    const name = document.getElementById("updateRecipeName").value;
    const difficulty = document.getElementById("updateRecipeDifficulty").value;
    const usrid = document.getElementById("updateRecipeUsrId").value;
    const msgDiv = document.getElementById("updateRecipeResult");

    // Frontend validation
    if (difficulty !== "") {
        const validSet = ["easy", "medium", "hard"];
        if (!isNaN(difficulty)) {
            msgDiv.textContent = "Difficulty cannot be a number.";
            return;
        }
        if (!validSet.includes(difficulty.toLowerCase())) {
            msgDiv.textContent = "Difficulty must be: Easy, Medium, or Hard.";
            return;
        }
    }

    const res = await fetch("/update-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name, difficulty, usrid })
    });

    const json = await res.json();
    if (json.success) {
        msgDiv.textContent = "Recipe updated successfully.";
        msgDiv.style.color = "green";
        loadRecipeList();
    } else {
        msgDiv.textContent = json.message || "Update failed.";
        msgDiv.style.color = "red";
    }
}

// Delete Meal Plan
async function deleteMealPlan() {
    const id = document.getElementById("deleteMealPlanId").value;
    const msgDiv = document.getElementById("deleteMealPlanResult");

    if (!id) {
        msgDiv.textContent = "Please enter a Meal Plan ID.";
        return;
    }

    const res = await fetch("/delete-mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    const json = await res.json();
    if (!json.success) {
        msgDiv.textContent = "Meal plan not found or delete failed.";
        msgDiv.style.color = "red";
        return;
    }

    msgDiv.textContent = "Meal plan deleted successfully.";
    msgDiv.style.color = "green";

    // Refresh Table
    const tableRes = await fetch("/get-all-mealplans");
    const tableJson = await tableRes.json();
    const table = document.getElementById("mealPlanTable");
    const tbody = table.querySelector("tbody");
    tbody.innerHTML = "";

    if (tableJson.success && tableJson.rows.length > 0) {
        tableJson.rows.forEach(r => {
            const tr = document.createElement("tr");
            r.forEach(val => {
                const td = document.createElement("td");
                td.textContent = val;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.style.display = "table";
    }
}

// Query 4: Search Recipes
async function searchRecipes(event) {
    event.preventDefault();

    const difficulty = document.getElementById('searchDifficulty').value;
    const logic = document.getElementById('searchLogic').value;
    const servingTemp = document.getElementById('searchServingTemp').value;
    const logic2 = document.getElementById('searchLogic2').value;
    const userID = document.getElementById('UserID').value;

    if (!difficulty && !servingTemp && !userID) {
        document.getElementById('searchRecipesResultMsg').textContent = "Please select at least one criterion.";
        return;
    }

    const response = await fetch('/search-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ difficulty, logic, servingTemp, logic2, userID })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('searchRecipesResultMsg');
    const tableElement = document.getElementById('searchRecipesTable');
    const tableBody = tableElement.querySelector('tbody');

    if (responseData.success) {
        messageElement.textContent = `Found ${responseData.data.length} recipe(s).`;
        tableBody.innerHTML = '';
        
        if (responseData.data.length > 0) {
            tableElement.style.display = 'table';
            responseData.data.forEach(recipe => {
                const row = tableBody.insertRow();
                recipe.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
        } else {
            tableElement.style.display = 'none';
        }
    } else {
        messageElement.textContent = "Error searching recipes!";
    }
}

// Load users for Search
async function loadUsersForSearch() {
    const response = await fetch('/get-all-users', { method: 'GET' });
    const responseData = await response.json();
    const userSelect = document.getElementById('UserID');

    if (responseData.success) {
        responseData.data.forEach(user => {
            const option = document.createElement('option');
            option.value = user[0]; 
            option.textContent = `${user[0]} - ${user[1]}`;
            userSelect.appendChild(option);
        });
    }
}

// Query 5: Projection
async function viewUsersProjection(event) {
    event.preventDefault();
    const checkboxes = document.querySelectorAll('input[name="projCol"]:checked');
    const columns = Array.from(checkboxes).map(cb => cb.value);
    const messageElement = document.getElementById('projectionResultMsg');
    
    if (columns.length === 0) {
        messageElement.textContent = "Select at least one column.";
        return;
    }

    const response = await fetch('/project-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columns: columns })
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = `Displaying ${responseData.data.length} user(s)`;
        const tableElement = document.getElementById('projectionTable');
        const tableHead = document.getElementById('projectionTableHead');
        const tableBody = document.getElementById('projectionTableBody');
        
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        if (responseData.data.length > 0) {
            tableElement.style.display = 'table';
            const headerRow = document.createElement('tr');
            columns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col.toUpperCase();
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);
            
            responseData.data.forEach(row => {
                const dataRow = tableBody.insertRow();
                row.forEach(field => {
                    const cell = dataRow.insertCell();
                    cell.textContent = field;
                });
            });
        }
    }
}

// Query 6: Load ingredients
async function loadIngredients() {
    const response = await fetch('/get-all-ingredients', { method: 'GET' });
    const responseData = await response.json();
    const dropdown = document.getElementById('ingredientDropdown');
    
    if (responseData.success && responseData.data.length > 0) {
        responseData.data.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient[0];
            option.textContent = ingredient[0];
            dropdown.appendChild(option);
        });
    }
}

// Query 6: Find Recipes
async function findRecipesByIngredient(event) {
    event.preventDefault();
    const ingredientName = document.getElementById('ingredientDropdown').value;
    
    if (!ingredientName) {
        document.getElementById('joinRecipesResultMsg').textContent = "Select an ingredient.";
        return;
    }

    const response = await fetch(`/recipes-by-ingredient?ingredient=${encodeURIComponent(ingredientName)}`, {
        method: 'GET'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('joinRecipesResultMsg');
    const tableElement = document.getElementById('joinRecipesTable');
    const tableBody = tableElement.querySelector('tbody');

    if (responseData.success) {
        messageElement.textContent = `Found ${responseData.data.length} recipe(s).`;
        tableBody.innerHTML = '';
        if (responseData.data.length > 0) {
            tableElement.style.display = 'table';
            responseData.data.forEach(recipe => {
                const row = tableBody.insertRow();
                recipe.forEach((field, index) => {
                    const cell = row.insertCell(index);
                    cell.textContent = field;
                });
            });
        }
    }
}

// Query 7: Sum times
const sumRecipeTimes = async () => {
    const response = await fetch('/sum-recipe-times', { method: 'GET' })
    const responseJson = await response.json();
    const tableBody = document.querySelector('#sumRecipeTimesTable tbody');

    if (tableBody) tableBody.innerHTML = '';

    if (responseJson.success) {
        responseJson.data.forEach((recipe) => {
            const row = tableBody.insertRow()
            recipe.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    }
}

// Query 8: Filter count
const recipeIngredientCountFilter = async (event) => {
    event.preventDefault();
    const maxIngredients = +document.getElementById('maxRecipeIngredientCount').value
    
    if (!maxIngredients || maxIngredients < 1) {
        alert("Please enter a valid number > 0");
        return;
    }

    const response = await fetch(`/recipe-ingredient-count-filter?maxIngredients=${maxIngredients}`, { method: 'GET' });
    const responseJson = await response.json();
    const tableBody = document.querySelector('#recipeIngredientCountTable tbody');

    if (tableBody) tableBody.innerHTML = '';

    if (responseJson.success) {
        responseJson.data.forEach((res) => {
            const row = tableBody.insertRow()
            res.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    }
}

// Query 9: Average
const belowAverageRecipeCountMealPlans = async () => {
    const response = await fetch('/below-average-recipe-count-meal-plans', { method: 'GET' })
    const responseJson = await response.json();
    const tableBody = document.querySelector('#belowAverageRecipeCountMealPlansTable tbody');

    if (tableBody) tableBody.innerHTML = '';

    if (responseJson.success) {
        responseJson.data.forEach((recipe) => {
            const row = tableBody.insertRow()
            recipe.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    }
}

// Query 10: Division
async function runDivisionQuery() {
    const res = await fetch("/division-users-following-all-mealplans");
    const json = await res.json();
    const tbody = document.querySelector("#divisionTable tbody");
    const msgDiv = document.getElementById("divisionResultMsg");

    tbody.innerHTML = "";
    if (!json.success) {
        msgDiv.textContent = "Error running query.";
        return;
    }
    if (json.rows.length === 0) {
        msgDiv.textContent = "No active users found following all plans.";
        return;
    }
    json.rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((val) => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    msgDiv.textContent = "Query Successful";
}

/* UI Logic for Sidebar and Tabs */
function showTab(id) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(div => {
        div.classList.remove('active');
    });

    // Show selected tab
    const selectedTab = document.getElementById(id);
    if(selectedTab) selectedTab.classList.add('active');

    // Update Sidebar active state
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        // Simple check: if the button onclick contains the ID
        if(btn.getAttribute('onclick').includes(id)) {
            btn.classList.add('active');
        }
    });

    // Update Header Title based on ID
    const titles = {
        'dashboard-view': 'Dashboard',
        'q1': 'User Management',
        'q2': 'Recipe Editor',
        'q3': 'Meal Plans',
        'q4': 'Search',
        'q5': 'Directory',
        'q6': 'Ingredients',
        'analytics-view': 'Analytics & Reports'
    };
    document.getElementById('page-title').textContent = titles[id] || 'NutriPlan';
}

// Initialize
window.onload = function () {
    // Start on Dashboard instead of Q1
    showTab('dashboard-view');
    checkDbConnection();
    loadUsersForSearch();
    loadIngredients();

    // Event Listeners
    document.getElementById("sumRecipeTimes").addEventListener("click", sumRecipeTimes);
    document.getElementById("recipeIngredientCountFilter").addEventListener("submit", recipeIngredientCountFilter);
    document.getElementById("belowAverageRecipeCountMealPlans").addEventListener("click", belowAverageRecipeCountMealPlans);
    document.getElementById("insertFollowForm").addEventListener("submit", insertFollow);
    document.getElementById("updateRecipeForm").addEventListener("submit", updateRecipe);
    document.getElementById("deleteMealPlanBtn").addEventListener("click", deleteMealPlan);
    document.getElementById("divisionBtn").addEventListener("click", runDivisionQuery);
    document.getElementById("setupDatabase").addEventListener("click", setupDatabase);
    document.getElementById("searchRecipesForm").addEventListener("submit", searchRecipes);
    document.getElementById("projectionForm").addEventListener("submit", viewUsersProjection);
    document.getElementById("joinRecipesForm").addEventListener("submit", findRecipesByIngredient);
    
    loadRecipeList();
};