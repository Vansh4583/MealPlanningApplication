const express = require('express');
const appService = require('./appService');

const router = express.Router();

// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get('/check-db-connection', async (req, res) => {
    const isConnect = await appService.testOracleConnection();
    if (isConnect) {
        res.send('connected');
    } else {
        res.send('unable to connect');
    }
});

// set up
router.post("/setup-database", async (req, res) => {
    try {
        const ok = await appService.setupDatabase();
        if (ok) {
            res.json({ success: true });
        } else {
            res.status(500).json({ success: false, error: "Failed to run script" });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/get-all-follow", async (req, res) => {
    const rows = await appService.getAllFollow();
    res.json({ success: true, rows });
});

// insert
router.post("/insert-follow", async (req, res) => {
    const { usrId, mid, isActive } = req.body;
    const result = await appService.insertFollow(usrId, mid, isActive);
    res.json(result);
});

//Helper for update
router.get("/fetch-recipes", async (req, res) => {
    const rows = await appService.fetchAllRecipes();
    res.json({ success: true, rows });
});

// update
router.post("/update-recipe", async (req, res) => {
    const { id, name, difficulty, usrid } = req.body;
    const result = await appService.updateRecipe(id, name, difficulty, usrid);
    res.json(result);
});

router.get("/get-all-mealplans", async (req, res) => {
    const rows = await appService.getAllMealPlans();
    res.json({ success: true, rows });
});

// delete
router.post("/delete-mealplan", async (req, res) => {
    const { id } = req.body;
    const result = await appService.deleteMealPlanById(id);
    res.json(result);
});

// Selection   QUERY 4
router.post('/search-recipes', async (req, res) => {
    const { difficulty, logic, servingTemp, logic2, userID } = req.body;

const results = await appService.searchRecipes(
    difficulty,
    logic,
    servingTemp,
    logic2,
    userID
);
    
    if (results) {
        res.json({ success: true, data: results });
    } else {
        res.status(500).json({ success: false });
    }
});

// Route to get all users for dropdown   (QUERY 4 HELPER)
router.get('/get-all-users', async (req, res) => {
    const users = await appService.getAllUsers();
    
    if (users) {
        res.json({ success: true, data: users });
    } else {
        res.status(500).json({ success: false });
    }
});

// QUERY 5
router.post('/project-users', async (req, res) => {
    const { columns } = req.body;
    const results = await appService.projectUsers(columns);
    
    if (results) {
        res.json({ success: true, data: results });
    } else {
        res.status(500).json({ success: false });
    }
});

// Get all ingredients for QUERY 6
router.get('/get-all-ingredients', async (req, res) => {
    const results = await appService.getAllIngredients();
    
    if (results) {
        res.json({ success: true, data: results });
    } else {
        res.status(500).json({ success: false });
    }
});

// QUERY 6
router.get('/recipes-by-ingredient', async (req, res) => {
    const { ingredient } = req.query;
    const results = await appService.getRecipesByIngredient(ingredient);
    
    if (results) {
        res.json({ success: true, data: results });
    } else {
        res.status(500).json({ success: false });
    }
});

router.get('/sum-recipe-times', async (req, res) => {
    const recipeTimesData = await appService.sumRecipeTimes();
    if (!recipeTimesData) {
        //Error case
        res.status(500).json({
            success: false,
            data: recipeTimesData
        })
    } else {
        res.json({
            success: true,
            data: recipeTimesData
        })
    }
})

router.get('/recipe-ingredient-count-filter', async (req, res) => {
    const { maxIngredients } = req.query

    const filterResults = await appService.recipeIngredientCountFilter(maxIngredients);

    if (!filterResults) {
        //Error case
        res.status(500).json({
            success: false,
            data: filterResults
        })
    } else {
        res.json({
            success: true,
            data: filterResults
        })
    }
})

router.get('/below-average-recipe-count-meal-plans', async (req, res) => {
    const filteredResults = await appService.belowAverageRecipeCountMealPlans();

    if (!filteredResults) {
        //Error case
        res.status(500).json({
            success: false,
            data: filteredResults
        })
    } else {
        res.json({
            success: true,
            data: filteredResults
        })
    }
})

// division
router.get("/division-users-following-all-mealplans", async (req, res) => {
    const rows = await appService.usersFollowingAllMealPlans();
    res.json({ success: true, rows });
});

module.exports = router;