# Meal Planner Application

A web application for managing recipes, ingredients, and meal plans with a focus on complex database operations.

## Tech Stack

- **Backend**: Node.js, Express, Oracle Database 19c
- **Frontend**: HTML, CSS, JavaScript
- **Database**: 20+ normalized tables with foreign key relationships

## Features

- Recipe search with multi-criteria filtering (difficulty, temperature, creator)
- Ingredient-based recipe discovery
- User and meal plan management
- Analytics dashboard with aggregation queries
- CRUD operations with proper constraint handling

## Database Schema

Key tables: Users, Recipes, Ingredients, MealPlans, KitchenTools, DietaryRestrictions

Relationships include:
- Users create Recipes (1:N)
- Users follow MealPlans (M:N)
- Recipes use Ingredients (M:N)
- ISA hierarchy for DietaryRestrictions (Allergy/Preference)


## SQL Queries Implemented

1. **Insert**: Add users to meal plans with FK validation
2. **Update**: Modify recipe attributes (name, difficulty, creator)
3. **Delete**: Remove meal plans with cascade deletion
4. **Selection**: Multi-criteria search with AND/OR logic
5. **Projection**: Display custom user attributes
6. **Join**: Find recipes by ingredient (3-table join)
7. **Aggregation**: Calculate total recipe preparation time
8. **Having**: Filter recipes by ingredient count
9. **Nested Aggregation**: Find meal plans below average recipe count
10. **Division**: Find users following all meal plans

## Project Structure
```
├── public/
│   ├── index.html
│   ├── styles.css
│   └── scripts.js
├── appController.js       # API routes
├── appService.js          # Database operations
├── server.js              # Server setup
└── CreateAndPopulate.sql  # Database initialization
```






![Descriptive alt text for the image](screenshots/1.jpg)
![Descriptive alt text for the image](screenshots/2.jpg)


