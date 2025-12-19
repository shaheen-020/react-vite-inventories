<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;

$columns = Schema::getColumnListing('medicines');
print_r($columns);

if (Schema::hasTable('categories')) {
    echo "Categories table exists.\n";
    $columns = Schema::getColumnListing('categories');
    print_r($columns);
} else {
    echo "Categories table DOES NOT exist.\n";
}
