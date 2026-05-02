<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class DomainRestriction
{
    public function handle(Request $request, Closure $next)
    {
        $currentHost = explode(':', $request->getHost() ?: $request->server('HTTP_HOST') ?: '')[0];

        $storeDomain = config('app.store_domain');

        if ($currentHost === $storeDomain || $currentHost === 'www.' . $storeDomain) {
            $path = $request->path();

            if (!str_starts_with($path, 'shop/')) {
                return response(view('store-domain-only'), 403);
            }
        }

        return $next($request);
    }
}
