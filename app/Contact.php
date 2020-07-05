<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    protected $table = 'contacts';
    protected $guarded = [];

    public function client()
    {
        return $this->belongsTo('App\Client');
    }
}
