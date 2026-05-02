<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\ReferralCommission;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AgentWithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = Withdrawal::with(['agent:id,name,email']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->latest()->paginate(20);

        $totalPending = Withdrawal::where('status', 'pending')->sum('amount');
        $totalApproved = Withdrawal::where('status', 'approved')->sum('amount');
        $totalRejected = Withdrawal::where('status', 'rejected')->sum('amount');
        $pendingCount = Withdrawal::where('status', 'pending')->count();

        return Inertia::render('Admin/Withdrawals', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only('status'),
            'summary' => [
                'total_pending' => (float) $totalPending,
                'total_approved' => (float) $totalApproved,
                'total_rejected' => (float) $totalRejected,
                'pending_count' => $pendingCount,
            ],
        ]);
    }

    public function process(Request $request, Withdrawal $withdrawal)
    {
        if ($withdrawal->status !== 'pending') {
            return back()->withErrors(['message' => 'This withdrawal has already been processed.']);
        }

        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string|max:500',
        ]);

        return DB::transaction(function () use ($withdrawal, $validated) {
            if ($validated['action'] === 'approve') {
                return $this->approveWithdrawal($withdrawal, $validated['notes'] ?? null);
            }
            return $this->rejectWithdrawal($withdrawal, $validated['notes'] ?? null);
        });
    }

    private function approveWithdrawal(Withdrawal $withdrawal, ?string $notes)
    {
        $agentId = $withdrawal->agent_id;
        $remaining = (float) $withdrawal->amount;

        // Partially withdraw from commissions
        $commissions = Commission::where('agent_id', $agentId)
            ->where('status', 'available')
            ->orderBy('created_at')
            ->get();

        foreach ($commissions as $commission) {
            if ($remaining <= 0) break;

            $availableOnThis = (float) bcsub((string) $commission->commission_amount, (string) $commission->withdrawn_amount, 2);
            if ($availableOnThis <= 0) continue;

            $deduct = min($availableOnThis, $remaining);
            $newWithdrawn = (float) bcadd((string) $commission->withdrawn_amount, (string) $deduct, 2);

            $fullyWithdrawn = bccomp((string) $newWithdrawn, (string) $commission->commission_amount, 2) >= 0;

            $commission->update([
                'withdrawn_amount' => $newWithdrawn,
                'status' => $fullyWithdrawn ? 'withdrawn' : 'available',
            ]);

            $remaining = (float) bcsub((string) $remaining, (string) $deduct, 2);
        }

        // Then from referral commissions if still remaining
        if ($remaining > 0) {
            $referralCommissions = ReferralCommission::where('referrer_id', $agentId)
                ->where('status', 'available')
                ->orderBy('created_at')
                ->get();

            foreach ($referralCommissions as $rc) {
                if ($remaining <= 0) break;

                $availableOnThis = (float) bcsub((string) $rc->referral_amount, (string) $rc->withdrawn_amount, 2);
                if ($availableOnThis <= 0) continue;

                $deduct = min($availableOnThis, $remaining);
                $newWithdrawn = (float) bcadd((string) $rc->withdrawn_amount, (string) $deduct, 2);

                $fullyWithdrawn = bccomp((string) $newWithdrawn, (string) $rc->referral_amount, 2) >= 0;

                $rc->update([
                    'withdrawn_amount' => $newWithdrawn,
                    'status' => $fullyWithdrawn ? 'withdrawn' : 'available',
                ]);

                $remaining = (float) bcsub((string) $remaining, (string) $deduct, 2);
            }
        }

        // Credit agent wallet
        $agent = $withdrawal->agent;
        $agent->wallet_balance = (float) bcadd((string) $agent->wallet_balance, (string) $withdrawal->net_amount, 2);
        $agent->save();

        $withdrawal->update([
            'status' => 'approved',
            'admin_note' => $notes,
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal approved. GHS ' . number_format($withdrawal->net_amount, 2) . ' credited.');
    }

    private function rejectWithdrawal(Withdrawal $withdrawal, ?string $notes)
    {
        $withdrawal->update([
            'status' => 'rejected',
            'admin_note' => $notes,
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal rejected.');
    }
}
