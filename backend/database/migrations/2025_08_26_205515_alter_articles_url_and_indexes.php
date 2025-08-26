<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $t) {
            // Drop unique index on url if it exists (default name below)
            try { $t->dropUnique('articles_url_unique'); } catch (\Throwable $e) {}

            // Make url & image_url long text to avoid 255 limit
            $t->longText('url')->change();
            $t->longText('image_url')->nullable()->change();

            // Ensure external_id is unique for upserts
            try { $t->unique('external_id'); } catch (\Throwable $e) {}
        });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $t) {
            // Best-effort rollback (not strictly needed for the challenge)
            // $t->dropUnique(['external_id']);
            // $t->string('url')->change();
            // $t->string('image_url')->nullable()->change();
            // $t->unique('url');
        });
    }
};
