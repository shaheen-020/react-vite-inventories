<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\MedicineController;
use App\Http\Controllers\PurchaseController;
use App\Http\Controllers\InvoiceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\SolutionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/


Route::post('/register', App\Http\Controllers\Api\RegisterController::class)->name('register');
Route::post('/login', App\Http\Controllers\Api\LoginController::class)->name('login');
Route::middleware('auth:api')->get('/user', function (Request $request) {
    $user = $request->user(); $role = $user->hasRole('admin') ? 'admin' : 'user';
    $user->setAttribute('role', $role);
    return $user;
});

Route::group(['middleware' => ['auth:api']], function () {
    Route::get('/user', function (Request $request) {
        $user = $request->user(); $role = $user->hasRole('admin') ? 'admin' : 'user';
        $user->setAttribute('role', $role);
        return $user;
    });
    Route::get('/profile', [PersonalController::class, 'index']);
    Route::put('/profile', [PersonalController::class, 'updateProfile']);
    Route::put('/update-password', [PersonalController::class, 'updatePassword']);
});

Route::group(['middleware' => ['auth:api', 'role:admin']], function () {
    Route::apiResource('/customers', CustomerController::class);
    Route::apiResource('/suppliers', SupplierController::class);
    Route::apiResource('/categories', CategoryController::class);
    Route::apiResource('solutions', SolutionController::class); // Added this line
    Route::apiResource('/medicines', MedicineController::class);
    Route::apiResource('/purchases', PurchaseController::class);
    Route::apiResource('/invoices', InvoiceController::class);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports/sales', [ReportController::class, 'sales']);
    Route::get('/reports/purchases', [ReportController::class, 'purchases']);
    Route::get('/reports/stock-card', [ReportController::class, 'stockCard']);
    Route::get('/reports/inventory', [ReportController::class, 'inventory']);
    Route::get('/reports/expiry', [ReportController::class, 'expiry']);
    Route::get('/reports/profit', [ReportController::class, 'profit']);
});

Route::post('/logout', App\Http\Controllers\Api\LogoutController::class)->name('logout');