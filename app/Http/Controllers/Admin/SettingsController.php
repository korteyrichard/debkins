<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => [
                'agent_registration_fee' => (float) Setting::get('agent_registration_fee', 50),
                'minimum_withdrawal' => (float) Setting::get('minimum_withdrawal', 10),
                'withdrawal_fee' => (float) Setting::get('withdrawal_fee', 0),
                'referral_commission_percentage' => (float) Setting::get('referral_commission_percentage', 5),
                'youtube_track_order_url' => Setting::get('youtube_track_order_url', ''),
                'youtube_verify_topup_url' => Setting::get('youtube_verify_topup_url', ''),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'agent_registration_fee' => 'required|numeric|min:0',
            'minimum_withdrawal' => 'required|numeric|min:0',
            'withdrawal_fee' => 'required|numeric|min:0|max:100',
            'referral_commission_percentage' => 'required|numeric|min:0|max:100',
            'youtube_track_order_url' => 'nullable|url|max:500',
            'youtube_verify_topup_url' => 'nullable|url|max:500',
        ]);

        foreach ($validated as $key => $value) {
            Setting::set($key, $value);
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
