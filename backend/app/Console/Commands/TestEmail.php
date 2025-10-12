<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use App\Models\Interview;
use App\Mail\InterviewInvitation;

class TestEmail extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:email {email?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test email configuration and send a test email';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Checking email configuration...');
        $this->newLine();

        // Display current mail configuration
        $this->table(
            ['Setting', 'Value'],
            [
                ['MAIL_MAILER', config('mail.default')],
                ['MAIL_HOST', config('mail.mailers.smtp.host')],
                ['MAIL_PORT', config('mail.mailers.smtp.port')],
                ['MAIL_USERNAME', config('mail.mailers.smtp.username') ? '✓ Set' : '✗ Not set'],
                ['MAIL_PASSWORD', config('mail.mailers.smtp.password') ? '✓ Set' : '✗ Not set'],
                ['MAIL_ENCRYPTION', config('mail.mailers.smtp.encryption')],
                ['MAIL_FROM_ADDRESS', config('mail.from.address')],
                ['MAIL_FROM_NAME', config('mail.from.name')],
            ]
        );

        $this->newLine();

        if (config('mail.default') === 'log') {
            $this->warn('⚠️  Mail driver is set to "log". Emails will be logged to storage/logs/laravel.log');
            $this->newLine();
        }

        $email = $this->argument('email');
        
        if (!$email) {
            $email = $this->ask('Enter email address to send test email to');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address!');
            return 1;
        }

        $this->info("📧 Sending test email to: {$email}");
        $this->newLine();

        try {
            // Send simple test email
            Mail::raw('This is a test email from Travel and Tours HR System. If you received this, your email configuration is working correctly!', function($message) use ($email) {
                $message->to($email)
                        ->subject('Test Email - Travel and Tours HR');
            });

            $this->info('✅ Test email sent successfully!');
            $this->newLine();

            // Ask if they want to test interview invitation
            if ($this->confirm('Do you want to test the Interview Invitation email template?', true)) {
                $this->testInterviewEmail($email);
            }

            $this->newLine();
            $this->info('💡 Tips:');
            $this->line('  - Check your spam/junk folder');
            $this->line('  - If using Gmail, make sure you use an App Password');
            $this->line('  - Check storage/logs/laravel.log for errors');
            
            return 0;
        } catch (\Exception $e) {
            $this->error('❌ Failed to send email!');
            $this->newLine();
            $this->error('Error: ' . $e->getMessage());
            $this->newLine();
            $this->warn('Common issues:');
            $this->line('  1. Wrong SMTP credentials');
            $this->line('  2. Gmail requires App Password (not regular password)');
            $this->line('  3. Firewall blocking port 587');
            $this->line('  4. 2-Step Verification not enabled (Gmail)');
            $this->newLine();
            $this->info('📖 Check EMAIL_SETUP.md for detailed setup instructions');
            
            return 1;
        }
    }

    private function testInterviewEmail($email)
    {
        $this->info('📧 Sending Interview Invitation test email...');
        
        try {
            // Get first interview or create a mock one
            $interview = Interview::with('applicant')->first();
            
            if (!$interview) {
                $this->warn('No interviews found in database. Creating mock data...');
                
                // Create mock interview data
                $interview = new Interview([
                    'date' => now()->addDays(3),
                    'time' => '10:00 AM',
                    'type' => 'Virtual Interview',
                    'status' => 'scheduled',
                ]);
                
                // Mock applicant
                $interview->setRelation('applicant', (object)[
                    'name' => 'Test Applicant',
                    'email' => $email,
                    'job_title' => 'Travel Consultant',
                ]);
            }

            Mail::to($email)->send(new InterviewInvitation($interview));
            
            $this->info('✅ Interview Invitation email sent successfully!');
        } catch (\Exception $e) {
            $this->error('❌ Failed to send Interview Invitation: ' . $e->getMessage());
        }
    }
}
