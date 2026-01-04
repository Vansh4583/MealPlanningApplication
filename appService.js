const oracledb = require('oracledb');
require('dotenv').config();


const fs = require("fs");
const path = require("path");


// Database configuration setup. Ensure your .env file has the required database credentials.
const dbConfig = {
    user: process.env.ORACLE_USER,
    password: process.env.ORACLE_PASS,
    connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_DBNAME}`,
    poolMin: 1,
    poolMax: 3,
    poolIncrement: 1,
    poolTimeout: 60
};


// initialize connection pool
async function initializeConnectionPool() {
    try {
        oracledb.initOracleClient({ libDir: process.env.ORACLE_DIR })
        await oracledb.createPool(dbConfig);
        console.log('Connection pool started');
    } catch (err) {
        console.error('Initialization error: ' + err.message);
    }
}

async function closePoolAndExit() {
    console.log('\nTerminating');
    try {
        await oracledb.getPool().close(10); // 10 seconds grace period for connections to finish
        console.log('Pool closed');
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

initializeConnectionPool();

process
    .once('SIGTERM', closePoolAndExit)
    .once('SIGINT', closePoolAndExit);


// ----------------------------------------------------------
// Wrapper to manage OracleDB actions, simplifying connection handling.
async function withOracleDB(action) {
    let connection;
    try {
        connection = await oracledb.getConnection(); // Gets a connection from the default pool 
        return await action(connection);
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}


// ----------------------------------------------------------
// Core functions for database operations
// Modify these functions, especially the SQL queries, based on your project's requirements and design.
async function testOracleConnection() {
    return await withOracleDB(async (connection) => {
        return true;
    }).catch(() => {
        return false;
    });
}



// helper for set up
async function runSqlFile(connection, filePath) {
    const sql = fs.readFileSync(filePath, "utf8");

    const statements = sql
        .split(/;\s*[\r\n]+/) // split by semicolon + newline
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (const stmt of statements) {
        try {
            await connection.execute(stmt);
        } catch (err) {
            console.log("Skipping statement:", stmt);
            console.error(err.message);
        }
    }
}

// set up
async function setupDatabase() {
    return await withOracleDB(async (connection) => {
        const createPath = path.join(__dirname, "CreateAndPopulate.sql");

        await runSqlFile(connection, createPath);

        await connection.commit();
        return true;
    }).catch((err) => {
        console.error(err);
        return false;
    });
}


// insert
async function insertFollow(usrId, mid, isActive) {
    return await withOracleDB(async (connection) => {
        // Check FK: USERS
        const userCheck = await connection.execute(
            `SELECT id FROM users WHERE id = :id`,
            { id: usrId }
        );
        if (userCheck.rows.length === 0) {
            return { success: false, message: "User ID does not exist." };
        }

        // Check FK: MEALPLAN
        const mealCheck = await connection.execute(
            `SELECT id FROM mealplan WHERE id = :id`,
            { id: mid }
        );
        if (mealCheck.rows.length === 0) {
            return { success: false, message: "Meal Plan ID does not exist." };
        }

        // Perform insert
        const result = await connection.execute(
            `
            INSERT INTO follow (usrid, mid, isactive)
            VALUES (:usrId, :mid, :isActive)
            `,
            { usrId, mid, isActive },
            { autoCommit: true }
        );

        return { success: result.rowsAffected > 0 };
    }).catch((e) => {
        console.error("insertFollow error", e);
        return { success: false, message: "Insert failed (possibly duplicate PK)." };
    });
}

// helper for update
async function fetchAllRecipes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT id, name, difficulty, usrid FROM recipe_create ORDER BY id`
        );
        return result.rows;
    }).catch((e) => {
        console.error("fetchAllRecipes error", e);
        return [];
    });
}

// update
async function updateRecipe(recipeId, newName, newDifficulty, newUsrId) {
    return await withOracleDB(async (connection) => {
        const setClauses = [];
        const binds = { recipeId };

        // Only update attributes that are non-empty strings
        if (newName !== undefined && newName !== "") {
            // Check FK to dishservingtemperatures(name)
            const dishCheck = await connection.execute(
                `SELECT name FROM dishservingtemperatures WHERE name = :name`,
                { name: newName }
            );
            if (dishCheck.rows.length === 0) {
                return { success: false, message: "New recipe name does not exist in DishServingTemperatures." };
            }

            setClauses.push("name = :newName");
            binds.newName = newName;
        }

        if (newDifficulty !== undefined && newDifficulty !== "") {
            setClauses.push("difficulty = :newDifficulty");
            binds.newDifficulty = newDifficulty;
        }

        if (newUsrId !== undefined && newUsrId !== "") {
            // Check FK to users(id)
            const userCheck = await connection.execute(
                `SELECT id FROM users WHERE id = :id`,
                { id: newUsrId }
            );
            if (userCheck.rows.length === 0) {
                return { success: false, message: "New user ID does not exist." };
            }

            setClauses.push("usrid = :newUsrId");
            binds.newUsrId = newUsrId;
        }

        if (setClauses.length === 0) {
            return { success: false, message: "No fields to update." };
        }

        const sql = `
            UPDATE recipe_create
            SET ${setClauses.join(", ")}
            WHERE id = :recipeId
        `;

        const result = await connection.execute(sql, binds, { autoCommit: true });

        return {
            success: result.rowsAffected > 0,
            message: result.rowsAffected === 0 ? "No recipe with that ID." : undefined
        };
    }).catch((e) => {
        console.error("updateRecipe error", e);
        return { success: false, message: "Update failed." };
    });
}

// delete
async function deleteMealPlanById(id) {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `DELETE FROM mealplan WHERE id = :id`,
            { id },
            { autoCommit: true }
        );

        return { success: result.rowsAffected > 0 };
    }).catch((e) => {
        console.error("deleteMealPlanById error", e);
        return { success: false };
    });
}

async function searchRecipes(difficulty, logic1, servingTemp, logic2, userId) {
    return await withOracleDB(async (connection) => {
        let sql = `
            SELECT r.id, r.name, r.difficulty, d.servingtemperature, u.name as creator_name
            FROM Recipe_Create r
            LEFT JOIN DishServingTemperatures d ON r.name = d.name
            LEFT JOIN Users u ON r.usrid = u.id
            WHERE 1=1
        `;
        
        const binds = [];
        const conditions = [];
        
        // Build conditions array
        if (difficulty) {
            conditions.push({ sql: 'r.difficulty = :difficulty', value: difficulty });
        }
        if (servingTemp) {
            conditions.push({ sql: 'd.servingtemperature = :servingTemp', value: servingTemp });
        }
        if (userId) {
            conditions.push({ sql: 'r.usrid = :userId', value: userId });
        }
        
        // Build WHERE clause with proper AND/OR logic
        if (conditions.length > 0) {
            sql += ' AND (';
            
            // First condition
            sql += conditions[0].sql;
            binds.push(conditions[0].value);
            
            // Second condition with logic1
            if (conditions.length > 1) {
                sql += ` ${logic1} ${conditions[1].sql}`;
                binds.push(conditions[1].value);
            }
            
            // Third condition with logic2
            if (conditions.length > 2) {
                sql += ` ${logic2} ${conditions[2].sql}`;
                binds.push(conditions[2].value);
            }
            
            sql += ')';
        }
        
        sql += ' ORDER BY r.name';
        
        console.log('Executing SQL:', sql);
        console.log('With binds:', binds);
        
        const result = await connection.execute(sql, binds);
        return result.rows;
    }).catch((err) => {
        console.error('Error searching recipes:', err);
        return null;
    });
}

// New function to get all users
async function getAllUsers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT id, name FROM Users ORDER BY id');
        return result.rows;
    }).catch((err) => {
        console.error('Error fetching users:', err);
        return null;
    });
}



//Q5
async function projectUsers(columns) {
    return await withOracleDB(async (connection) => {
        // Whitelist valid columns to prevent SQL injection
        const validColumns = ['id', 'name', 'height', 'weight'];
        const safeColumns = columns.filter(col => validColumns.includes(col.toLowerCase()));
        
        if (safeColumns.length === 0) {
            safeColumns.push('id'); // Default to ID if no valid columns
        }
        
        const sql = `SELECT ${safeColumns.join(', ')} FROM Users`;
        const result = await connection.execute(sql);
        return result.rows;
    }).catch((err) => {
        console.error('Error in projection:', err);
        return null;
    });
}

// Q6
async function getRecipesByIngredient(ingredientName) {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT DISTINCT 
                r.id, 
                r.name, 
                r.difficulty, 
                rui.amount, 
                rui.unit
            FROM Recipe_Create r
            JOIN RecipeUsedIngredients rui ON r.id = rui.rid
            JOIN Ingredient i ON rui.iid = i.id
            WHERE LOWER(i.name) = LOWER(:ingredientName)
            ORDER BY r.name
        `;
        
        const result = await connection.execute(sql, [ingredientName]);
        return result.rows;
    }).catch((err) => {
        console.error('Error finding recipes by ingredient:', err);
        return null;
    });
}

// Get all unique ingredient names
async function getAllIngredients() {
    return await withOracleDB(async (connection) => {
        const sql = `
            SELECT DISTINCT name 
            FROM Ingredient 
            ORDER BY name
        `;
        
        const result = await connection.execute(sql);
        return result.rows;
    }).catch((err) => {
        console.error('Error getting ingredients:', err);
        return null;
    });
}


const sumRecipeTimes = async () => {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT rs.id, r.name, SUM(rs.TimeToComplete)
            FROM RECIPESTEP rs
            JOIN RECIPE_CREATE r
            ON r.id = rs.id
            GROUP BY rs.id, r.name
            `);
        return result.rows
    }).catch(() => {
        return []
    })
}

const recipeIngredientCountFilter = async (maxIngredients) => {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT r.id, r.name, i.numIngredients
            FROM RECIPE_CREATE r
            JOIN (SELECT rid, COUNT(iid) as numIngredients
                  FROM RECIPEUSEDINGREDIENTS
                  GROUP BY rid
                  HAVING COUNT(iid) <= :maxIngredients) i
                  ON r.id = i.rid
            `,
            [maxIngredients]);
        return result.rows
    }).catch(() => {
        return []
    })
}

const belowAverageRecipeCountMealPlans = async () => {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT mp.id, mp.name, COUNT(DISTINCT smmf.rid) as numRecipes
            FROM MealPlanScheduledMeals mpsm
            JOIN MealPlan mp on mp.id = mpsm.mpid
            JOIN ScheduledMeal_MadeFrom smmf
            on smmf.id = mpsm.smid
            GROUP BY mp.id, mp.name
            HAVING COUNT(DISTINCT smmf.rid) < (SELECT AVG(recipeCount) 
                                                FROM (
                                                    SELECT COUNT(DISTINCT smmf2.rid) as recipeCount
                                                    FROM MealPlanScheduledMeals mpsm2
                                                    JOIN ScheduledMeal_MadeFrom smmf2
                                                    ON mpsm2.smid = smmf2.id
                                                    GROUP BY mpsm2.mpid
                                                    )
                                                )
                                                
            `);
        return result.rows
    }).catch(() => {
        return []
    })
}

// division
async function usersFollowingAllMealPlans() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(`
            SELECT u.id, u.name
            FROM users u
            WHERE NOT EXISTS (
                SELECT *
                FROM mealplan mp
                WHERE NOT EXISTS (
                    SELECT *
                    FROM follow f
                    WHERE f.usrid = u.id
                      AND f.mid = mp.id
                      AND f.isactive = 1
                )
            )
        `);
        return result.rows;
    }).catch((e) => {
        console.error("usersFollowingAllMealPlans error", e);
        return [];
    });
}

async function getAllFollow() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT usrid, mid, isactive FROM follow ORDER BY usrid, mid`
        );
        return result.rows;
    }).catch((err) => {
        console.error("getAllFollow error", err);
        return [];
    });
}
async function getAllMealPlans() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute(
            `SELECT id, name, mealsperweek, datecreated 
             FROM mealplan 
             ORDER BY id`
        );
        return result.rows;
    }).catch((e) => {
        console.error("getAllMealPlans error", e);
        return [];
    });
}

// Count functions for dashboard stats
async function countRecipes() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT COUNT(*) FROM Recipe_Create');
        return result.rows[0][0];
    }).catch(() => 0);
}

async function countUsers() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT COUNT(*) FROM Users');
        return result.rows[0][0];
    }).catch(() => 0);
}

async function countMealPlans() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT COUNT(*) FROM MealPlan');
        return result.rows[0][0];
    }).catch(() => 0);
}

async function countIngredients() {
    return await withOracleDB(async (connection) => {
        const result = await connection.execute('SELECT COUNT(*) FROM Ingredient');
        return result.rows[0][0];
    }).catch(() => 0);
}

module.exports = {
    testOracleConnection,
    setupDatabase,
    insertFollow,
    fetchAllRecipes,
    updateRecipe,
    deleteMealPlanById,
    sumRecipeTimes,
    recipeIngredientCountFilter,
    belowAverageRecipeCountMealPlans,
    usersFollowingAllMealPlans,
    searchRecipes,
    getAllUsers,
    projectUsers,
    getRecipesByIngredient,
    getAllIngredients,
    getAllMealPlans,
    getAllFollow,
    countRecipes,
    countUsers,
    countMealPlans,
    countIngredients
};