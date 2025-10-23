<?php

return [

    /*
    |--------------------------------------------------------------------------
    | TOTP Window (in time-steps)
    |--------------------------------------------------------------------------
    | How many adjacent time-steps are allowed when verifying a code.
    | 1–2 is typical. Larger window = more tolerant but less strict.
    */
    'window' => 1,

    /*
    |--------------------------------------------------------------------------
    | Key Regeneration
    |--------------------------------------------------------------------------
    | If true, a new secret will be generated when calling helper functions
    | that ask for a secret but none exists. We'll control this ourselves
    | in our own endpoints, so keep false.
    */
    'regenerate' => false,

    /*
    |--------------------------------------------------------------------------
    | Forbid Reuse
    |--------------------------------------------------------------------------
    | If true, the same OTP code cannot be used twice in a row within the
    | same time-step. Recommended: true.
    */
    'forbid_old_passwords' => true,

    /*
    |--------------------------------------------------------------------------
    | Issuer (shown in authenticator apps)
    |--------------------------------------------------------------------------
    | Used in the otpauth:// label. We'll set the issuer dynamically when
    | building the otpauth URL from our endpoint (recommended).
    */
    'issuer' => env('APP_NAME', 'PPK-PayPal'),

    /*
    |--------------------------------------------------------------------------
    | Stat Tracking (not used here)
    |--------------------------------------------------------------------------
    */
    'statistic' => [
        'enabled' => false,
    ],
];
