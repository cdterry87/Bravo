<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Issue extends Model
{
    protected $table = 'issues';
    protected $guarded = [];

    public function project()
    {
        return $this->belongsTo('App\Project');
    }
}
