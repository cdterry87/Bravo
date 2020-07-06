<?php

use App\Client;
use Faker\Generator as Faker;

$factory->define(Client::class, function (Faker $faker) {
    return [
        'name' => ucwords($faker->words(rand(3, 5), true)),
        'details' => $faker->paragraph(rand(1, 3)),
        'active' => rand(0, 1)
    ];
});
