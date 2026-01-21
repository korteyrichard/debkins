<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\FosterOrderStatusSyncService;

class SyncFosterOrderStatus extends Command
{
    protected $signature = 'orders:sync-foster-status';
    protected $description = 'Sync pending Ishare order statuses from Foster API';

    public function handle()
    {
        $this->info('Starting Ishare order status sync...');
        
        $syncService = new FosterOrderStatusSyncService();
        $syncService->syncPendingOrders();
        
        $this->info('Ishare order status sync completed.');
    }
}
