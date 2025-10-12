<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobPosting;

class JobPostingSeeder extends Seeder
{
    public function run(): void
    {
        $jobPostings = [
            [
                'title' => 'Software Engineer',
                'description' => 'Develop and maintain web applications using modern technologies.',
                'location' => 'Manila, Philippines',
                'status' => 'open',
            ],
            [
                'title' => 'Tour Guide',
                'description' => 'Lead tours and provide excellent customer service to travelers.',
                'location' => 'Cebu, Philippines',
                'status' => 'open',
            ],
            [
                'title' => 'Customer Service Representative',
                'description' => 'Handle customer inquiries and provide support via phone and email.',
                'location' => 'Quezon City, Philippines',
                'status' => 'open',
            ],
            [
                'title' => 'Marketing Specialist',
                'description' => 'Create and execute marketing campaigns to promote travel packages.',
                'location' => 'Makati, Philippines',
                'status' => 'open',
            ],
            [
                'title' => 'Accountant',
                'description' => 'Manage financial records and prepare financial reports.',
                'location' => 'Manila, Philippines',
                'status' => 'open',
            ],
            [
                'title' => 'HR Manager',
                'description' => 'Oversee recruitment, employee relations, and HR operations.',
                'location' => 'Manila, Philippines',
                'status' => 'open',
            ],
        ];

        foreach ($jobPostings as $job) {
            JobPosting::create($job);
        }
    }
}
