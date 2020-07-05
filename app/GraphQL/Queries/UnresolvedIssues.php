<?php

namespace App\GraphQL\Queries;

use App\Issue;

class UnresolvedIssues
{
    public function __invoke($_, array $args)
    {
        return Issue::where('resolved', 0)->orderBy('created_at')->get();
    }
}
