<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'status',
        'is_online',
        'last_seen_at',
        'otp_code',
        'otp_expires_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'otp_expires_at' => 'datetime',
        'last_seen_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function monitors()
    {
        return $this->hasMany(Monitor::class);
    }

    public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function markOnline()
    {
        $this->update([
            'is_online' => true,
            'last_seen_at' => now(),
        ]);
    }

    public function markOffline()
    {
        $this->update(['is_online' => false]);
    }
}