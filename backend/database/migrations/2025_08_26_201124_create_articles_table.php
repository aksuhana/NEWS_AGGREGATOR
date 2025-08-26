<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up(): void
{
    Schema::create('articles', function (Blueprint $t) {
        $t->id();
        $t->string('external_id')->index();
        $t->string('title');
        $t->text('description')->nullable();
        $t->longText('content')->nullable();
        $t->string('url')->unique();
        $t->string('image_url')->nullable();
        $t->string('source')->index();
        $t->string('author')->nullable()->index();
        $t->string('category')->nullable()->index();
        $t->timestamp('published_at')->index();
        $t->timestamps();
    });
}



    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
