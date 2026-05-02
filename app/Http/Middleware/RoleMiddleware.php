<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        // Check if user is authenticated
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        $user = auth()->user();

        if (empty($user->role) || !in_array($user->role, $roles, true)) {
            abort(403, 'Access denied. You need one of "' . implode(', ', $roles) . '" roles to access this page.');
        }

        return $next($request);
    }
}