<?php

echo "=== Email Configuration Check ===\n\n";

// Load environment variables
$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    echo "❌ .env file not found!\n";
    echo "Please copy .env.example to .env and configure it.\n";
    exit(1);
}

$envContent = file_get_contents($envFile);
$envLines = explode("\n", $envContent);

$config = [];
foreach ($envLines as $line) {
    $line = trim($line);
    if (empty($line) || strpos($line, '#') === 0) continue;
    
    $parts = explode('=', $line, 2);
    if (count($parts) === 2) {
        $key = trim($parts[0]);
        $value = trim($parts[1]);
        $config[$key] = $value;
    }
}

echo "Current Email Configuration:\n";
echo "----------------------------\n";

$mailSettings = [
    'MAIL_MAILER' => 'Mail Driver',
    'MAIL_HOST' => 'SMTP Host',
    'MAIL_PORT' => 'SMTP Port',
    'MAIL_USERNAME' => 'Username',
    'MAIL_PASSWORD' => 'Password',
    'MAIL_ENCRYPTION' => 'Encryption',
    'MAIL_FROM_ADDRESS' => 'From Address',
    'MAIL_FROM_NAME' => 'From Name',
];

$allSet = true;
foreach ($mailSettings as $key => $label) {
    $value = $config[$key] ?? 'NOT SET';
    
    if ($key === 'MAIL_PASSWORD' && $value !== 'NOT SET') {
        $value = str_repeat('*', strlen($value)) . ' (hidden)';
    }
    
    $status = ($config[$key] ?? '') ? '✓' : '✗';
    
    if ($key !== 'MAIL_FROM_NAME' && !isset($config[$key])) {
        $allSet = false;
    }
    
    printf("%-20s: %s %s\n", $label, $status, $value);
}

echo "\n";

if (!$allSet) {
    echo "⚠️  Some email settings are missing!\n\n";
    echo "For Gmail, add these to your .env file:\n";
    echo "-------------------------------------------\n";
    echo "MAIL_MAILER=smtp\n";
    echo "MAIL_HOST=smtp.gmail.com\n";
    echo "MAIL_PORT=587\n";
    echo "MAIL_USERNAME=your-email@gmail.com\n";
    echo "MAIL_PASSWORD=your-app-password\n";
    echo "MAIL_ENCRYPTION=tls\n";
    echo "MAIL_FROM_ADDRESS=your-email@gmail.com\n";
    echo "MAIL_FROM_NAME=\"Travel and Tours HR\"\n";
    echo "\n";
    echo "📖 See GMAIL_SETUP_GUIDE.md for detailed instructions\n";
} else {
    echo "✅ All email settings are configured!\n\n";
    
    if (isset($config['MAIL_MAILER']) && $config['MAIL_MAILER'] === 'log') {
        echo "ℹ️  Mail driver is set to 'log'\n";
        echo "   Emails will be logged to storage/logs/laravel.log\n";
        echo "   Change to 'smtp' to send real emails\n";
    } else {
        echo "To test email sending, run:\n";
        echo "  php artisan test:email your-email@gmail.com\n";
    }
}

echo "\n";
