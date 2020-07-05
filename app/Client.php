<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    protected $table = 'clients';
    protected $guarded = [];

    public function projects()
    {
        return $this->hasMany('App\Project');
    }

    public function contacts()
    {
        return $this->hasMany('App\Contact');
    }
}
