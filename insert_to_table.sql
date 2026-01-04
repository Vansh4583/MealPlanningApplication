-- HeightWeightCalories (no dependencies)
INSERT INTO HeightWeightCalories (Height, Weight, MaintenanceCalorie) VALUES (170.0, 70.0, 2200);
INSERT INTO HeightWeightCalories (Height, Weight, MaintenanceCalorie) VALUES (165.0, 60.0, 1900);
INSERT INTO HeightWeightCalories (Height, Weight, MaintenanceCalorie) VALUES (180.0, 85.0, 2500);
INSERT INTO HeightWeightCalories (Height, Weight, MaintenanceCalorie) VALUES (175.0, 75.0, 2300);
INSERT INTO HeightWeightCalories (Height, Weight, MaintenanceCalorie) VALUES (160.0, 55.0, 1800);


-- Users (depends on HeightWeightCalories)
INSERT INTO Users (Id, Height, Weight, Name) VALUES (1, 170.0, 70.0, 'John Smith');
INSERT INTO Users (Id, Height, Weight, Name) VALUES (2, 165.0, 60.0, 'Emily Chen');
INSERT INTO Users (Id, Height, Weight, Name) VALUES (3, 180.0, 85.0, 'Michael Johnson');
INSERT INTO Users (Id, Height, Weight, Name) VALUES (4, 175.0, 75.0, 'Sarah Williams');
INSERT INTO Users (Id, Height, Weight, Name) VALUES (5, 160.0, 55.0, 'Lisa Martinez');


-- MealPlan (no dependencies)
INSERT INTO MealPlan (Id, Name, MealsPerWeek, DateCreated) VALUES (1, 'High Protein Plan', 21, '2024-01-15');
INSERT INTO MealPlan (Id, Name, MealsPerWeek, DateCreated) VALUES (2, 'Vegetarian Weekly', 14, '2024-02-20');
INSERT INTO MealPlan (Id, Name, MealsPerWeek, DateCreated) VALUES (3, 'Keto Diet', 21, '2024-03-10');
INSERT INTO MealPlan (Id, Name, MealsPerWeek, DateCreated) VALUES (4, 'Mediterranean Style', 18, '2024-04-05');
INSERT INTO MealPlan (Id, Name, MealsPerWeek, DateCreated) VALUES (5, 'Low Carb Plan', 21, '2024-05-12');


-- DietaryRestriction (no dependencies)
INSERT INTO DietaryRestriction (Id, Name) VALUES (1, 'Peanuts');
INSERT INTO DietaryRestriction (Id, Name) VALUES (2, 'Dairy');
INSERT INTO DietaryRestriction (Id, Name) VALUES (3, 'Gluten');
INSERT INTO DietaryRestriction (Id, Name) VALUES (4, 'Vegan');
INSERT INTO DietaryRestriction (Id, Name) VALUES (5, 'Low Sodium');


-- Allergy (depends on DietaryRestriction)
INSERT INTO Allergy (Id, Severity) VALUES (1, 'Severe');
INSERT INTO Allergy (Id, Severity) VALUES (2, 'Moderate');
INSERT INTO Allergy (Id, Severity) VALUES (3, 'Mild');


-- Preference (depends on DietaryRestriction)
INSERT INTO Preference (Id, Type) VALUES (4, 'Ethical');
INSERT INTO Preference (Id, Type) VALUES (5, 'Health');


-- Has (depends on Users and DietaryRestriction)
INSERT INTO Has (uId, dId, IsActive) VALUES (1, 1, TRUE);
INSERT INTO Has (uId, dId, IsActive) VALUES (2, 4, TRUE);
INSERT INTO Has (uId, dId, IsActive) VALUES (3, 2, FALSE);
INSERT INTO Has (uId, dId, IsActive) VALUES (4, 3, TRUE);
INSERT INTO Has (uId, dId, IsActive) VALUES (5, 5, TRUE);


-- Follow (depends on Users and MealPlan)
INSERT INTO Follow (uId, mId, IsActive) VALUES (1, 1, TRUE);
INSERT INTO Follow (uId, mId, IsActive) VALUES (2, 2, TRUE);
INSERT INTO Follow (uId, mId, IsActive) VALUES (3, 3, TRUE);
INSERT INTO Follow (uId, mId, IsActive) VALUES (4, 4, FALSE);
INSERT INTO Follow (uId, mId, IsActive) VALUES (5, 5, TRUE);


-- DishServingTemperatures (no dependencies)
INSERT INTO DishServingTemperatures (Name, ServingTemperature) VALUES ('Grilled Chicken Salad', 'Cold');
INSERT INTO DishServingTemperatures (Name, ServingTemperature) VALUES ('Spaghetti Carbonara', 'Hot');
INSERT INTO DishServingTemperatures (Name, ServingTemperature) VALUES ('Caesar Salad', 'Cold');
INSERT INTO DishServingTemperatures (Name, ServingTemperature) VALUES ('Beef Stir Fry', 'Hot');
INSERT INTO DishServingTemperatures (Name, ServingTemperature) VALUES ('Smoothie Bowl', 'Cold');


-- Recipe_Create (depends on Users and DishServingTemperatures)
INSERT INTO Recipe_Create (Id, Name, Difficulty, uId) VALUES (1, 'Grilled Chicken Salad', 'Easy', 1);
INSERT INTO Recipe_Create (Id, Name, Difficulty, uId) VALUES (2, 'Spaghetti Carbonara', 'Medium', 2);
INSERT INTO Recipe_Create (Id, Name, Difficulty, uId) VALUES (3, 'Caesar Salad', 'Easy', 3);
INSERT INTO Recipe_Create (Id, Name, Difficulty, uId) VALUES (4, 'Beef Stir Fry', 'Medium', 4);
INSERT INTO Recipe_Create (Id, Name, Difficulty, uId) VALUES (5, 'Smoothie Bowl', 'Easy', 5);


-- SizeMicrowaveTimes (no dependencies)
INSERT INTO SizeMicrowaveTimes (Size, NeedsReheating, MicrowaveTime) VALUES ('Small', TRUE, 90);
INSERT INTO SizeMicrowaveTimes (Size, NeedsReheating, MicrowaveTime) VALUES ('Medium', TRUE, 150);
INSERT INTO SizeMicrowaveTimes (Size, NeedsReheating, MicrowaveTime) VALUES ('Large', TRUE, 210);
INSERT INTO SizeMicrowaveTimes (Size, NeedsReheating, MicrowaveTime) VALUES ('Small', FALSE, 0);
INSERT INTO SizeMicrowaveTimes (Size, NeedsReheating, MicrowaveTime) VALUES ('Medium', FALSE, 0);


-- ScheduledMeal_MadeFrom (depends on Recipe_Create and SizeMicrowaveTimes)
INSERT INTO ScheduledMeal_MadeFrom (Id, MealType, Servings, dayOfWeek, rId, Size, NeedsReheating) VALUES (1, 'Lunch', 2, 'Monday', 1, 'Medium', FALSE);
INSERT INTO ScheduledMeal_MadeFrom (Id, MealType, Servings, dayOfWeek, rId, Size, NeedsReheating) VALUES (2, 'Dinner', 4, 'Tuesday', 2, 'Large', TRUE);
INSERT INTO ScheduledMeal_MadeFrom (Id, MealType, Servings, dayOfWeek, rId, Size, NeedsReheating) VALUES (3, 'Lunch', 1, 'Wednesday', 3, 'Small', FALSE);
INSERT INTO ScheduledMeal_MadeFrom (Id, MealType, Servings, dayOfWeek, rId, Size, NeedsReheating) VALUES (4, 'Dinner', 3, 'Thursday', 4, 'Medium', TRUE);
INSERT INTO ScheduledMeal_MadeFrom (Id, MealType, Servings, dayOfWeek, rId, Size, NeedsReheating) VALUES (5, 'Breakfast', 1, 'Friday', 5, 'Small', FALSE);


-- RecipeStep (depends on Recipe_Create)
INSERT INTO RecipeStep (Id, OrderNumber, Description, TimeToComplete) VALUES (1, 1, 'Season and grill chicken breast until cooked through', 15);
INSERT INTO RecipeStep (Id, OrderNumber, Description, TimeToComplete) VALUES (2, 1, 'Boil pasta according to package directions', 10);
INSERT INTO RecipeStep (Id, OrderNumber, Description, TimeToComplete) VALUES (3, 1, 'Wash and chop romaine lettuce', 5);
INSERT INTO RecipeStep (Id, OrderNumber, Description, TimeToComplete) VALUES (4, 1, 'Cut beef into thin strips and marinate', 10);
INSERT INTO RecipeStep (Id, OrderNumber, Description, TimeToComplete) VALUES (5, 1, 'Blend frozen fruits with yogurt until smooth', 3);



-- PerishableCategories (no dependencies)
INSERT INTO PerishableCategories (Category, IsPerishable) VALUES ('Protein', TRUE);
INSERT INTO PerishableCategories (Category, IsPerishable) VALUES ('Vegetables', TRUE);
INSERT INTO PerishableCategories (Category, IsPerishable) VALUES ('Grains', FALSE);
INSERT INTO PerishableCategories (Category, IsPerishable) VALUES ('Dairy', TRUE);
INSERT INTO PerishableCategories (Category, IsPerishable) VALUES ('Spices', FALSE);


-- FoodCategory (depends on PerishableCategories)
INSERT INTO FoodCategory (Name, Category) VALUES ('Chicken Breast', 'Protein');
INSERT INTO FoodCategory (Name, Category) VALUES ('Romaine Lettuce', 'Vegetables');
INSERT INTO FoodCategory (Name, Category) VALUES ('Spaghetti', 'Grains');
INSERT INTO FoodCategory (Name, Category) VALUES ('Parmesan Cheese', 'Dairy');
INSERT INTO FoodCategory (Name, Category) VALUES ('Black Pepper', 'Spices');


-- Ingredient (depends on FoodCategory)
INSERT INTO Ingredient (Id, Name) VALUES (1, 'Chicken Breast');
INSERT INTO Ingredient (Id, Name) VALUES (2, 'Romaine Lettuce');
INSERT INTO Ingredient (Id, Name) VALUES (3, 'Spaghetti');
INSERT INTO Ingredient (Id, Name) VALUES (4, 'Parmesan Cheese');
INSERT INTO Ingredient (Id, Name) VALUES (5, 'Black Pepper');


-- PartOf (depends on DietaryRestriction and Ingredient)
INSERT INTO PartOf (dId, iId) VALUES (2, 4);
INSERT INTO PartOf (dId, iId) VALUES (3, 3);
INSERT INTO PartOf (dId, iId) VALUES (4, 1);
INSERT INTO PartOf (dId, iId) VALUES (4, 4);
INSERT INTO PartOf (dId, iId) VALUES (1, 5);


-- RecipeUsedIngredients (depends on Recipe_Create and Ingredient)
INSERT INTO RecipeUsedIngredients (rId, iId, Unit, Amount) VALUES (1, 1, 'grams', 200);
INSERT INTO RecipeUsedIngredients (rId, iId, Unit, Amount) VALUES (2, 3, 'grams', 400);
INSERT INTO RecipeUsedIngredients (rId, iId, Unit, Amount) VALUES (3, 2, 'grams', 150);
INSERT INTO RecipeUsedIngredients (rId, iId, Unit, Amount) VALUES (2, 4, 'grams', 50);
INSERT INTO RecipeUsedIngredients (rId, iId, Unit, Amount) VALUES (4, 5, 'teaspoons', 2);


-- PoweredTools (no dependencies)
INSERT INTO PoweredTools (Name, PowerNeeded) VALUES ('Blender', TRUE);
INSERT INTO PoweredTools (Name, PowerNeeded) VALUES ('Food Processor', TRUE);
INSERT INTO PoweredTools (Name, PowerNeeded) VALUES ('Knife', FALSE);
INSERT INTO PoweredTools (Name, PowerNeeded) VALUES ('Cutting Board', FALSE);
INSERT INTO PoweredTools (Name, PowerNeeded) VALUES ('Stand Mixer', TRUE);


-- MicrowavableMaterials (no dependencies)
INSERT INTO MicrowavableMaterials (Material, IsMicrowavable) VALUES ('Glass', TRUE);
INSERT INTO MicrowavableMaterials (Material, IsMicrowavable) VALUES ('Plastic', TRUE);
INSERT INTO MicrowavableMaterials (Material, IsMicrowavable) VALUES ('Metal', FALSE);
INSERT INTO MicrowavableMaterials (Material, IsMicrowavable) VALUES ('Ceramic', TRUE);
INSERT INTO MicrowavableMaterials (Material, IsMicrowavable) VALUES ('Wood', FALSE);


-- KitchenTool (depends on PoweredTools and MicrowavableMaterials)
INSERT INTO KitchenTool (Id, Name, Size, Material) VALUES (1, 'Blender', 'Large', 'Glass');
INSERT INTO KitchenTool (Id, Name, Size, Material) VALUES (2, 'Food Processor', 'Medium', 'Plastic');
INSERT INTO KitchenTool (Id, Name, Size, Material) VALUES (3, 'Knife', 'Small', 'Metal');
INSERT INTO KitchenTool (Id, Name, Size, Material) VALUES (4, 'Cutting Board', 'Large', 'Wood');
INSERT INTO KitchenTool (Id, Name, Size, Material) VALUES (5, 'Stand Mixer', 'Large', 'Ceramic');


-- Require (depends on Recipe_Create and KitchenTool)
INSERT INTO Require (rId, kId, Quantity) VALUES (1, 3, 1);
INSERT INTO Require (rId, kId, Quantity) VALUES (2, 4, 1);
INSERT INTO Require (rId, kId, Quantity) VALUES (3, 3, 1);
INSERT INTO Require (rId, kId, Quantity) VALUES (4, 2, 1);
INSERT INTO Require (rId, kId, Quantity) VALUES (5, 1, 1);

