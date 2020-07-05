<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Project extends Model
{
    protected $table = 'projects';
    protected $guarded = [];

    public function tasks()
    {
        return $this->hasMany('App\Task');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo('App\Client');
    }

    public function issues()
    {
        return $this->hasMany('App\Issue');
    }
}
