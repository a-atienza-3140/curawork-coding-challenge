<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Http\Resources\UserResource;

class UsersController extends Controller
{
    /**
     * @return JsonResource
     */
    public function index(): JsonResource
    {
        $users = User::paginate(10);
        return UserResource::collection($users);
    }
}
