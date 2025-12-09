import axios from '@/lib/axios';

interface SendEmailData {
  to: string;
  subject: string;
  message: string;
  cc?: string[];
  bcc?: string[];
  attachments?: File[];
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

export const emailService = {
  // Send email
  sendEmail: async (data: SendEmailData) => {
    const response = await axios.post('/api/email/send', data);
    return response.data;
  },

  // Get email templates
  getTemplates: async (category?: string) => {
    const params = category ? `?category=${category}` : '';
    const response = await axios.get(`/api/email/templates${params}`);
    return response.data;
  },

  // Get template by ID
  getTemplate: async (id: string) => {
    const response = await axios.get(`/api/email/templates/${id}`);
    return response.data;
  },

  // Create template
  createTemplate: async (template: Omit<EmailTemplate, 'id'>) => {
    const response = await axios.post('/api/email/templates', template);
    return response.data;
  },

  // Update template
  updateTemplate: async (id: string, template: Partial<EmailTemplate>) => {
    const response = await axios.put(`/api/email/templates/${id}`, template);
    return response.data;
  },

  // Delete template
  deleteTemplate: async (id: string) => {
    const response = await axios.delete(`/api/email/templates/${id}`);
    return response.data;
  },

  // Get sent emails
  getSentEmails: async (limit: number = 50) => {
    const response = await axios.get(`/api/email/sent?limit=${limit}`);
    return response.data;
  },

  // Get email by ID
  getEmail: async (id: string) => {
    const response = await axios.get(`/api/email/${id}`);
    return response.data;
  },

  // Send bulk emails
  sendBulkEmails: async (recipients: string[], subject: string, message: string) => {
    const response = await axios.post('/api/email/bulk', {
      recipients,
      subject,
      message
    });
    return response.data;
  },

  // Schedule email
  scheduleEmail: async (data: SendEmailData & { scheduledDate: string }) => {
    const response = await axios.post('/api/email/schedule', data);
    return response.data;
  },

  // Get email statistics
  getStats: async () => {
    const response = await axios.get('/api/email/stats');
    return response.data;
  }
};
