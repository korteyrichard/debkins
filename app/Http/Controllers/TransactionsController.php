<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
    use App\Models\Transaction;
use Illuminate\Support\Facades\Auth;

class TransactionsController extends Controller
{
    /**
     * Display a listing of the transactions.
     */

    public function index(Request $request)
    {
        $user = Auth::user();

    $transactions = Transaction::where('user_id', $user->id)
        ->with(['order' => function($query) {
            $query->select('id', 'beneficiary_number');
        }])
        ->select('id', 'type', 'amount', 'description', 'created_at', 'order_id')
        ->latest()
        ->get();

    return inertia('Dashboard/transactions', [
        'transactions' => $transactions,
    ]);
}

}
