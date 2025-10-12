<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Interview Invitation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .meeting-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #667eea;
        }
        .zoom-link {
            background: #667eea;
            color: white;
            padding: 15px 25px;
            text-decoration: none;
            border-radius: 5px;
            display: inline-block;
            margin: 15px 0;
            font-weight: bold;
        }
        .zoom-link:hover {
            background: #5568d3;
        }
        .credentials {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            border-left: 4px solid #ffc107;
        }
        .footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 12px;
        }
        .detail-row {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .detail-label {
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎯 Interview Invitation</h1>
        <p>Travel and Tours Agency</p>
    </div>

    <div class="content">
        <p>Dear <strong>{{ $applicantName }}</strong>,</p>

        <p>Congratulations! We are pleased to invite you for an interview for the position of <strong>{{ $jobTitle ?? 'Staff Member' }}</strong>.</p>

        <div class="meeting-details">
            <h3>📅 Interview Details</h3>
            
            <div class="detail-row">
                <span class="detail-label">Date:</span> 
                {{ \Carbon\Carbon::parse($interviewDate)->format('l, F j, Y') }}
            </div>

            <div class="detail-row">
                <span class="detail-label">Time:</span> 
                {{ $interviewTime }} (Philippine Time)
            </div>

            <div class="detail-row">
                <span class="detail-label">Type:</span> 
                {{ $interviewType ?? 'Virtual Interview' }}
            </div>

            <div class="detail-row">
                <span class="detail-label">Topic:</span> 
                Travel and Tours Agency Staff Interview
            </div>
        </div>

        <div style="text-align: center; margin: 25px 0;">
            <a href="{{ $zoomLink }}" class="zoom-link">
                🔗 Join Zoom Meeting
            </a>
        </div>

        <div class="credentials">
            <h4>🔐 Meeting Credentials</h4>
            <p><strong>Meeting ID:</strong> {{ $meetingId }}</p>
            <p><strong>Passcode:</strong> {{ $passcode }}</p>
            <p><strong>Zoom Link:</strong><br>
                <a href="{{ $zoomLink }}" style="word-break: break-all; color: #667eea;">{{ $zoomLink }}</a>
            </p>
        </div>

        <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h4>📝 Important Notes:</h4>
            <ul>
                <li>Please join the meeting 5 minutes before the scheduled time</li>
                <li>Ensure you have a stable internet connection</li>
                <li>Test your camera and microphone beforehand</li>
                <li>Prepare any questions you may have about the position</li>
                <li>Have a copy of your resume ready for reference</li>
            </ul>
        </div>

        <p>If you have any questions or need to reschedule, please contact our HR department as soon as possible.</p>

        <p>We look forward to meeting you!</p>

        <p>Best regards,<br>
        <strong>Human Resources Department</strong><br>
        Travel and Tours Agency</p>
    </div>

    <div class="footer">
        <p>© {{ date('Y') }} Travel and Tours Agency. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
