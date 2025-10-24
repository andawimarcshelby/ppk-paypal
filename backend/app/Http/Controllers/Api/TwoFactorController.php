<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    /**
     * Generate a secret + otpauth string for the current user.
     * Does NOT enable 2FA yet. Frontend will display the QR (from otpauth URL) and ask for a 6-digit code.
     */
    public function setup(Request $request)
    {
        $user = $request->user();
        $g2fa = new Google2FA();

        // Reuse existing secret if present & not enabled yet; else create a fresh one
        if (!$user->two_factor_secret) {
            $user->two_factor_secret = $g2fa->generateSecretKey(32);
            $user->save();
        }

        $issuer = config('app.name', 'PPK-Paypal');
        $otpauth = $g2fa->getQRCodeUrl(
            $issuer,
            $user->email,
            $user->two_factor_secret
        );

        return response()->json([
            'secret'    => $user->two_factor_secret,
            'otpauth'   => $otpauth, // e.g. "otpauth://totp/Issuer:email?secret=...&issuer=Issuer"
            'enabled'   => (bool) $user->two_factor_enabled,
            'issuer'    => $issuer,
            'account'   => $user->email,
        ]);
    }

    /**
     * Verify the 6-digit TOTP code and enable 2FA.
     */
    public function verify(Request $request)
    {
        $data = $request->validate([
            'code' => ['required','string','regex:/^\d{6}$/'],
        ]);

        $user = $request->user();
        if (!$user->two_factor_secret) {
            throw ValidationException::withMessages([
                'code' => ['2FA secret not initialized. Call /2fa/setup first.'],
            ]);
        }

        $g2fa = new Google2FA();
        $valid = $g2fa->verifyKey($user->two_factor_secret, $data['code'], 1); // 1 = ±30s window

        if (!$valid) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired code.'],
            ]);
        }

        $user->two_factor_enabled = true;
        $user->save();

        return response()->json([
            'message' => 'Two-factor enabled',
            'user'    => [
                'id'                  => $user->id,
                'email'               => $user->email,
                'two_factor_enabled'  => (bool) $user->two_factor_enabled,
            ],
        ]);
    }

    /**
     * Disable 2FA (requires current valid 6-digit code).
     */
    public function disable(Request $request)
    {
        $data = $request->validate([
            'code' => ['required','string','regex:/^\d{6}$/'],
        ]);

        $user = $request->user();
        if (!$user->two_factor_secret || !$user->two_factor_enabled) {
            return response()->json([
                'message' => 'Two-factor already disabled',
            ]);
        }

        $g2fa = new Google2FA();
        $valid = $g2fa->verifyKey($user->two_factor_secret, $data['code'], 1);

        if (!$valid) {
            throw ValidationException::withMessages([
                'code' => ['Invalid or expired code.'],
            ]);
        }

        // Keep the secret so a user can re-enable without re-setup (or wipe it — your choice).
        $user->two_factor_enabled = false;
        $user->save();

        return response()->json([
            'message' => 'Two-factor disabled',
        ]);
    }
}
