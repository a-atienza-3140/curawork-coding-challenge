<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'mutual_friends_count' => isset($this->mutualFriends) ? $this->mutualFriends->count() : 0,
            'mutual_friends' => isset($this->mutualFriends) ? $this->mutualFriends : null,
        ];
    }
}
