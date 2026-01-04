/*
 * These functions below are for various webpage functionalities. 
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 * 
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your 
 *   backend endpoints 
 * and 
 *   HTML structure.
 * 
 */

// Navigation between sections
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // If showing hero, load stats
    if (sectionId === 'hero') {
        loadDashboardStats();
    }
}

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        // Total Recipes
        const recipesRes = await fetch('/count-recipes');
        const recipesData = await recipesRes.json();
        if (recipesData.success) {
            document.getElementById('totalRecipes').textContent = recipesData.count;
        }

        // Total Users
        const usersRes = await fetch('/count-users');
        const usersData = await usersRes.json();
        if (usersData.success) {
            document.getElementById('totalUsers').textContent = usersData.count;
        }

        // Total Meal Plans
        const plansRes = await fetch('/count-mealplans');
        const plansData = await plansRes.json();
        if (plansData.success) {
            document.getElementById('totalMealPlans').textContent = plansData.count;
        }

        // Total Ingredients
        const ingredientsRes = await fetch('/count-ingredients');
        const ingredientsData = await ingredientsRes.json();
        if (ingredientsData.success) {
            document.getElementById('totalIngredients').textContent = ingredientsData.count;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    
    // If element doesn't exist, just check connection silently
    if (!statusElem) {
        await fetch('/check-db-connection', { method: "GET" });
        return;
    }

    statusElem.textContent = '';
    
    const response = await fetch('/check-db-connection', {
        method: "GET"
    });

    response.text()
        .then((text) => {
            if (text === 'connected') {
                statusElem.textContent = '✓ Connected';
                statusElem.style.background = '#10b981';
            } else {
                statusElem.textContent = '✗ Disconnected';
                statusElem.style.background = '#ef4444';
            }
        })
        .catch((error) => {
            statusElem.textContent = '✗ Failed';
            statusElem.style.background = '#ef4444';
        });
}


//set up
async function setupDatabase() {
    const msg = document.getElementById("setupDatabaseMsg");
    msg.textContent = "Running setup...";

    const response = await fetch("/setup-database", {
        method: "POST"
    });

    const result = await response.json();
    if (result.success) {
        msg.textContent = "Database successfully created and populated!";
    } else {
        msg.textContent = "Error: " + result.error;
    }
}

//Insert
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
        msgDiv.textContent = "Follow relationship inserted successfully.";
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
        msgDiv.textContent = json.message || "Insert failed.";
    }
}

//helper for update
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
        opt.textContent = `${row[0]} - ${row[1]} (Difficulty: ${row[2]}, User: ${row[3] ?? "NULL"})`;
        dropdown.appendChild(opt);
    });
}

//update
async function updateRecipe(event) {
    event.preventDefault();

    const id = document.getElementById("recipeSelect").value;
    const name = document.getElementById("updateRecipeName").value;
    const difficulty = document.getElementById("updateRecipeDifficulty").value;
    const usrid = document.getElementById("updateRecipeUsrId").value;
    const msgDiv = document.getElementById("updateRecipeResult");

    // Frontend validation: difficulty cannot be an integer
    if (difficulty !== "") {
        const validSet = ["easy", "medium", "hard"];
        
        // user typed something numeric → reject
        if (!isNaN(difficulty)) {
            msgDiv.textContent = "Difficulty cannot be a number. Please enter Easy, Medium, or Hard.";
            return;
        }

        // user typed something not in the allowed set → reject
        if (!validSet.includes(difficulty.toLowerCase())) {
            msgDiv.textContent = "Difficulty must be one of: Easy, Medium, Hard.";
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
        // Refresh dropdown to show updated values
        loadRecipeList();
    } else {
        msgDiv.textContent = json.message || "Update failed.";
    }
}

//delete
async function deleteMealPlan() {
    const id = document.getElementById("deleteMealPlanId").value;
    const msgDiv = document.getElementById("deleteMealPlanResult");

    if (!id) {
        msgDiv.textContent = "Please enter a Meal Plan ID.";
        return;
    }

    // Perform delete
    const res = await fetch("/delete-mealplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
    });

    const json = await res.json();
    if (!json.success) {
        msgDiv.textContent = "Meal plan not found or delete failed.";
        return;
    }

    msgDiv.textContent = "Meal plan deleted successfully.";

    // Fetch updated table
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
    } else {
        table.style.display = "none";
    }
}


// Query 4: Search Recipes with Selection
async function searchRecipes(event) {
    event.preventDefault();

    const difficulty = document.getElementById('searchDifficulty').value;
    const logic = document.getElementById('searchLogic').value;
    const servingTemp = document.getElementById('searchServingTemp').value;
    const logic2 = document.getElementById('searchLogic2').value;
    const userID = document.getElementById('UserID').value;

    // Validate at least one criterion is selected
    if (!difficulty && !servingTemp && !userID) {
        document.getElementById('searchRecipesResultMsg').textContent = 
            "Please select at least one search criterion!";
        return;
    }

    const response = await fetch('/search-recipes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            difficulty: difficulty,
            logic: logic,
            servingTemp: servingTemp,
            logic2: logic2,
            userID: userID
        })
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('searchRecipesResultMsg');
    const tableElement = document.getElementById('searchRecipesTable');
    const tableBody = tableElement.querySelector('tbody');

    if (responseData.success) {
        messageElement.textContent = `Found ${responseData.data.length} recipe(s)!`;
        
        // Clear previous results
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
            messageElement.textContent = "No recipes found matching your criteria.";
        }
    } else {
        messageElement.textContent = "Error searching recipes!";
        tableElement.style.display = 'none';
    }
}

// Load users into dropdown for Query 4
async function loadUsersForSearch() {
    const response = await fetch('/get-all-users', {
        method: 'GET'
    });

    const responseData = await response.json();
    const userSelect = document.getElementById('UserID');

    if (responseData.success) {
        responseData.data.forEach(user => {
            const option = document.createElement('option');
            option.value = user[0]; // User ID
            option.textContent = `${user[0]} - ${user[1]}`; // ID - Name
            userSelect.appendChild(option);
        });
    }
}


// Query 5: Projection - View Users with Selected Columns
async function viewUsersProjection(event) {
    event.preventDefault();

    const checkboxes = document.querySelectorAll('input[name="projCol"]:checked');
    const columns = Array.from(checkboxes).map(cb => cb.value);

    const messageElement = document.getElementById('projectionResultMsg');
    
    if (columns.length === 0) {
        messageElement.textContent = "Please select at least one column!";
        return;
    }

    const response = await fetch('/project-users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ columns: columns })
    });

    const responseData = await response.json();

    if (responseData.success) {
        messageElement.textContent = `Displaying ${responseData.data.length} user(s)`;
        
        const tableElement = document.getElementById('projectionTable');
        const tableHead = document.getElementById('projectionTableHead');
        const tableBody = document.getElementById('projectionTableBody');
        
        // Clear previous results
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        if (responseData.data.length > 0) {
            tableElement.style.display = 'table';
            
            // Create header row
            const headerRow = document.createElement('tr');
            columns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col.toUpperCase();
                headerRow.appendChild(th);
            });
            tableHead.appendChild(headerRow);
            
            // Create data rows
            responseData.data.forEach(row => {
                const dataRow = tableBody.insertRow();
                row.forEach(field => {
                    const cell = dataRow.insertCell();
                    cell.textContent = field;
                });
            });
        } else {
            tableElement.style.display = 'none';
            messageElement.textContent = "No users found.";
        }
    } else {
        messageElement.textContent = "Error fetching user data!";
        document.getElementById('projectionTable').style.display = 'none';
    }
}


// Query 6: Load ingredients into dropdown (HELPER)
async function loadIngredients() {
    const response = await fetch('/get-all-ingredients', {
        method: 'GET'
    });

    const responseData = await response.json();
    const dropdown = document.getElementById('ingredientDropdown');
    
    if (responseData.success && responseData.data.length > 0) {
        responseData.data.forEach(ingredient => {
            const option = document.createElement('option');
            option.value = ingredient[0]; // Ingredient name
            option.textContent = ingredient[0]; // Display name
            dropdown.appendChild(option);
        });
    } else {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No ingredients found";
        dropdown.appendChild(option);
    }
}

// Query 6: Find Recipes by Selected Ingredient
async function findRecipesByIngredient(event) {
    event.preventDefault();

    const ingredientName = document.getElementById('ingredientDropdown').value;
    
    if (!ingredientName) {
        document.getElementById('joinRecipesResultMsg').textContent = 
            "Please select an ingredient!";
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
        messageElement.textContent = `Found ${responseData.data.length} recipe(s) using "${ingredientName}"`;
        
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
            messageElement.textContent = `No recipes found using ingredient: "${ingredientName}"`;
        }
    } else {
        messageElement.textContent = "Error searching recipes!";
        tableElement.style.display = 'none';
    }
}


//Query 7: Aggregation - Sum total recipe time
const sumRecipeTimes = async () => {
    const response = await fetch('/sum-recipe-times', {
        method: 'GET'
    })

    const responseJson = await response.json();
    const responseData = responseJson.data;
    const tableElement = document.getElementById('sumRecipeTimesTable');
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = ''; //Reset the table
    }

    if (responseJson.success) {
        responseData.forEach((recipe) => {
            const row = tableBody.insertRow()
            recipe.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    } else {
        alert("Error when fetching the recipe times; please try again")
    }
}

//Query 8: Recipe ingredient count filter
const recipeIngredientCountFilter = async (event) => {
    event.preventDefault();// PREVENT REFRESH
    const maxIngredients = +document.getElementById('maxRecipeIngredientCount').value
    console.log(maxIngredients)

    if (!maxIngredients || !Number.isInteger(maxIngredients) || maxIngredients < 1) {
        alert("Max Ingredients must be an integer > 0, please try again")
    }

    const response = await fetch(`/recipe-ingredient-count-filter?maxIngredients=${maxIngredients}`, {
        method: 'GET'
    });

    const responseJson = await response.json();
    const responseData = responseJson.data;
    const tableElement = document.getElementById('recipeIngredientCountTable');
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = ''; //Reset the table
    }

    if (responseJson.success) {
        responseData.forEach((res) => {
            const row = tableBody.insertRow()
            res.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    } else {
        alert("Error when querying, please try again")
    }
}

//Query 9 - Nested aggregation with group by.
const belowAverageRecipeCountMealPlans = async () => {
    const response = await fetch('/below-average-recipe-count-meal-plans', {
        method: 'GET'
    })

    const responseJson = await response.json();
    const responseData = responseJson.data;
    const tableElement = document.getElementById('belowAverageRecipeCountMealPlansTable');
    const tableBody = tableElement.querySelector('tbody');

    if (tableBody) {
        tableBody.innerHTML = ''; //Reset the table
    }

    if (responseJson.success) {
        responseData.forEach((recipe) => {
            const row = tableBody.insertRow()
            recipe.forEach((val, index) => {
                const cell = row.insertCell(index);
                cell.textContent = val;
            })
        })
    } else {
        alert("Error when fetching the recipe times; please try again")
    }
}

//division
async function runDivisionQuery() {
    const res = await fetch("/division-users-following-all-mealplans");
    const json = await res.json();

    const tbody = document.querySelector("#divisionTable tbody");
    const msgDiv = document.getElementById("divisionResultMsg");

    tbody.innerHTML = "";

    if (!json.success) {
        msgDiv.textContent = "Error running division query.";
        return;
    }

    const rows = json.rows;
    if (rows.length === 0) {
        msgDiv.textContent = "No users follow all meal plans.";
        return;
    }

    rows.forEach((row) => {
        const tr = document.createElement("tr");
        row.forEach((val) => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    msgDiv.textContent = "";
}

function showTab(id) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(div => {
        div.style.display = 'none';
    });

    // Show selected tab
    document.getElementById(id).style.display = 'block';
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function () {
    showSection('hero');
    loadDashboardStats();
    checkDbConnection();
    loadUsersForSearch();
    loadIngredients();
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
