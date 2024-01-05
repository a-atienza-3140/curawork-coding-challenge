<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;

class SentRequestFriendsController extends Controller
{
    /**
     * @return JsonResource
     */
    public function index(): JsonResource
    {
        $user = Auth::user();
        $receivedRequest = $user->receiveRequest()->paginate(10);
        return UserResource::collection($receivedRequest);
    }
}
