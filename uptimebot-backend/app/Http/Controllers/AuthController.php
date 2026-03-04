<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\OtpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(private OtpService $otpService) {}

    // Helper: create token with expiry
    private function createToken(User $user): string
    {
        return $user->createToken('auth-token', ['*'], now()->addMinutes(480))->plainTextToken;
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'nullable|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user) {
            return response()->json(['message' => 'Email not found. Please contact administrator.'], 404);
        }

        // Admin must use password
        if ($user->role === 'admin') {
            if (!isset($data['password'])) {
                return response()->json(['message' => 'Password required for admin login.'], 422);
            }

            if (!Hash::check($data['password'], $user->password)) {
                throw ValidationException::withMessages(['password' => 'Invalid password.']);
            }

            $user->markOnline();
            $token = $this->createToken($user); // ← uses helper with expiry

            return response()->json([
                'user' => $user,
                'token' => $token,
                'requires_otp' => false,
            ]);
        }

        // Regular users: check status
        if ($user->status === 'disabled') {
            return response()->json(['message' => 'Your account has been disabled.'], 403);
        }

        // If user is pending (first time), send OTP
        if ($user->status === 'pending') {
            $otp = $this->otpService->generate($user);
            $this->otpService->send($user, $otp);

            return response()->json([
                'message' => 'OTP sent to your email. Complete your registration.',
                'requires_otp' => true,
                'email' => $user->email,
            ]);
        }

        // If user is registered/active and has password, use password login
        if (in_array($user->status, ['registered', 'active']) && $user->password) {
            if (!isset($data['password'])) {
                return response()->json(['message' => 'Password required.'], 422);
            }

            if (!Hash::check($data['password'], $user->password)) {
                throw ValidationException::withMessages(['password' => 'Invalid password.']);
            }

            $user->markOnline();
            $token = $this->createToken($user); // ← uses helper with expiry

            return response()->json([
                'user' => $user,
                'token' => $token,
                'requires_otp' => false,
            ]);
        }

        // Fallback: send OTP if no password set
        $otp = $this->otpService->generate($user);
        $this->otpService->send($user, $otp);

        return response()->json([
            'message' => 'OTP sent to your email.',
            'requires_otp' => true,
            'email' => $user->email,
        ]);
    }

    public function verifyOtp(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'name' => 'required|string|max:100',
            'password' => 'required|string|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        $result = $this->otpService->verify($user, $data['otp']);

        if (!$result['success']) {
            return response()->json(['message' => $result['message']], 422);
        }

        $user->update([
            'name' => $data['name'],
            'password' => Hash::make($data['password']),
            'status' => 'registered',
            'email_verified_at' => now(),
        ]);

        $user->markOnline();
        $token = $this->createToken($user); // ← uses helper with expiry

        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Account setup complete!',
        ]);
    }

    public function resendOtp(Request $request)
    {
        $data = $request->validate(['email' => 'required|email']);
        $user = User::where('email', $data['email'])->firstOrFail();

        $otp = $this->otpService->generate($user);
        $this->otpService->send($user, $otp);

        return response()->json(['message' => 'OTP resent successfully.']);
    }

    public function logout(Request $request)
    {
        $request->user()->markOffline();
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request)
    {
        $user = $request->user();
        return response()->json($user->load('monitors'));
    }
}