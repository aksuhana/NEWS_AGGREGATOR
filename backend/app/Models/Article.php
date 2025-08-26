<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $fillable = [
        'external_id','title','description','content','url',
        'image_url','source','author','category','published_at'
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
