<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // adjust if you have specific policies
    }

    public function rules(): array
    {
        return [
            'full_name'        => ['required','string','max:255'],
            'email'            => ['required','email','max:255','unique:users,email'],
            'mobile_number'    => ['required','string','max:20','unique:users,mobile_number'],
            'password'         => ['required','string','min:8','confirmed'],
            // expects password_confirmation alongside password
        ];
    }
}
