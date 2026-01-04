-- Drop all tables first
drop table allergy cascade constraints;
drop table dishservingtemperatures cascade constraints;
drop table follow cascade constraints;
drop table foodcategory cascade constraints;
drop table foodsizemicrowavetimes cascade constraints;
drop table has cascade constraints;
drop table heightweightcalories cascade constraints;
drop table ingredient cascade constraints;
drop table kitchentool cascade constraints;
drop table mealplan cascade constraints;
drop table microwavablematerials cascade constraints;
drop table partof cascade constraints;
drop table perishablecategories cascade constraints;
drop table poweredtools cascade constraints;
drop table preference cascade constraints;
drop table recipestep cascade constraints;
drop table recipeusedingredients cascade constraints;
drop table recipe_create cascade constraints;
drop table require cascade constraints;
drop table scheduledmeal_madefrom cascade constraints;
drop table users cascade constraints;
drop table dietaryrestriction cascade constraints;
drop table mealplanscheduledmeals cascade constraints;

create table heightweightcalories (
   height             decimal,
   weight             decimal,
   maintenancecalorie integer not null,
   primary key ( height,
                 weight )
);

create table users (
   id     integer primary key,
   height decimal not null,
   weight decimal not null,
   name   varchar(50) not null,
      foreign key ( height,
                    weight )
         references heightweightcalories ( height,
                                           weight ) -- Should be on Update cascade but oracle doesnt support, default delete is no action
);

create table dietaryrestriction (
   id   integer primary key,
   name varchar(50) not null
);

create table allergy (
   id       integer primary key,
   severity varchar(20) not null,
   foreign key ( id )
      references dietaryrestriction ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support,
);

create table preference (
   id   integer primary key,
   type varchar(50) not null,
   foreign key ( id )
      references dietaryrestriction ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table mealplan (
   id           integer primary key,
   name         varchar(50) not null,
   mealsperweek integer not null,
   datecreated  date
);

create table has (
   usrid    integer,
   did      integer,
   isactive number(1,0) not null check ( isactive in ( 1,
                                                       0 ) ),
   -- since oracle doesn't support boolean, 0 = no, 1 = yes
   primary key ( usrid,
                 did ),
   foreign key ( usrid )
      references users ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( did )
      references dietaryrestriction ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table follow (
   usrid    integer,
   mid      integer,
   isactive number(1,0) not null check ( isactive in ( 1,
                                                       0 ) ),
   -- since oracle doesn't support boolean, 0 = no, 1 = yes
   primary key ( usrid,
                 mid ),
   foreign key ( usrid )
      references users ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( mid )
      references mealplan ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table dishservingtemperatures (
   name               varchar(50) primary key,
   servingtemperature varchar(20) not null
);

create table recipe_create (
   id         integer primary key,
   name       varchar(50) not null,
   difficulty varchar(20) not null,
   usrid      integer,
   foreign key ( usrid )
      references users ( id )
         on delete set null,
      -- Should be on Update cascade but oracle doesnt support
   foreign key ( name )
      references dishservingtemperatures ( name ) -- Should be on Update cascade but oracle doesnt support, also no action is default for delete
);

create table recipestep (
   id             integer,
   ordernumber    integer,
   description    varchar(1000) not null,
   timetocomplete integer not null,
   primary key ( id,
                 ordernumber ),
   foreign key ( id )
      references recipe_create ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table foodsizemicrowavetimes (
   food_size      varchar(20),
   needsreheating number(1,0) not null check ( needsreheating in ( 1,
                                                                   0 ) ),
   -- since oracle doesn't support boolean, 0 = no, 1 = yes
   microwavetime  integer not null,
   primary key ( food_size,
                 needsreheating )
);

create table scheduledmeal_madefrom (
   id             integer primary key,
   mealtype       varchar(50) not null,
   servings       integer not null,
   dayofweek      varchar(20) not null,
   rid            integer,
   food_size      varchar(20) not null,
   needsreheating number(1,0) not null check ( needsreheating in ( 1,
                                                                   0 ) ),
   -- since oracle doesn't support boolean, 0 = no, 1 = yes
   foreign key ( rid )
      references recipe_create ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
      foreign key ( food_size,
                    needsreheating )
         references foodsizemicrowavetimes ( food_size,
                                             needsreheating ) -- Should be on Update cascade but oracle doesnt support, default is no action for delete
);

create table perishablecategories (
   category     varchar(50) primary key,
   isperishable number(1,0) not null check ( isperishable in ( 1,
                                                               0 ) ) -- since oracle doesn't support boolean, 0 = no, 1 = yes
);

create table foodcategory (
   name     varchar(50) primary key,
   category varchar(50) not null,
   foreign key ( category )
      references perishablecategories ( category ) -- Should be on Update cascade but oracle doesnt support, default is no action for delete
);

create table ingredient (
   id   integer primary key,
   name varchar(50) not null,
   foreign key ( name )
      references foodcategory ( name ) -- Should be on Update cascade but oracle doesnt support default is no action for delete
);

create table partof (
   did integer,
   iid integer,
   primary key ( did,
                 iid ),
   foreign key ( did )
      references dietaryrestriction ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( iid )
      references ingredient ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table recipeusedingredients (
   rid    integer,
   iid    integer,
   unit   varchar(20) not null,
   amount integer not null,
   primary key ( rid,
                 iid ),
   foreign key ( rid )
      references recipe_create ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( iid )
      references ingredient ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

create table poweredtools (
   name        varchar(20) primary key,
   powerneeded number(1,0) not null check ( powerneeded in ( 1,
                                                             0 ) ) -- since oracle doesn't support boolean, 0 = no, 1 = yes
);

create table microwavablematerials (
   material       varchar(20) primary key,
   ismicrowavable number(1,0) not null check ( ismicrowavable in ( 1,
                                                                   0 ) ) -- since oracle doesn't support boolean, 0 = no, 1 = yes
);

create table kitchentool (
   id        integer primary key,
   name      varchar(50) not null,
   tool_size varchar(20) not null,
   material  varchar(20) not null,
   foreign key ( name )
      references poweredtools ( name ),
   -- Should be on Update cascade but oracle doesnt support, default is no action for delete
   foreign key ( material )
      references microwavablematerials ( material ) -- Should be on Update cascade but oracle doesnt support, default for delete is no acton
);

create table require (
   rid      integer,
   kid      integer,
   quantity integer not null,
   primary key ( rid,
                 kid ),
   foreign key ( rid )
      references recipe_create ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( kid )
      references kitchentool ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

--Renamed from include to be more descriptive of what it contains
create table mealplanscheduledmeals (
   mpid integer,
   smid integer,
   primary key ( mpid,
                 smid ),
   foreign key ( mpid )
      references mealplan ( id )
         on delete cascade,
   -- Should be on Update cascade but oracle doesnt support
   foreign key ( smid )
      references scheduledmeal_madefrom ( id )
         on delete cascade -- Should be on Update cascade but oracle doesnt support
);

-- Insert Statements --
-- HeightWeightCalories (no dependencies)
insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 170.0,
           70.0,
           2200 );

insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 165.0,
           60.0,
           1900 );

insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 180.0,
           85.0,
           2500 );

insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 175.0,
           75.0,
           2300 );

insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 160.0,
           55.0,
           1800 );

insert into heightweightcalories (
   height,
   weight,
   maintenancecalorie
) values ( 190.0,
           125.0,
           3100 );

-- Users (depends on HeightWeightCalories)
insert into users (
   id,
   height,
   weight,
   name
) values ( 1,
           170.0,
           70.0,
           'John Smith' );

insert into users (
   id,
   height,
   weight,
   name
) values ( 2,
           165.0,
           60.0,
           'Emily Chen' );

insert into users (
   id,
   height,
   weight,
   name
) values ( 3,
           180.0,
           85.0,
           'Michael Johnson' );

insert into users (
   id,
   height,
   weight,
   name
) values ( 4,
           175.0,
           75.0,
           'Sarah Williams' );

insert into users (
   id,
   height,
   weight,
   name
) values ( 5,
           160.0,
           55.0,
           'Lisa Martinez' );

insert into users (
   id,
   height,
   weight,
   name
) values ( 6,
           190.0,
           125.0,
           'Absolute Unit' );

-- MealPlan (no dependencies)
insert into mealplan (
   id,
   name,
   mealsperweek,
   datecreated
) values ( 1,
           'High Protein Plan',
           21,
           to_date('2024-01-15','YYYY-MM-DD') );

insert into mealplan (
   id,
   name,
   mealsperweek,
   datecreated
) values ( 2,
           'Vegetarian Weekly',
           14,
           to_date('2024-02-20','YYYY-MM-DD') );

insert into mealplan (
   id,
   name,
   mealsperweek,
   datecreated
) values ( 3,
           'Keto Diet',
           21,
           to_date('2024-03-10','YYYY-MM-DD') );

insert into mealplan (
   id,
   name,
   mealsperweek,
   datecreated
) values ( 4,
           'Mediterranean Style',
           18,
           to_date('2024-04-05','YYYY-MM-DD') );

insert into mealplan (
   id,
   name,
   mealsperweek,
   datecreated
) values ( 5,
           'Low Carb Plan',
           21,
           to_date('2024-05-12','YYYY-MM-DD') );

-- DietaryRestriction (no dependencies)
insert into dietaryrestriction (
   id,
   name
) values ( 1,
           'Peanuts' );

insert into dietaryrestriction (
   id,
   name
) values ( 2,
           'Dairy' );

insert into dietaryrestriction (
   id,
   name
) values ( 3,
           'Gluten' );

insert into dietaryrestriction (
   id,
   name
) values ( 4,
           'Vegan' );

insert into dietaryrestriction (
   id,
   name
) values ( 5,
           'Low Sodium' );

insert into dietaryrestriction (id, name) values (6, 'Vegan');
insert into dietaryrestriction (id, name) values (7, 'Vegetarian');
insert into dietaryrestriction (id, name) values (8, 'Low Sodium');
insert into dietaryrestriction (id, name) values (9, 'Low Carb');
insert into dietaryrestriction (id, name) values (10, 'High Protein');

-- Allergy (depends on DietaryRestriction)
insert into allergy (
   id,
   severity
) values ( 1,
           'Severe' );

insert into allergy (
   id,
   severity
) values ( 2,
           'Moderate' );

insert into allergy (
   id,
   severity
) values ( 3,
           'Mild' );

-- Preference (depends on DietaryRestriction)
insert into preference (
   id,
   type
) values ( 4,
           'Ethical' );

insert into preference (
   id,
   type
) values ( 5,
           'Health' );

insert into preference (id, type) values (6, 'Ethical');
insert into preference (id, type) values (7, 'Lifestyle');
insert into preference (id, type) values (8, 'Health');
insert into preference (id, type) values (9, 'Taste');
insert into preference (id, type) values (10, 'Cultural');

-- Has (depends on Users and DietaryRestriction)
insert into has (
   usrid,
   did,
   isactive
) values ( 1,
           1,
           1 );

insert into has (
   usrid,
   did,
   isactive
) values ( 2,
           4,
           1 );

insert into has (
   usrid,
   did,
   isactive
) values ( 3,
           2,
           0 );

insert into has (
   usrid,
   did,
   isactive
) values ( 4,
           3,
           1 );

insert into has (
   usrid,
   did,
   isactive
) values ( 5,
           5,
           1 );

-- Follow (depends on Users and MealPlan)
insert into follow (
   usrid,
   mid,
   isactive
) values ( 1,
           1,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 2,
           2,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 3,
           3,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 4,
           4,
           0 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 5,
           5,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 6,
           1,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 6,
           2,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 6,
           3,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 6,
           4,
           1 );

insert into follow (
   usrid,
   mid,
   isactive
) values ( 6,
           5,
           1 );

-- DishServingTemperatures (no dependencies)
insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Grilled Chicken Salad',
           'Cold' );

insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Spaghetti Carbonara',
           'Hot' );

insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Caesar Salad',
           'Cold' );

insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Beef Stir Fry',
           'Hot' );

insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Smoothie Bowl',
           'Cold' );

insert into dishservingtemperatures (
   name,
   servingtemperature
) values ( 'Ribeye Steak',
           'Hot' );

-- Recipe_Create (depends on Users and DishServingTemperatures)
insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 1,
           'Grilled Chicken Salad',
           'Easy',
           1 );

insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 2,
           'Spaghetti Carbonara',
           'Medium',
           2 );

insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 3,
           'Caesar Salad',
           'Easy',
           3 );

insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 4,
           'Beef Stir Fry',
           'Medium',
           4 );

insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 5,
           'Smoothie Bowl',
           'Easy',
           5 );

insert into recipe_create (
   id,
   name,
   difficulty,
   usrid
) values ( 6,
           'Ribeye Steak',
           'Hard',
           4 );

-- SizeMicrowaveTimes (no dependencies)
insert into foodsizemicrowavetimes (
   food_size,
   needsreheating,
   microwavetime
) values ( 'Small',
           1,
           90 );

insert into foodsizemicrowavetimes (
   food_size,
   needsreheating,
   microwavetime
) values ( 'Medium',
           1,
           150 );

insert into foodsizemicrowavetimes (
   food_size,
   needsreheating,
   microwavetime
) values ( 'Large',
           1,
           210 );

insert into foodsizemicrowavetimes (
   food_size,
   needsreheating,
   microwavetime
) values ( 'Small',
           0,
           0 );

insert into foodsizemicrowavetimes (
   food_size,
   needsreheating,
   microwavetime
) values ( 'Medium',
           0,
           0 );

-- ScheduledMeal_MadeFrom (depends on Recipe_Create and foodsizemicrowavetimes)
insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 1,
           'Lunch',
           2,
           'Monday',
           1,
           'Medium',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 2,
           'Dinner',
           4,
           'Tuesday',
           2,
           'Large',
           1 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 3,
           'Lunch',
           1,
           'Wednesday',
           3,
           'Small',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 4,
           'Dinner',
           3,
           'Thursday',
           4,
           'Medium',
           1 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 5,
           'Breakfast',
           1,
           'Friday',
           5,
           'Small',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 6,
           'Dinner',
           2,
           'Friday',
           6,
           'Small',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 7,
           'Dinner',
           2,
           'Wednesday',
           6,
           'Small',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 8,
           'Dinner',
           2,
           'Monday',
           6,
           'Small',
           0 );

insert into scheduledmeal_madefrom (
   id,
   mealtype,
   servings,
   dayofweek,
   rid,
   food_size,
   needsreheating
) values ( 9,
           'Dinner',
           2,
           'Sunday',
           6,
           'Small',
           0 );

-- RecipeStep (depends on Recipe_Create)
insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 1,
           1,
           'Season and grill chicken breast until cooked through',
           15 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 1,
           2,
           'Wash and cut lettuce',
           5 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 2,
           1,
           'Boil pasta according to package directions',
           10 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 2,
           2,
           'On large saucepan heat milk and parmesan cheese',
           5 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 2,
           3,
           'Temper Egg Yolk ',
           1 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 2,
           4,
           'Reduce heat and add egg yolk to pan ',
           1 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 2,
           5,
           'Add pasta and serve',
           2 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           1,
           'Wash and chop romaine lettuce',
           5 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           2,
           'Cook chicken in pan with salt pepper and olive oil',
           10 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           3,
           'Cut chicken into slices',
           10 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           4,
           'Add dressing to lettuce',
           2 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           5,
           'Add croutons and chicken to salad',
           2 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 3,
           6,
           'Garnish with parmesan cheese',
           2 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 4,
           1,
           'Cut beef into thin strips and marinate',
           10 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 4,
           2,
           'Wash rice and put in rice cooker to cook',
           20 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 4,
           3,
           'Cook beef in pan',
           20 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 5,
           1,
           'Blend frozen fruits with Milk until smooth',
           3 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           1,
           'Remove steak from fridge 20 mins early and let air dry',
           20 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           2,
           'Pat steak dry on all sides with paper towel, and season generously on both sides with salt and pepper',
           2 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           3,
           'Heat pan over a medium high heat until smoking, add olive oil',
           5 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           4,
           'Sear first side of steak for 2.5 minutes, flip and sear for 2.5 minutes again. DO NOT TOUCH EARLY',
           5 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           5,
           'Lower heat to medium and add butter & thyme & garlic',
           1 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           6,
           'With a spoon baste the steak with the seasoned butter, flipping every 30s',
           3 );

insert into recipestep (
   id,
   ordernumber,
   description,
   timetocomplete
) values ( 6,
           7,
           'Remove steak and let rest on cutting board for 5 minutes',
           5 );

-- PerishableCategories (no dependencies)
insert into perishablecategories (
   category,
   isperishable
) values ( 'Protein',
           1 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Vegetables',
           1 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Grains',
           0 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Dairy',
           1 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Spices',
           0 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Jarred',
           0 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Frozen Fruit',
           0 );

insert into perishablecategories (
   category,
   isperishable
) values ( 'Fats',
           0 );

-- FoodCategory (depends on PerishableCategories)
insert into foodcategory (
   name,
   category
) values ( 'Chicken Breast',
           'Protein' );

insert into foodcategory (
   name,
   category
) values ( 'Romaine Lettuce',
           'Vegetables' );

insert into foodcategory (
   name,
   category
) values ( 'Spaghetti',
           'Grains' );

insert into foodcategory (
   name,
   category
) values ( 'Parmesan Cheese',
           'Dairy' );

insert into foodcategory (
   name,
   category
) values ( 'Black Pepper',
           'Spices' );

insert into foodcategory (
   name,
   category
) values ( 'Sea Salt',
           'Spices' );

insert into foodcategory (
   name,
   category
) values ( 'Ground Beef',
           'Protein' );

insert into foodcategory (
   name,
   category
) values ( 'Milk',
           'Jarred' );

insert into foodcategory (
   name,
   category
) values ( 'Croutons',
           'Grains' );

insert into foodcategory (
   name,
   category
) values ( 'Egg Yolk',
           'Protein' );

insert into foodcategory (
   name,
   category
) values ( 'Frozen Blueberries',
           'Frozen Fruit' );

insert into foodcategory (
   name,
   category
) values ( 'Frozen Raspberries',
           'Frozen Fruit' );

insert into foodcategory (
   name,
   category
) values ( 'White Rice',
           'Grains' );

insert into foodcategory (
   name,
   category
) values ( 'Caeser Dressing',
           'Jarred' );

insert into foodcategory (
   name,
   category
) values ( 'Ribeye Steak',
           'Protein' );

insert into foodcategory (
   name,
   category
) values ( 'Olive Oil',
           'Fats' );

insert into foodcategory (
   name,
   category
) values ( 'Butter',
           'Fats' );

-- Ingredient (depends on FoodCategory)
insert into ingredient (
   id,
   name
) values ( 1,
           'Chicken Breast' );

insert into ingredient (
   id,
   name
) values ( 2,
           'Romaine Lettuce' );

insert into ingredient (
   id,
   name
) values ( 3,
           'Spaghetti' );

insert into ingredient (
   id,
   name
) values ( 4,
           'Parmesan Cheese' );

insert into ingredient (
   id,
   name
) values ( 5,
           'Black Pepper' );

insert into ingredient (
   id,
   name
) values ( 6,
           'Sea Salt' );

insert into ingredient (
   id,
   name
) values ( 7,
           'Ground Beef' );

insert into ingredient (
   id,
   name
) values ( 8,
           'Milk' );

insert into ingredient (
   id,
   name
) values ( 9,
           'Croutons' );

insert into ingredient (
   id,
   name
) values ( 10,
           'Egg Yolk' );

insert into ingredient (
   id,
   name
) values ( 11,
           'Frozen Blueberries' );

insert into ingredient (
   id,
   name
) values ( 12,
           'Frozen Raspberries' );

insert into ingredient (
   id,
   name
) values ( 13,
           'White Rice' );

insert into ingredient (
   id,
   name
) values ( 14,
           'Caeser Dressing' );

insert into ingredient (
   id,
   name
) values ( 15,
           'Ribeye Steak' );

insert into ingredient (
   id,
   name
) values ( 16,
           'Olive Oil' );

insert into ingredient (
   id,
   name
) values ( 17,
           'Butter' );

-- PartOf (depends on DietaryRestriction and Ingredient)
insert into partof (
   did,
   iid
) values ( 2,
           4 );

insert into partof (
   did,
   iid
) values ( 3,
           3 );

insert into partof (
   did,
   iid
) values ( 4,
           1 );

insert into partof (
   did,
   iid
) values ( 4,
           4 );

insert into partof (
   did,
   iid
) values ( 1,
           5 );

-- RecipeUsedIngredients (depends on Recipe_Create and Ingredient)
-- Start grilled chicken salad
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 1,
           1,
           'grams',
           200 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 1,
           2,
           'heads',
           2 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 1,
           5,
           'pinches',
           1 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 1,
           6,
           'pinches',
           2 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 1,
           16,
           'tablespoon',
           1 );

-- End grilled chicken salad
--Start Spaghetti Carbonara
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           3,
           'grams',
           400 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           4,
           'grams',
           50 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           10,
           'yolks',
           2 );

--SPOLIVE
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           5,
           'pinches',
           1 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           6,
           'pinches',
           2 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 2,
           16,
           'tablespoon',
           1 );

-- End Carbonara
--Start Caesar Salad
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 3,
           2,
           'grams',
           300 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 3,
           14,
           'ml',
           120 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 3,
           9,
           'g',
           50 );


insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 3,
           4,
           'g',
           15 );
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 3,
           8,
           'ml',
           125 );

--End Caesar Salad
--Start Beef Stir Fry
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 4,
           13,
           'grams',
           100 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 4,
           7,
           'grams',
           200 );

--SPOLIVE
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 4,
           5,
           'pinches',
           1 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 4,
           6,
           'pinches',
           2 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 4,
           16,
           'tablespoon',
           1 );

--End stir fry
--Start Smoothie Bowl
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 5,
           8,
           'ml',
           150 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 5,
           11,
           'grams',
           100 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 5,
           12,
           'grams',
           60 );

--End Smoothie Bowl
--Start Steak
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 6,
           15,
           'ounce',
           16 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 6,
           16,
           'ounce',
           16 );

--SPOLIVE
insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 6,
           5,
           'pinches',
           1 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 6,
           6,
           'pinches',
           2 );

insert into recipeusedingredients (
   rid,
   iid,
   unit,
   amount
) values ( 6,
           17,
           'tablespoon',
           1 );

--End Steak
-- PoweredTools (no dependencies)
insert into poweredtools (
   name,
   powerneeded
) values ( 'Blender',
           1 );

insert into poweredtools (
   name,
   powerneeded
) values ( 'Food Processor',
           1 );

insert into poweredtools (
   name,
   powerneeded
) values ( 'Knife',
           0 );

insert into poweredtools (
   name,
   powerneeded
) values ( 'Cutting Board',
           0 );

insert into poweredtools (
   name,
   powerneeded
) values ( 'Stand Mixer',
           1 );

-- MicrowavableMaterials (no dependencies)
insert into microwavablematerials (
   material,
   ismicrowavable
) values ( 'Glass',
           1 );

insert into microwavablematerials (
   material,
   ismicrowavable
) values ( 'Plastic',
           1 );

insert into microwavablematerials (
   material,
   ismicrowavable
) values ( 'Metal',
           0 );

insert into microwavablematerials (
   material,
   ismicrowavable
) values ( 'Ceramic',
           1 );

insert into microwavablematerials (
   material,
   ismicrowavable
) values ( 'Wood',
           0 );

-- KitchenTool (depends on PoweredTools and MicrowavableMaterials)
insert into kitchentool (
   id,
   name,
   tool_size,
   material
) values ( 1,
           'Blender',
           'Large',
           'Glass' );

insert into kitchentool (
   id,
   name,
   tool_size,
   material
) values ( 2,
           'Food Processor',
           'Medium',
           'Plastic' );

insert into kitchentool (
   id,
   name,
   tool_size,
   material
) values ( 3,
           'Knife',
           'Small',
           'Metal' );

insert into kitchentool (
   id,
   name,
   tool_size,
   material
) values ( 4,
           'Cutting Board',
           'Large',
           'Wood' );

insert into kitchentool (
   id,
   name,
   tool_size,
   material
) values ( 5,
           'Stand Mixer',
           'Large',
           'Ceramic' );

-- Require (depends on Recipe_Create and KitchenTool)
insert into require (
   rid,
   kid,
   quantity
) values ( 1,
           3,
           1 );

insert into require (
   rid,
   kid,
   quantity
) values ( 2,
           4,
           1 );

insert into require (
   rid,
   kid,
   quantity
) values ( 3,
           3,
           1 );

insert into require (
   rid,
   kid,
   quantity
) values ( 4,
           2,
           1 );

insert into require (
   rid,
   kid,
   quantity
) values ( 5,
           1,
           1 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           1 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           2 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           3 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           4 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           5 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           6 );


insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           7 );


insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 1,
           8 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 2,
           2 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 3,
           4 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 3,
           5 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 3,
           1 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 4,
           1 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 4,
           2 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 4,
           3 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 4,
           4 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 5,
           1 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 5,
           4 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 5,
           5 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 5,
           6 );

insert into mealplanscheduledmeals (
   mpid,
   smid
) values ( 5,
           7 );
           

commit