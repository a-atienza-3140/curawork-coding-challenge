<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Enums\ConnectionEnums;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function friends()
    {
        $friendsOfMine = $this->friendsOfMine()
                         ->select('users.id', 'users.name', 'users.email')
                         ->getQuery();

        $friendOf = $this->friendOf()
                        ->select('users.id', 'users.name', 'users.email')
                        ->getQuery();

        return $friendsOfMine->union($friendOf);
    }

    public function friendsOfMine()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
                    ->wherePivot('status', ConnectionEnums::Accepted->value);
    }

    public function friendOf()
    {
        return $this->belongsToMany(User::class, 'friendships', 'friend_id', 'user_id')
                    ->wherePivot('status', ConnectionEnums::Accepted->value);
    }

    public function sentRequest()
    {
        return $this->belongsToMany(User::class, 'friendships', 'user_id', 'friend_id')
                    ->wherePivot('status', ConnectionEnums::Pending->value)
                    ->wherePivot('sender_id', $this->id);
    }

    public function receiveRequest()
    {
        return $this->belongsToMany(User::class, 'friendships', 'friend_id', 'user_id')
                    ->wherePivot('status', ConnectionEnums::Pending->value)
                    ->wherePivot('sender_id', '!=', $this->id);
    }

    public function hasFriendshipWith($userId)
    {
        $isAlreadyFriend = $this->friendsOfMine()->where('users.id', $userId)->exists() ||
                           $this->friendOf()->where('users.id', $userId)->exists();
    
        $hasPendingRequest = $this->sentRequest()->where('users.id', $userId)->exists() ||
                             $this->receiveRequest()->where('users.id', $userId)->exists();
    
        return $isAlreadyFriend || $hasPendingRequest;
    }
}
