# Bravo
A personal project manager built with Laravel + Vue.js + GraphQL 
 
## Installation
1. Clone the project to your PC
```
git clone https://github.com/cdterry87/Bravo.git bravo
```

2. Setup the application
```
composer install              # Install dependencies with composer
cp .env.example .env          # Create your .env file based on the .env.example file and change the appropriate values
php artisan key:generate      # Generate an application key for your project
php artisan migrate --seed    # Migrate the database schema and seed with mock data

php artisan serve             # Runs the application on a local web server
```
