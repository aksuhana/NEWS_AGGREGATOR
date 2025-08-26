<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Preference;

class PreferenceController extends Controller
{
    public function show(Request $r)
    {
        return Preference::firstOrCreate(['user_id' => $r->user()->id]);
    }

    public function store(Request $r)
    {
        $data = $r->validate([
            'sources'    => 'array',
            'categories' => 'array',
            'authors'    => 'array',
        ]);

        $p = Preference::firstOrCreate(['user_id' => $r->user()->id]);
        $p->fill([
            'sources'    => $data['sources']    ?? [],
            'categories' => $data['categories'] ?? [],
            'authors'    => $data['authors']    ?? [],
        ])->save();

        return $p;
    }
}
