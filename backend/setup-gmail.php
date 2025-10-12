<?php

echo "=== Gmail SMTP Setup Helper ===\n\n";

$envFile = __DIR__ . '/.env';

if (!file_exists($envFile)) {
    echo "❌ .env file not found!\n";
    exit(1);
}

echo "This script will help you configure Gmail SMTP.\n\n";

// Get user input
echo "Enter your Gmail address: ";
$email = trim(fgets(STDIN));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "❌ Invalid email address!\n";
    exit(1);
}

echo "\nNow you need to get your Gmail App Password:\n";
echo "1. Go to: https://myaccount.google.com/apppasswords\n";
echo "2. Enable 2-Step Verification if not enabled\n";
echo "3. Generate an App Password for 'Mail'\n";
echo "4. Copy the 16-character password (remove spaces)\n\n";

echo "Enter your Gmail App Password (16 characters, no spaces): ";
$password = trim(fgets(STDIN));

if (strlen($password) < 10) {
    echo "⚠️  Warning: Password seems too short. Make sure you copied the full App Password.\n";
    echo "Continue anyway? (y/n): ";
    $continue = trim(fgets(STDIN));
    if (strtolower($continue) !== 'y') {
        echo "Setup cancelled.\n";
        exit(0);
    }
}

echo "\nUpdating .env file...\n";

// Read current .env
$envContent = file_get_contents($envFile);
$envLines = explode("\n", $envContent);

$mailSettings = [
    'MAIL_MAILER' => 'smtp',
    'MAIL_HOST' => 'smtp.gmail.com',
    'MAIL_PORT' => '587',
    'MAIL_USERNAME' => $email,
    'MAIL_PASSWORD' => $password,
    'MAIL_ENCRYPTION' => 'tls',
    'MAIL_FROM_ADDRESS' => $email,
    'MAIL_FROM_NAME' => '"Travel and Tours HR"',
];

$updatedLines = [];
$keysUpdated = [];

foreach ($envLines as $line) {
    $updated = false;
    
    foreach ($mailSettings as $key => $value) {
        if (strpos($line, $key . '=') === 0) {
            $updatedLines[] = $key . '=' . $value;
            $keysUpdated[] = $key;
            $updated = true;
            break;
        }
    }
    
    if (!$updated) {
        $updatedLines[] = $line;
    }
}

// Add missing keys
foreach ($mailSettings as $key => $value) {
    if (!in_array($key, $keysUpdated)) {
        $updatedLines[] = $key . '=' . $value;
    }
}

// Write back to .env
file_put_contents($envFile, implode("\n", $updatedLines));

echo "✅ .env file updated successfully!\n\n";

echo "Configuration applied:\n";
echo "----------------------\n";
foreach ($mailSettings as $key => $value) {
    if ($key === 'MAIL_PASSWORD') {
        echo "$key=" . str_repeat('*', strlen($value)) . "\n";
    } else {
        echo "$key=$value\n";
    }
}

echo "\n✅ Setup complete!\n\n";
echo "Next steps:\n";
echo "1. Run: php artisan config:cache\n";
echo "2. Test: php artisan test:email $email\n\n";
