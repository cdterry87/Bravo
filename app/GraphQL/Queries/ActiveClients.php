<?php

namespace App\GraphQL\Queries;

use App\Client;

class ActiveClients
{
    public function __invoke($_, array $args)
    {
        return Client::where('active', 1)->orderBy('name')->get();
    }
}
