<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Enums\ConnectionEnums;

class ConnectionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $users = User::all();

        $statuses = ['accepted', 'pending'];

        foreach ($users as $user) {
            $friends = $users->where('id', '!=', $user->id);

            foreach ($friends as $friend) {
                if (!$user->hasFriendshipWith($friend->id)) {
                    $status = ConnectionEnums::cases()[array_rand(ConnectionEnums::cases())]->value;

                    $user->friendsOfMine()->attach($friend->id, [
                        'status' => $status,
                        'sender_id' => $user->id,
                        'created_at' => now(),
                        'updated_at' => now()
                    ]);
                }
            }
        }
    }
}
