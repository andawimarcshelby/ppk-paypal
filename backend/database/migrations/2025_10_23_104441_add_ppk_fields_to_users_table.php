<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Core profile fields
            $table->string('full_name')->after('id');
            $table->string('mobile_number')->nullable()->after('email');

            // Verification
            $table->boolean('is_verified')->default(false)->after('remember_token');

            // 2FA (TOTP)
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->boolean('two_factor_enabled')->default(false)->after('two_factor_secret');

            // Last login info
            $table->timestamp('last_login_at')->nullable()->after('two_factor_enabled');
            $table->string('last_login_ip', 45)->nullable()->after('last_login_at'); // IPv4/IPv6
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'full_name',
                'mobile_number',
                'is_verified',
                'two_factor_secret',
                'two_factor_enabled',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
