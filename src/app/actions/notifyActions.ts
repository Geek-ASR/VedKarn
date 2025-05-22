
'use server';

import { z } from 'zod';

const NotifyInputSchema = z.object({
  contactInfo: z.string().min(1, "Contact information is required."),
  webinarTitle: z.string().min(1, "Webinar title is required."),
  webinarDate: z.string().min(1, "Webinar date is required."),
});

interface NotifyActionResult {
  success: boolean;
  message: string;
  error?: string;
}

export async function requestWebinarReminder(
  prevState: NotifyActionResult | null,
  formData: FormData
): Promise<NotifyActionResult> {
  const rawFormData = {
    contactInfo: formData.get('contactInfo'),
    webinarTitle: formData.get('webinarTitle'),
    webinarDate: formData.get('webinarDate'),
  };

  const validatedFields = NotifyInputSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("[Server Action Error] Invalid input for reminder:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Invalid input provided.",
      error: JSON.stringify(validatedFields.error.flatten().fieldErrors),
    };
  }

  const { contactInfo, webinarTitle, webinarDate } = validatedFields.data;

  // In a real application, you would integrate with a messaging service API here
  // (e.g., Twilio for WhatsApp/SMS, SendGrid/Mailgun for email)
  // and schedule the reminder.

  console.log(`[MOCK SERVER ACTION] Reminder Request Received:
    Webinar: "${webinarTitle}"
    Date: ${webinarDate}
    Contact: ${contactInfo}
    Action: Would schedule and send a reminder notification.`);

  // Simulate successful processing
  return {
    success: true,
    message: `Reminder request for "${webinarTitle}" to ${contactInfo} has been processed (mock).`,
  };
}
