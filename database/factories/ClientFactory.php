<?php

use App\Client;
use Faker\Generator as Faker;

$factory->define(Client::class, function (Faker $faker) {
    return [
        'name' => ucwords($faker->sentence(rand(3, 6), true)),
        'details' => $faker->paragraph(rand(1, 5)),
        'active' => rand(0, 1)
    ];
});
