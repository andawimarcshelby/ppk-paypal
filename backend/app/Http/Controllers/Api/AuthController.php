<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class AuthController extends Controller
{
    // POST /api/register
    public function register(Request $request)
    {
        $data = $request->validate([
            'full_name'            => ['required', 'string', 'max:255'],
            'email'                => ['required', 'email', 'max:255', 'unique:users,email'],
            'mobile_number'        => ['nullable', 'string', 'max:32'],
            'password'             => ['required', 'confirmed', Password::min(8)],
        ]);

        $user = User::create([
            'full_name'      => $data['full_name'],
            'email'          => $data['email'],
            'mobile_number'  => $data['mobile_number'] ?? null,
            'password'       => Hash::make($data['password']),
            // make sure your users table has these columns
            'two_factor_enabled' => false,
            'two_factor_secret'  => null,
        ]);

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'message' => 'Registered',
            'user'    => $user->only([
                'id','full_name','email','mobile_number','two_factor_enabled','created_at','updated_at'
            ]),
            'token'   => $token,
        ]);
    }

    // POST /api/login
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
            'code'     => ['nullable', 'string'], // 6-digit TOTP (optional)
        ]);

        /** @var User|null $user */
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // If 2FA is enabled, enforce it
        if ($user->two_factor_enabled) {
            // If no code was sent => 409 to trigger the challenge on the frontend
            if (empty($data['code'])) {
                return response()->json(['message' => 'Two-factor code required'], 409);
            }

            $google2fa = new Google2FA();
            $isValid = $google2fa->verifyKey($user->two_factor_secret, $data['code']);

            if (!$isValid) {
                return response()->json(['message' => 'Invalid two-factor code'], 422);
            }
        }

        $token = $user->createToken('auth')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => $user->only([
                'id','full_name','email','mobile_number','two_factor_enabled','created_at','updated_at'
            ]),
        ]);
    }

    // POST /api/logout (auth)
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json(['message' => 'Logged out']);
    }

    // GET /api/user (auth)
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()->only([
                'id','full_name','email','mobile_number','two_factor_enabled','created_at','updated_at'
            ]),
        ]);
    }

    // POST /api/2fa/setup (auth)
    // Generates a secret and otpauth:// URL (frontend renders QR)
    public function twoFaSetup(Request $request)
    {
        $user = $request->user();
        $google2fa = new Google2FA();

        // generate new secret (don’t enable yet)
        $secret = $google2fa->generateSecretKey();

        // save the secret temporarily (you can keep it; final enable happens in verify)
        $user->two_factor_secret = $secret;
        $user->save();

        $company = config('app.name', 'PPK');
        $otpauth = $google2fa->getQRCodeUrl($company, $user->email, $secret);

        return response()->json([
            'secret'      => $secret,
            'otpauth_url' => $otpauth,
        ]);
    }

    // POST /api/2fa/verify (auth)
    public function twoFaVerify(Request $request)
    {
        $data = $request->validate([
            'code' => ['required', 'string'],
        ]);

        $user = $request->user();
        if (!$user->two_factor_secret) {
            return response()->json(['message' => '2FA not initialized'], 422);
        }

        $google2fa = new Google2FA();
        $isValid = $google2fa->verifyKey($user->two_factor_secret, $data['code']);

        if (!$isValid) {
            return response()->json(['message' => 'Invalid two-factor code'], 422);
        }

        $user->two_factor_enabled = true;
        $user->save();

        return response()->json([
            'message'           => 'Two-factor enabled',
            'two_factor_enabled'=> true,
        ]);
    }

    // POST /api/2fa/disable (auth)
    public function twoFaDisable(Request $request)
    {
        $user = $request->user();
        $user->two_factor_enabled = false;
        // If you want to keep the secret for future re-enable, omit the next line:
        // $user->two_factor_secret  = null;
        $user->save();

        return response()->json([
            'message'            => 'Two-factor disabled',
            'two_factor_enabled' => false,
        ]);
    }
}
