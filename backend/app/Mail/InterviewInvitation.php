<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Interview;

class InterviewInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public $interview;
    public $applicant;
    public $zoomLink;
    public $meetingId;
    public $passcode;

    /**
     * Create a new message instance.
     */
    public function __construct(Interview $interview)
    {
        $this->interview = $interview;
        $this->applicant = $interview->applicant;
        
        // Default Zoom meeting details
        $this->zoomLink = 'https://us02web.zoom.us/j/82345678901?pwd=Q1JzR3h5bGZKT2pVY2t6bGhYb0tQdz09';
        $this->meetingId = '823 4567 8901';
        $this->passcode = 'travel123';
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Interview Invitation - Travel and Tours Agency',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.interview-invitation',
            with: [
                'applicantName' => $this->applicant->name,
                'interviewDate' => $this->interview->date,
                'interviewTime' => $this->interview->time,
                'interviewType' => $this->interview->type,
                'jobTitle' => $this->applicant->job_title,
                'zoomLink' => $this->zoomLink,
                'meetingId' => $this->meetingId,
                'passcode' => $this->passcode,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
