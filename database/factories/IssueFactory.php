<?php

use App\Issue;
use Faker\Generator as Faker;

$factory->define(Issue::class, function (Faker $faker) {
    $resolved = rand(0, 1);
    $resolved_date = null;
    if ($resolved) {
        $resolved_date = date('Y-m-d H:i:s');
    }

    return [
        'project_id' => rand(1, 9),
        'details' => $faker->sentence(rand(3, 10)),
        'priority' => rand(1, 5),
        'resolved' => $resolved,
        'resolved_date' => $resolved_date,
    ];
});
