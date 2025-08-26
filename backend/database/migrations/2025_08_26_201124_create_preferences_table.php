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
    Schema::create('preferences', function (Blueprint $t) {
        $t->id();
        $t->foreignId('user_id')->constrained()->cascadeOnDelete();
        $t->json('sources')->nullable();
        $t->json('categories')->nullable();
        $t->json('authors')->nullable();
        $t->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('preferences');
    }
};
