<?php

use App\Contact;
use Faker\Generator as Faker;

$factory->define(Contact::class, function (Faker $faker) {
    return [
        'client_id' => rand(1, 9),
        'name' => $faker->name,
        'title' => ucwords($faker->words(rand(2, 5), true)),
        'email' => $faker->unique()->safeEmail,
        'phone' => $faker->tollFreePhoneNumber()
    ];
});
