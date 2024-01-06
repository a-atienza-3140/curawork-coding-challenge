<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class UsersController extends Controller
{
    /**
     * @return JsonResource
     */
    public function index()
    {
        $user = Auth::user();
        $usersWithoutConnection = $user->usersWithoutConnection()->paginate(10);
        return UserResource::collection($usersWithoutConnection);
    }
}
