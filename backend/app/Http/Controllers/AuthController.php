<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $r)
    {
        $r->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
        ]);

        $u = User::create([
            'name' => $r->name,
            'email' => $r->email,
            'password' => Hash::make($r->password),
        ]);

        return [
            'token' => $u->createToken('api')->plainTextToken,
            'user'  => $u,
        ];
    }

    public function login(Request $r)
    {
        $r->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $u = User::where('email', $r->email)->first();
        if (!$u || !Hash::check($r->password, $u->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        return [
            'token' => $u->createToken('api')->plainTextToken,
            'user'  => $u,
        ];
    }

    public function logout(Request $r)
    {
        $r->user()->currentAccessToken()?->delete();
        return ['ok' => true];
    }
}
