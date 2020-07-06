<?php

use App\Task;
use Faker\Generator as Faker;

$factory->define(Task::class, function (Faker $faker) {
    $completed = rand(0, 1);
    $completed_date = null;
    if ($completed) {
        $completed_date = date('Y-m-d H:i:s');
    }

    return [
        'project_id' => rand(1, 9),
        'details' => $faker->sentences(rand(1, 5), true),
        'due_date' => $faker->dateTimeBetween('-6 months', '+6 months'),
        'completed' => $completed,
        'completed_date' => $completed_date
    ];
});
