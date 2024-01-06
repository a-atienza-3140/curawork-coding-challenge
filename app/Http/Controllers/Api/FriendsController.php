<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;

class FriendsController extends Controller
{
    /**
     * @return JsonResource
     */
    public function index(): JsonResource
    {
        $user = Auth::user();
        $friends = $user->friends()->paginate(10);

        $friends->getCollection()->transform(function ($friend) use ($user) {
            $mutualFriends = $user->mutualFriendsWith($friend)->get();
            $friend->setRelation('mutualFriends', $mutualFriends);
            return $friend;
        });

        return UserResource::collection($friends);
    }

    public function destroy(Request $request)
    {
        $friendId = $request->input('friend_id');
        $user = Auth::user();

        $user->friends()->detach($friendId);
        $user->sentRequest()->detach($friendId);
        $user->receiveRequest()->detach($friendId);

        return response()->json(['message' => 'friend has been removed']);
    }
}
