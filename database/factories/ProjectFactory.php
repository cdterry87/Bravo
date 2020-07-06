<?php

use App\Project;
use Faker\Generator as Faker;

$factory->define(Project::class, function (Faker $faker) {
    $completed = rand(0, 1);
    $completed_date = null;
    if ($completed) {
        $completed_date = date('Y-m-d H:i:s');
    }

    return [
        'client_id' => rand(1, 9),
        'name' => ucwords($faker->words(rand(3, 5), true)),
        'details' => $faker->paragraph(rand(1, 3)),
        'due_date' => $faker->dateTimeBetween('-6 months', '+6 months'),
        'completed' => $completed,
        'completed_date' => $completed_date
    ];
});
