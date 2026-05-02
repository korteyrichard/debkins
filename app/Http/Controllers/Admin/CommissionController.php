<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CommissionController extends Controller
{
    public function index(Request $request)
    {
        $query = Commission::with([
            'agent:id,name,email',
            'order:id,total,status,beneficiary_number,network,created_at',
            'product:id,name,network',
            'productVariant:id,variant_attributes',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('agent_id')) {
            $query->where('agent_id', $request->agent_id);
        }

        $commissions = $query->latest()->paginate(30);

        $totalAvailable = (float) Commission::where('status', 'available')
            ->selectRaw('COALESCE(SUM(commission_amount - withdrawn_amount), 0) as total')
            ->value('total');
        $totalWithdrawn = (float) Commission::selectRaw('COALESCE(SUM(withdrawn_amount), 0) as total')->value('total');
        $totalCommissions = (float) Commission::sum('commission_amount');

        return Inertia::render('Admin/Commissions', [
            'commissions' => $commissions,
            'filters' => $request->only('status', 'agent_id'),
            'summary' => [
                'total_commissions' => $totalCommissions,
                'total_available' => $totalAvailable,
                'total_withdrawn' => $totalWithdrawn,
            ],
        ]);
    }
}
