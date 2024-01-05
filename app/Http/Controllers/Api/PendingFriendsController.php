<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\UserResource;
use App\Enums\ConnectionEnums;
use App\Models\User;

class PendingFriendsController extends Controller
{
    /**
     * @return JsonResource
     */
    public function index(): JsonResource
    {
        $user = Auth::user();
        $pending = $user->sentRequest()->paginate(10);
        return UserResource::collection($pending);
    }

    public function store(Request $request)
    {
        $recipientId = $request->input('recipient_id');
        $sender = Auth::user();
        $recipient = User::find($recipientId);

        if (!$recipient) {
            return response()->json(['message' => 'Recipient not found'], 404);
        }

        $sender->sentRequest()->attach($recipientId, ['sender_id' => $sender->id, 'status' => ConnectionEnums::Pending->value]);

        return response()->json(['message' => 'Friend request sent']);
    }

    public function update(Request $request)
    {
        $senderId = $request->input('sender_id');
        $recipient = Auth::user();
        
        $recipient->sentRequest()->updateExistingPivot($senderId, ['status' => ConnectionEnums::Accepted->value]);

        return response()->json(['message' => 'Friend request accepted']);
    }
}
