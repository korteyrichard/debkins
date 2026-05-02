<?php

return [
    'enabled' => env('AGENT_SYSTEM_ENABLED', true),
    'registration_enabled' => env('AGENT_REGISTRATION_ENABLED', true),
    'shop_creation_enabled' => env('AGENT_SHOP_CREATION_ENABLED', true),
    'commission_enabled' => env('COMMISSION_SYSTEM_ENABLED', true),
    'referral_enabled' => env('REFERRAL_SYSTEM_ENABLED', true),
    'withdrawal_enabled' => env('WITHDRAWAL_SYSTEM_ENABLED', true),
    'default_referral_percentage' => env('DEFAULT_REFERRAL_PERCENTAGE', 5.00),
    'commission_availability_delay_hours' => env('COMMISSION_AVAILABILITY_DELAY_HOURS', 0),
    'minimum_withdrawal_amount' => env('MINIMUM_WITHDRAWAL_AMOUNT', 10.00),
];
