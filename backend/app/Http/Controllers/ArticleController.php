<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Article;

class ArticleController extends Controller
{
    public function index(Request $r)
    {
        $q = Article::query();

        if ($r->q) {
            $q->where(function ($qq) use ($r) {
                $qq->where('title', 'like', '%' . $r->q . '%')
                   ->orWhere('description', 'like', '%' . $r->q . '%');
            });
        }

        if ($r->dateFrom) $q->where('published_at', '>=', $r->dateFrom);
        if ($r->dateTo)   $q->where('published_at', '<=', $r->dateTo);
        if ($r->sources)  $q->whereIn('source', explode(',', $r->sources));
        if ($r->category) $q->where('category', $r->category);
        if ($r->author)   $q->where('author', $r->author);

        return $q->orderByDesc('published_at')->paginate(20);
    }

    public function show($id)
    {
        return Article::findOrFail($id);
    }
}
