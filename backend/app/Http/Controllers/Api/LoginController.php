<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class LoginController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'code'     => 'nullable|string',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // 2FA required but no code provided
        if ($user->two_factor_enabled && !$request->code) {
            return response()->json([
                'status'  => 'PENDING_2FA',
                'message' => 'Two-factor authentication required. Please provide a 6-digit code.'
            ], 409);
        }

        // 2FA verification if enabled and code is given
        if ($user->two_factor_enabled && $request->code) {
            try {
                $google2fa = app('pragmarx.google2fa');
                $valid = $google2fa->verifyKey($user->two_factor_secret, $request->code);
            } catch (\Exception $e) {
                return response()->json(['message' => '2FA validation failed'], 500);
            }

            if (!$valid) {
                return response()->json(['message' => 'Invalid or expired 2FA code'], 403);
            }
        }

        // Create Sanctum token
        $token = $user->createToken('api_token')->plainTextToken;

        // Update user login metadata
        $user->last_login_at = now();
        $user->last_login_ip = $request->ip();
        $user->save();

        return response()->json([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id' => $user->id,
                'full_name' => $user->full_name,
                'email' => $user->email,
                'mobile_number' => $user->mobile_number,
                'two_factor_enabled' => $user->two_factor_enabled,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }
}
