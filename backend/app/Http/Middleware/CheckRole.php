<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, $role)
    {
        if (!$request->user()) {
            return response()->json(['message' => 'غير مصرح (Unauthorized)'], 401);
        }

        if ($request->user()->role !== $role) {
            return response()->json(['message' => 'ليس لديك صلاحية للوصول إلى هذه الصفحة (Forbidden)'], 403);
        }

        return $next($request);
    }
}
