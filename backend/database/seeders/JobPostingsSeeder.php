<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\JobPosting;
use Carbon\Carbon;

class JobPostingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing job postings to avoid duplicates
        JobPosting::truncate();
        
        $jobPostings = [
            // 🧳 Frontline & Customer Service
            [
                'title' => 'Travel Agent / Travel Consultant',
                'department' => 'Frontline & Customer Service',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱140,000 - ₱196,000/month',
                'description' => 'We are seeking an experienced Travel Agent to assist clients with travel planning, bookings, and itinerary creation. The ideal candidate will have excellent customer service skills and knowledge of travel destinations.',
                'requirements' => 'Bachelor\'s degree in Tourism, Hospitality, or related field. 2+ years experience in travel industry. Strong communication and sales skills. Knowledge of booking systems (Amadeus, Sabre, etc.). Excellent customer service orientation.',
                'benefits' => 'Health insurance, Travel discounts, Performance bonuses, Paid time off, Professional development opportunities',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Tour Guide / Tour Coordinator',
                'department' => 'Frontline & Customer Service',
                'location' => 'Multiple Locations',
                'employment_type' => 'Full-time',
                'salary_range' => '₱123,200 - ₱168,000/month',
                'description' => 'Join our team as a Tour Guide to lead groups on exciting tours, provide historical and cultural information, and ensure memorable travel experiences for our clients.',
                'requirements' => 'High school diploma or equivalent. Certification in Tour Guiding preferred. Excellent public speaking and interpersonal skills. Knowledge of local history, culture, and attractions. Multilingual abilities a plus. Physical fitness for walking tours.',
                'benefits' => 'Travel opportunities, Flexible schedule, Tips and gratuities, Health insurance, Training programs',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Reservation Officer / Booking Agent',
                'department' => 'Frontline & Customer Service',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱112,000 - ₱156,800/month',
                'description' => 'We need a detail-oriented Reservation Officer to handle bookings, manage reservations, and coordinate with service providers to ensure seamless travel arrangements.',
                'requirements' => 'Associate degree or equivalent. 1+ years experience in reservations or customer service. Proficiency in booking systems and MS Office. Strong organizational and multitasking abilities. Excellent phone and email communication skills.',
                'benefits' => 'Health insurance, Employee discounts, Paid training, Career advancement opportunities',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Customer Service Representative',
                'department' => 'Frontline & Customer Service',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱100,800 - ₱140,000/month',
                'description' => 'Provide exceptional customer service by handling inquiries, resolving complaints, and assisting clients with their travel needs through phone, email, and in-person interactions.',
                'requirements' => 'High school diploma required. 1+ years customer service experience. Excellent communication and problem-solving skills. Patience and empathy. Computer literacy. Ability to work in fast-paced environment.',
                'benefits' => 'Health insurance, Performance bonuses, Paid time off, Training and development',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],

            // 💼 Operations & Management
            [
                'title' => 'Operations Manager',
                'department' => 'Operations & Management',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱252,000 - ₱336,000/month',
                'description' => 'Lead our operations team to ensure efficient daily operations, manage resources, oversee tour logistics, and maintain high service quality standards.',
                'requirements' => 'Bachelor\'s degree in Business Administration, Tourism Management, or related field. 5+ years experience in operations management, preferably in travel industry. Strong leadership and team management skills. Excellent problem-solving abilities. Budget management experience.',
                'benefits' => 'Competitive salary, Health insurance, Performance bonuses, Retirement plan, Professional development, Company vehicle',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Tour Operations Specialist',
                'department' => 'Operations & Management',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱168,000 - ₱224,000/month',
                'description' => 'Coordinate and manage tour operations, liaise with suppliers and partners, ensure smooth execution of tour packages, and handle operational challenges.',
                'requirements' => 'Bachelor\'s degree in Tourism or related field. 3+ years experience in tour operations. Strong organizational and coordination skills. Knowledge of travel industry regulations. Excellent negotiation abilities. Proficiency in tour management software.',
                'benefits' => 'Health insurance, Travel opportunities, Performance bonuses, Paid time off, Career growth',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Branch Manager / Agency Manager',
                'department' => 'Operations & Management',
                'location' => 'Branch Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱224,000 - ₱308,000/month',
                'description' => 'Manage branch operations, lead sales team, develop business strategies, maintain client relationships, and achieve revenue targets.',
                'requirements' => 'Bachelor\'s degree in Business or related field. 5+ years experience in travel industry with 2+ years in management. Proven track record in sales and team leadership. Strong business acumen. Excellent interpersonal skills. P&L management experience.',
                'benefits' => 'Competitive salary, Health insurance, Performance bonuses, Company benefits, Professional development',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],

            // 💻 Marketing & Sales
            [
                'title' => 'Sales Executive / Travel Sales Representative',
                'department' => 'Marketing & Sales',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱140,000 - ₱224,000/month + Commission',
                'description' => 'Drive sales growth by promoting travel packages, building client relationships, meeting sales targets, and identifying new business opportunities.',
                'requirements' => 'Bachelor\'s degree preferred. 2+ years sales experience, preferably in travel industry. Excellent communication and negotiation skills. Self-motivated and target-driven. Strong presentation abilities. CRM software proficiency.',
                'benefits' => 'Base salary + commission, Health insurance, Travel incentives, Performance bonuses, Career advancement',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Digital Marketing Officer',
                'department' => 'Marketing & Sales',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱156,800 - ₱212,800/month',
                'description' => 'Develop and execute digital marketing strategies, manage social media platforms, create engaging content, run online campaigns, and analyze marketing metrics.',
                'requirements' => 'Bachelor\'s degree in Marketing, Communications, or related field. 2+ years digital marketing experience. Proficiency in social media management, SEO, SEM, and analytics tools. Content creation skills. Knowledge of email marketing and advertising platforms.',
                'benefits' => 'Health insurance, Creative work environment, Professional development, Performance bonuses, Flexible hours',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Content Creator / Graphic Designer',
                'department' => 'Marketing & Sales',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱140,000 - ₱196,000/month',
                'description' => 'Create compelling visual content, design marketing materials, produce social media graphics, edit photos and videos, and maintain brand consistency.',
                'requirements' => 'Bachelor\'s degree in Graphic Design, Multimedia Arts, or related field. 2+ years experience in content creation. Proficiency in Adobe Creative Suite (Photoshop, Illustrator, Premiere Pro). Photography and videography skills. Portfolio required. Creative and detail-oriented.',
                'benefits' => 'Health insurance, Creative freedom, Latest design tools, Professional development, Flexible schedule',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],

            // 📊 Administrative & Support
            [
                'title' => 'Accounting Staff / Finance Officer',
                'department' => 'Administrative & Support',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱140,000 - ₱196,000/month',
                'description' => 'Handle financial transactions, maintain accounting records, prepare financial reports, process invoices and payments, and ensure compliance with accounting standards.',
                'requirements' => 'Bachelor\'s degree in Accounting or Finance. CPA license preferred. 2+ years accounting experience. Proficiency in accounting software (QuickBooks, SAP, etc.). Strong analytical skills. Knowledge of tax regulations. Attention to detail.',
                'benefits' => 'Health insurance, Retirement plan, Professional development, Paid time off, Stable work environment',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Administrative Assistant / Secretary',
                'department' => 'Administrative & Support',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱100,800 - ₱140,000/month',
                'description' => 'Provide administrative support, manage schedules, handle correspondence, organize files and documents, coordinate meetings, and assist with office operations.',
                'requirements' => 'Associate degree or equivalent. 1+ years administrative experience. Excellent organizational and time management skills. Proficiency in MS Office Suite. Strong written and verbal communication. Professional demeanor. Multitasking abilities.',
                'benefits' => 'Health insurance, Paid time off, Training opportunities, Supportive work environment',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Human Resources Officer',
                'department' => 'Administrative & Support',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱156,800 - ₱212,800/month',
                'description' => 'Manage recruitment processes, handle employee relations, maintain HR records, administer benefits, ensure compliance with labor laws, and support organizational development.',
                'requirements' => 'Bachelor\'s degree in Human Resources, Psychology, or related field. 2+ years HR experience. Knowledge of labor laws and HR best practices. Strong interpersonal and conflict resolution skills. HRIS proficiency. Confidentiality and discretion.',
                'benefits' => 'Health insurance, Professional development, Retirement plan, Work-life balance, Career growth',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],

            // 🌍 Specialized & Technical
            [
                'title' => 'Visa and Documentation Officer',
                'department' => 'Specialized & Technical',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱140,000 - ₱196,000/month',
                'description' => 'Process visa applications, prepare travel documents, liaise with embassies and consulates, ensure compliance with immigration requirements, and advise clients on documentation needs.',
                'requirements' => 'Bachelor\'s degree preferred. 2+ years experience in visa processing or travel documentation. Knowledge of visa requirements for various countries. Attention to detail. Strong organizational skills. Excellent communication abilities. Ability to work under pressure.',
                'benefits' => 'Health insurance, Specialized training, Career development, Paid time off, Stable position',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'IT Support / System Administrator',
                'department' => 'Specialized & Technical',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱168,000 - ₱252,000/month',
                'description' => 'Maintain IT infrastructure, provide technical support, manage networks and systems, ensure data security, troubleshoot hardware and software issues, and implement IT solutions.',
                'requirements' => 'Bachelor\'s degree in Computer Science, IT, or related field. 3+ years experience in IT support or system administration. Knowledge of Windows/Linux servers, networking, and cybersecurity. Problem-solving skills. Certifications (CCNA, MCSA, etc.) preferred.',
                'benefits' => 'Competitive salary, Health insurance, Latest technology, Professional certifications, Career advancement',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
            [
                'title' => 'Transport Coordinator',
                'department' => 'Specialized & Technical',
                'location' => 'Main Office',
                'employment_type' => 'Full-time',
                'salary_range' => '₱128,800 - ₱179,200/month',
                'description' => 'Coordinate transportation logistics, manage vehicle fleet, schedule drivers, ensure timely pickups and drop-offs, maintain transport records, and liaise with transport providers.',
                'requirements' => 'High school diploma or equivalent. 2+ years experience in logistics or transport coordination. Strong organizational and planning skills. Knowledge of local routes and traffic patterns. Good communication abilities. Problem-solving skills. Valid driver\'s license.',
                'benefits' => 'Health insurance, Transportation allowance, Paid time off, Training opportunities, Stable employment',
                'application_deadline' => Carbon::now()->addMonths(2),
                'status' => 'open',
            ],
        ];

        foreach ($jobPostings as $posting) {
            JobPosting::create($posting);
        }

        $this->command->info('Job postings seeded successfully!');
    }
}
